"use client";
import { Poppins, Ubuntu } from "next/font/google";
import { useEffect, useState } from "react";

const title = Poppins({ weight: ["400"], subsets: ["latin"] });
const ubuntu = Ubuntu({ weight: ["700"], subsets: ["latin"] });
export default function TicketCounter() {
  const [ticketCount, setTicketCount] = useState(0);
  const [actualSales, setActualSales] = useState(0);
  const [paidCount, setPaidCount] = useState(0);

  useEffect(() => {
    fetch("/api/tickets")
      .then((res) => res.json())
      .then((data) => {
        setTicketCount(data.total);
        setPaidCount(data.paid);
        setActualSales(data.actual);
      });
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw",
        height: "100vh",
      }}
    >
      <span
        style={{
          ...ubuntu.style,
          fontWeight: "700",
          margin: "0 !important",
          padding: "0 !important",
        }}
        className="text-[20rem] max-phone:text-[15rem]"
      >
        {ticketCount > 0 ? ticketCount : "..."}
      </span>

      <span
        style={{
          ...title.style,
          fontSize: "1rem",
          fontWeight: "400",
          margin: "0 !important",
          padding: "0 !important",
          position: "absolute",
          bottom: "20%",
        }}
      >
        Seats Reserved: {paidCount} ({actualSales})
      </span>
    </div>
  );
}
