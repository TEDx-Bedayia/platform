"use client";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

import { motion } from "framer-motion";
import { Poppins, Ubuntu } from "next/font/google";
import { addLoader, removeLoader } from "../global_components/loader";
import {
  check,
  cross,
  group,
  onePerson,
  pencil,
  speakerTicketIcon,
} from "../icons";
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

  const [selectedEmailEditor, setSelectedEmailEditor] = useState(0);
  const [editorEmail, setEditorEmail] = useState("");

  useEffect(() => {
    if (localStorage.getItem("admin-token") == "dev") {
      setDevMode(true);
    }
  }, []);

  const msg =
    "Hello {name}! Your ticket for the event has been sent to your email. Please check your inbox and spam folder. If you have any questions or concerns, feel free to contact us. Enjoy!";

  const grpMsg =
    "Hello {name}! The tickets for the event have been sent to each member individually on their email. Please check your inbox and spam folder. If you have any questions or concerns, feel free to contact us. Enjoy!";

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
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "start",
                gap: "0px",
              }}
            >
              <span className={styles.applicantName}>
                {applicant.full_name}
              </span>
              <div className="flex flex-row-reverse justify-center items-center gap-2">
                <span
                  contentEditable={selectedEmailEditor === applicant.id}
                  className={styles.applicantEmail + " " + styles.disabled}
                  id={"email_editor" + applicant.id}
                  onInput={(e) => {
                    setEditorEmail(e.currentTarget.innerText);
                    return;
                  }}
                >
                  {applicant.email}
                </span>

                {selectedEmailEditor == applicant.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: { duration: 0.2, ease: "easeInOut" },
                    }}
                    exit={{ opacity: 0 }}
                    style={{ cursor: "pointer" }}
                    className="hover:scale-[2] origin-bottom-left transition-all duration-200"
                    onClick={() => {
                      setSelectedEmailEditor(0);
                      document
                        .getElementById("email_editor" + applicant.id)
                        ?.classList.remove(styles.active);

                      document.getElementById(
                        "email_editor" + applicant.id
                      )!.innerText = applicant.email;

                      setEditorEmail("");
                    }}
                  >
                    {cross}
                  </motion.div>
                )}

                <div
                  style={{ cursor: "pointer" }}
                  className="hover:scale-[2] origin-bottom-left transition-all duration-200"
                  onClick={async () => {
                    setSelectedEmailEditor(
                      selectedEmailEditor == applicant.id ? 0 : applicant.id
                    );

                    if (selectedEmailEditor !== applicant.id) {
                      setEditorEmail("");
                      document
                        .getElementById("email_editor" + applicant.id)
                        ?.focus();

                      // Select the text
                      const range = document.createRange();
                      range.selectNodeContents(
                        document.getElementById("email_editor" + applicant.id)!
                      );
                      const sel = window.getSelection();
                      sel?.removeAllRanges();
                      sel?.addRange(range);
                    } else {
                      // Unselect text
                      const range = document.createRange();
                      range.selectNodeContents(
                        document.getElementById("email_editor" + applicant.id)!
                      );
                      const sel = window.getSelection();
                      sel?.removeAllRanges();

                      // Try to Update the Email
                      const emailRegExp = new RegExp(
                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                      );
                      if (
                        emailRegExp.test(editorEmail) &&
                        editorEmail !== applicant.email
                      ) {
                        addLoader();
                        let resp = await fetch(`/api/admin/update-email`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            key: `${localStorage.getItem("admin-token")}`,
                          },
                          body: JSON.stringify({
                            email: editorEmail,
                            id: applicant.id,
                          }),
                        });
                        removeLoader();

                        if (resp.ok) {
                          setApplicants((prevApplicants) =>
                            prevApplicants.map((prevApplicant) =>
                              prevApplicant.id === applicant.id
                                ? { ...prevApplicant, email: editorEmail }
                                : prevApplicant
                            )
                          );
                        } else {
                          customAlert("Error updating email.");
                        }
                      } else {
                        if (editorEmail != applicant.email && editorEmail != "")
                          customAlert("Invalid Email.");
                      }
                      setEditorEmail("");
                      document.getElementById(
                        "email_editor" + applicant.id
                      )!.innerText = applicant.email;
                    }

                    document
                      .getElementById("email_editor" + applicant.id)
                      ?.classList.toggle(styles.active);
                  }}
                >
                  {selectedEmailEditor == applicant.id ? check : pencil}
                </div>
              </div>
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
                {applicant.ticket_type == "group" ||
                applicant.ticket_type == "individual"
                  ? applicant.payment_method.split("@")[0]
                  : applicant.ticket_type.toUpperCase()}
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
                    }&text=${
                      applicant.ticket_type == "group"
                        ? encodeURIComponent(
                            grpMsg.replace(
                              "{name}",
                              applicant.full_name.split(" ")[0]
                            )
                          )
                        : encodeURIComponent(
                            msg.replace(
                              "{name}",
                              applicant.full_name.split(" ")[0]
                            )
                          )
                    }&type=phone_number&app_absent=0`
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
            <option value="uuid">UUID</option>
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
