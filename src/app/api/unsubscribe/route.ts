import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import EmailLog from "@/models/EmailLog";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const campaignId = searchParams.get("campaignId");

    if (!email) {
      return new NextResponse(
        `<html>
          <body style="font-family: sans-serif; text-align: center; padding: 48px; background-color: #f3f4f6;">
            <div style="background-color: white; padding: 32px; border-radius: 12px; max-width: 480px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <h2 style="color: #ef4444; margin-top: 0;">Error</h2>
              <p style="color: #4b5563;">Invalid unsubscribe link. Email address is missing.</p>
            </div>
          </body>
        </html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    await connectToDatabase();

    // Find and unsubscribe subscriber
    const subscriber = await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase() },
      { status: "UNSUBSCRIBED", unsubscribedAt: new Date() },
      { new: true }
    );

    // Record unsubscribe in EmailLog if campaign ID is provided
    if (subscriber && campaignId) {
      await EmailLog.create({
        queueId: `unsub_${Date.now()}`,
        campaign: campaignId,
        subscriber: subscriber._id,
        recipientEmail: email.toLowerCase(),
        status: "UNSUBSCRIBED",
        unsubscribedAt: new Date(),
      });
    }

    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Unsubscribed Successfully</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 60px 16px; background-color: #f8fafc; margin: 0;">
          <div style="background-color: #ffffff; padding: 40px 24px; border-radius: 16px; max-width: 440px; margin: 0 auto; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div style="width: 56px; height: 56px; background-color: #fef2f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px auto;">
              <svg style="width: 28px; height: 28px; color: #ef4444;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </div>
            <h2 style="color: #0f172a; font-weight: 800; font-size: 22px; margin: 0 0 10px 0; letter-spacing: -0.5px;">Unsubscribed</h2>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
              You have been successfully removed from our list. You will no longer receive marketing emails or newsletters at <strong>${email.toLowerCase()}</strong>.
            </p>
            <div style="border-top: 1px solid #f1f5f9; padding-top: 24px;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0 0 16px 0;">Did this happen by mistake?</p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || "#"}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-size: 13px; font-weight: 700; transition: background-color 0.2s;">
                Return to Website
              </a>
            </div>
          </div>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (err: any) {
    console.error("Unsubscribe error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
