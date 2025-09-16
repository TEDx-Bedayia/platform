"use client";
import Link from "next/link";
import styles from "../book.module.css";
import "../htmlcolor.css";

export function CheckCircle({ className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export default function Success() {
  return (
    <div className={styles.successContainer}>
      <div className={styles.successCard}>
        <center>
          <CheckCircle className={styles.successIcon} />
        </center>
        <h1 className={styles.successTitle}>Payment Successful</h1>
        <p className={styles.successMessage}>Thank you for your purchase! 🎟️</p>
        <p className={styles.successSubMessage}>
          A QR-enabled eTicket has been sent to your email. <br />
          Please keep it handy for event entry.
        </p>

        <Link href="/" className={styles.successButton}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
