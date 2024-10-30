"use client";
import { useEffect, useRef, useState } from "react";

import { Poppins, Space_Grotesk, Ubuntu } from "next/font/google";
import { customAlert } from "../custom-alert";
import styles from "./history.module.css"; // Import CSS styles

type Applicant = {
  full_name: string;
  email: string;
  ticket_type: string;
  payment_method: string;
  paid: boolean;
  admitted: boolean;
  id: number;
  sent: boolean;
  phone: string;
};

const title = Poppins({ weight: "700", subsets: ["latin"] });

const ubuntu = Ubuntu({ weight: ["300", "400", "700"], subsets: ["latin"] });

function Entry(
  stream: string,
  incurred: number,
  recieved: number,
  recieved_at: string
) {
  return <div></div>;
}

export default function History() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  // Redirect if no token is found
  useEffect(() => {
    if (!localStorage.getItem("admin-token")) {
      window.location.href = "/admin/login";
    }
  }, []);

  // Fetch applicants from API
  const fetchData = async (index: number) => {
    setLoading(true);
    const response = await fetch(`/api/admin/payments-history`, {
      method: "GET",
      headers: {
        key: `${localStorage.getItem("admin-token")}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setData(data);
    } else {
      if (response.status === 401) {
        customAlert("Unauthorized");
        localStorage.removeItem("admin-token");
        window.location.href = "/admin/login";
      } else customAlert("Failed to fetch applicants.");
    }

    setLoading(false);
  };

  return (
    <section id="pay-history" className={styles.dashboard}>
      <h1 style={{ ...title.style, fontWeight: 700 }}>Payment Data</h1>
      <p>Not that important right now. It&apos;s safely stored.</p>
      <br />
      <p style={{ color: "grey" }}>
        P.S. refund digital payment differences at the end of the ticket
        purchasing period, after this section becomes active.
      </p>
      <p style={{ color: "grey" }}>
        AND refund cash payment differences on the spot.
      </p>
      {loading && <p>Loading...</p>}
    </section>
  );
}
