"use client";
import { useState } from "react";
import styles from "../book.module.css";

import { motion } from "framer-motion";

import { verifyEmail } from "@/app/api/utils/input-sanitization";
import { backArrow, forwardArrow } from "@/app/icons";
import { Poppins, Ubuntu } from "next/font/google";
import { customAlert } from "../../admin/custom-alert";
import { addLoader, removeLoader } from "../../global_components/loader";
import "../htmlcolor.css";
const title = Poppins({ weight: ["100", "400", "700"], subsets: ["latin"] });
const ubuntu = Ubuntu({ weight: ["300", "400", "700"], subsets: ["latin"] });

export default function GroupTickets() {
  const [formData, setFormData] = useState({
    emails: ["", "", "", ""],
    names: ["", "", "", ""],
    phone: "",
    paymentMethod: "",
    additionalFields: {} as { [key: string]: string },
  });

  const [useSameEmail, setUseSameEmail] = useState(true);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    let { name, value } = e.target;
    if (name == "phone")
      value = value.replace(/[\u0660-\u0669]/g, (c) => {
        return (c.charCodeAt(0) - 0x0660).toString();
      });
    if (name == "phone") value = value.replace(/[^+\d]/g, "");

    if (name == "phone" && (isNaN(Number(value)) || value.includes(" "))) {
      if (value != "+") return;
    }
    if (name == "phone") {
      if (value.includes("+")) {
        if (value.length > 13) return;
      } else if (value.length > 11) {
        return;
      }
    }

    if (name == "email" || name == "name") {
      const index = currentPerson;
      const names = formData.names;
      const emails = formData.emails;

      if (name == "name") names[index] = value;
      if (name == "email") emails[index] = value;
      if (useSameEmail && index == 0) {
        // If using the same email, set all emails to the first person's email
        for (let i = 1; i < emails.length; i++) {
          emails[i] = value;
        }
      }

      setFormData({
        ...formData,
        names,
        emails,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    document.body.focus();
    addLoader();

    if (
      formData.phone.length < 11 ||
      (formData.phone.includes("+") && formData.phone.length != 13)
    ) {
      customAlert("Please enter a valid phone number.");
      setCurrentPerson(0);
      removeLoader();
      return;
    }

    if (
      formData.names[1] == "" &&
      formData.names[2] == "" &&
      formData.names[3] == "" &&
      formData.names[0] != ""
    ) {
      setFormData({
        ...formData,
        names: [
          formData.names[0],
          formData.names[0],
          formData.names[0],
          formData.names[0],
        ],
      });
      formData.names[1] = formData.names[0];
      formData.names[2] = formData.names[0];
      formData.names[3] = formData.names[0];
    }

    const response = await fetch("/api/tickets/group", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name1: formData.names[0],
        email1: formData.emails[0],
        name2: formData.names[1],
        email2: formData.emails[1],
        name3: formData.names[2],
        email3: formData.emails[2],
        name4: formData.names[3],
        email4: formData.emails[3],
        phone: formData.phone,
        paymentMethod: formData.paymentMethod,
        additionalFields: formData.additionalFields,
      }),
    });

    if (response.ok) {
      if (formData.paymentMethod === "CARD") {
        const { paymentUrl } = await response.json();
        window.location.href = paymentUrl;
        return;
      }
      setFormData({
        emails: ["", "", "", ""],
        names: ["", "", "", ""],
        phone: "",
        paymentMethod: "",
        additionalFields: {} as { [key: string]: string },
      });
      setUseSameEmail(false);
      customAlert((await response.json()).message ?? "Submitted.");
      setCurrentPerson(0);
    } else {
      customAlert((await response.json()).message ?? "An Error Occurred.");
    }
    removeLoader();
  }

  const [currentPerson, setCurrentPerson] = useState(0);

  return (
    <section
      id="book-group-ticket"
      className={`${styles.container} ${styles.group}`}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ease: "easeOut", duration: 1.5 }}
      >
        <h1 style={{ ...title.style, fontWeight: 700 }}>Book a Group Ticket</h1>
        <h2
          style={{
            ...title.style,
            fontWeight: 900,
            color: "#F9F9F9",
            marginBottom: ".5rem",
          }}
        >
          1, 400 EGP
        </h2>
        <h2 style={{ ...title.style, fontWeight: 100, fontSize: ".75em" }}>
          350 EGP/Person
        </h2>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ease: "anticipate", duration: 2 }}
      >
        <form onSubmit={handleSubmit} style={ubuntu.style}>
          {currentPerson == 0 && <h3>Group Leader</h3>}
          {currentPerson != 0 && <h3>Person {currentPerson + 1}</h3>}
          <div className={styles.mainTextbox}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                name="name"
                id="name-input"
                placeholder=" "
                value={formData.names[currentPerson]}
                required={true}
                onChange={handleChange}
              />
              <label htmlFor="name">Full Name</label>
            </div>
          </div>

          <div className={styles.mainTextbox}>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                name="email"
                placeholder=" "
                id="email-input"
                required={true}
                value={formData.emails[currentPerson]}
                disabled={useSameEmail && currentPerson != 0}
                onChange={handleChange}
              />
              <label htmlFor="email">Email Address</label>
            </div>
          </div>

          {currentPerson == 0 && (
            <>
              <div className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="same-email-checkbox"
                  checked={!useSameEmail}
                  onChange={(e) => {
                    setUseSameEmail(!e.target.checked);
                    if (!e.target.checked) {
                      setFormData({
                        ...formData,
                        emails: [
                          formData.emails[0],
                          formData.emails[0],
                          formData.emails[0],
                          formData.emails[0],
                        ],
                      });
                    }
                  }}
                />
                <span
                  className={styles.checkMark}
                  onClick={() => {
                    setUseSameEmail(!useSameEmail);
                    if (!useSameEmail) {
                      setFormData({
                        ...formData,
                        emails: [
                          formData.emails[0],
                          formData.emails[0],
                          formData.emails[0],
                          formData.emails[0],
                        ],
                      });
                    }
                  }}
                ></span>
                <label htmlFor="same-email-checkbox">
                  Use different emails for members
                </label>
              </div>

              <div className={styles.mainTextbox}>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    name="phone"
                    id="phone-input"
                    placeholder=" "
                    minLength={11}
                    required={true}
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  <label htmlFor="phone">Phone Number</label>
                </div>
              </div>
            </>
          )}

          <div className={styles.buttonsContainer}>
            {currentPerson != 0 && (
              <motion.div
                initial={{ opacity: 0.2 }}
                animate={{ opacity: 1 }}
                transition={{ type: "tween", ease: "anticipate", duration: 2 }}
              >
                <button
                  style={{ ...title.style }}
                  className={styles.backButton}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementsByTagName("form")[0].style.transition =
                      "opacity 300ms ease";
                    document.getElementsByTagName("form")[0].style.opacity =
                      "0";
                    setTimeout(() => {
                      document.getElementsByTagName("form")[0].style.opacity =
                        "1";
                      setCurrentPerson(currentPerson - 1);
                    }, 350);
                  }}
                >
                  {backArrow}
                </button>
              </motion.div>
            )}

            {((formData.names[currentPerson] &&
              formData.emails[currentPerson]) ||
              currentPerson == 0) &&
              currentPerson != 3 &&
              !useSameEmail && (
                <motion.div
                  initial={{ opacity: 0.2 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    type: "tween",
                    ease: "anticipate",
                    duration: 2,
                  }}
                >
                  <button
                    style={{ ...title.style }}
                    className={styles.nextButton}
                    onClick={(e) => {
                      e.preventDefault();

                      if (
                        formData.names[currentPerson] != "" &&
                        verifyEmail(formData.emails[currentPerson]) &&
                        formData.phone.length >= 11
                      ) {
                        document.getElementsByTagName(
                          "form"
                        )[0].style.transition = "opacity 300ms ease";
                        document.getElementsByTagName("form")[0].style.opacity =
                          "0";
                        setTimeout(() => {
                          document.getElementsByTagName(
                            "form"
                          )[0].style.opacity = "1";
                          setCurrentPerson(currentPerson + 1);
                        }, 350);
                      } else {
                        if (formData.names[currentPerson] == "")
                          document.getElementById("name-input")!.focus();
                        else if (!verifyEmail(formData.emails[currentPerson]))
                          document.getElementById("email-input")!.focus();
                        else if (formData.phone.length < 11)
                          document.getElementById("phone-input")!.focus();
                      }
                    }}
                  >
                    {forwardArrow}
                  </button>
                </motion.div>
              )}
          </div>

          {(currentPerson == 3 ||
            useSameEmail ||
            (!formData.emails.includes("") &&
              !formData.names.includes(""))) && (
            <>
              {!useSameEmail && <br />}
              <motion.div
                initial={{ opacity: 0.2 }}
                animate={{ opacity: 1 }}
                transition={{ type: "tween", ease: "anticipate", duration: 2 }}
              >
                <button
                  type="submit"
                  style={{ ...title.style, width: "100%", marginTop: "12px" }}
                  onClick={() => {
                    formData.paymentMethod = "CARD";
                  }}
                >
                  Pay Online
                </button>
              </motion.div>

              <div className="flex items-center justify-center mt-4 mb-4 font-bold">
                OR
              </div>

              <motion.div
                initial={{ opacity: 0.2 }}
                animate={{ opacity: 1 }}
                transition={{ type: "tween", ease: "anticipate", duration: 2 }}
              >
                <button
                  className={`${styles.schoolOfficeButton} font-bold`}
                  style={{ ...title.style, width: "100%" }}
                  onClick={() => {
                    formData.paymentMethod = "CASH";
                  }}
                >
                  Pay at Bedayia
                </button>
              </motion.div>
            </>
          )}
        </form>
      </motion.div>
    </section>
  );
}
