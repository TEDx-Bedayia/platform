"use client";
import { useEffect, useState } from "react";

import { addLoader, removeLoader } from "@/app/global_components/loader";
import {
  check,
  hashtag,
  keyIcon,
  onePerson,
  onePersonSm,
  shieldLock,
  ticketIcon,
  trash,
  whiteCheck,
  whiteCheckLg,
} from "@/app/icons";
import { motion } from "framer-motion";
import { Poppins, Ubuntu } from "next/font/google";
import { customAlert } from "../custom-alert";
import { MarketingMember } from "../types/MarketingMember";
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

  const [members, setMembers] = useState<MarketingMember[]>([]);
  const [password, setPassword] = useState<string>("Loading...");
  const [rushHourDate, setRushHourDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [memberActivity, setMemberActivity] = useState<
    Record<
      string,
      Record<number, { attendeeId: number; price: number; createdAt: string }[]>
    >
  >({});

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  function fetchMembers() {
    const token =
      localStorage.getItem("admin-token") ||
      localStorage.getItem("marketing-token");

    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    fetch("/api/admin/manage-marketing-members/members", {
      headers: {
        key: token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.members) {
          setMembers(data.members);
        } else {
          customAlert(data.message || "Failed to fetch members");
        }
        setIsLoading(false);
      })
      .catch((error) => customAlert("Failed to fetch members."));
  }

  function fetchMemberActivity() {
    const token =
      localStorage.getItem("admin-token") ||
      localStorage.getItem("marketing-token");

    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    fetch("/api/admin/manage-marketing-members/member-activity", {
      headers: {
        key: token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // TODO
        if (data.activity) {
          // Group by createdAt DATE without TIME then by memberId
          const groupedActivity = data.activity.reduce(
            (acc: any, item: any) => {
              // DD/MM/YYYY
              const date = new Date(item.createdAt).toLocaleDateString(
                "en-GB",
                {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }
              );
              if (!acc[date]) {
                acc[date] = {};
              }
              if (!acc[date][item.memberId]) {
                acc[date][item.memberId] = [];
              }
              acc[date][item.memberId].push({
                attendeeId: item.attendeeId,
                price: item.price,
                createdAt: item.createdAt,
              });
              return acc;
            },
            {}
          );
          setMemberActivity(groupedActivity);
          console.log("Member Activity:", groupedActivity);
        } else {
          customAlert(data.message || "Failed to fetch member activity");
        }
      })
      .catch((error) => customAlert("Error fetching member activity."));
  }

  useEffect(() => {
    if (
      !localStorage.getItem("admin-token") &&
      !localStorage.getItem("marketing-token")
    ) {
      window.location.href = "/admin/login";
      return;
    }

    fetch("/api/admin/manage-marketing-members/get-pass", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        key:
          (localStorage.getItem("admin-token") ||
            localStorage.getItem("marketing-token")) ??
          "",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.pass) {
          setPassword(data.pass);
        } else {
          customAlert(data.message || "Failed to fetch password");
        }
      })
      .catch((error) => customAlert("Error fetching password."));

    fetch("/api/admin/manage-marketing-members/rush-hour-date", {
      method: "GET",
      headers: {
        key:
          (localStorage.getItem("admin-token") ||
            localStorage.getItem("marketing-token")) ??
          "",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.date) {
          setRushHourDate(new Date(data.date));
        }
      })
      .catch((error) => customAlert("Error fetching rush hour date."));
    fetchMembers();

    fetchMemberActivity();
  }, []);

  function createMember(name: string) {
    const token =
      localStorage.getItem("admin-token") ||
      localStorage.getItem("marketing-token");

    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    if (!name) {
      customAlert("Name is required.");
      return;
    }

    addLoader();

    fetch("/api/admin/manage-marketing-members/members", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        key: token,
      },
      body: JSON.stringify({ name }),
    })
      .then((res) => res.json())
      .then((data) => {
        removeLoader();
        if (data.member) {
          setMembers((prevMembers) => [...prevMembers, data.member]);
          customAlert(
            "Member added successfully. Please share the username and password with them privately."
          );
        } else {
          customAlert(data.message || "Failed to create member");
        }
      })
      .catch((error) => customAlert("Error creating member."));
  }

  function deleteMember(id: number) {
    const token =
      localStorage.getItem("admin-token") ||
      localStorage.getItem("marketing-token");

    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    addLoader();

    fetch(
      `/api/admin/manage-marketing-members/members?id=${encodeURIComponent(
        id
      )}`,
      {
        method: "DELETE",
        headers: {
          key: token,
        },
      }
    )
      .then((res) => {
        removeLoader();
        if (res.ok) {
          setMembers((prevMembers) =>
            prevMembers.filter((member) => member.id !== id)
          );
          customAlert("Member deleted successfully.");
        } else {
          customAlert("Failed to delete member");
        }
      })
      .catch((error) => customAlert("Error deleting member."));
  }

  function deleteAllMembers() {
    const token =
      localStorage.getItem("admin-token") ||
      localStorage.getItem("marketing-token");

    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    fetch("/api/admin/manage-marketing-members/members?id=-1", {
      method: "DELETE",
      headers: {
        key: token,
      },
    })
      .then((res) => {
        if (res.ok) {
          setMembers([]);
          customAlert("All members deleted successfully.");
        } else {
          customAlert("Failed to delete all members");
        }
      })
      .catch((error) => customAlert("Error deleting all members."));
  }

  return (
    <section id="rush-hour" className={styles.dashboard}>
      <h1 className={title.className}>Rush Hour Management</h1>
      <p className={ubuntu.className} style={{ fontWeight: "300" }}>
        Edit the list of members, approve rush hour tickets, and manage
        schedules.
      </p>
      <br />
      <h2 className={title.className}>Rush Hour Management</h2>
      {/* Date Input w/button for next rush hour day */}
      <div className="flex items-center gap-2">
        <h3>Next Rush Hour Date:</h3>
        <input
          type="date"
          className="bg-white text-black p-2 rounded-md border border-[#014f86]"
          value={rushHourDate ? rushHourDate.toISOString().split("T")[0] : ""}
          onChange={(e) => setRushHourDate(new Date(e.target.value))}
        />
        <button
          className="scale-125 hover:scale-150 transition-all duration-300 origin-bottom-left"
          onClick={async () => {
            if (rushHourDate) {
              addLoader();
              const response = await fetch(
                "/api/admin/manage-marketing-members/rush-hour-date",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    key:
                      (localStorage.getItem("admin-token") ||
                        localStorage.getItem("marketing-token")) ??
                      "",
                  },
                  body: JSON.stringify({ date: rushHourDate.toISOString() }),
                }
              );
              const data = await response.json();
              if (data.date) {
                setRushHourDate(new Date(data.date));
                customAlert("Rush hour date updated successfully.");
              } else {
                customAlert(data.message || "Failed to update date");
              }
              removeLoader();
            }
          }}
        >
          {check}
        </button>
      </div>
      <br />
      <div
        className={
          styles.rushDateSelector +
          " flex flex-wrap w-[90%] max-w-[400px] items-center justify-center max-phone:flex-col gap-4"
        }
      >
        {/* Loop over all dates (keys) */}
        {Object.entries(memberActivity).map(([date, members]) => (
          <span
            key={date}
            className={selectedDate === date ? styles.selected : ""}
            onClick={() => setSelectedDate(date)}
          >
            {date}
          </span>
        ))}
      </div>
      <br />
      {selectedDate && (
        <div className={styles.activityContainer}>
          <div className={styles.activityList}>
            {Object.entries(memberActivity[selectedDate] || {}).map(
              ([memberId, activities]) => (
                <div key={memberId} className={styles.activityItem}>
                  <h4 className={ubuntu.className} style={{ width: "30%" }}>
                    {members
                      .filter((m) => m.id === Number(memberId))
                      .map((m) => m.name)}
                  </h4>
                  <div style={{ width: "40%" }}>
                    <div
                      className={styles.detailContainer}
                      style={{ marginBottom: "0.5rem" }}
                    >
                      <span>{hashtag}</span>
                      <span>{activities.length} ticket(s).</span>
                    </div>

                    <div className={styles.detailContainer}>
                      <span className="font-bold">EGP</span>
                      <span>
                        {activities.reduce(
                          (total, activity) => total + activity.price,
                          0
                        )}
                      </span>
                    </div>
                  </div>
                  <button
                    className="h-full aspect-square p-5 rounded-[20px] bg-[#1f9c5a] hover:bg-[#147a43] transition-all duration-300"
                    onClick={async () => {
                      addLoader();
                      const response = await fetch(
                        "/api/admin/manage-marketing-members/accept-tickets",
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            key:
                              (localStorage.getItem("admin-token") ||
                                localStorage.getItem("marketing-token")) ??
                              "",
                          },
                          body: JSON.stringify({
                            memberId: Number(memberId),
                            date: selectedDate,
                          }),
                        }
                      );
                      const data = await response.json();
                      removeLoader();
                      if (response.ok) {
                        setMemberActivity((prev) => {
                          const newActivity = { ...prev };
                          delete newActivity[selectedDate][Number(memberId)];
                          return newActivity;
                        });
                        customAlert(
                          `You have confirmed receiving ${activities.reduce(
                            (total, activity) => total + activity.price,
                            0
                          )} EGP from ${members
                            .filter((m) => m.id === Number(memberId))
                            .map(
                              (m) => m.name
                            )} for rush hour / individual tickets on ${selectedDate}.`
                        );
                      } else {
                        customAlert(
                          data.message || "Failed to accept tickets."
                        );
                      }
                    }}
                  >
                    {whiteCheckLg}
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}
      {!selectedDate && (
        <div className="flex flex-col items-center justify-center">
          <h3 className={title.className}>
            {Object.entries(memberActivity).length > 0
              ? "No Date Selected"
              : "All Done"}
          </h3>
          {Object.entries(memberActivity).length > 0 && (
            <p className={ubuntu.className}>
              Click on a date to view pending rush hour tickets.
            </p>
          )}
        </div>
      )}
      <br />
      <h2 className={title.className}>Member List</h2>
      <div className="flex flex-col gap-2 w-full items-center">
        {members.map((member) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            key={member.id}
            className={styles.memberCard}
          >
            <h3 className={ubuntu.className} style={{ width: "30%" }}>
              {member.name}
            </h3>

            <div style={{ width: "40%" }}>
              <div
                className={styles.detailContainer}
                style={{ marginBottom: "0.5rem" }}
              >
                <span>{onePersonSm}</span>
                <span>{member.username}</span>
              </div>

              <div className={styles.detailContainer}>
                <span>{shieldLock}</span>
                <span>{password}</span>
              </div>
            </div>

            <button
              className={styles.deleteButton}
              style={{ marginTop: "auto" }}
              onClick={() => deleteMember(member.id)}
            >
              {trash}
            </button>
          </motion.div>
        ))}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={styles.memberCard}
            style={{ textAlign: "center", alignItems: "center" }}
          >
            <h3 className={ubuntu.className}>Add New Member</h3>
            <input
              type="text"
              placeholder="Enter member name"
              className={styles.inputField}
              id="new-member-input"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  createMember((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = "";
                }
              }}
            />
            <button
              className={styles.addButton}
              onClick={() => {
                const input = document.querySelector(
                  `#new-member-input`
                ) as HTMLInputElement;
                createMember(input.value);
                input.value = "";
              }}
            >
              {whiteCheckLg}
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
