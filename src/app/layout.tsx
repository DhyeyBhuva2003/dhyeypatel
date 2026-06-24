import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import CustomCursor from "@/components/CustomCursor";

const inter = Inter({
  variable: "--font-inter",
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
          <CustomCursor />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
