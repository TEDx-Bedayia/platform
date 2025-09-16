import React from "react";
import styles from "./DeliveryPolicy.module.css";

type Props = {
  city?: string;
  effectiveDate?: string;
  contactEmail?: string;
};

const DeliveryPolicy: React.FC<Props> = ({
  city = "Youth Bedayia School",
  effectiveDate = "September 16, 2025",
  contactEmail = "tedxyouth@bedayia.com",
}) => {
  return (
    <article
      className={styles.container}
      aria-labelledby="delivery-policy-title"
    >
      <header className={styles.header}>
        <h1 id="delivery-policy-title" className={styles.title}>
          Delivery &amp; Shipment Policy
        </h1>
        <p className={styles.effective}>
          Effective Date: <time dateTime={effectiveDate}>{effectiveDate}</time>
        </p>
      </header>

      <section className={styles.section}>
        <p>
          At TEDx {city}, all tickets are delivered electronically as eTickets.
          No physical tickets are issued or shipped.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>1. Delivery Method</h2>
        <ul className={styles.list}>
          <li>
            <strong>Online Payments (via PayMob):</strong> eTickets are
            delivered instantly by email to the address provided during
            purchase, once payment is successfully processed.
          </li>
          <li>
            <strong>Cash Payments (at the school office):</strong> eTickets are
            issued after payment is received in person and will then be sent by
            email to the address provided.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>2. Delivery Timeframe</h2>
        <ul className={styles.list}>
          <li>
            <strong>Instant Delivery:</strong> For PayMob payments, delivery
            occurs immediately after confirmation.
          </li>
          <li>
            <strong>Cash Payments:</strong> Delivery occurs within 24 hours of
            payment confirmation at the school office.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>3. Non-Delivery Issues</h2>
        <p>If you do not receive your eTicket within the stated timeframe:</p>
        <ul className={styles.list}>
          <li>Check your spam or junk email folder</li>
          <li>Ensure the email address provided during purchase was correct</li>
          <li>
            If the issue persists, contact us at{" "}
            <a href={`mailto:${contactEmail}`} className={styles.link}>
              {contactEmail}
            </a>
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>4. No Physical Shipment</h2>
        <p>
          All tickets are digital. We do not ship or provide printed tickets.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>5. Contact</h2>
        <address className={styles.address}>
          <strong>TEDx {city} Team</strong>
          <br />
          <a href={`mailto:${contactEmail}`} className={styles.link}>
            {contactEmail}
          </a>
        </address>
      </section>

      <footer className={styles.footer}>
        <p className={styles.small}>
          This Delivery &amp; Shipment Policy applies only to eTickets purchased
          for TEDx {city} events.
        </p>
      </footer>
    </article>
  );
};

export default DeliveryPolicy;
