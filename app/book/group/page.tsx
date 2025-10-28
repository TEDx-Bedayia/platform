"use client";
import { useState } from "react";
import styles from "../book.module.css";
import { motion } from "framer-motion";
import { Poppins, Ubuntu } from "next/font/google";
import { customAlert } from "../../admin/custom-alert";
import { addLoader, removeLoader } from "../../global_components/loader";

const title = Poppins({ weight: ["100", "400", "700"], subsets: ["latin"] });
const ubuntu = Ubuntu({ weight: ["300", "400", "700"], subsets: ["latin"] });

export default function GroupTickets() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;

    if (name === "phone") {
      // Normalize Arabic numerals and restrict to digits
      value = value.replace(/[\u0660-\u0669]/g, (c) =>
        (c.charCodeAt(0) - 0x0660).toString()
      );
      value = value.replace(/[^+\d]/g, "");

      if (value.includes("+")) {
        if (value.length > 13) return;
      } else if (value.length > 11) {
        return;
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent, paymentType: "CARD" | "CASH") => {
    e.preventDefault();

    const { name, email, phone } = formData;
    if (!name || !email || phone.length < 11) {
      customAlert("Please fill in all fields correctly.");
      return;
    }

    addLoader();

    if (paymentType === "CARD") {
      const encodedName = encodeURIComponent(name);
      const encodedEmail = encodeURIComponent(email);
      const encodedPhone = encodeURIComponent(phone);

      // Redirect to pay-online page dynamically
      window.location.href = `http://localhost:3000/pay-online/group?name=${encodedName}&mail=${encodedEmail}&phone=${encodedPhone}`;
    } else {
      // Handle Pay at Bedayia
      removeLoader();
      customAlert("You have chosen to pay at Bedayia. Please visit the school office to complete payment.");
    }
  };

  return (
    <section id="book-group-ticket" className={`${styles.container} ${styles.group}`}>
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
          1,400 EGP
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
        <form style={ubuntu.style}>
          <div className={styles.mainTextbox}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                name="name"
                placeholder=" "
                required
                value={formData.name}
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
                required
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
                placeholder=" "
                minLength={11}
                required
                value={formData.phone}
                onChange={handleChange}
              />
              <label htmlFor="phone">Phone Number</label>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 1 }}
            transition={{ type: "tween", ease: "anticipate", duration: 2 }}
          >
            <button
              type="submit"
              style={{ ...title.style, width: "100%", marginTop: "12px" }}
              onClick={(e) => handleSubmit(e, "CARD")}
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
              onClick={(e) => handleSubmit(e, "CASH")}
            >
              Pay at Bedayia
            </button>
          </motion.div>
        </form>
      </motion.div>
    </section>
  );
}