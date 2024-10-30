"use client";
import { useEffect, useState } from "react";
import "./book.css";

import { customAlert } from "../admin/custom-alert";
import {
  Field,
  PaymentMethod,
} from "../api/tickets/payment-methods/payment-methods";

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
    if (value.includes("@")) {
      return;
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
      return;
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
      setSelectedPaymentFields(selectedOption?.fields || []);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      customAlert((await response.json()).message ?? "An error occurred");
    } else {
      customAlert((await response.json()).message ?? "An error occurred");
    }
  }

  return (
    <section id="book-one-ticket">
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          id="email-input"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="text"
          name="name"
          id="name-input"
          placeholder="Enter your name"
          value={formData.name}
          onChange={handleChange}
        />
        <input
          type="text"
          name="phone"
          id="phone-input"
          placeholder="Enter your phone number"
          maxLength={11}
          value={formData.phone}
          onChange={handleChange}
        />

        <select
          name="paymentMethod"
          id="payment-method"
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

        {/* Dynamically render additional fields based on selected payment method */}
        <div className="additional-field-container">
          {selectedPaymentFields.length > 0 &&
            selectedPaymentFields.map((field, index) => (
              <div className="additional-field" key={index}>
                <label htmlFor={`additional-field-${index}`}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.id}
                  id={`additional-field-${index}`}
                  placeholder={field.placeholder}
                  required={field.required}
                  value={formData.additionalFields[field.id] || ""}
                  onChange={handleAdditionalFieldChange}
                />
              </div>
            ))}
        </div>

        <button type="submit">Submit</button>
      </form>
    </section>
  );
}
