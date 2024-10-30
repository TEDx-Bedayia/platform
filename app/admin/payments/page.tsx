"use client";
import { PaymentMethod } from "@/app/api/tickets/payment-methods/payment-methods";
import { Poppins } from "next/font/google";
import { useEffect, useState } from "react";
import { customAlert } from "../custom-alert";
import styles from "./payments.module.css";
const title = Poppins({ weight: "700", subsets: ["latin"] });

export default function Payments() {
  const [formData, setFormData] = useState({
    method: "",
    from: "",
    amount: "",
    date: "",
  });
  const [paymentOptions, setPaymentOptions] = useState([] as PaymentMethod[]);
  const [type, setType] = useState<"admin" | "school">("school");

  useEffect(() => {
    if (localStorage.getItem("admin-token")) {
      setType("admin");
    }

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

          if (!localStorage.getItem("admin-token")) {
            setPaymentOptions(methods.filter((m) => m.identifier == "CASH"));
            setFormData((prev) => ({
              ...prev,
              method: "CASH",
            }));
          } else setPaymentOptions(methods);
        } else {
          console.error("Failed to fetch payment methods");
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error);
      }
    };

    fetchPaymentMethods();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name == "from" && formData.method != "CASH" && value.includes("@")) {
      return;
    }
    if (name == "method" && type == "school") {
      setFormData({
        ...formData,
        method: "CASH",
      });
      return;
    }
    if (type == "school" && formData.method != "CASH") {
      formData.method = "CASH";
    }
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  useEffect(() => {
    if (
      !localStorage.getItem("admin-token") &&
      !localStorage.getItem("school-token")
    ) {
      window.location.href = "/admin/login";
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.method && formData.from && formData.amount && formData.date) {
      const { method, from, amount, date } = formData;
      // Show Loader

      const response = await fetch(
        `/api/admin/payment-reciever/${method.toLowerCase()}?from=${encodeURIComponent(
          from
        )}&amount=${encodeURIComponent(amount)}&date=${encodeURIComponent(
          date
        )}`,
        {
          method: "GET",
          headers: {
            key: localStorage.getItem("school-token")
              ? (localStorage.getItem("school-token") as string)
              : (localStorage.getItem("admin-token") as string),
          },
        }
      );

      // Hide Loader

      if (response.ok) {
        let { paid } = await response.json();
        customAlert(
          paid +
            " EGP were accepted successfully. Refund " +
            (parseInt(amount) - paid) +
            " EGP."
        );
        formData.method = type == "admin" ? "" : "CASH";
        formData.from = "";
        formData.amount = "";
        formData.date = "";
        setFormData({ ...formData });
      } else {
        const { message } = await response.json();
        customAlert(message);
      }
    } else {
      customAlert("All fields are required.");
    }
  };

  return (
    <section id="admin-payments">
      <div
        className={styles.pageContainer}
        style={type == "school" ? { height: "100vh !important" } : {}}
      >
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <h2 style={{ ...title.style, fontWeight: 700 }}>Submit Payment</h2>

          <div className={styles.formGroup}>
            <select
              id="method"
              name="method"
              value={formData.method}
              onChange={handleChange}
              required
            >
              <option value="">Select Method</option>
              {paymentOptions.map((option) => (
                <option key={option.identifier} value={option.identifier}>
                  {option.displayName}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <input
              type="text"
              id="from"
              name="from"
              value={formData.from}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label htmlFor="from">Username / Email</label>
          </div>

          <div className={styles.formGroup}>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label htmlFor="amount">Amount Recieved</label>
          </div>

          <div className={styles.formGroup}>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label htmlFor="date">Date Recieved</label>
          </div>

          <button type="submit">Submit Payment</button>
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
          Developed by Aly Mohamed Salah with ❤️
        </span>

        {formData.method == "CASH" && (
          <span
            style={{
              position: "absolute",
              top: "6em",
              color: "#fff",
              fontSize: "0.8rem",
              textAlign: "center",
              padding: "0.5em 1em",
              borderRadius: "1em",
              background: "#95190D",
            }}
          >
            To check how much money is needed, enter 0 in the amount field.
            <br />
            Then, only accept the amount of money needed (or refund difference f
            sa3etha).
          </span>
        )}
      </div>
    </section>
  );
}
