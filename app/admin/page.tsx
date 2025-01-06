"use client";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

import { Poppins, Ubuntu } from "next/font/google";
import { addLoader, removeLoader } from "../global_components/loader";
import { EVENT_DATE } from "../metadata";
import { customAlert, customAlert2 } from "./custom-alert";
import styles from "./dashboard.module.css"; // Import CSS styles
type Applicant = {
  full_name: string;
  email: string;
  ticket_type: string;
  payment_method: string;
  created_at: string;
  paid: boolean;
  admitted: boolean;
  id: number;
  sent: boolean;
  phone: string;
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
      fillRule="evenodd"
      clipRule="evenodd"
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
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.66683 10.6667C4.66683 6.6166 7.95001 3.33334 12.0001 3.33334C16.0501 3.33334 19.3333 6.6166 19.3333 10.6667C19.3333 13.186 18.0629 15.4086 16.1278 16.7288C20.6138 18.3722 23.8451 22.6173 23.9945 27.6369C24.011 28.189 23.5768 28.6498 23.0247 28.6662C22.4727 28.6827 22.0119 28.2485 21.9954 27.6964C21.8352 22.3143 17.4212 18 11.9999 18C6.57863 18 2.16463 22.3143 2.00445 27.6964C1.98802 28.2485 1.52718 28.6827 0.975142 28.6662C0.423102 28.6498 -0.0110959 28.189 0.00533413 27.6369C0.154732 22.6172 3.38618 18.3721 7.87225 16.7288C5.93718 15.4085 4.66683 13.186 4.66683 10.6667ZM12.0001 5.33334C9.05461 5.33334 6.66683 7.72113 6.66683 10.6667C6.66683 13.6122 9.05461 16 12.0001 16C14.9455 16 17.3333 13.6122 17.3333 10.6667C17.3333 7.72113 14.9455 5.33334 12.0001 5.33334Z"
      fill="#1F2328"
    />
    <path
      d="M23.0534 10.6667C22.8565 10.6667 22.6634 10.6807 22.475 10.7076C21.9283 10.7858 21.4217 10.406 21.3435 9.85928C21.2653 9.31256 21.6452 8.80597 22.1919 8.72777C22.4738 8.68746 22.7614 8.66667 23.0534 8.66667C26.3892 8.66667 29.0933 11.3709 29.0933 14.7067C29.0933 16.6744 28.1522 18.4212 26.6982 19.5232C29.8068 20.9167 31.9733 24.0376 31.9733 27.6667C31.9733 28.219 31.5256 28.6667 30.9733 28.6667C30.421 28.6667 29.9733 28.219 29.9733 27.6667C29.9733 24.5388 27.8974 21.8932 25.0459 21.0375L24.3333 20.8237V18.5891L24.8803 18.3112C26.1956 17.6428 27.0933 16.2787 27.0933 14.7067C27.0933 12.4754 25.2845 10.6667 23.0534 10.6667Z"
      fill="#1F2328"
    />
  </svg>
);

const speakerTicketIcon = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22 1.75002C22 1.47444 21.8489 1.22106 21.6064 1.09011C21.3642 0.959306 21.0691 0.972213 20.8387 1.12283C20.792 1.15211 20.7446 1.18046 20.6969 1.20808C20.5913 1.26909 20.4278 1.35946 20.2071 1.46954C19.7659 1.68971 19.0964 1.98866 18.2054 2.28941C16.4244 2.8906 13.7554 3.50002 10.25 3.50002H9.7548L9.75 3.5H6.5C3.46243 3.5 1 5.96243 1 9C1 11.5176 2.6915 13.64 5 14.293V14.75C5 17.8113 5.68398 20.2548 6.06118 21.3712C6.30061 22.0798 6.96462 22.5 7.66124 22.5H9.67422C10.968 22.5 11.7734 21.1784 11.4059 20.0465C10.9945 18.7795 10.5 16.7792 10.5 14.5C10.5 14.4701 10.4983 14.4407 10.4949 14.4118C13.8766 14.4403 16.4602 15.0559 18.1978 15.6634C19.0879 15.9745 19.7568 16.2839 20.1977 16.5117C20.2815 16.5551 20.3691 16.6077 20.4594 16.6619C20.8164 16.8764 21.2163 17.1166 21.601 16.9128C21.8465 16.7828 22 16.5278 22 16.25V1.75002ZM10.5 12.9118C14.0638 12.9409 16.8127 13.5901 18.6928 14.2474C19.4304 14.5053 20.0339 14.7642 20.5 14.9872V2.99271C20.033 3.20875 19.427 3.46022 18.6852 3.71062C16.8068 4.34467 14.0605 4.97086 10.5 4.99903V12.9118ZM6.5 14.75V14.5H9C9 16.9857 9.53723 19.1484 9.97923 20.5098C10.0146 20.6187 9.99563 20.7471 9.92328 20.8533C9.85291 20.9566 9.76098 21 9.67422 21H7.66124C7.55594 21 7.49953 20.9421 7.48225 20.891C7.13816 19.8726 6.5 17.5974 6.5 14.75ZM6.5 5H9V13H6.5C4.29086 13 2.5 11.2091 2.5 9C2.5 6.79086 4.29086 5 6.5 5Z"
      fill="#15803D"
    />
  </svg>
);

const ubuntu = Ubuntu({ weight: ["300", "400", "700"], subsets: ["latin"] });

const sendTicket = async (
  id: number,
  setApplicants: Dispatch<SetStateAction<Applicant[]>>
) => {
  const response = await fetch(
    `/api/admin/send-ticket/?id=${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers: {
        key: `${localStorage.getItem("admin-token")}`,
      },
    }
  );

  let resp = await response.json();
  customAlert(resp.message);
  if (response.ok) {
    setApplicants((prevApplicants) =>
      prevApplicants.map((applicant) =>
        applicant.id === id ? { ...applicant, sent: true } : applicant
      )
    );
  }
};

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

export default function AdminDashboard() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [variable, setVariable] = useState("clear");
  const [filter, setFilter] = useState("");
  const observer = useRef<IntersectionObserver | null>(null);
  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("admin-token") == "dev") {
      setDevMode(true);
    }
  }, []);

  const msg =
    "Hello {name}! Your ticket for the event has been sent to your email. Please check your inbox and spam folder. If you have any questions, feel free to contact us. Enjoy!";

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
            <div
              style={{ position: "relative", width: "32px", height: "32px" }}
            >
              {applicant.ticket_type === "group" ? group : onePerson}
              <span
                style={{
                  fontSize: ".5rem",
                  fontWeight: 700,
                  position: "absolute",
                  width: applicant.ticket_type === "group" ? "71.5%" : "100%",
                  textAlign: "center",
                  top: "20px",
                }}
              >
                {applicant.id}
              </span>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "0px" }}
            >
              <span className={styles.applicantName}>
                {applicant.full_name}
              </span>
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <span style={{ fontSize: ".7rem" }}>
              +
              {applicant.phone.slice(0, 2) +
                " " +
                applicant.phone.slice(2, 5) +
                " " +
                applicant.phone.slice(5, 8) +
                " " +
                applicant.phone.slice(8)}
            </span>
            <span style={{ fontSize: ".7rem" }}>
              <span style={{ fontWeight: "700" }}>
                {applicant.ticket_type !== "speaker"
                  ? applicant.payment_method.split("@")[0]
                  : "SPEAKER"}
              </span>
              {applicant.payment_method.split("@")[1] != undefined &&
                ": " + applicant.payment_method.split("@")[1]}
              <span style={{ fontSize: ".5rem", marginLeft: ".5rem" }}>
                {formatDate(new Date(applicant.created_at))}
              </span>
            </span>
          </div>

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
            {applicant.paid && !applicant.sent && (
              <button
                className={styles.sendButton}
                onClick={() => sendTicket(applicant.id, setApplicants)}
              >
                Send Ticket
              </button>
            )}

            {applicant.sent && (
              <button
                className={styles.sendButton}
                onClick={() =>
                  window.open(
                    `https://web.whatsapp.com/send/?phone=${
                      applicant.phone
                    }&text=${encodeURIComponent(
                      msg.replace("{name}", applicant.full_name.split(" ")[0])
                    )}&type=phone_number&app_absent=0`
                  )
                }
              >
                Send WA Notice
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Redirect if no token is found
  useEffect(() => {
    if (!localStorage.getItem("admin-token")) {
      window.location.href = "/admin/login";
    }
  }, []);

  // Fetch applicants from API

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
    const fetchApplicants = async (index: number) => {
      setLoading(true);
      const response = await fetch(`/api/admin/tickets/${index}${filter}`, {
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
        console.log(data);
        setApplicants((prevApplicants) => [...prevApplicants, ...data]);
      } else {
        if (response.status === 401) {
          localStorage.removeItem("admin-token");
          if (localStorage.getItem("school-token")) {
            window.location.href = "/admin/payments";
            return;
          } else {
            window.location.href = "/admin/login";
            return;
          }
        } else {
          setHasMore(false);
          customAlert("Failed to fetch applicants.");
        }
      }

      setLoading(false);
    };

    if (pageIndex > 0) {
      fetchApplicants(pageIndex);
    }
  }, [pageIndex, filter]);

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
      {(new Date() > EVENT_DATE || devMode) && (
        <button
          className="absolute right-24 top-24 w-9 h-9 bg-red-200 overflow-hidden rounded-lg text-red-700 flex items-center justify-center scale-125 transition-all hover:bg-red-300 active:bg-red-400"
          title="Reset Event Data"
          onClick={() => {
            customAlert2("Destructive Key", async (key: string) => {
              addLoader();
              const response = await fetch(
                `/api/admin/destructive/delete?verification=${encodeURIComponent(
                  key
                )}`,
                {
                  method: "GET",
                  headers: {
                    key: `${localStorage.getItem("admin-token")}`,
                  },
                }
              );
              removeLoader();

              if (response.ok) {
                setApplicants([]);
                setPageIndex(0);
                setLoading(false);
                setHasMore(true);
                return true;
              } else {
                return false;
              }
            });
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.28033 7.71967C8.98744 7.42678 8.51256 7.42678 8.21967 7.71967C7.92678 8.01256 7.92678 8.48744 8.21967 8.78033L10.9393 11.5L8.21967 14.2197C7.92678 14.5126 7.92678 14.9874 8.21967 15.2803C8.51256 15.5732 8.98744 15.5732 9.28033 15.2803L12 12.5607L14.7197 15.2803C15.0126 15.5732 15.4874 15.5732 15.7803 15.2803C16.0732 14.9874 16.0732 14.5126 15.7803 14.2197L13.0607 11.5L15.7803 8.78033C16.0732 8.48744 16.0732 8.01256 15.7803 7.71967C15.4874 7.42678 15.0126 7.42678 14.7197 7.71967L12 10.4393L9.28033 7.71967Z"
              fill="#b91c1c"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12.5399 0.63663C12.189 0.522816 11.811 0.522816 11.4601 0.63663L3.21012 3.31231C2.48947 3.54603 2 4.21654 2 4.97593V9.99999C2.00001 16.1893 5.7708 20.7049 11.401 22.8293C11.7866 22.9748 12.2134 22.9748 12.599 22.8293C18.2292 20.7049 22 16.1893 22 9.99999V4.97621C22 4.21708 21.5108 3.54611 20.7899 3.31231L12.5399 0.63663ZM11.9229 2.06346C11.973 2.0472 12.027 2.0472 12.0771 2.06346L20.3271 4.73914C20.4308 4.77277 20.5 4.8685 20.5 4.97621V9.99999C20.5 15.4613 17.2193 19.4827 12.0695 21.4259C12.0251 21.4426 11.9749 21.4426 11.9305 21.4259C6.78075 19.4827 3.5 15.4613 3.5 9.99999L3.5 4.97593C3.5 4.86847 3.56895 4.77284 3.67287 4.73914L11.9229 2.06346Z"
              fill="#b91c1c"
            />
          </svg>
        </button>
      )}

      <button
        className="absolute left-24 top-24 w-9 h-9 bg-green-200 overflow-hidden rounded-lg text-green-700 flex items-center justify-center scale-125 transition-all hover:bg-green-300 active:bg-green-400"
        title="Add Speaker Tickets"
        onClick={() => {
          window.location.href = "/admin/speaker-tickets";
        }}
      >
        {speakerTicketIcon}
      </button>

      <h1 style={{ ...title.style, fontWeight: 700 }}>All Tickets</h1>
      <div
        style={{
          marginBottom: "2rem",
          display: "flex",
          flexDirection: "row",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "row" }}>
          <select
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #000",
              marginRight: "1rem",
              paddingRight: "1rem",
              backgroundColor: "transparent",
            }}
            value={variable}
            onChange={(e) => setVariable(e.target.value)}
          >
            <option value="clear">All</option>
            <option value="email">Email</option>
            <option value="tosend">Pending eTicket</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="admitted">Admitted</option>
            <option value="name">Name</option>
          </select>
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "0px",
              borderBottom: "2px solid #333",
              backgroundColor: "transparent",
              marginRight: "1rem",
              width: "250px",
            }}
          />
          <button
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #000",
              backgroundColor: "#000",
              color: "#fff",
            }}
            onClick={() => {
              if (variable === "clear") {
                setFilter("");
              } else if (variable === "tosend") {
                setFilter(`?sent=false&paid=true`);
              } else {
                if (variable === "sent" && search === "")
                  setFilter(`?${variable}=true`);
                else setFilter(`?${variable}=${encodeURIComponent(search)}`);
              }

              setApplicants([]);
              setPageIndex(0);
              setLoading(false);
              setHasMore(true);
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.04505 18.8942L9.93934 11.9999L3.04505 5.10565C2.75216 4.81275 2.75216 4.33788 3.04505 4.04499C3.33794 3.75209 3.81282 3.75209 4.10571 4.04499L11.5303 11.4696C11.8232 11.7625 11.8232 12.2374 11.5303 12.5303L4.10571 19.9549C3.81282 20.2478 3.33794 20.2478 3.04505 19.9549C2.75216 19.662 2.75215 19.1871 3.04505 18.8942Z"
                fill="#fff"
              />
              <path
                d="M11.25 19.4999C10.8358 19.4999 10.5 19.8357 10.5 20.2499C10.5 20.6642 10.8358 20.9999 11.25 20.9999H20.75C21.1642 20.9999 21.5 20.6642 21.5 20.2499C21.5 19.8357 21.1642 19.4999 20.75 19.4999L11.25 19.4999Z"
                fill="#fff"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.applicantList}>
        {applicants.map((applicant) => TicketCard(applicant, admitApplicant))}
      </div>

      {loading && <p>Loading...</p>}
      {!loading && hasMore && <div id="loadMoreTrigger"></div>}
    </section>
  );
}
