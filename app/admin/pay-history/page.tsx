"use client";
import { useEffect, useState } from "react";

import { Poppins, Ubuntu } from "next/font/google";
import { useRouter } from "next/navigation";
import { customAlert } from "../custom-alert";
import styles from "./history.module.css"; // Import CSS styles

const title = Poppins({ weight: "700", subsets: ["latin"] });

const ubuntu = Ubuntu({ weight: ["300", "400", "700"], subsets: ["latin"] });

const formatDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  const formatter = new Intl.DateTimeFormat("en-EG", options);
  const parts = formatter.formatToParts(date);
  const ampm = date.getHours() >= 12 ? "PM" : "AM";
  const formattedDate = `${parts.find((p) => p.type === "day")?.value}/${
    parts.find((p) => p.type === "month")?.value
  }/${parts.find((p) => p.type === "year")?.value}, ${
    parts.find((p) => p.type === "hour")?.value
  }:${parts.find((p) => p.type === "minute")?.value} ${ampm}`;
  return formattedDate;
};

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
      <span style={{ width: "180px" }}>
        {formatDate(new Date(recieved_at))}
      </span>
    </div>
  );
}

interface Transaction {
  stream: string;
  incurred: number;
  recieved: number;
  created_at: string;
}

export default function History() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Transaction[]>([]);
  const [total, setTotal] = useState<number>(0);
  // Redirect if no token is found
  useEffect(() => {
    fetch("/api/admin/auth")
      .then((res) => res.json())
      .then((data) => {
        if (!data.role) router.push("/admin/login");
      });
  }, []);

  // Fetch applicants from API
  const fetchData = async () => {
    setLoading(true);
    const response = await fetch(`/api/admin/payments-history`, {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      setData(data);
    } else {
      if (response.status === 401) {
        customAlert("Unauthorized");
        router.push("/admin/login");
      } else customAlert("Failed to fetch payments.");
    }

    const response2 = await fetch(`/api/admin/payments-total`, {
      method: "GET",
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
          textAlign: "center",
        }}
      >
        Expected Ticket Inflows: <br />{" "}
        <strong style={{ color: "#107E7D" }}>{total} EGP</strong> <br /> Total
        Recieved: <br />
        <strong style={{ color: "#107E7D" }}>
          {data.reduce((acc, curr) => acc + curr.recieved, 0)} EGP
        </strong>
        <br />
        Errors:{" "}
        {data.reduce(
          (acc, curr) => acc + curr.recieved - curr.incurred,
          0
        )}{" "}
        EGP. <br /> Office:{" "}
        {data
          .filter((x) => x.stream.startsWith("Office"))
          .reduce((acc, curr) => acc + curr.recieved, 0)}{" "}
        EGP. Cards:{" "}
        {data
          .filter((x) => x.stream.startsWith("Card"))
          .reduce((acc, curr) => acc + curr.recieved, 0)}{" "}
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
          <span style={{ width: "180px", textAlign: "left", fontWeight: 700 }}>
            Recieved At
          </span>
        </div>
        {data.map((transaction, index) =>
          Entry(
            transaction.stream,
            transaction.incurred,
            transaction.recieved,
            transaction.created_at,
            index
          )
        )}
      </div>
      {loading && <p>Loading...</p>}
    </section>
  );
}
