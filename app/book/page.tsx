"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./book.module.css";

import { motion } from "framer-motion";

import { Poppins, Ubuntu } from "next/font/google";
import { customAlert } from "../admin/custom-alert";
import {
  Field,
  PaymentMethod,
} from "../api/tickets/payment-methods/payment-methods";
import "./htmlcolor.css";

import { addLoader, removeLoader } from "../global_components/loader";
const title = Poppins({ weight: ["100", "400", "700"], subsets: ["latin"] });
const ubuntu = Ubuntu({ weight: ["300", "400", "700"], subsets: ["latin"] });

export default function SingleTickets() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    paymentMethod: "",
    additionalFields: {} as { [key: string]: string },
  });

  const [code, setCode] = useState("");
  const [askForCode, setAskForCode] = useState(false);

  let CodeInputElement = () => {
    const inputRefs = useRef<(HTMLSpanElement | null)[]>([]);

    const getFirstEmptyIndex = () => {
      return inputRefs.current.findIndex((span) => {
        return !span?.textContent || span.textContent.trim() === "";
      });
    };

    const handleInput = (
      e: React.FormEvent<HTMLSpanElement>,
      index: number
    ) => {
      let value = e.currentTarget.textContent || "";
      value = value.toUpperCase();

      // Enforce 1 character only
      if (value.length > 1) {
        value = value.charAt(0);
      }

      e.currentTarget.textContent = value;

      placeCaretAtEnd(e.currentTarget);

      // Move focus to next box if not the last
      if (value.length === 1 && index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      if (index === inputRefs.current.length - 1) {
        inputRefs.current[index]?.blur();
      }
    };

    const handleKeyDown = (
      e: React.KeyboardEvent<HTMLSpanElement>,
      index: number
    ) => {
      const key = e.key;

      if (e.key === "Tab") {
        const correctIndex = getFirstEmptyIndex();
        if (index !== correctIndex) {
          e.preventDefault();
          inputRefs.current[correctIndex]?.focus();
        }
      }

      // Backspace: if current is empty, go back
      if (key === "Backspace") {
        const value = e.currentTarget.textContent;
        if ((!value || value.length === 0) && index > 0) {
          e.preventDefault();
          inputRefs.current[index - 1]?.focus();
          inputRefs.current[index - 1]!.textContent = ""; // Clear previous box
        } else {
          inputRefs.current[index]!.textContent = ""; // Clear current box
        }
        const correctIndex = getFirstEmptyIndex();
        if (index !== correctIndex) {
          e.preventDefault();
          inputRefs.current[correctIndex]?.focus();
        }
        return;
      }

      // Block multiple keys
      if (
        e.currentTarget.textContent &&
        e.currentTarget.textContent.length >= 1 &&
        key.length === 1
      ) {
        e.preventDefault();
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLSpanElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").toUpperCase();

      const clean = pasted.replace(/[^A-Z0-9]/gi, ""); // Remove dashes, symbols

      for (let i = 0; i < clean.length && i < inputRefs.current.length; i++) {
        const char = clean.charAt(i);
        const span = inputRefs.current[i];
        if (span) {
          span.textContent = char;
        }
      }

      // Focus next empty box
      const nextEmpty =
        clean.length < inputRefs.current.length
          ? inputRefs.current[clean.length]
          : null;
      nextEmpty?.focus();
      if (!nextEmpty) {
        inputRefs.current[inputRefs.current.length - 1]?.focus();
      }
    };

    const placeCaretAtEnd = (el: HTMLElement) => {
      const range = document.createRange();
      const sel = window.getSelection();

      range.selectNodeContents(el);
      range.collapse(false); // Move to end

      sel?.removeAllRanges();
      sel?.addRange(range);
    };

    return (
      <motion.div
        className="w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, delay: 1 }}
      >
        <div className={styles.codeInputDialog}>
          <div
            className="absolute top-4 right-4 cursor-pointer text-white z-[600]"
            onClick={() => {
              window.history.pushState({}, "", `/book`);
              setCode("");
              setAskForCode(false);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
          <h2>Enter Your Code</h2>
          <div className="flex flex-row gap-2 w-full justify-center my-4 text-2xl">
            {[...Array(9)].map((_, i) => {
              // Add a dash after 4th element (index 4)
              if (i === 4) {
                return (
                  <span key="dash" className="text-white font-bold">
                    -
                  </span>
                );
              }

              const adjustedIndex = i > 4 ? i - 1 : i;

              return (
                <span
                  key={i}
                  ref={(el) => {
                    inputRefs.current[adjustedIndex] = el;
                  }}
                  className="border-b border-white w-8 text-center outline-none"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => handleInput(e, adjustedIndex)}
                  onKeyDown={(e) => handleKeyDown(e, adjustedIndex)}
                  onPaste={(e) => handlePaste(e)}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      document.getElementById("submit-code-button")?.click();
                    }
                  }}
                  onFocus={(e) => {
                    const correctIndex = getFirstEmptyIndex();
                    const currentIndex = inputRefs.current.findIndex(
                      (el) => el === e.currentTarget
                    );

                    if (currentIndex !== correctIndex && correctIndex !== -1) {
                      e.preventDefault();
                      inputRefs.current[correctIndex]?.focus();
                      return;
                    } else if (correctIndex === -1) {
                      // If all boxes are filled, focus the last one
                      inputRefs.current[inputRefs.current.length - 1]?.focus();
                      return;
                    }

                    placeCaretAtEnd(e.currentTarget);
                  }}
                ></span>
              );
            })}
          </div>
          <button
            id="submit-code-button"
            onClick={async () => {
              const code = inputRefs.current
                .map((span) => span?.textContent || "")
                .join("")
                .toUpperCase();
              if (code.length !== 8) {
                customAlert("Please enter a valid code.");
                return;
              }
              if (code.trim() === "") {
                customAlert("Please enter a valid code.");
                return;
              }
              addLoader();

              // customAlert("Code submitted successfully.");
              const response = await fetch("/api/tickets/test-rush-code", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  code: `${code.slice(0, 4)}-${code.slice(4)}`,
                }),
              });
              if (!response.ok) {
                const errorData = await response.json();
                customAlert(errorData.message || "An error occurred.");
                removeLoader();
                return;
              }
              removeLoader();

              customAlert(
                "Code Accepted! Please fill in your details and your ticket will arrive shortly (P.S. it may take us a day or two to verify your ticket)."
              );
              window.history.pushState({}, "", `/book`);
              setCode(`${code.slice(0, 4)}-${code.slice(4)}`);
              formData.paymentMethod = "CASH";
              setAskForCode(false);
            }}
          >
            Submit
          </button>
        </div>
      </motion.div>
    );
  };

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("rush") !== null) {
      setAskForCode(true);
    }
  }, [askForCode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    let { name, value } = e.target;
    if (name == "phone")
      value = value.replaceAll(/[\u0660-\u0669]/g, (c) => {
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

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  async function submitTicket(type: string) {
    addLoader();
    formData.paymentMethod = type;
    if (
      formData.phone.length < 11 ||
      (formData.phone.includes("+") && formData.phone.length != 13)
    ) {
      customAlert("Please enter a valid phone number");
      removeLoader();
      return;
    }

    const response = await fetch("/api/tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(code ? { ...formData, code } : formData),
    });

    if (response.ok) {
      const jsonRes = await response.json();

      if (type === "CASH") {
        customAlert(jsonRes.message ?? "Ticket booked successfully!");
        setFormData({
          email: "",
          name: "",
          phone: "",
          paymentMethod: "",
          additionalFields: {},
        });
        setCode("");
        removeLoader();
        return;
      }

      window.location.href = jsonRes.paymentUrl;
      return;
    } else {
      customAlert((await response.json()).message ?? "An Error Occurred.");
    }
    removeLoader();
  }

  // for PayMob & Cash
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    document.body.focus();

    if (code !== "") await submitTicket("CASH");
    else await submitTicket(formData.paymentMethod || "CARD");
  }

  return (
    <section id="book-one-ticket" className={styles.container}>
      {askForCode && <CodeInputElement />}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ease: "easeOut", duration: 1.5 }}
      >
        <h1 style={{ ...title.style, fontWeight: 700, color: "#E0E0E0" }}>
          Book a Ticket
        </h1>
        <h2 style={{ ...title.style, fontWeight: 900, color: "#F9F9F9" }}>
          {code ? "Paid Ticket!" : "400 EGP"}
        </h2>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ease: "anticipate", duration: 2 }}
        className={askForCode ? "pointer-events-none" : ""}
      >
        <form onSubmit={handleSubmit} style={ubuntu.style}>
          {code && (
            <center>
              <code className="text-gray-200">RUSH {code}</code>
            </center>
          )}
          <div className={styles.mainTextbox}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                name="name"
                id="name-input"
                placeholder=" "
                value={formData.name}
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
                value={formData.email}
                onChange={handleChange}
              />
              <label htmlFor="email">Email Address</label>
            </div>
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

          <motion.div
            initial={{ scale: 2, opacity: 0.2 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "tween", ease: "anticipate", duration: 2 }}
          >
            <button type="submit" style={{ ...title.style, width: "100%" }}>
              {code !== "" ? <span>Submit</span> : <span>Pay Online</span>}
            </button>
          </motion.div>
          {code === "" && (
            <>
              <div className="flex items-center justify-center mt-4 mb-4 font-bold">
                OR
              </div>

              <motion.div
                initial={{ scale: 2, opacity: 0.2 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "tween", ease: "anticipate", duration: 2 }}
              >
                <button
                  className={`${styles.schoolOfficeButton} font-bold`}
                  style={{ ...title.style, width: "100%" }}
                  onClick={() => {
                    formData.paymentMethod = "CASH";
                  }}
                >
                  Pay at Bedayia High School Office
                </button>
              </motion.div>
            </>
          )}
        </form>
      </motion.div>
    </section>
  );
}
