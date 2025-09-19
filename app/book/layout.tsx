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
      <div
        style={{
          position: "absolute",
          bottom: "6rem",
          textAlign: "center",
          width: "100vw",
          color: "lightgray",
          fontSize: ".75rem",
        }}
        className={styles.hideOnMobile}
      >
        <p>Bedayia International School, New Cairo</p>
        <p>
          <Link
            href="/privacy-policy"
            target="_blank"
            className="text-secondary-200"
          >
            Privacy Policy
          </Link>
          {" - "}
          <Link
            href="/delivery-policy"
            target="_blank"
            className="text-secondary-200"
          >
            Delivery Policy
          </Link>
          {" - "}
          <Link
            href="/refund-policy"
            target="_blank"
            className="text-secondary-200"
          >
            Refund Policy
          </Link>
        </p>
      </div>

      <span
        style={{
          position: "absolute",
          // bottom: "-1.5rem",
          textAlign: "center",
          width: "100vw",
          fontSize: ".75rem",
          color: "#E0E0E0",
        }}
        className={styles.contact}
      >
        Contact us on{" "}
        <Link
          className="font-body"
          href="https://wa.me/message/VNHEAKD7RJD5A1?src=qr"
          passHref
        >
          +201055782533
        </Link>{" "}
      </span>

      <Link
        href="mailto:tedxyouth@bedayia.com"
        passHref
        style={{
          position: "absolute",
          // bottom: "-1.5rem",
          textAlign: "center",
          width: "100vw",
          color: "lightgray",
          fontSize: ".75rem",
        }}
        className={`${styles.contact2} ${styles.hideOnMobile}`}
      >
        OR <span className="text-secondary-200">tedxyouth@bedayia.com</span>
      </Link>

    </>
  );
}
