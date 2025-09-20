"use client";
import { motion } from "framer-motion";
import { Ubuntu } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Footer from "../global_components/footer";
import styles from "./booking_nav.module.css";

const ubuntu = Ubuntu({ weight: "300", subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  return (
    <div className={styles.mainBookingContainer}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ease: "easeInOut", duration: 2.5 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10000,
        }}
      >
        <nav className={styles.navigation} style={ubuntu.style}>
          <Image
            width="336"
            height="27"
            src="/main-logo.png"
            alt="Event's Logo"
            style={{ marginRight: "auto" }}
            className="hover:cursor-pointer hover:opacity-75 transition-opacity duration-200"
            onClick={() => (location.href = "/")}
          />

          <Link href={pathname == "/book" ? "/book/group" : "/book"}>
            Book a {pathname == "/book" ? "Group " : ""}Ticket
          </Link>
        </nav>
      </motion.div>
      {children}
      <div className={styles.footerContainer}>{Footer()}</div>
    </div>
  );
}
