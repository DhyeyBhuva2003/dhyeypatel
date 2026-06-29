"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { getCookieConsent, GA_MEASUREMENT_ID } from "@/lib/analytics";

export default function GoogleAnalytics() {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. Initial consent check
    setHasConsent(getCookieConsent());

    // 2. Listen to consent changes dynamically
    const handleConsentChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail === "accepted") {
        setHasConsent(true);
      } else {
        setHasConsent(false);
      }
    };

    window.addEventListener("cookieConsentChange", handleConsentChange);
    return () => {
      window.removeEventListener("cookieConsentChange", handleConsentChange);
    };
  }, []);

  const isProduction = process.env.NODE_ENV === "production";

  // Prevent script injection if not in production, missing measurement ID, or consent is not accepted
  if (!isProduction || !GA_MEASUREMENT_ID || hasConsent !== true) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              anonymize_ip: true
            });
          `,
        }}
      />
    </>
  );
}
