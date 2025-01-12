import type { Metadata } from "next";
import "./globals.css";
import { YEAR, support } from "./metadata";

/* DO NOT EDIT */
export const metadata: Metadata = {
  title: `TEDxBedayia | 20${YEAR}`,
  description:
    "Stop by the official TEDxBedayia Website to book your tickets, know more about us, and have some fun! Waiting for you!",
  authors: [support],
  keywords: [
    "TEDx",
    "TEDxYouth",
    "Bedayia",
    "School",
    "Cairo",
    "Egypt",
    "School Event",
    "Event Near Me",
    "Echoes of Time",
    "School Event 20" + YEAR,
  ],
  icons: [
    {
      url: "/favicon-32x32.png",
      sizes: "32x32",
      type: "image/png",
    },
    {
      url: "/favicon-16x16.png",
      sizes: "16x16",
      type: "image/png",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <meta name="robots" content="index, follow"></meta>
        <meta name="googlebot" content="index, follow"></meta>
        {/* OG */}
        <meta property="og:type" content="website"></meta>
        <meta property="og:title" content={metadata.title!.toString()}></meta>
        <meta property="og:description" content={metadata.description!}></meta>
        <meta property="og:image" content="/og-image.png"></meta>
        <meta property="og:url" content="TEDxBedayia.com"></meta>
        <meta
          property="og:site_name"
          content={metadata.title!.toString()}
        ></meta>
        <meta name="theme-color" content="#100d26"></meta>
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>{children}</body>
    </html>
  );
}
