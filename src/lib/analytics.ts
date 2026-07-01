"use client";

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Gets cookie consent status from client document.cookies.
 * Returns true if accepted, false if declined, and null if no choice made yet.
 */
export function getCookieConsent(): boolean | null {
  if (typeof window === "undefined") return null;

  const match = document.cookie.match(/(^| )cookie_consent=([^;]+)/);
  if (!match) return null;

  const value = match[2];
  if (value === "accepted") return true;
  if (value === "declined") return false;
  return null;
}

/**
 * Saves cookie consent choice to cookies (expires in 1 year).
 * Triggers window event to notify tracking script immediately.
 */
export function setCookieConsent(consent: "accepted" | "declined") {
  if (typeof window === "undefined") return;

  const maxAge = 365 * 24 * 60 * 60; // 1 year in seconds
  document.cookie = `cookie_consent=${consent}; max-age=${maxAge}; path=/; SameSite=Lax; Secure`;

  // Dispatch custom event to notify GoogleAnalytics component instantly
  const event = new CustomEvent("cookieConsentChange", { detail: consent });
  window.dispatchEvent(event);
}

/**
 * Generic helper to publish event to Google Analytics dataLayer.
 * Prevents execution outside production or if consent is not granted.
 */
export function trackEvent(eventName: string, params?: Record<string, any>) {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction && typeof window !== "undefined" && typeof window.gtag === "function") {
    const consent = getCookieConsent();
    if (consent === true) {
      window.gtag("event", eventName, params);
    }
  } else if (!isProduction) {
    // Log to console in development mode to aid debugging
    console.log(`[GA4 Event] ${eventName}:`, params);
  }
}

// Reusable Custom Event Tracker Helpers

export const trackContactFormSubmit = (formType: string = "general") => {
  trackEvent("contact_form_submit", { form_type: formType });
};

export const trackNewsletterSignup = (source: string = "footer") => {
  trackEvent("newsletter_signup", { signup_source: source });
};

export const trackResumeDownload = (format: string = "pdf") => {
  trackEvent("resume_download", { file_format: format });
};

export const trackProjectView = (projectSlug: string, projectName: string) => {
  trackEvent("project_view", { project_slug: projectSlug, project_name: projectName });
};

export const trackBlogView = (blogSlug: string, blogTitle: string) => {
  trackEvent("blog_view", { blog_slug: blogSlug, blog_title: blogTitle });
};

export const trackServiceView = (serviceSlug: string, serviceName: string) => {
  trackEvent("service_view", { service_slug: serviceSlug, service_name: serviceName });
};

export const trackPortfolioView = () => {
  trackEvent("portfolio_view");
};

export const trackHireMeClick = (location: string) => {
  trackEvent("hire_me_click", { button_location: location });
};

export const trackWhatsAppClick = (purpose: string = "general") => {
  trackEvent("whatsapp_click", { purpose });
};

export const trackEmailClick = (email: string) => {
  trackEvent("email_click", { target_email: email });
};

export const trackPhoneClick = (phone: string) => {
  trackEvent("phone_click", { target_phone: phone });
};

export const trackLinkedInClick = () => {
  trackEvent("linkedin_click");
};

export const trackGitHubClick = () => {
  trackEvent("github_click");
};

export const trackYouTubeClick = () => {
  trackEvent("youtube_click");
};

export const trackBookConsultationClick = (url: string) => {
  trackEvent("book_consultation_click", { booking_url: url });
};
