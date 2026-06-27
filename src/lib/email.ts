import nodemailer from "nodemailer";

// Initialize the SMTP Transporter
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: parseInt(process.env.SMTP_PORT || "587", 10) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailInquiryData {
  name: string;
  email: string;
  subject?: string;
  message: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

/**
 * Sends a notification email to the website owner about a new contact inquiry.
 */
export async function sendOwnerInquiryEmail(data: EmailInquiryData) {
  const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || "dhyeybhuva2003@gmail.com";
  const dateString = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
    dateStyle: "long",
    timeStyle: "medium",
  });

  const subjectText = data.subject?.trim() || "General Inquiry";

  const attachmentHtml = data.attachmentUrl
    ? `<tr style="border-bottom: 1px solid #e5e7eb;">
         <td style="padding: 12px; font-weight: 600; color: #4b5563; width: 140px; vertical-align: top;">Attachment</td>
         <td style="padding: 12px; color: #1f2937; vertical-align: top;">
           <a href="${data.attachmentUrl}" target="_blank" style="color: #6366f1; text-decoration: underline; font-weight: 500;">
             ${data.attachmentName || "View Attachment"}
           </a>
         </td>
       </tr>`
    : "";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Project / Contact Inquiry</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; -webkit-font-smoothing: antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb;">
                <!-- Header Banner -->
                <tr>
                  <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">New Inquiry Received</h1>
                    <p style="margin: 8px 0 0 0; color: #e0e7ff; font-size: 14px;">A visitor has submitted a new message through the contact form.</p>
                  </td>
                </tr>
                <!-- Content Section -->
                <tr>
                  <td style="padding: 32px 24px;">
                    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 18px; font-weight: 700; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">Submission Details</h2>
                    
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px; border-collapse: collapse; margin-bottom: 24px;">
                      <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 12px; font-weight: 600; color: #4b5563; width: 140px; vertical-align: top;">Name</td>
                        <td style="padding: 12px; color: #1f2937; vertical-align: top;">${data.name}</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 12px; font-weight: 600; color: #4b5563; width: 140px; vertical-align: top;">Email</td>
                        <td style="padding: 12px; color: #1f2937; vertical-align: top;">
                          <a href="mailto:${data.email}" style="color: #4f46e5; text-decoration: none;">${data.email}</a>
                        </td>
                      </tr>
                      <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 12px; font-weight: 600; color: #4b5563; width: 140px; vertical-align: top;">Subject</td>
                        <td style="padding: 12px; color: #1f2937; vertical-align: top;">${subjectText}</td>
                      </tr>
                      ${attachmentHtml}
                      <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 12px; font-weight: 600; color: #4b5563; width: 140px; vertical-align: top;">Date & Time</td>
                        <td style="padding: 12px; color: #1f2937; vertical-align: top;">${dateString} (IST)</td>
                      </tr>
                    </table>

                    <h2 style="margin: 24px 0 12px 0; color: #111827; font-size: 16px; font-weight: 700;">Message Body</h2>
                    <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; padding: 16px; border-radius: 8px; font-size: 14px; color: #374151; line-height: 1.6; white-space: pre-line; margin-bottom: 28px;">
${data.message}
                    </div>

                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center">
                          <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(subjectText)}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 700; text-align: center; box-shadow: 0 2px 4px 0 rgba(79, 70, 229, 0.2);">
                            Reply to Sender
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 16px 24px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #9ca3af;">
                    Sent automatically from Dhyey Bhuva Portfolio Website.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Inquiry Form" <${process.env.SMTP_USER}>`,
    to: receiverEmail,
    replyTo: data.email,
    subject: `📩 [Inquiry] ${subjectText} - ${data.name}`,
    html: htmlContent,
  });
}

/**
 * Sends a confirmation email to the user acknowledging receipt of their inquiry.
 */
export async function sendUserConfirmationEmail(data: EmailInquiryData) {
  const dateString = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
    dateStyle: "long",
    timeStyle: "medium",
  });

  const subjectText = data.subject?.trim() || "General Inquiry";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Inquiry Received - Dhyey Bhuva</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; -webkit-font-smoothing: antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb;">
                <!-- Header Banner -->
                <tr>
                  <td style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 32px 24px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800;">Message Received</h1>
                    <p style="margin: 8px 0 0 0; color: #e0e7ff; font-size: 14px;">Thank you for reaching out. I'll get back to you shortly.</p>
                  </td>
                </tr>
                <!-- Content Section -->
                <tr>
                  <td style="padding: 32px 24px;">
                    <p style="margin: 0 0 16px 0; font-size: 15px; color: #374151; line-height: 1.6;">
                      Hi <strong>${data.name}</strong>,
                    </p>
                    <p style="margin: 0 0 24px 0; font-size: 15px; color: #374151; line-height: 1.6;">
                      Your message has been received and registered. I appreciate you taking the time to share your inquiry.
                      I will review your message and reply as soon as possible, typically <strong>within 24 hours</strong>.
                    </p>

                    <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 16px; font-weight: 700; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">Inquiry Summary</h2>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; border-collapse: collapse; margin-bottom: 28px;">
                      <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 10px; font-weight: 600; color: #6b7280; width: 120px; vertical-align: top;">Subject</td>
                        <td style="padding: 10px; color: #374151; vertical-align: top;">${subjectText}</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 10px; font-weight: 600; color: #6b7280; width: 120px; vertical-align: top;">Submitted At</td>
                        <td style="padding: 10px; color: #374151; vertical-align: top;">${dateString} (IST)</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px; font-weight: 600; color: #6b7280; width: 120px; vertical-align: top;">Message</td>
                        <td style="padding: 10px; color: #374151; vertical-align: top; line-height: 1.5; white-space: pre-line;">${data.message}</td>
                      </tr>
                    </table>

                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #374151; font-weight: 600;">
                      Best regards,
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #4f46e5; font-weight: 700;">
                      Dhyey Bhuva
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 24px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; line-height: 1.6;">
                    <div style="font-weight: 600; color: #374151; margin-bottom: 4px;">Dhyey Bhuva Portfolio</div>
                    <div>Website: <a href="https://dhyeybhuva.tech" style="color: #4f46e5; text-decoration: none;">dhyeybhuva.tech</a></div>
                    <div>Email: <a href="mailto:dhyeybhuva2003@gmail.com" style="color: #4f46e5; text-decoration: none;">dhyeybhuva2003@gmail.com</a></div>
                    <div>Phone: <a href="tel:+916355830394" style="color: #4f46e5; text-decoration: none;">+91 6355830394</a></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Dhyey Bhuva" <${process.env.SMTP_USER}>`,
    to: data.email,
    subject: `Inquiry Confirmation - Dhyey Bhuva`,
    html: htmlContent,
  });
}
