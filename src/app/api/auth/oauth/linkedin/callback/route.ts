import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Account from "@/models/Account";
import Profile from "@/models/Profile";
import Preferences from "@/models/Preferences";
import AuditLog from "@/models/AuditLog";
import CrmProfile from "@/models/CrmProfile";
import Subscriber from "@/models/Subscriber";
import Tag from "@/models/Tag";
import BrandSetting from "@/models/BrandSetting";
import EmailTemplate from "@/models/EmailTemplate";
import { encryptToken } from "@/lib/encryption";
import { signToken } from "@/lib/jwt";
import { getEmailQueue } from "@/lib/queue/emailQueue";
import { compileEmailHtml, interpolateVariables } from "@/lib/emails/renderer";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    const cookieStore = await cookies();
    const savedState = cookieStore.get("oauth_state")?.value;

    // 1. CSRF Verification
    if (!state || !savedState || state !== savedState) {
      return NextResponse.json({ success: false, message: "Invalid state. Potential CSRF attack." }, { status: 400 });
    }

    if (!code) {
      return NextResponse.json({ success: false, message: "Authorization code missing." }, { status: 400 });
    }

    // Clear state cookie
    cookieStore.delete("oauth_state");

    const clientId = process.env.LINKEDIN_CLIENT_ID || "";
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET || "";
    const host = request.headers.get("host");
    const protocol = host?.includes("localhost") || host?.includes("127.0.0.1") ? "http" : "https";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL 
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "")
      : host 
        ? `${protocol}://${host}`
        : "http://localhost:3000";

    const redirectUri = `${appUrl}/api/auth/oauth/linkedin/callback`;

    // 2. Exchange authorization code for token
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error("[LinkedIn OAuth Callback] Token exchange failed:", errorText);
      return NextResponse.json({ success: false, message: "Failed to exchange OAuth code." }, { status: 500 });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in;
    const tokenExpiry = expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined;

    // 3. Fetch LinkedIn OpenID UserInfo Profile
    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.ok) {
      console.error("[LinkedIn OAuth Callback] Failed to fetch user info.");
      return NextResponse.json({ success: false, message: "Failed to fetch user profile." }, { status: 500 });
    }

    const linkedinUser = await profileRes.json();
    const { sub: providerId, given_name: firstName, family_name: lastName, email, picture: avatar, email_verified } = linkedinUser;

    if (!email) {
      return NextResponse.json({ success: false, message: "Email not provided by LinkedIn account." }, { status: 400 });
    }

    const fullName = `${firstName || ""} ${lastName || ""}`.trim() || "LinkedIn User";

    await connectToDatabase();

    // 4. Client Request Parsing (CRM Logging)
    const userAgent = request.headers.get("user-agent") || "";
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    let browser = "Unknown";
    let device = "Desktop";

    if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Safari")) browser = "Safari";
    else if (userAgent.includes("Edge")) browser = "Edge";

    if (/Mobi|Android|iPhone/i.test(userAgent)) {
      device = "Mobile";
    } else if (/iPad|Tablet/i.test(userAgent)) {
      device = "Tablet";
    }

    // Read UTM and referrer params from cookies
    const utmSource = cookieStore.get("utm_source")?.value || "";
    const utmMedium = cookieStore.get("utm_medium")?.value || "";
    const utmCampaign = cookieStore.get("utm_campaign")?.value || "";
    const referralSource = cookieStore.get("referral_source")?.value || "";
    const landingPage = cookieStore.get("landing_page")?.value || "/";

    const utmMap = new Map<string, string>();
    if (utmSource) utmMap.set("source", utmSource);
    if (utmMedium) utmMap.set("medium", utmMedium);
    if (utmCampaign) utmMap.set("campaign", utmCampaign);

    // 5. Database Transaction / Records Creation
    let user = await User.findOne({ email: email.toLowerCase() });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await User.create({
        name: fullName,
        email: email.toLowerCase(),
        role: "USER",
        status: "ACTIVE",
        provider: "LINKEDIN",
      });
    } else {
      user.lastLogin = new Date();
      await user.save();
    }

    // Connect Account
    let account = await Account.findOne({ user: user._id, provider: "LINKEDIN" });
    if (!account) {
      account = await Account.create({
        user: user._id,
        provider: "LINKEDIN",
        providerId,
        accessToken: encryptToken(accessToken),
        refreshToken: refreshToken ? encryptToken(refreshToken) : undefined,
        expiry: tokenExpiry,
        avatar,
        verifiedEmail: !!email_verified,
      });
    } else {
      account.accessToken = encryptToken(accessToken);
      if (refreshToken) account.refreshToken = encryptToken(refreshToken);
      if (tokenExpiry) account.expiry = tokenExpiry;
      account.avatar = avatar;
      await account.save();
    }

    // Ensure Profile exists
    let profile = await Profile.findOne({ user: user._id });
    if (!profile) {
      profile = await Profile.create({
        user: user._id,
        fullName,
        profilePicture: avatar,
        language: "en",
        country: "IN",
      });
    }

    // Ensure Preferences exist
    let preferences = await Preferences.findOne({ user: user._id });
    if (!preferences) {
      preferences = await Preferences.create({
        user: user._id,
        marketingOptIn: true,
        marketingOptInDate: new Date(),
      });
    } else {
      preferences.marketingOptIn = true;
      preferences.marketingOptInDate = new Date();
      await preferences.save();
    }

    // Ensure Subscriber tag lists are created and assigned
    let linkedinTag = await Tag.findOne({ slug: "linkedin-user" });
    if (!linkedinTag) {
      linkedinTag = await Tag.create({ name: "LinkedIn User", slug: "linkedin-user" });
    }

    let webTag = await Tag.findOne({ slug: "website-user" });
    if (!webTag) {
      webTag = await Tag.create({ name: "Website User", slug: "website-user" });
    }

    let subscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    if (!subscriber) {
      subscriber = await Subscriber.create({
        email: email.toLowerCase(),
        firstName,
        lastName,
        status: "SUBSCRIBED",
        tags: [linkedinTag._id, webTag._id],
      });
    } else {
      subscriber.status = "SUBSCRIBED";
      // Append tags if they don't exist
      const existingTags = subscriber.tags.map((t: any) => t.toString());
      if (!existingTags.includes(linkedinTag._id.toString())) subscriber.tags.push(linkedinTag._id);
      if (!existingTags.includes(webTag._id.toString())) subscriber.tags.push(webTag._id);
      await subscriber.save();
    }

    // Create / Update CRM Profile
    let crm = await CrmProfile.findOne({ user: user._id });
    if (!crm) {
      crm = await CrmProfile.create({
        user: user._id,
        subscriber: subscriber._id,
        device,
        browser,
        ipAddress,
        referralSource,
        campaignSource: utmSource,
        utmParameters: utmMap,
        landingPage,
        loginHistory: [{ loginAt: new Date(), ipAddress, device, browser }],
      });
    } else {
      crm.loginHistory.push({ loginAt: new Date(), ipAddress, device, browser });
      await crm.save();
    }

    // Create Audit Log
    await AuditLog.create({
      user: user._id,
      action: isNewUser ? "REGISTER" : "LOGIN",
      ipAddress,
      device,
      browser,
      details: { provider: "LINKEDIN", verifiedEmail: !!email_verified },
    });

    // 6. Sign JWT and Set Session Cookie
    const sessionToken = await signToken(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      7 * 24 * 60 * 60
    );

    // Set cookie
    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    // If role is ADMIN, set admin_token cookie too
    if (user.role === "ADMIN") {
      cookieStore.set("admin_token", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });
    }

    // 7. Dispatch Welcome Onboarding Email (if new user)
    if (isNewUser) {
      try {
        const brand = (await BrandSetting.findOne({})) || {
          brandName: "Dhyey Bhuva Portfolio",
          supportEmail: "support@dhyeybhuva.tech",
          replyEmail: "noreply@dhyeybhuva.tech",
          website: "https://dhyeybhuva.tech",
        };

        const welcomeTemplate = await EmailTemplate.findOne({ slug: "welcome-email" });
        if (welcomeTemplate) {
          const compiledSubject = interpolateVariables(welcomeTemplate.subject, {
            subscriber,
            currentDate: new Date().toLocaleDateString(),
          });
          const compiledHtml = compileEmailHtml(
            welcomeTemplate.jsonLayout,
            brand,
            subscriber,
            { subject: compiledSubject, name: "Welcome Onboard" }
          );

          const emailQueue = getEmailQueue();
          await emailQueue.add("send-email", {
            recipientEmail: subscriber.email,
            subject: compiledSubject,
            htmlContent: compiledHtml,
            subscriberId: subscriber._id.toString(),
            senderName: brand.brandName || "Dhyey Bhuva",
            replyTo: brand.replyEmail || "noreply@dhyeybhuva.tech",
          });
        }
      } catch (queueErr) {
        console.error("[LinkedIn OAuth Callback] Welcome email queue failure:", queueErr);
      }
    }

    // 8. Redirect Page
    return NextResponse.redirect(`${appUrl}/?subscribed=true`);
  } catch (err: any) {
    console.error("LinkedIn OAuth Callback Error:", err);
    return NextResponse.json({ success: false, message: "Internal server authentication error" }, { status: 500 });
  }
}
