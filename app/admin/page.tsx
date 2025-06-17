"use client";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

import { motion } from "framer-motion";
import { Poppins, Ubuntu } from "next/font/google";
import { getTicketTypeName, TicketType } from "../api/utils/ticket-types";
import { addLoader, removeLoader } from "../global_components/loader";
import {
  check,
  cross,
  destructiveIcon,
  devSearch,
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
  const [variable, setVariable] = useState("desc");
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
              {applicant.ticket_type === TicketType.GROUP ? group : onePerson}
              <span
                style={{
                  fontSize: ".5rem",
                  fontWeight: 700,
                  position: "absolute",
                  width:
                    applicant.ticket_type === TicketType.GROUP
                      ? "71.5%"
                      : "100%",
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
                  className={styles.applicantEmail}
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
              <span
                style={{ fontWeight: "700" }}
                className={
                  applicant.ticket_type != TicketType.GROUP && !applicant.paid
                    ? styles.ticketType + " cursor-pointer"
                    : ""
                }
                onClick={() => {
                  if (
                    applicant.ticket_type != TicketType.GROUP &&
                    !applicant.paid
                  )
                    customAlert2(
                      "",
                      async (type: string) => {
                        try {
                          let response = await fetch(
                            `/api/admin/tickets/update-type`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                key: `${localStorage.getItem("admin-token")}`,
                              },
                              body: JSON.stringify({
                                id: applicant.id,
                                type: type,
                              }),
                            }
                          );

                          if (response.ok) {
                            setApplicants((prevApplicants) =>
                              prevApplicants.map((prevApplicant) =>
                                prevApplicant.id === applicant.id
                                  ? { ...prevApplicant, ticket_type: type }
                                  : prevApplicant
                              )
                            );
                            return true;
                          }

                          return false;
                        } catch (e) {
                          return false;
                        }
                      },
                      applicant.ticket_type,
                      Object.values(TicketType).filter((value) => {
                        return (
                          value != TicketType.GROUP &&
                          value != TicketType.SPEAKER
                        );
                      })
                    );
                }}
              >
                {/* {applicant.ticket_type == TicketType.GROUP ||
                applicant.ticket_type == TicketType.INDIVIDUAL
                  ? applicant.payment_method.split("@")[0]
                  : getTicketTypeName(
                      applicant.ticket_type as TicketType
                    ).toUpperCase()} */}

                {getTicketTypeName(
                  applicant.ticket_type as TicketType
                ).toUpperCase()}
              </span>
              <span>
                {/* {applicant.payment_method.split("@")[1] != undefined &&
                  " " + applicant.payment_method.split("@")[1]}{" "}
                {applicant.ticket_type != TicketType.GROUP &&
                applicant.ticket_type != TicketType.INDIVIDUAL
                  ? `(${applicant.payment_method.split("@")[0]})`
                  : ""} */}

                {applicant.payment_method.split("@")[1] != undefined &&
                  " " + applicant.payment_method.split("@")[1]}
                {` (`}
                <span style={{ fontWeight: 700 }}>
                  {applicant.payment_method.split("@")[0]}
                </span>
                {")"}
              </span>
              <span style={{ fontSize: ".5rem", marginLeft: ".25rem" }}>
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
                      applicant.ticket_type == TicketType.GROUP
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
          {destructiveIcon}
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
            <option value="desc">All</option>
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
              if (variable === "desc") {
                setFilter(`?desc=${encodeURIComponent(search)}`);
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
            {devSearch}
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
