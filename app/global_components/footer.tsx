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
      className="flex flex-col items-center justify-center gap-2"
    >
      <div className={styles.footerLinksSecondary}>
        <Link
          href="https://tiktok.com/@tedxyouthbedayiaschool"
          style={{ color: "#25D366", margin: "", textDecoration: "none" }}
        >
          TikTok
        </Link>
        <Link
          href="https://www.instagram.com/tedxyouthbedayiaschool/"
          target="_blank"
          style={{ color: "#25D366", margin: "", textDecoration: "none" }}
        >
          Instagram
        </Link>
        <Link
          href="https://www.facebook.com/TEDxYouthBedayiaSchool"
          target="_blank"
          style={{ color: "#25D366", margin: "", textDecoration: "none" }}
        >
          Facebook
        </Link>
      </div>
      <div className={styles.footerLinks}>
        <Link
          href="mailto:tedxyouth@bedayia.com"
          style={{ color: "#F9F9F9", margin: "", textDecoration: "none" }}
        >
          Email Us
        </Link>
        <Link
          href="https://wa.me/message/VNHEAKD7RJD5A1"
          target="_blank"
          style={{ color: "#F9F9F9", margin: "", textDecoration: "none" }}
        >
          WhatsApp
        </Link>
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: "1rem",
          color: "lightgray",
          fontSize: ".75rem",
          marginBottom: "1rem",
        }}
      >
        <p>+20 105 578 2533</p>
        <p>Bedayia International School, New Cairo</p>
        <p style={{ marginTop: "0.25rem" }} className={styles.policiesLinks}>
          <Link
            href="/terms-and-conditions"
            target="_blank"
            className="text-secondary-200"
          >
            Terms &amp; Conditions
          </Link>
          {" - "}
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
