import type { Metadata } from "next";
import "./globals.css";
import { YEAR, support } from "./metadata";

/* DO NOT EDIT */
export const metadata: Metadata = {
  title: `TEDxYouth@BedayiaSchool'${YEAR}`,
  description:
    "This is the official website for the TEDxYouth event hosted at Bedayia International School. Stop by to book your tickets, know more about us, and have some fun! Waiting for you!",
  authors: [support],
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
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>{children}</body>
    </html>
  );
}
