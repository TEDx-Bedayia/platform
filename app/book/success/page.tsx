"use client";
import { CheckCircle } from "lucide-react";
import styles from "../book.module.css";
import "../htmlcolor.css";

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

        <a href="/" className={styles.successButton}>
          Back to Home
        </a>
      </div>
    </div>
  );
}
