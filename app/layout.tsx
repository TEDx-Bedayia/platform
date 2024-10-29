import type { Metadata } from "next";
import type { Author } from "next/dist/lib/metadata/types/metadata-types";
import "./globals.css";
import NavBar from "./navbar";

const support: Author = {
  name: "Aly Mobarak", // Change with your name (head)
  url: "mailto:alymmobarak@hotmail.com", // Change with your public email
};

const YEAR = 25; // Change to current year

/* DO NOT EDIT */
export const metadata: Metadata = {
  title: `TEDxYouth@BedayiaSchool'${YEAR}`,
  description:
    "This is the official website for the TEDxYouth event hosted at Bedayia International School. Stop by to book your tickets, know more about us, and have some fun! Waiting for you!",
  authors: [support],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {NavBar()}
        {children}
      </body>
    </html>
  );
}
