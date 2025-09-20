import { Poppins } from "next/font/google";
import Link from "next/link";
import styles from "./footer.module.css";

const poppins = Poppins({ weight: ["400", "700"], subsets: ["latin"] });

export default function Footer() {
  return (
    <footer
      style={{
        color: "#fff",
        padding: "2rem",
        textAlign: "center",
        fontFamily: poppins.style.fontFamily,
      }}
    >
      <div style={{ marginBottom: "1rem" }} className={styles.footerLinks}>
        <Link
          href="/privacy-policy"
          style={{ color: "#fff", margin: "0 1rem", textDecoration: "none" }}
        >
          Privacy Policy
        </Link>
        <Link
          href="/delivery-policy"
          style={{ color: "#fff", margin: "0 1rem", textDecoration: "none" }}
        >
          Delivery Policy
        </Link>
        <Link
          href="/refund-policy"
          style={{ color: "#fff", margin: "0 1rem", textDecoration: "none" }}
        >
          Refund Policy
        </Link>
      </div>
      <div className={styles.footerLinksSecondary}>
        <Link
          href="mailto:tedxyouth@bedayia.com"
          style={{ color: "#25D366", margin: "0 1rem", textDecoration: "none" }}
        >
          Email Us
        </Link>
        <Link
          href="https://wa.me/message/VNHEAKD7RJD5A1"
          target="_blank"
          style={{ color: "#25D366", margin: "0 1rem", textDecoration: "none" }}
        >
          WhatsApp
        </Link>
      </div>

      {/* Socials */}

      <p
        style={{
          marginTop: "2rem",
          fontSize: "0.9rem",
          color: "#e0e0e0",
        }}
      >
        Bedayia International School, New Cairo
      </p>
      <p
        style={{
          marginTop: "0.75rem",
          fontSize: "0.9rem",
          color: "#e0e0e0",
          letterSpacing: "0.05em",
        }}
      >
        &copy; {new Date().getFullYear()} TEDxBedayia. All rights reserved.
      </p>
    </footer>
  );
}
