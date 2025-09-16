"use client";
import { CheckCircle, XCircle } from "lucide-react";
import styles from "../book.module.css";
import "../htmlcolor.css";

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

        <a href="/" className={styles.successButton}>
          Back to Home
        </a>
      </div>
    </div>
  );
}
