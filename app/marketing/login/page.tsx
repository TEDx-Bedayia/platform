"use client";
import { useEffect, useState } from "react";
import styles from "./marketing-login.module.css";

import { Poppins } from "next/font/google";
import { customAlert } from "../../admin/custom-alert";
import "../../book/htmlcolor.css";

import { onePersonMd } from "@/app/icons";
import { addLoader, removeLoader } from "../../global_components/loader";
const title = Poppins({ weight: ["100", "400", "700"], subsets: ["latin"] });

export default function MarketingLogin() {
  useEffect(() => {
    if (
      localStorage.getItem("marketing-username") &&
      localStorage.getItem("marketing-password")
    ) {
      window.location.href = "/marketing";
    }
  });

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  function saveCredentialsAndRedirect() {
    localStorage.setItem("marketing-username", username);
    localStorage.setItem("marketing-password", password);
    window.location.href = "/marketing";
  }

  async function checkCredentials() {
    if (!username || !password) {
      customAlert("Please enter both username and password.");
      return false;
    }

    addLoader();
    let isValid;
    try {
      const response = await fetch("/api/marketing/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        isValid = data.valid;
        localStorage.setItem("marketing-name", data.name);
        console.log(data);
      } else {
        isValid = false;
      }
    } catch (error) {
      customAlert("Error checking credentials.");
      isValid = false;
    }
    removeLoader();

    if (!isValid) {
      customAlert("Invalid username or password.");
      return false;
    }

    return true;
  }

  return (
    <section id="marketing-login" className={styles.container}>
      <h1 style={title.style}>Marketing Login</h1>
      <div className={styles.loginForm}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            name="username"
            id="username-input"
            placeholder=" "
            value={username}
            required={true}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label htmlFor="username">Username</label>
          {onePersonMd}
        </div>
        <div className={styles.inputWrapper}>
          <input
            type="password"
            name="password"
            id="password-input"
            placeholder=" "
            value={password}
            required={true}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label htmlFor="password">Password</label>
          <svg
            width="20"
            height="20"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginLeft: "2px" }}
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M8.53336 0.133063C8.18645 0.0220524 7.81355 0.0220518 7.46664 0.133062L2.21664 1.81306C1.49183 2.045 1 2.71878 1 3.4798V6.99985C1 8.5659 1.31923 10.1823 2.3032 11.682C3.28631 13.1805 4.88836 14.4946 7.33508 15.5367C7.75909 15.7173 8.24091 15.7173 8.66493 15.5367C11.1116 14.4946 12.7137 13.1805 13.6968 11.682C14.6808 10.1823 15 8.5659 15 6.99985V3.4798C15 2.71878 14.5082 2.045 13.7834 1.81306L8.53336 0.133063ZM7.92381 1.5617C7.97336 1.54584 8.02664 1.54584 8.07619 1.5617L13.3262 3.2417C13.4297 3.27483 13.5 3.37109 13.5 3.4798V6.99985C13.5 8.35818 13.2253 9.66618 12.4426 10.8592C11.6591 12.0535 10.3216 13.2007 8.07713 14.1567C8.02866 14.1773 7.97134 14.1773 7.92287 14.1567C5.67838 13.2007 4.34094 12.0535 3.55737 10.8592C2.77465 9.66618 2.5 8.35818 2.5 6.99985V3.4798C2.5 3.37109 2.57026 3.27483 2.67381 3.2417L7.92381 1.5617ZM9.5 6.49988C9.5 7.05509 9.19835 7.53985 8.75 7.7992V10.2499C8.75 10.6641 8.41421 10.9999 8 10.9999C7.58579 10.9999 7.25 10.6641 7.25 10.2499V7.7992C6.80165 7.53985 6.5 7.05509 6.5 6.49988C6.5 5.67145 7.17157 4.99988 8 4.99988C8.82843 4.99988 9.5 5.67145 9.5 6.49988Z"
              fill="#1F2328"
            />
          </svg>
        </div>
        <button
          className={styles.loginButton}
          style={{ ...title.style, width: "100%", fontWeight: "700" }}
          onClick={async () => {
            if (await checkCredentials()) {
              saveCredentialsAndRedirect();
            }
          }}
        >
          Login
        </button>
      </div>
    </section>
  );
}
