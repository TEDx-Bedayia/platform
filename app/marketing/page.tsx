"use client";
import { useEffect, useState } from "react";
import styles from "./marketing-dashboard.module.css";

import { Ubuntu } from "next/font/google";
import { customAlert } from "../admin/custom-alert";
import { showPopup } from "../api/utils/generic-popup";
import { verifyEmail } from "../api/utils/input-sanitization";
import "../book/htmlcolor.css";
import { addLoader, removeLoader } from "../global_components/loader";
import {
  downArrow,
  emailIcon,
  forwardArrowLg,
  gradCap,
  onePersonMd,
  upArrow,
} from "../icons";
const ubuntu = Ubuntu({ weight: ["300", "400", "700"], subsets: ["latin"] });

export default function MarketingRushHourDashboard() {
  const [name, setName] = useState<string>("");

  useEffect(() => {
    if (
      !localStorage.getItem("marketing-username") ||
      !localStorage.getItem("marketing-password")
    ) {
      window.location.href = "/marketing/login";
    } else {
      setName(localStorage.getItem("marketing-name") || "");
    }
  }, []);

  const [ticketCount, setTicketCount] = useState<number>(1);
  const handleTicketCountChange = (increment: boolean) => {
    if (increment) {
      setTicketCount((prevCount) => Math.min(prevCount + 1, 10));
    } else {
      setTicketCount((prevCount) => Math.max(prevCount - 1, 1));
    }
  };

  const [payerInfo, setPayerInfo] = useState<{
    name: string;
    grade: string;
    paid: number;
  }>({
    name: "",
    grade: "",
    paid: 0,
  });

  const [type, setType] = useState<"discounted" | "individual">("discounted");
  const [email, setEmail] = useState<string>("");

  return (
    <>
      <span
        className="text-gray-300 absolute top-4 left-1/2 -translate-x-1/2 cursor-pointer opacity-90"
        onClick={() => (window.location.href = "/marketing/logout")}
      >
        Logged in as: <span className="font-bold">{name}</span>. Click to
        Logout.
      </span>
      {name != "" && (
        <section id="marketing-dashboard" className={styles.container}>
          <h1>Submit Ticket(s)</h1>
          <div className={styles.form}>
            <center>
              <h2 style={ubuntu.style}>How Many Tickets?</h2>
              <div className={styles.ticketCount}>
                <button onClick={() => handleTicketCountChange(false)}>
                  {downArrow}
                </button>
                <span id="ticket-count">{ticketCount}</span>
                <button onClick={() => handleTicketCountChange(true)}>
                  {upArrow}
                </button>
              </div>
            </center>
            <div>
              <center>
                <h2 style={ubuntu.style}>Payer Information</h2>
              </center>
              <div
                className={styles.inputWrapper}
                style={{ marginTop: "0.5rem" }}
              >
                <input
                  type="text"
                  name="name"
                  id="name-input"
                  placeholder=" "
                  value={payerInfo.name}
                  required={true}
                  onChange={(e) =>
                    setPayerInfo({ ...payerInfo, name: e.target.value })
                  }
                />
                <label htmlFor="name">Name</label>
                {onePersonMd}
              </div>
              <div className="flex flex-row w-full gap-2 mt-4">
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    name="grade"
                    id="grade-input"
                    placeholder=" "
                    value={payerInfo.grade}
                    required={true}
                    onChange={(e) =>
                      setPayerInfo({ ...payerInfo, grade: e.target.value })
                    }
                  />
                  <label htmlFor="grade">Grade</label>
                  {gradCap}
                </div>
                <div className={styles.inputWrapper}>
                  <input
                    type="number"
                    name="paid"
                    id="paid-input"
                    placeholder=" "
                    value={payerInfo.paid == 0 ? "" : payerInfo.paid}
                    required={true}
                    onChange={(e) =>
                      setPayerInfo({
                        ...payerInfo,
                        paid: Number(e.target.value),
                      })
                    }
                  />
                  <label htmlFor="paid">Paid</label>
                  <span className={styles.icon + " text-xs text-white"}>
                    EGP
                  </span>
                </div>
              </div>
              <div className={styles.pickType}>
                <div
                  className={type == "discounted" ? styles.selectedType : ""}
                  onClick={() => setType("discounted")}
                >
                  Rush Hour
                </div>
                <div
                  className={type == "individual" ? styles.selectedType : ""}
                  onClick={() => setType("individual")}
                >
                  Normal
                </div>
              </div>
              <p className="text-xs text-gray-200 mt-3 text-center">
                If someone wants to buy a group ticket, go to
                tedxbedayia.com/book/group and enter their details then tell
                them to pay at the high school office (or go pay using their
                ID).
              </p>
            </div>
            <div className="h-[2px] bg-white rounded-full opacity-25 w-full" />
            <div>
              <div className={styles.inputWrapper}>
                <input
                  type="email"
                  name="email"
                  id="email-input"
                  placeholder=" "
                  value={email}
                  required={true}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label htmlFor="email">Email for Ticket(s)</label>
                {emailIcon}
                <button
                  className={
                    "rounded-full absolute right-0 top-1/2 -translate-y-1/2 bg-[#007bff] hover:bg-[#0056b3] mr-2 h-8 w-12 flex items-center justify-center text-white transition-all duration-300"
                  }
                  onClick={async () => {
                    if (
                      email &&
                      email.trim() !== "" &&
                      payerInfo.name &&
                      payerInfo.grade &&
                      payerInfo.paid > 0
                    ) {
                      // Handle email submission
                      if (verifyEmail(email)) {
                        // Email is valid, proceed with submission
                        addLoader();
                        const response = await fetch("/api/marketing/submit", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            username:
                              localStorage.getItem("marketing-username") || "",
                            password:
                              localStorage.getItem("marketing-password") || "",
                          },
                          body: JSON.stringify({
                            name: payerInfo.name,
                            grade: payerInfo.grade,
                            email: email,
                            type: type,
                            ticketCount: ticketCount,
                            paid: payerInfo.paid,
                          }),
                        });
                        if (response.ok) {
                          const data = await response.json();
                          customAlert(data.message);
                          // Reset form fields
                          setPayerInfo({ name: "", grade: "", paid: 0 });
                          setEmail("");
                          setTicketCount(1);
                        } else if (response.status === 400) {
                          const data = await response.json();
                          customAlert(data.message);
                        } else if (response.status === 401) {
                          customAlert("Invalid marketing member credentials.");
                        } else {
                          customAlert(
                            "An unexpected error occurred. Please try again later."
                          );
                        }
                        removeLoader();
                      } else {
                        customAlert("Please enter a valid email address.");
                        return;
                      }
                    } else {
                      customAlert(
                        "Please fill in all fields before submitting."
                      );
                      return;
                    }
                  }}
                >
                  {forwardArrowLg}
                </button>
              </div>
              <div className="flex items-center justify-center mt-4 font-bold">
                OR
              </div>
              <center className="mt-4">
                <button
                  className={styles.noEmailButton}
                  onClick={async () => {
                    if (type === "individual") {
                      customAlert(
                        "You cannot submit a ticket without an email for individual tickets. They can go to the school office and pay there."
                      );
                      return;
                    }
                    if (
                      !payerInfo.name ||
                      !payerInfo.grade ||
                      payerInfo.paid <= 0
                    ) {
                      customAlert(
                        "Please fill in all fields before submitting."
                      );
                      return;
                    }

                    addLoader();
                    const response = await fetch("/api/marketing/gen-code", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        username:
                          localStorage.getItem("marketing-username") || "",
                        password:
                          localStorage.getItem("marketing-password") || "",
                      },
                      body: JSON.stringify({
                        name: payerInfo.name,
                        grade: payerInfo.grade,
                        type: type,
                        ticketCount: ticketCount,
                        paid: payerInfo.paid,
                      }),
                    });
                    const data = await response.json();
                    if (response.ok) {
                      customAlert(
                        `Accepted! The codes are: ${data.codes.join(
                          ", "
                        )}. Please share them with the person who paid. Tell them to go to tedxbedayia.com/book?rush and enter the codes to get their tickets.`
                      );
                      // Reset form fields
                      setPayerInfo({ name: "", grade: "", paid: 0 });
                      setEmail("");
                      setTicketCount(1);
                    } else if (data.message) {
                      customAlert(data.message);
                    } else {
                      customAlert(
                        "An unexpected error occurred. Please try again later."
                      );
                    }
                    removeLoader();
                  }}
                >
                  No Email
                </button>
              </center>
            </div>
            <p className="text-xs text-gray-200 mt-3 text-center">
              Don&apos;t submit a ticket for someone who will not give you cash
              in your hand. This is for your own safety. For telda and instapay
              rush hour tickets, tell them to book a normal ticket from the
              website and follow the instructions but transfer the discounted
              amount, and include the word <strong>RUSH</strong> in their note.
              Finance/Logistics will process those tickets.
            </p>
          </div>
        </section>
      )}
    </>
  );
}
