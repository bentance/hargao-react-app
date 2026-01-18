import type { Metadata } from "next";
import { BRAND_CONFIG } from "@/config";
import { PostHogProvider } from "@/components/PostHogProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: BRAND_CONFIG.seo.defaultTitle,
  description: BRAND_CONFIG.seo.description,
  keywords: BRAND_CONFIG.seo.keywords,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
