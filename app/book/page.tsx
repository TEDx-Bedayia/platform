"use client";
import { useState } from "react";

export default function SingleTickets() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    paymentMethod: "",
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const response = await fetch("/api/submit-ticket", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      alert((await response.json()).message ?? "An error occurred");
    } else {
      console.error("Form submission error");
    }
  }

  return (
    <section id="book-one-ticket">
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          id="email-input"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="text"
          name="name"
          id="name-input"
          value={formData.name}
          onChange={handleChange}
        />
        <input
          type="text"
          name="phone"
          id="phone-input"
          value={formData.phone}
          onChange={handleChange}
        />

        <select
          name="paymentMethod"
          id="payment-method"
          value={formData.paymentMethod}
          onChange={handleChange}
        >
          <option value="telda">Telda</option>
          <option value="instapay">Instapay</option>
          <option value="mobile-wallet">Mobile Wallet (VF Cash, etc.)</option>
          <option value="school-cash">School Office</option>
        </select>
        <button type="submit">Submit</button>
      </form>
    </section>
  );
}
