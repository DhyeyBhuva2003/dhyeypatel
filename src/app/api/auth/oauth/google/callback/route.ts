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

    // 1. CSRF Protection
    if (!state || !savedState || state !== savedState) {
      return NextResponse.json({ success: false, message: "Invalid state. Potential CSRF attack." }, { status: 400 });
    }

    if (!code) {
      return NextResponse.json({ success: false, message: "Authorization code missing." }, { status: 400 });
    }

    // Clear state cookie
    cookieStore.delete("oauth_state");

    const clientId = process.env.GOOGLE_CLIENT_ID || "";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
    const host = request.headers.get("host");
    const protocol = host?.includes("localhost") || host?.includes("127.0.0.1") ? "http" : "https";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL 
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "")
      : host 
        ? `${protocol}://${host}`
        : "http://localhost:3000";

    const redirectUri = `${appUrl}/api/auth/oauth/google/callback`;

    // 2. Exchange authorization code for token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
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
      console.error("[Google OAuth Callback] Token exchange failed:", errorText);
      return NextResponse.json({ success: false, message: "Failed to exchange OAuth code." }, { status: 500 });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token; // offline access required to receive this
    const expiresIn = tokenData.expires_in;
    const tokenExpiry = expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined;

    // 3. Fetch Google User Profile
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.ok) {
      console.error("[Google OAuth Callback] Failed to fetch user info.");
      return NextResponse.json({ success: false, message: "Failed to fetch user profile." }, { status: 500 });
    }

    const googleUser = await profileRes.json();
    const { sub: providerId, name, email, picture: avatar, locale, email_verified } = googleUser;

    if (!email) {
      return NextResponse.json({ success: false, message: "Email not provided by Google account." }, { status: 400 });
    }

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
        name,
        email: email.toLowerCase(),
        role: "USER",
        status: "ACTIVE",
        provider: "GOOGLE",
      });
    } else {
      user.lastLogin = new Date();
      await user.save();
    }

    // Connect Account
    let account = await Account.findOne({ user: user._id, provider: "GOOGLE" });
    if (!account) {
      account = await Account.create({
        user: user._id,
        provider: "GOOGLE",
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
      const nameParts = name.trim().split(/\s+/);
      profile = await Profile.create({
        user: user._id,
        fullName: name,
        profilePicture: avatar,
        language: locale || "en",
        country: locale?.split("-")[1] || "IN",
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
    let googleTag = await Tag.findOne({ slug: "google-user" });
    if (!googleTag) {
      googleTag = await Tag.create({ name: "Google User", slug: "google-user" });
    }

    let webTag = await Tag.findOne({ slug: "website-user" });
    if (!webTag) {
      webTag = await Tag.create({ name: "Website User", slug: "website-user" });
    }

    let subscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    if (!subscriber) {
      subscriber = await Subscriber.create({
        email: email.toLowerCase(),
        firstName,
        lastName,
        status: "SUBSCRIBED",
        tags: [googleTag._id, webTag._id],
      });
    } else {
      subscriber.status = "SUBSCRIBED";
      // Append tags if they don't exist
      const existingTags = subscriber.tags.map((t: any) => t.toString());
      if (!existingTags.includes(googleTag._id.toString())) subscriber.tags.push(googleTag._id);
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
      details: { provider: "GOOGLE", verifiedEmail: !!email_verified },
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
        console.error("[Google OAuth Callback] Welcome email queue failure:", queueErr);
      }
    }

    // 8. Redirect Page
    return NextResponse.redirect(`${appUrl}/?subscribed=true`);
  } catch (err: any) {
    console.error("Google OAuth Callback Error:", err);
    return NextResponse.json({ success: false, message: "Internal server authentication error" }, { status: 500 });
  }
}
