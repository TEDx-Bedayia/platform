"use client";
import { useEffect, useRef, useState } from "react";

import { Poppins, Space_Grotesk, Ubuntu } from "next/font/google";
import { totalmem } from "os";
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
  recieved_at: string,
  index: number
) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "60vw",
        gap: "1rem",
      }}
      key={index}
      className={styles.transaction}
    >
      <span
        style={{
          width: "300px",
        }}
      >
        {stream}
      </span>
      <span
        style={{
          color: incurred > recieved ? "#95190D" : "#107E7D",
          marginRight: "auto",
          width: 130,
          textAlign: "left",
        }}
      >
        {recieved > 0 ? "+" : ""}
        {recieved} EGP
      </span>

      <span
        style={{
          color: recieved - incurred >= 0 ? "#95190D" : "#107E7D",
          marginRight: "auto",
          width: 100,
          textAlign: "left",
        }}
      >
        {recieved - incurred} EGP
      </span>
      <span style={{ width: "132px" }}>
        {new Date(recieved_at).toDateString()}
      </span>
    </div>
  );
}

interface Transaction {
  stream: string;
  incurred: number;
  recieved: number;
  recieved_at: string;
}

export default function History() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Transaction[]>([]);
  const [total, setTotal] = useState<number>(0);
  // Redirect if no token is found
  useEffect(() => {
    if (!localStorage.getItem("admin-token")) {
      window.location.href = "/admin/login";
    }
  }, []);

  // Fetch applicants from API
  const fetchData = async () => {
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
      } else customAlert("Failed to fetch payments.");
    }

    const response2 = await fetch(`/api/admin/payments-total`, {
      method: "GET",
      headers: {
        key: `${localStorage.getItem("admin-token")}`,
      },
    });

    if (response2.ok) {
      const data = await response2.json();
      setTotal(data.total);
    } else {
      customAlert("Failed to fetch total.");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <section id="pay-history" className={styles.dashboard}>
      <h1 style={{ ...title.style, fontWeight: 700 }}>Transactions</h1>
      <p
        style={{
          ...ubuntu.style,
          fontSize: ".75rem",
          fontWeight: 300,
          color: "grey",
          marginBottom: "1rem",
        }}
      >
        Expected Ticket Inflows: {total} EGP. <br /> Total Recieved:{" "}
        {data.reduce((acc, curr) => acc + curr.recieved, 0)} EGP.
        <br />
        Errors:{" "}
        {data.reduce(
          (acc, curr) => acc + curr.recieved - curr.incurred,
          0
        )}{" "}
        EGP.
      </p>
      <div className={styles.transactionList}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            width: "60vw",
            gap: "1rem",
          }}
          className={styles.heading}
        >
          <span style={{ fontWeight: 700, width: "300px" }}>Stream</span>
          <span
            style={{
              marginRight: "auto",
              fontWeight: 700,
              width: 130,
              textAlign: "left",
            }}
          >
            Recieved Money
          </span>
          <span
            style={{
              marginRight: "auto",
              fontWeight: 700,
              width: 100,
              textAlign: "left",
            }}
          >
            To Refund
          </span>
          <span style={{ width: "132px", textAlign: "left", fontWeight: 700 }}>
            Recieved At
          </span>
        </div>
        {data.map((transaction, index) =>
          Entry(
            transaction.stream,
            transaction.incurred,
            transaction.recieved,
            transaction.recieved_at,
            index
          )
        )}
      </div>
      {loading && <p>Loading...</p>}
    </section>
  );
}
