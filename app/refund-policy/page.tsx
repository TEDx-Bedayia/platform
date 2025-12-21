import React from "react";
import styles from "../styles/Policy.module.css";

import { Poppins, Ubuntu } from "next/font/google";
const ubuntu = Ubuntu({ subsets: ["latin"], weight: ["400", "500", "700"] });
const poppins = Poppins({ subsets: ["latin"], weight: "700" });

export default function RefundPolicy() {
  return (
    <article
      className={styles.container}
      aria-labelledby="refund-policy-title"
      style={ubuntu.style}
    >
      <header className={styles.header}>
        <h1
          id="refund-policy-title"
          className={styles.title}
          style={poppins.style}
        >
          Refund &amp; Cancellation Policy
        </h1>
        <p className={styles.effective}>
          Effective Date:{" "}
          <time dateTime="September 16, 2025">September 16, 2025</time>
        </p>
      </header>

      <section className={styles.section}>
        <p>
          TEDx Youth Bedayia School eTickets are issued for admission to a
          one-time live event. Please review this policy carefully before
          completing your purchase.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>1. General Policy</h2>
        <ul className={styles.list}>
          <li>
            All ticket sales are <strong>final</strong>.
          </li>
          <li>
            eTickets are <strong>non-refundable</strong> and{" "}
            <strong>non-transferable</strong> except as outlined below.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>2. Event Cancellation or Rescheduling</h2>
        <ul className={styles.list}>
          <li>
            If the event is <strong>canceled</strong> by the organizers, ticket
            holders will receive a full refund to the original payment method
            (for online payments) or in cash (for school office payments).
          </li>
          <li>
            If the event is <strong>rescheduled</strong>, existing eTickets will
            remain valid. If you cannot attend the new date, you may request a
            refund.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>3. Attendee-Initiated Cancellations</h2>
        <ul className={styles.list}>
          <li>
            No refunds will be issued if you are unable to attend after
            purchase.
          </li>
          <li>
            No refunds are provided for late arrivals, no-shows, or partial
            attendance.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>4. Duplicate or Invalid Purchases</h2>
        <p>
          Please check all details before confirming payment. Refunds will not
          be provided for accidental duplicate purchases unless you notify us
          within <strong>24 hours</strong> of the transaction.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>5. How to Request a Refund</h2>
        <p>
          To request a refund under the conditions outlined above, please
          contact us at{" "}
          <a href={`mailto:tedxyouth@bedayia.com`} className={styles.link}>
            tedxyouth@bedayia.com
          </a>{" "}
          and provide:
        </p>
        <ul className={styles.list}>
          <li>Your full name</li>
          <li>Ticket details</li>
          <li>Proof of purchase</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>6. Processing Time</h2>
        <p>
          Approved refunds will be processed within{" "}
          <strong>5-10 business days</strong>. Timelines may vary depending on
          your bank or payment provider.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>7. Contact</h2>
        <address className={styles.address}>
          <strong>TEDx Youth Bedayia School Team</strong>
          <br />
          <a href={`mailto:tedxyouth@bedayia.com`} className={styles.link}>
            tedxyouth@bedayia.com
          </a>
        </address>
      </section>

      <footer className={styles.footer}>
        <p className={styles.small}>
          This Refund &amp; Cancellation Policy applies only to TEDx Youth
          Bedayia School events and may be updated at any time.
        </p>
      </footer>
    </article>
  );
}
