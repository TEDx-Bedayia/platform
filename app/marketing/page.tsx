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

  return (
    <section id="marketing-dashboard" className={styles.container}>
      <div>Hello, {name}</div>
    </section>
  );
}
