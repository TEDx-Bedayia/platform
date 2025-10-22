import React from "react";
import styles from "../styles/Policy.module.css";

import { Poppins, Ubuntu } from "next/font/google";
import { paymentProcessor } from "../metadata";
const ubuntu = Ubuntu({ subsets: ["latin"], weight: ["400", "500", "700"] });
const poppins = Poppins({ subsets: ["latin"], weight: "700" });

export default function PrivacyPolicy() {
  return (
    <article
      className={styles.container}
      aria-labelledby="privacy-policy-title"
      style={ubuntu.style}
    >
      <header className={styles.header}>
        <h1
          id="privacy-policy-title"
          className={styles.title}
          style={poppins.style}
        >
          Privacy Policy
        </h1>
        <p className={styles.effective}>
          Effective Date:{" "}
          <time dateTime="September 16, 2025">September 16, 2025</time>
        </p>
      </header>

      <section className={styles.section}>
        <p>
          <strong>TEDx Youth Bedayia School</strong> (“we”, “our”, or “us”)
          respects your privacy and is committed to protecting the personal
          information you share with us. This Privacy Policy explains how we
          collect, use, share, and retain the personal information necessary to
          issue and admit attendees to our events.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>1. Information We Collect</h2>
        <p>
          When you purchase an eTicket, we collect only the information
          necessary to admit you into the event:
        </p>
        <ul className={styles.list}>
          <li>Full name</li>
          <li>Email address</li>
          <li>Phone number</li>
          <li>Ticket creation date</li>
          <li>Admission status (whether the attendee was admitted)</li>
        </ul>

        <p className={styles.note}>
          <strong>We do not collect or store:</strong>
        </p>
        <ul className={styles.list}>
          <li>
            Credit card or payment information (payments are processed by
            {paymentProcessor})
          </li>
          <li>Device metadata, IP addresses, or geolocation identifiers</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>2. How We Use Your Information</h2>
        <p>We use your information solely for the purposes listed below:</p>
        <ul className={styles.list}>
          <li>To issue and validate your eTicket</li>
          <li>
            To contact you with event updates or important information regarding
            your ticket
          </li>
          <li>To confirm admission during the event</li>
          <li>
            To comply with legal or regulatory requirements, where applicable
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>3. How We Share Your Information</h2>
        <p>
          We do not sell or rent your personal information. Sharing is
          restricted to limited circumstances:
        </p>
        <ul className={styles.list}>
          <li>
            With service providers that perform services on our behalf (for
            example, {paymentProcessor})
          </li>
          <li>When required by law or in response to valid legal requests</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>4. Data Security</h2>
        <p>
          We implement administrative and technical safeguards designed to
          protect your personal information against unauthorized access,
          disclosure, or destruction. While we take reasonable measures, no
          system is completely secure — if you have security concerns, please
          contact us.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>5. Data Retention</h2>
        <p>
          We retain personal information only as long as necessary to fulfill
          the purposes described in this Privacy Policy, or as required by law.
          All data is deleted after the event concludes.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>6. Your Rights</h2>
        <p>
          Depending on your jurisdiction, you may have rights to access,
          correct, or delete the personal information we hold about you. To
          exercise these rights, contact us at{" "}
          <a href={`mailto:tedxyouth@bedayia.com`} className={styles.link}>
            tedxyouth@bedayia.com
          </a>
          .
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>7. Third-Party Payment Processor</h2>
        <p>
          All payments are processed through <strong>{paymentProcessor}</strong>
          . We do not have access to or store credit card or financial details.
          Please review {paymentProcessor}&apos;s privacy policy for details on
          how they handle payment data.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>8. Contact Us</h2>
        <p>
          If you have questions or concerns about this Privacy Policy or our
          data practices, please contact:
        </p>
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
          This policy is intentionally concise and focused on data collected for
          event admission. For additional legal details or location-specific
          rights (e.g., GDPR), please contact us.
        </p>
      </footer>
    </article>
  );
}
