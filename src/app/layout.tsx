import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Providers from "@/components/Providers";
import CustomCursor from "@/components/CustomCursor";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import CookieConsent from "@/components/CookieConsent";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Dhyey Bhuva | Full Stack Developer",
    template: "%s | Dhyey Bhuva",
  },
  description:
    "Personal Brand, Portfolio, and Freelance Services platform for Dhyey Bhuva. Custom SaaS MVP builds, backend optimizations, and AI agent automation.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://dhyeybhuva.tech" || "https://dhyeybhuva.netlify.app"),
  openGraph: {
    title: "Dhyey Bhuva | Full Stack Developer",
    url: "https://dhyeybhuva.tech",
    siteName: "Dhyey Bhuva Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dhyey Bhuva | Full Stack Developer",
    description: "Personal Brand, Portfolio, and Freelance Services platform for Dhyey Bhuva.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  verification: {
    google: "eY-W9xR-7MUL41WZVc-X_ooLdanoMTcdhDGzsHYn6EU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-bg-main text-text-main antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <Providers>
            <CustomCursor />
            <GoogleAnalytics />
            {children}
            <CookieConsent />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
