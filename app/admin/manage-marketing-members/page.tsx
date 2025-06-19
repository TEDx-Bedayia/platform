"use client";
import { useEffect, useState } from "react";

import { Poppins, Ubuntu } from "next/font/google";
import { customAlert } from "../custom-alert";
import styles from "./marketing-members.module.css"; // Import CSS styles

const title = Poppins({ weight: "700", subsets: ["latin"] });

const ubuntu = Ubuntu({ weight: ["300", "400", "700"], subsets: ["latin"] });

export default function MarketingMembers() {
  useEffect(() => {
    if (
      !localStorage.getItem("admin-token") &&
      !localStorage.getItem("marketing-token")
    ) {
      window.location.href = "/admin/login";
    }
  }, []);

  return <></>;
}
