"use client";
import Link from "next/link";
import styles from "../book.module.css";
import "../htmlcolor.css";

function XCircle({ className = "" }) {
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
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

export default function Failure() {
  return (
    <div className={styles.successContainer}>
      <div className={styles.successCard}>
        <center>
          <XCircle className={styles.failureIcon} />
        </center>
        <h1 className={styles.successTitle}>Payment Failed</h1>
        <p className={styles.successMessage}>
          We&apos;re sorry, but your payment could not be processed.
        </p>
        <p className={styles.successSubMessage}>
          Please check your payment details and try again using the link sent to
          your email.
        </p>

        <Link href="/" className={styles.successButton}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
