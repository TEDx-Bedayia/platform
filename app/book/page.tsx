"use client";
import { useEffect, useState } from "react";
import styles from "./book.module.css";

import { motion } from "framer-motion";

import { Poppins, Ubuntu } from "next/font/google";
import { customAlert } from "../admin/custom-alert";
import {
  Field,
  PaymentMethod,
} from "../api/tickets/payment-methods/payment-methods";
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

  const [paymentOptions, setPaymentOptions] = useState([] as PaymentMethod[]);
  const [selectedPaymentFields, setSelectedPaymentFields] = useState(
    [] as Field[]
  );

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch("/api/tickets/payment-methods");
        if (response.ok) {
          const data = (await response.json()) as {
            paymentMethods: PaymentMethod[];
          };

          const methods: PaymentMethod[] = data.paymentMethods.map(
            (method) => ({
              displayName: method.displayName,
              identifier: method.identifier,
              to: method.to,
              fields: method.fields,
            })
          );

          setPaymentOptions(methods);
        } else {
          console.error("Failed to fetch payment methods");
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error);
      }
    };

    fetchPaymentMethods();
  }, []);

  const handleAdditionalFieldChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    if (value != "" && !RegExp(/^[a-zA-Z0-9-.+\s]+$/g).test(value)) {
      return;
    }
    if (name == "tlda" && value.includes("+")) return;
    if (
      (name == "vfcash" || name == "ipn") &&
      (isNaN(Number(value)) || value.includes(" "))
    ) {
      if (value != "+") return;
    }
    if (name == "vfcash" || name == "ipn") {
      if (value.includes("+")) {
        if (value.length > 13) return;
      } else if (value.length > 11) {
        return;
      }
    }
    setFormData({
      ...formData,
      additionalFields: {
        ...formData.additionalFields,
        [name]: value,
      },
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

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

    // Set additional fields for the selected payment method
    if (name === "paymentMethod") {
      const selectedOption = paymentOptions.find(
        (option) => option.identifier === value
      );

      setFormData({
        ...formData,
        paymentMethod: value,
        additionalFields: {},
      });

      setSelectedPaymentFields(selectedOption?.fields || []);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    document.body.focus();
    addLoader();
    if (
      formData.additionalFields.vfcash &&
      formData.additionalFields.vfcash.length < 11
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
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      setFormData({
        email: "",
        name: "",
        phone: "",
        paymentMethod: "",
        additionalFields: {} as { [key: string]: string },
      });
      setSelectedPaymentFields([]);
      customAlert((await response.json()).message ?? "Submitted.");
    } else {
      customAlert((await response.json()).message ?? "An Error Occurred.");
    }
    removeLoader();
  }

  return (
    <section id="book-one-ticket" className={styles.container}>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ease: "easeInOut", duration: 0.75 }}
      >
        <h1 style={{ ...title.style, fontWeight: 700 }}>Book a Ticket</h1>
        {/* <h3
          style={{
            ...title.style,
            fontWeight: 400,
            fontSize: ".5em",
            textAlign: "center",
          }}
        >
          1% vodafone imposed fee on E-Wallet
        </h3> */}
        <h2 style={{ ...title.style, fontWeight: 100 }}>400 EGP</h2>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ease: "anticipate", duration: 2 }}
      >
        <form onSubmit={handleSubmit} style={ubuntu.style}>
          <div className={styles.mainTextbox}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                name="name"
                id="name-input"
                placeholder=""
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
                placeholder=""
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
                placeholder=""
                maxLength={13}
                minLength={11}
                required={true}
                value={formData.phone}
                onChange={handleChange}
              />
              <label htmlFor="phone">Phone Number</label>
            </div>
          </div>

          <div className={styles.paymentMethodContainer}>
            <select
              name="paymentMethod"
              id="payment-method"
              required={true}
              value={formData.paymentMethod}
              onChange={handleChange}
            >
              <option value="" disabled>
                Select Payment Method
              </option>
              {paymentOptions.map((option) => (
                <option key={option.identifier} value={option.identifier}>
                  {option.displayName}
                </option>
              ))}
            </select>

            <svg
              className={styles.selectArrow}
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 8.825C5.8 8.825 5.6 8.725 5.5 8.625L2.2 5.325C1.9 5.025 1.9 4.525 2.2 4.225C2.5 3.925 3 3.925 3.3 4.225L6 6.925L8.7 4.225C9 3.925 9.5 3.925 9.8 4.225C10.1 4.525 10.1 5.025 9.8 5.325L6.6 8.525C6.4 8.725 6.2 8.825 6 8.825Z"
                fill="#fff"
              />
            </svg>
          </div>

          {/* Dynamically render additional fields based on selected payment method */}
          {selectedPaymentFields.length > 0 && (
            <div className="additional-field-container">
              {selectedPaymentFields.length > 0 &&
                selectedPaymentFields.map((field, index) => (
                  <div className={styles.mainTextbox} key={index}>
                    <div className={styles.inputWrapper}>
                      <input
                        type={field.type}
                        name={field.id}
                        id={`additional-field-${index}`}
                        placeholder=""
                        required={field.required}
                        value={formData.additionalFields[field.id] || ""}
                        onChange={handleAdditionalFieldChange}
                      />
                      <label htmlFor={`additional-field-${index}`}>
                        {field.placeholder}
                      </label>
                    </div>
                  </div>
                ))}
            </div>
          )}

          <motion.div
            initial={{ scale: 2, opacity: 0.2 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "tween", ease: "anticipate", duration: 2 }}
          >
            <button type="submit" style={{ ...title.style, width: "100%" }}>
              Submit
            </button>
          </motion.div>
        </form>
      </motion.div>
    </section>
  );
}
