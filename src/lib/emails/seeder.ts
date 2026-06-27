import connectToDatabase from "../db";
import BrandSetting from "@/models/BrandSetting";
import EmailTemplate from "@/models/EmailTemplate";

/**
 * Checks if default Brand Settings and core System Templates exist.
 * If not, populates them in MongoDB automatically.
 */
export async function seedDefaultEmailConfig() {
  await connectToDatabase();

  // 1. Seed Brand Settings
  let brand = await BrandSetting.findOne({});
  if (!brand) {
    brand = await BrandSetting.create({
      brandName: "Dhyey Bhuva Portfolio",
      logoUrl: "https://res.cloudinary.com/dfpjcqywv/image/upload/v1700000000/inquiries/logo.png",
      lightLogoUrl: "",
      darkLogoUrl: "",
      primaryColor: "#4f46e5", // indigo-600
      secondaryColor: "#475569", // slate-600
      accentColor: "#2563eb", // blue-650
      supportEmail: "support@dhyeybhuva.tech",
      replyEmail: "noreply@dhyeybhuva.tech",
      website: "https://dhyeybhuva.tech",
      address: "Ahmedabad, Gujarat, India",
      phone: "+91 6355830394",
      socialLinks: {
        twitter: "https://twitter.com/dhyey_bhuva",
        linkedin: "https://linkedin.com/in/dhyeybhuva",
        github: "https://github.com/DhyeyBhuva2003",
        facebook: "",
        instagram: "",
      },
      footerText: "You received this email because you reached out to Dhyey Bhuva.",
      copyright: `© ${new Date().getFullYear()} Dhyey Bhuva. All rights reserved.`,
    });
    console.log("[EmailSeeder] Seeded default Brand Settings");
  }

  // 2. Seed "Contact Inquiry" Template (sent to owner)
  const contactInquiryTemplate = await EmailTemplate.findOne({ slug: "contact-inquiry" });
  if (!contactInquiryTemplate) {
    await EmailTemplate.create({
      name: "New Contact Form Inquiry",
      slug: "contact-inquiry",
      category: "System",
      subject: "📩 [New Inquiry] {{inquiry.subject}} - {{inquiry.name}}",
      html: "Default inquiry notification template",
      jsonLayout: [
        {
          type: "hero",
          title: "New Message Received",
          content: "A visitor has submitted a new inquiry through your portfolio contact form. Details are logged below.",
        },
        {
          type: "table",
          title: "Submission Details",
          items: [
            { name: "Sender Name", value: "{{inquiry.name}}" },
            { name: "Sender Email", value: "{{inquiry.email}}" },
            { name: "Subject", value: "{{inquiry.subject}}" },
            { name: "Reference ID", value: "{{inquiry.referenceId}}" },
            { name: "Date Sent", value: "{{currentDate}}" },
          ],
        },
        {
          type: "quote",
          title: "Message Body",
          content: "{{inquiry.message}}",
        },
        {
          type: "button",
          buttonText: "Reply to Sender",
          url: "mailto:{{inquiry.email}}?subject=Re: {{inquiry.subject}}",
          align: "center",
        },
      ],
      variables: ["inquiry.name", "inquiry.email", "inquiry.subject", "inquiry.message", "inquiry.referenceId"],
      version: 1,
      status: "PUBLISHED",
    });
    console.log("[EmailSeeder] Seeded default 'contact-inquiry' template");
  }

  // 3. Seed "Auto Reply" Template (sent to visitor)
  const autoReplyTemplate = await EmailTemplate.findOne({ slug: "auto-reply" });
  if (!autoReplyTemplate) {
    await EmailTemplate.create({
      name: "Auto Confirmation",
      slug: "auto-reply",
      category: "System",
      subject: "Inquiry Confirmation - Dhyey Bhuva",
      html: "Default client confirmation template",
      jsonLayout: [
        {
          type: "hero",
          title: "Message Received Successfully",
          content: "Hi {{subscriber.firstName || inquiry.name}},\n\nThank you for reaching out! I appreciate you taking the time to share your message. I am reviewing your inquiry and will reply within 24 hours.",
        },
        {
          type: "alert",
          alertType: "info",
          title: "Your Reference ID",
          content: "Please keep this Reference ID for your records: <strong>{{inquiry.referenceId}}</strong>",
        },
        {
          type: "table",
          title: "Your Submitted Message",
          items: [
            { name: "Subject", value: "{{inquiry.subject || 'General Inquiry'}}" },
            { name: "Your Email", value: "{{inquiry.email}}" },
            { name: "Date", value: "{{currentDate}}" },
          ],
        },
        {
          type: "text",
          content: "Feel free to check out my latest works and case studies in the meantime by visiting the main website.",
        },
        {
          type: "button",
          buttonText: "Visit Portfolio Website",
          url: "{{brand.website}}",
          align: "center",
        },
      ],
      variables: ["inquiry.name", "inquiry.subject", "inquiry.email", "inquiry.referenceId"],
      version: 1,
      status: "PUBLISHED",
    });
    console.log("[EmailSeeder] Seeded default 'auto-reply' template");
  }

  // 4. Seed "Welcome Email" Template (sent to new signups)
  const welcomeTemplate = await EmailTemplate.findOne({ slug: "welcome-email" });
  if (!welcomeTemplate) {
    await EmailTemplate.create({
      name: "Welcome Onboard",
      slug: "welcome-email",
      category: "System",
      subject: "Welcome to Dhyey's Platform, {{subscriber.firstName || 'Friend'}}! 👋",
      html: "Default welcome onboarding template",
      jsonLayout: [
        {
          type: "hero",
          title: "Welcome to the Community!",
          content: "Hi {{subscriber.firstName || 'there'}},\n\nI'm thrilled to have you onboard! You've successfully connected your social profile to my updates platform. Let's build something exceptional together.",
        },
        {
          type: "text",
          content: "As a registered member, you will get early access to exclusive case studies, tech blogs, and project announcements.",
        },
        {
          type: "table",
          title: "Account Overview",
          items: [
            { name: "Your Email", value: "{{subscriber.email}}" },
            { name: "Status", value: "Active" },
            { name: "Sign Up Date", value: "{{currentDate}}" },
          ],
        },
        {
          type: "button",
          buttonText: "Browse Portfolio",
          url: "{{brand.website}}/portfolio",
          align: "center",
        },
      ],
      variables: ["subscriber.firstName", "subscriber.email"],
      version: 1,
      status: "PUBLISHED",
    });
    console.log("[EmailSeeder] Seeded default 'welcome-email' template");
  }
}

export default seedDefaultEmailConfig;
