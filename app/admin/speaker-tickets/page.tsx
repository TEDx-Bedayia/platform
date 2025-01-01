"use client";
import { addLoader, removeLoader } from "@/app/global_components/loader";
import { s } from "framer-motion/client";
import { Poppins } from "next/font/google";
import { useEffect, useState } from "react";
import { customAlert } from "../custom-alert";
import styles from "../payments/payments.module.css";
const title = Poppins({ weight: "700", subsets: ["latin"] });

export default function SpeakerTickets() {
  const [email, setEmail] = useState("");
  const [speakerName, setSpeakerName] = useState("");

  // Redirect if no token is found
  useEffect(() => {
    if (!localStorage.getItem("admin-token")) {
      window.location.href = "/admin/login";
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name == "email") setEmail(value);
    else setSpeakerName(value);
  };

  useEffect(() => {
    if (
      !localStorage.getItem("admin-token") &&
      !localStorage.getItem("school-token")
    ) {
      window.location.href = "/admin/login";
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    addLoader();
    e.preventDefault();
    if (email) {
      const response = await fetch(
        `/api/admin/speaker-tickets?speaker=${encodeURIComponent(
          email
        )}&name=${encodeURIComponent(speakerName)}`,
        {
          method: "GET",
          headers: {
            key: localStorage.getItem("admin-token") as string,
          },
        }
      );

      if (response.ok) {
        customAlert("Speaker Ticket Accepted.");
        setEmail("");
        setSpeakerName("");
      } else {
        const { message } = await response.json();
        customAlert(message);
      }
    } else {
      customAlert("All fields are required.");
    }

    // Hide Loader
    removeLoader();
  };

  return (
    <section id="admin-payments">
      <div className={styles.pageContainer}>
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <h2 style={{ ...title.style, fontWeight: 700 }}>Speaker Tickets</h2>

          <div className={styles.formGroup}>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label htmlFor="email">Speaker&apos;s Email Address</label>
          </div>

          <div className={styles.formGroup}>
            <input
              type="text"
              id="speaker-name"
              name="speaker-name"
              value={speakerName}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label htmlFor="speaker-name">Speaker&apos;s Full Name</label>
          </div>

          <button type="submit">Send Tickets</button>
        </form>

        <span
          style={{
            position: "absolute",
            bottom: "3em",
            color: "#888",
            fontSize: "0.8rem",
            textAlign: "center",
            width: "100%",
          }}
        >
          <strong>Developed by Aly with ❤️</strong>
        </span>
      </div>
    </section>
  );
}
