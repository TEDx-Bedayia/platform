"use client";
import { useEffect, useState } from "react";

import {
  check,
  keyIcon,
  onePerson,
  onePersonSm,
  shieldLock,
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
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
          console.error("Failed to fetch members:", data);
          customAlert(data.message || "Failed to fetch members");
        }
        setIsLoading(false);
      })
      .catch((error) => console.error("Error fetching members:", error));
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
          console.error("Failed to fetch password:", data);
          customAlert(data.message || "Failed to fetch password");
        }
      })
      .catch((error) => console.error("Error fetching password:", error));

    // Fetch members when the component mounts
    fetchMembers();
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
        if (data.member) {
          setMembers((prevMembers) => [...prevMembers, data.member]);
          customAlert(
            "Member added successfully. Please share the username and password with them privately."
          );
        } else {
          console.error("Failed to create member:", data);
          customAlert(data.message || "Failed to create member");
        }
      })
      .catch((error) => console.error("Error creating member:", error));
  }

  function deleteMember(id: number) {
    const token =
      localStorage.getItem("admin-token") ||
      localStorage.getItem("marketing-token");

    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

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
        if (res.ok) {
          setMembers((prevMembers) =>
            prevMembers.filter((member) => member.id !== id)
          );
          customAlert("Member deleted successfully.");
        } else {
          console.error("Failed to delete member");
          customAlert("Failed to delete member");
        }
      })
      .catch((error) => console.error("Error deleting member:", error));
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
          console.error("Failed to delete all members");
          customAlert("Failed to delete all members");
        }
      })
      .catch((error) => console.error("Error deleting all members:", error));
  }

  return (
    <section id="rush-hour" className={styles.dashboard}>
      <h1 className={title.className}>Rush Hour Management</h1>
      <p className={ubuntu.className} style={{ fontWeight: "300" }}>
        Edit the list of members, approve rush hour tickets, and manage
        schedules.
      </p>
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
              <div className={styles.detailContainer}>
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
