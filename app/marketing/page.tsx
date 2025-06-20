"use client";
import { useEffect, useState } from "react";
import styles from "./marketing-dashboard.module.css";

import { motion } from "framer-motion";

import { Poppins, Ubuntu } from "next/font/google";
import { customAlert } from "../admin/custom-alert";
import {
  Field,
  PaymentMethod,
} from "../api/tickets/payment-methods/payment-methods";
import "../book/htmlcolor.css";
import { addLoader, removeLoader } from "../global_components/loader";
import {
  downArrow,
  emailIcon,
  forwardArrow,
  forwardArrowLg,
  gradCap,
  onePersonMd,
  upArrow,
} from "../icons";
const title = Poppins({ weight: ["100", "400", "700"], subsets: ["latin"] });
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

  return (
    <>
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
                  <label htmlFor="paid">Money</label>
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
                them to pay at the school office.
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
                  value={""}
                  required={true}
                  onChange={(e) => ""}
                />
                <label htmlFor="email">Email for Ticket(s)</label>
                {emailIcon}
                <button
                  className={
                    "rounded-full absolute right-0 top-1/2 -translate-y-1/2 bg-[#007bff] hover:bg-[#0056b3] mr-2 h-8 w-12 flex items-center justify-center text-white transition-all duration-300"
                  }
                >
                  {forwardArrowLg}
                </button>
              </div>
              <div className="flex items-center justify-center mt-4 font-bold">
                OR
              </div>
              <center className="mt-4">
                <button className={styles.noEmailButton}>No Email</button>
              </center>
            </div>
            <p className="text-xs text-gray-200 mt-3 text-center">
              Don&apos;t submit a ticket for someone who will not give you cash
              in your hand. This is for your own safety. For telda and instapay
              rush hour tickets, tell them to book a normal ticket from the
              website and follow the instructions but transfer the discounted
              amount, and include the word rush in their note.
            </p>
          </div>
        </section>
      )}
    </>
  );
}
