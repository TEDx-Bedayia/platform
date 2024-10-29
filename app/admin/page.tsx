"use client";
import { useEffect, useRef, useState } from "react";

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
};

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
      <h1>Ticket Applicants</h1>

      <div className={styles.applicantList}>
        {applicants.map((applicant) => (
          <div key={applicant.id} className={styles.applicantCard}>
            <p>
              <strong>Full Name:</strong> {applicant.full_name}
            </p>
            <p>
              <strong>Email:</strong> {applicant.email}
            </p>
            <p>
              <strong>Ticket Type:</strong> {applicant.ticket_type}
            </p>
            <p>
              <strong>Payment Method:</strong> {applicant.payment_method}
            </p>
            <p>
              <strong>Paid:</strong> {applicant.paid ? "Yes" : "No"}
            </p>
            {applicant.paid && (
              <p>
                <strong>Admitted:</strong> {applicant.admitted ? "Yes" : "No"}
              </p>
            )}
            {applicant.paid && (
              <button
                className={styles.admitButton}
                onClick={() => admitApplicant(applicant.id, applicant.admitted)}
              >
                {applicant.admitted ? "Revoke Admission" : "Admit"}
              </button>
            )}
          </div>
        ))}
      </div>

      {loading && <p>Loading...</p>}
      {!loading && hasMore && <div id="loadMoreTrigger"></div>}
    </section>
  );
}
