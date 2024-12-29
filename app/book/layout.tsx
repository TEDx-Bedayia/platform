"use client";
import { motion } from "framer-motion";
import { Ubuntu } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./booking_nav.module.css";

const ubuntu = Ubuntu({ weight: "300", subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ease: "easeInOut", duration: 2.5 }}
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 10000 }}
      >
        <nav className={styles.navigation} style={ubuntu.style}>
          <Image
            width="336"
            height="27"
            src="/main-logo.png"
            alt="Event's Logo"
            style={{ marginRight: "auto" }}
          />

          <Link href={pathname == "/book" ? "/book/group" : "/book"}>
            Book a {pathname == "/book" ? "Group " : ""}Ticket
          </Link>

          <Link
            href="https://wa.me/message/VNHEAKD7RJD5A1?src=qr"
            style={{ marginLeft: "auto" }}
          >
            Contact Us
          </Link>
        </nav>
      </motion.div>
      {children}
    </>
  );
}
