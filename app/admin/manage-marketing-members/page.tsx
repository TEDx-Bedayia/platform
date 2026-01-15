"use client";
import { useEffect, useState } from "react";

import { ResponseCode } from "@/app/api/utils/response-codes";
import { addLoader, removeLoader } from "@/app/global_components/loader";
import {
  check,
  hashtag,
  onePersonSm,
  shieldLock,
  trash,
  whiteCheckLg,
} from "@/app/icons";
import { motion } from "framer-motion";
import { Poppins, Ubuntu } from "next/font/google";
import { useRouter } from "next/navigation";
import { customAlert } from "../custom-alert";
import { MarketingMember } from "../types/MarketingMember";
import styles from "./marketing-members.module.css"; // Import CSS styles

const title = Poppins({ weight: "700", subsets: ["latin"] });

const ubuntu = Ubuntu({ weight: ["300", "400", "700"], subsets: ["latin"] });

export default function MarketingMembers() {
  const router = useRouter();

  const [members, setMembers] = useState<MarketingMember[]>([]);
  const [rushHourDate, setRushHourDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [memberActivity, setMemberActivity] = useState<
    Record<
      string,
      Record<number, { attendeeId: number; price: number; createdAt: string }[]>
    >
  >({});

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  async function fetchMembers() {
    try {
      const response = await fetch(
        "/api/admin/manage-marketing-members/members"
      );
      const data = await response.json();

      setIsLoading(false);
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (data.members) {
        setMembers(data.members);
      } else {
        customAlert(data.message || "Failed to fetch members");
      }
    } catch (error) {
      customAlert("Failed to fetch members.");
    }
  }

  async function fetchMemberActivity() {
    try {
      const response = await fetch(
        "/api/admin/manage-marketing-members/member-activity"
      );
      const data = await response.json();

      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (data.activity) {
        // Group by createdAt DATE without TIME then by memberId
        const groupedActivity = data.activity.reduce((acc: any, item: any) => {
          // DD/MM/YYYY
          const date = new Date(item.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
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
        }, {});
        setMemberActivity(groupedActivity);
        console.log("Member Activity:", groupedActivity);
      } else {
        customAlert(data.message || "Failed to fetch member activity");
      }
    } catch (error) {
      customAlert("Error fetching member activity.");
    }
  }

  useEffect(() => {
    async function runEffect() {
      addLoader();

      try {
        const response = await fetch(
          "/api/admin/manage-marketing-members/rush-hour-date",
          {
            method: "GET",
          }
        );
        const data = await response.json();

        if (response.status === 401) {
          router.push("/admin/login");
          removeLoader();
          return;
        }

        if (data.date) {
          setRushHourDate(new Date(data.date));
        } else {
          customAlert(data.message || "Failed to fetch rush hour date");
        }
      } catch (error) {
        customAlert("Error fetching rush hour date.");
      }

      await fetchMembers();

      await fetchMemberActivity();

      removeLoader();
    }

    runEffect();
  }, []);

  function createMember(name: string) {
    if (!name) {
      customAlert("Name is required.");
      return;
    }

    addLoader();

    fetch("/api/admin/manage-marketing-members/members", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
    addLoader();

    fetch(
      `/api/admin/manage-marketing-members/members?id=${encodeURIComponent(
        id
      )}`,
      {
        method: "DELETE",
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

  return (
    <section id="rush-hour" className={styles.dashboard}>
      <h1 className={title.className}>Rush Hour Management</h1>
      <p className={ubuntu.className} style={{ fontWeight: "300" }}>
        Edit the list of members, approve rush hour tickets, and manage
        schedules.
      </p>
      <br />
      <h2 className={title.className}>Tickets Management</h2>
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
                          },
                          body: JSON.stringify({
                            memberId: Number(memberId),
                            date: selectedDate,
                            paid: activities.reduce(
                              (total, activity) => total + activity.price,
                              0
                            ),
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
                      } else if (
                        response.status ===
                        ResponseCode.MARKETING_ACTIVITY_OUT_OF_SYNC
                      ) {
                        customAlert("Out of sync error. Refreshing data...");
                        await fetchMemberActivity();
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
              Click on a date to view pending rush hour/normal tickets.
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
                <span>{member.password}</span>
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
