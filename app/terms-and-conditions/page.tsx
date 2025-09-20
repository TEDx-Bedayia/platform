import React from "react";
import styles from "../styles/Policy.module.css";

import { Poppins, Ubuntu } from "next/font/google";
const ubuntu = Ubuntu({ subsets: ["latin"], weight: ["400", "500", "700"] });
const poppins = Poppins({ subsets: ["latin"], weight: "700" });

export default function TermsConditions() {
  return (
    <article
      className={styles.container}
      aria-labelledby="terms-conditions-title"
      style={ubuntu.style}
    >
      <header className={styles.header}>
        <h1
          id="terms-conditions-title"
          className={styles.title}
          style={poppins.style}
        >
          Terms &amp; Conditions
        </h1>
        <p className={styles.effective}>
          Effective Date:{" "}
          <time dateTime="September 16, 2025">September 16, 2025</time>
        </p>
      </header>

      <section className={styles.section}>
        <p>
          These Terms &amp; Conditions (&quot;Terms&quot;) govern your purchase
          of eTickets and participation in events organized by{" "}
          <strong>TEDx Youth Bedayia School</strong>. By purchasing a ticket or
          attending our event, you agree to comply with these Terms.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>1. Ticket Purchase</h2>
        <ul className={styles.list}>
          <li>
            All tickets must be purchased directly through our official
            channels.
          </li>
          <li>
            Tickets are issued electronically (eTickets) and sent to the email
            address provided at purchase.
          </li>
          <li>Tickets are non-transferable unless explicitly authorized.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>2. Event Admission</h2>
        <ul className={styles.list}>
          <li>
            Admission is only granted with a valid eTicket presented at
            check-in.
          </li>
          <li>
            The organizers reserve the right to refuse entry to any attendee
            engaging in disruptive, unsafe, or unlawful behavior.
          </li>
          <li>
            Attendees must comply with venue rules, security requirements, and
            staff instructions at all times.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>3. Use of Content</h2>
        <ul className={styles.list}>
          <li>
            Photography, audio, or video recording may be restricted unless
            otherwise stated.
          </li>
          <li>
            By attending, you consent to be included in event photography,
            filming, or live-streaming for promotional purposes.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>4. Intellectual Property</h2>
        <p>
          All TEDx content, branding, and materials are protected by
          intellectual property laws. You may not reproduce, distribute, or use
          our content without prior written permission.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>5. Liability</h2>
        <p>
          TEDx Youth Bedayia School is not responsible for personal injury,
          property loss, or damages arising during the event, except where
          required by law.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>6. Changes to the Event</h2>
        <p>
          We reserve the right to modify the event schedule, speakers, or venue
          as necessary. Significant changes will be communicated via email.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>7. Governing Law</h2>
        <p>
          These Terms are governed by and construed in accordance with the laws
          of Egypt. Any disputes will be subject to the jurisdiction of Egyptian
          courts.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>8. Contact Us</h2>
        <p>
          For questions regarding these Terms &amp; Conditions, please contact:
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
          By purchasing a ticket and attending the event, you acknowledge and
          accept these Terms &amp; Conditions.
        </p>
      </footer>
    </article>
  );
}
