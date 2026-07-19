import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorker } from "@/components/service-worker";

const siteUrl = process.env.SITE_URL ?? "https://thelastfreemission.hu";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "The Last Free Mission",
  description: "Official Groom Evaluation for Martin \"Martinka\".",
  applicationName: "The Last Free Mission",
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "The Last Free Mission",
    description: "Official Groom Evaluation for Martin \"Martinka\".",
    url: siteUrl,
    siteName: "The Last Free Mission",
    type: "website"
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Last Free Mission"
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg"
  }
};

export const viewport: Viewport = {
  themeColor: "#0E0E0E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ServiceWorker />
        {children}
      </body>
    </html>
  );
}
