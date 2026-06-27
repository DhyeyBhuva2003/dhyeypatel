import { Worker, Job } from "bullmq";
import { getRedisConnection } from "./redis";
import { getEmailQueue } from "./emailQueue";
import { transporter } from "../email";
import connectToDatabase from "../db";
import EmailLog from "@/models/EmailLog";
import Subscriber from "@/models/Subscriber";
import Campaign from "@/models/Campaign";
import EmailTemplate from "@/models/EmailTemplate";
import BrandSetting from "@/models/BrandSetting";
import { compileEmailHtml, interpolateVariables } from "../emails/renderer";

export interface EmailJobData {
  recipientEmail: string;
  subject: string;
  htmlContent: string;
  campaignId?: string;
  subscriberId?: string;
  senderName: string;
  replyTo: string;
}

export interface CampaignJobData {
  campaignId: string;
}

declare global {
  // eslint-disable-next-line no-var
  var emailBullWorker: Worker | undefined;
}

/**
 * Loads campaign, queries segments, renders HTML per subscriber, and enqueues individual send-email jobs.
 */
async function processCampaignSend(campaignId: string) {
  await connectToDatabase();
  
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) {
    console.error(`[CampaignScheduler] Campaign ${campaignId} not found`);
    return;
  }

  // Only run if campaign is scheduled or processing
  if (campaign.status === "PAUSED" || campaign.status === "COMPLETED" || campaign.status === "FAILED") {
    console.log(`[CampaignScheduler] Campaign ${campaignId} status is ${campaign.status}, skipping send`);
    return;
  }

  try {
    campaign.status = "PROCESSING";
    await campaign.save();

    const template = await EmailTemplate.findById(campaign.template);
    if (!template) {
      throw new Error(`Email template ${campaign.template} not found`);
    }

    const brand = (await BrandSetting.findOne({})) || {
      brandName: campaign.senderName,
      primaryColor: "#4f46e5",
      secondaryColor: "#475569",
      accentColor: "#2563eb",
      copyright: "All rights reserved.",
      address: "India",
    };

    // Construct segment filters
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = { status: "SUBSCRIBED" };
    const aud = campaign.audience;

    if (aud.type === "GROUPS" && aud.groupIds?.length) {
      filter.groups = { $in: aud.groupIds };
    } else if (aud.type === "TAGS" && aud.tagIds?.length) {
      filter.tags = { $in: aud.tagIds };
    } else if (aud.type === "MANUAL" && aud.manualEmails?.length) {
      filter.email = { $in: aud.manualEmails.map((e: string) => e.toLowerCase()) };
    }

    const subscribers = await Subscriber.find(filter);
    console.log(`[CampaignScheduler] Queueing ${subscribers.length} emails for Campaign ${campaign.name}`);

    const emailQueue = getEmailQueue();

    for (const sub of subscribers) {
      const subjectCompiled = interpolateVariables(campaign.subject, {
        subscriber: sub,
        brand,
        currentDate: new Date().toLocaleDateString("en-US", { dateStyle: "long" }),
        currentYear: new Date().getFullYear().toString(),
      });

      const htmlContent = compileEmailHtml(template.jsonLayout, brand, sub, campaign);

      await emailQueue.add(
        "send-email",
        {
          recipientEmail: sub.email,
          subject: subjectCompiled,
          htmlContent,
          campaignId: campaign._id.toString(),
          subscriberId: sub._id.toString(),
          senderName: campaign.senderName,
          replyTo: campaign.replyTo,
        },
        {
          priority: campaign.priority === "HIGH" ? 1 : campaign.priority === "MEDIUM" ? 5 : 10,
        }
      );
    }

    campaign.status = "COMPLETED";
    await campaign.save();
    console.log(`[CampaignScheduler] Finished queueing Campaign ${campaign.name}`);
  } catch (err: any) {
    console.error(`[CampaignScheduler] Campaign ${campaignId} dispatch failed:`, err);
    campaign.status = "FAILED";
    await campaign.save();
    throw err;
  }
}

export function initEmailWorker() {
  if (global.emailBullWorker) {
    return global.emailBullWorker;
  }

  global.emailBullWorker = new Worker(
    "email-sending-queue",
    async (job: Job) => {
      await connectToDatabase();

      if (job.name === "start-campaign") {
        const { campaignId } = job.data as CampaignJobData;
        await processCampaignSend(campaignId);
      } else if (job.name === "send-email") {
        const {
          recipientEmail,
          subject,
          htmlContent,
          campaignId,
          subscriberId,
          senderName,
          replyTo,
        } = job.data as EmailJobData;

        const msgId = job.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(/\/$/, "");

        // 1. Inject Open Tracking Pixel
        const openTrackUrl = `${siteUrl}/api/emails/track/open?logId=${msgId}`;
        const pixelHtml = `<img src="${openTrackUrl}" width="1" height="1" style="display:none !important;" alt="" />`;
        let trackedHtml = htmlContent;
        if (trackedHtml.includes("</body>")) {
          trackedHtml = trackedHtml.replace("</body>", `${pixelHtml}</body>`);
        } else {
          trackedHtml += pixelHtml;
        }

        // 2. Inject Link Click Tracking
        trackedHtml = trackedHtml.replace(/href="([^"]+)"/g, (match, url) => {
          if (url.startsWith("http://") || url.startsWith("https://")) {
            if (url.includes("/api/unsubscribe")) {
              if (campaignId) {
                return `href="${url}&campaignId=${campaignId}"`;
              }
              return match;
            }
            return `href="${siteUrl}/api/emails/track/click?logId=${msgId}&url=${encodeURIComponent(url)}"`;
          }
          return match;
        });

        try {
          // Send email via nodemailer SMTP
          await transporter.sendMail({
            from: `"${senderName}" <${process.env.SMTP_USER}>`,
            to: recipientEmail,
            replyTo: replyTo,
            subject: subject,
            html: trackedHtml,
          });

          // Create log record
          await EmailLog.create({
            queueId: msgId,
            campaign: campaignId || undefined,
            subscriber: subscriberId || undefined,
            recipientEmail: recipientEmail,
            status: "DELIVERED",
            openedAt: undefined,
            clickedAt: undefined,
          });
        } catch (err: any) {
          console.error(`[EmailWorker] Failed to send email to ${recipientEmail} (Job ${job.id}):`, err);

          // Mark subscriber status as BOUNCED if error is address-related
          if (subscriberId) {
            const isHardBounce =
              err.code === "EENVELOPE" ||
              err.responseCode === 550 ||
              err.message.includes("does not exist") ||
              err.message.includes("bounced");
            if (isHardBounce) {
              await Subscriber.findByIdAndUpdate(subscriberId, {
                status: "BOUNCED",
                bouncedAt: new Date(),
              });
            }
          }

          // Create error log record
          await EmailLog.create({
            queueId: `err_${Date.now()}`,
            campaign: campaignId || undefined,
            subscriber: subscriberId || undefined,
            recipientEmail: recipientEmail,
            status: "BOUNCED",
            bouncedAt: new Date(),
            errorMessage: err.message || "Unknown SMTP Error",
          });

          throw err; // Allow BullMQ to handle retry/backoff
        }
      }
    },
    {
      connection: getRedisConnection() as any,
      concurrency: 5,
      limiter: {
        max: 10,
        duration: 1000,
      },
    }
  );

  global.emailBullWorker.on("completed", (job) => {
    console.log(`[EmailWorker] Job completed: ${job.id} (${job.name})`);
  });

  global.emailBullWorker.on("failed", (job, err) => {
    console.error(`[EmailWorker] Job failed: ${job?.id} (${job?.name}), Error:`, err);
  });

  return global.emailBullWorker;
}

export default initEmailWorker;
