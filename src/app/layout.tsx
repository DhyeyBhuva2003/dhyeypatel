import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Dhyey Bhuva | Staff Software Engineer & Solutions Architect",
    template: "%s | Dhyey Bhuva",
  },
  description:
    "Personal Brand, Portfolio, and Freelance Services platform for Dhyey Bhuva. Custom SaaS MVP builds, backend optimizations, and AI agent automation.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://dhyeybhuva.com"),
  openGraph: {
    title: "Dhyey Bhuva | Staff Software Engineer & Solutions Architect",
    description:
      "Personal Brand, Portfolio, and Freelance Services platform for Dhyey Bhuva. Custom SaaS MVP builds, backend optimizations, and AI agent automation.",
    url: "https://dhyeybhuva.com",
    siteName: "Dhyey Bhuva Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dhyey Bhuva | Staff Software Engineer",
    description: "Personal Brand, Portfolio, and Freelance Services platform for Dhyey Bhuva.",
  },
  robots: {
    index: true,
    follow: true,
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
