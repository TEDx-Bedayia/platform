"use client";
import { useEffect, useRef, useState } from "react";

import { Poppins, Space_Grotesk, Ubuntu } from "next/font/google";
import { customAlert } from "./custom-alert";
import styles from "./dashboard.module.css"; // Import CSS styles
type Applicant = {
  full_name: string;
  email: string;
  ticket_type: string;
  payment_method: string;
  paid: boolean;
  admitted: boolean;
  id: number;
  sent: boolean;
};

const title = Poppins({ weight: "700", subsets: ["latin"] });
const onePerson = (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M16.0001 3.33333C11.95 3.33333 8.66683 6.61659 8.66683 10.6667C8.66683 13.1859 9.93718 15.4085 11.8722 16.7288C7.38617 18.3721 4.15473 22.6172 4.00533 27.6369C3.9889 28.189 4.4231 28.6498 4.97514 28.6662C5.52718 28.6826 5.98802 28.2484 6.00445 27.6964C6.16463 22.3143 10.5786 18 15.9999 18C21.4212 18 25.8352 22.3143 25.9954 27.6964C26.0119 28.2484 26.4727 28.6826 27.0247 28.6662C27.5768 28.6498 28.011 28.189 27.9945 27.6369C27.8451 22.6173 24.6138 18.3722 20.1278 16.7288C22.0629 15.4086 23.3333 13.186 23.3333 10.6667C23.3333 6.61659 20.0501 3.33333 16.0001 3.33333ZM10.6668 10.6667C10.6668 7.72113 13.0546 5.33333 16.0001 5.33333C18.9455 5.33333 21.3333 7.72113 21.3333 10.6667C21.3333 13.6122 18.9455 16 16.0001 16C13.0546 16 10.6668 13.6122 10.6668 10.6667Z"
      fill="#1F2328"
    />
  </svg>
);

const group = (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M4.66683 10.6667C4.66683 6.6166 7.95001 3.33334 12.0001 3.33334C16.0501 3.33334 19.3333 6.6166 19.3333 10.6667C19.3333 13.186 18.0629 15.4086 16.1278 16.7288C20.6138 18.3722 23.8451 22.6173 23.9945 27.6369C24.011 28.189 23.5768 28.6498 23.0247 28.6662C22.4727 28.6827 22.0119 28.2485 21.9954 27.6964C21.8352 22.3143 17.4212 18 11.9999 18C6.57863 18 2.16463 22.3143 2.00445 27.6964C1.98802 28.2485 1.52718 28.6827 0.975142 28.6662C0.423102 28.6498 -0.0110959 28.189 0.00533413 27.6369C0.154732 22.6172 3.38618 18.3721 7.87225 16.7288C5.93718 15.4085 4.66683 13.186 4.66683 10.6667ZM12.0001 5.33334C9.05461 5.33334 6.66683 7.72113 6.66683 10.6667C6.66683 13.6122 9.05461 16 12.0001 16C14.9455 16 17.3333 13.6122 17.3333 10.6667C17.3333 7.72113 14.9455 5.33334 12.0001 5.33334Z"
      fill="#1F2328"
    />
    <path
      d="M23.0534 10.6667C22.8565 10.6667 22.6634 10.6807 22.475 10.7076C21.9283 10.7858 21.4217 10.406 21.3435 9.85928C21.2653 9.31256 21.6452 8.80597 22.1919 8.72777C22.4738 8.68746 22.7614 8.66667 23.0534 8.66667C26.3892 8.66667 29.0933 11.3709 29.0933 14.7067C29.0933 16.6744 28.1522 18.4212 26.6982 19.5232C29.8068 20.9167 31.9733 24.0376 31.9733 27.6667C31.9733 28.219 31.5256 28.6667 30.9733 28.6667C30.421 28.6667 29.9733 28.219 29.9733 27.6667C29.9733 24.5388 27.8974 21.8932 25.0459 21.0375L24.3333 20.8237V18.5891L24.8803 18.3112C26.1956 17.6428 27.0933 16.2787 27.0933 14.7067C27.0933 12.4754 25.2845 10.6667 23.0534 10.6667Z"
      fill="#1F2328"
    />
  </svg>
);

const ubuntu = Ubuntu({ weight: ["300", "400", "700"], subsets: ["latin"] });

function TicketCard(applicant: Applicant, admitApplicant: any) {
  return (
    <div
      key={applicant.id}
      className={styles.applicantCard}
      style={ubuntu.style}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "start",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", width: "32px", height: "32px" }}>
            {applicant.ticket_type === "individual" ? onePerson : group}
            <span
              style={{
                fontSize: ".5rem",
                fontWeight: 700,
                position: "absolute",
                left: applicant.ticket_type == "individual" ? "12px" : "8px",
                top: "20px",
              }}
            >
              {applicant.id}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
            <span className={styles.applicantName}>{applicant.full_name}</span>
            <span className={styles.applicantEmail}>{applicant.email}</span>
          </div>
        </div>
        <span
          className={`${styles.paidStatus} ${
            applicant.paid ? styles.paid : styles.unpaid
          }`}
        >
          $$
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "end",
        }}
      >
        <span style={{ fontSize: ".7rem" }}>
          <span style={{ fontWeight: "700" }}>
            {applicant.payment_method.split("@")[0]}
          </span>
          : {applicant.payment_method.split("@")[1]}
        </span>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "12px",
          }}
        >
          {applicant.paid && (
            <button
              className={`${styles.admitButton} ${
                applicant.admitted ? styles.deadmit : styles.admit
              }`}
              onClick={() => admitApplicant(applicant.id, applicant.admitted)}
            >
              {applicant.admitted ? "De Admit" : "Admit"}
            </button>
          )}
          {applicant.paid && (
            <button
              className={styles.sendButton}
              onClick={() => sendTicket(applicant)}
            >
              Send Ticket
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function sendTicket(applicant: Applicant) {
  customAlert(`Ticket sent to ${applicant.email}`);
}

export default function AdminDashboard() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  // Redirect if no token is found
  useEffect(() => {
    if (!localStorage.getItem("admin-token")) {
      window.location.href = "/admin/login";
    }
  }, []);

  // Fetch applicants from API
  const fetchApplicants = async (index: number) => {
    setLoading(true);
    const response = await fetch(`/api/admin/tickets/${index}`, {
      method: "GET",
      headers: {
        key: `${localStorage.getItem("admin-token")}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.length < 10) {
        setHasMore(false); // No more data if less than 10 rows are returned
      }
      setApplicants((prevApplicants) => [...prevApplicants, ...data]);
    } else {
      alert("Failed to load data");
    }

    setLoading(false);
  };

  // Intersection Observer to implement infinite scroll
  useEffect(() => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    const loadMore = (entries: any) => {
      if (entries[0].isIntersecting && hasMore) {
        setPageIndex((prevPageIndex) => prevPageIndex + 1);
      }
    };

    observer.current = new IntersectionObserver(loadMore);
    if (document.getElementById("loadMoreTrigger")) {
      observer.current.observe(document.getElementById("loadMoreTrigger")!);
    }
  }, [loading, hasMore]);

  // Fetch data when pageIndex changes
  useEffect(() => {
    if (pageIndex > 0) {
      fetchApplicants(pageIndex);
    }
  }, [pageIndex]);

  // Admit Applicant Handler (toggle admit status)
  const admitApplicant = async (id: number, admitted: boolean) => {
    const response = await fetch(`/api/admin/tickets/admit/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        key: `${localStorage.getItem("admin-token")}`,
      },
      body: JSON.stringify({ admitted: !admitted }),
    });

    if (response.ok) {
      setApplicants((prevApplicants) =>
        prevApplicants.map((applicant) =>
          applicant.id === id
            ? { ...applicant, admitted: !admitted }
            : applicant
        )
      );
    } else {
      customAlert("Failed to update admission status.");
    }
  };

  return (
    <section id="admin-dashboard" className={styles.dashboard}>
      <h1 style={{ ...title.style, fontWeight: 700 }}>All Tickets</h1>

      <div className={styles.applicantList}>
        {applicants.map((applicant) => TicketCard(applicant, admitApplicant))}
      </div>

      {loading && <p>Loading...</p>}
      {!loading && hasMore && <div id="loadMoreTrigger"></div>}
    </section>
  );
}
