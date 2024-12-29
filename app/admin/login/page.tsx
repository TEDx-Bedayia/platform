"use client";
import { addLoader, removeLoader } from "@/app/global_components/loader";
import { Poppins, Space_Grotesk } from "next/font/google";
import { useEffect, useState } from "react";
import { customAlert } from "../custom-alert";
import styles from "./login.module.css"; // Importing the CSS module

const title = Poppins({ weight: "700", subsets: ["latin"] });

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  useEffect(() => {
    if (localStorage.getItem("school-token")) {
      window.location.href = "/admin/payments";
    }
    if (localStorage.getItem("admin-token")) {
      window.location.href = "/admin";
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    addLoader();
    e.preventDefault();
    if (formData.username && formData.password && formData.name) {
      const { username, password, name } = formData;
      // Show Loader

      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: username,
          password: password,
          name: name,
        }),
      });

      // Hide Loader

      if (response.ok) {
        const { token, type } = await response.json();
        if (token) {
          localStorage.setItem(type + "-token", token);
          if (type == "admin") window.location.href = "/admin";
          else window.location.href = "/admin/payments";
        }
      } else {
        const { message } = await response.json();
        customAlert(message);
      }
    } else {
      customAlert("All fields are required.");
    }
    removeLoader();
  };

  return (
    <div className={styles.pageContainer}>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <h2 className={title.className}>eTickets v1.0</h2>

        <div className={styles.formGroup}>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder=" "
            required
          />
          <label htmlFor="name">Name</label>
        </div>

        <div className={styles.formGroup}>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder=" "
            required
          />
          <label htmlFor="username">Username</label>
        </div>

        <div className={styles.formGroup}>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder=" "
            required
          />
          <label htmlFor="password">Password</label>
        </div>

        <button type="submit">Login</button>
      </form>

      <span
        style={{
          position: "absolute",
          bottom: "3em",
          color: "#888",
          fontSize: "0.8rem",
          textAlign: "center",
          width: "100%",
        }}
      >
        <strong>Developed by Aly Mohamed Salah with ❤️</strong>
      </span>
    </div>
  );
}
