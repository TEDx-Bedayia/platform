"use client";
import { useEffect, useState } from "react";
import styles from "../book.module.css";

import { motion } from "framer-motion";

import { verifyEmail } from "@/app/api/tickets/utils";
import { Poppins, Ubuntu } from "next/font/google";
import { customAlert } from "../../admin/custom-alert";
import {
  Field,
  PaymentMethod,
} from "../../api/tickets/payment-methods/payment-methods";
import { addLoader, removeLoader } from "../../global_components/loader";
const title = Poppins({ weight: ["100", "400", "700"], subsets: ["latin"] });
const ubuntu = Ubuntu({ weight: ["300", "400", "700"], subsets: ["latin"] });

export default function SingleTickets() {
  const [formData, setFormData] = useState({
    emails: ["", "", "", ""],
    names: ["", "", "", ""],
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

    if (name == "email" || name == "name") {
      const index = currentPerson;
      const names = formData.names;
      const emails = formData.emails;

      if (name == "name") names[index] = value;
      if (name == "email") emails[index] = value;

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
      (formData.additionalFields.vfcash &&
        formData.additionalFields.vfcash.length < 11) ||
      (formData.additionalFields.ipn &&
        formData.additionalFields.ipn.length < 11)
    ) {
      customAlert(
        "Please enter a valid phone number for E-Wallet or InstaPay."
      );
      setCurrentPerson(0);
      removeLoader();
      return;
    }

    try {
      for (let i = 0; i < 2; i++) {
        if (formData.emails[i] == formData.emails[3]) {
          customAlert(
            "Please enter a unique email. Or set the email to " +
              formData.emails[3].split("@")[0] +
              (!formData.emails[3].includes("+") ? "+p" : "") +
              4 +
              "@" +
              formData.emails[3].split("@")[1] +
              " if you wish to recieve " +
              formData.names[3] +
              "'s ticket on the same email."
          );
          removeLoader();
          return;
        }
      }
    } catch (error) {
      customAlert("Please check the inputted emails and try again.");
      removeLoader();
      return;
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
      setFormData({
        emails: ["", "", "", ""],
        names: ["", "", "", ""],
        phone: "",
        paymentMethod: "",
        additionalFields: {} as { [key: string]: string },
      });
      setSelectedPaymentFields([]);
      customAlert((await response.json()).message ?? "Submitted.");
      setCurrentPerson(0);
    } else {
      customAlert((await response.json()).message ?? "An Error Occurred.");
    }
    removeLoader();
  }

  const [currentPerson, setCurrentPerson] = useState(0);

  return (
    <section id="book-group-ticket" className={styles.container}>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ease: "easeOut", duration: 1.5 }}
      >
        <h1 style={{ ...title.style, fontWeight: 700 }}>Book a Group Ticket</h1>
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
        <h2 style={{ ...title.style, fontWeight: 100, marginBottom: ".5rem" }}>
          1, 400 EGP
        </h2>
        <h2 style={{ ...title.style, fontWeight: 400, fontSize: ".75em" }}>
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
                placeholder=""
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
                placeholder=""
                id="email-input"
                required={true}
                value={formData.emails[currentPerson]}
                onChange={handleChange}
              />
              <label htmlFor="email">Email Address</label>
            </div>
          </div>

          {currentPerson == 0 && (
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
          )}

          {currentPerson == 0 && (
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
          )}

          {/* Dynamically render additional fields based on selected payment method */}
          {selectedPaymentFields.length > 0 && currentPerson == 0 && (
            <div className="additional-field-container">
              {selectedPaymentFields.length > 0 &&
                selectedPaymentFields.map((field, index) => (
                  <motion.div
                    initial={{ opacity: 0.3, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={index}
                    transition={{
                      type: "tween",
                      ease: "easeIn",
                      duration: 0.75,
                    }}
                  >
                    <div className={styles.mainTextbox}>
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
                  </motion.div>
                ))}
            </div>
          )}

          {currentPerson != 3 && (
            <h3 style={{ margin: "0.5rem 0", color: "white", opacity: 0.6 }}>
              Please fill out the fields above to continue
            </h3>
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
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M7.78033 12.5303C7.48744 12.8232 7.01256 12.8232 6.71967 12.5303L2.46967 8.28033C2.17678 7.98744 2.17678 7.51256 2.46967 7.21967L6.71967 2.96967C7.01256 2.67678 7.48744 2.67678 7.78033 2.96967C8.07322 3.26256 8.07322 3.73744 7.78033 4.03033L4.81066 7H12.25C12.6642 7 13 7.33579 13 7.75C13 8.16421 12.6642 8.5 12.25 8.5H4.81066L7.78033 11.4697C8.07322 11.7626 8.07322 12.2374 7.78033 12.5303Z"
                      fill="#FFFFFF"
                    />
                  </svg>
                </button>
              </motion.div>
            )}

            {((formData.names[currentPerson] &&
              formData.emails[currentPerson]) ||
              currentPerson == 0) &&
              currentPerson != 3 && (
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
                        formData.phone.length >= 11 &&
                        formData.paymentMethod &&
                        (formData.paymentMethod == "CASH" ||
                          (formData.additionalFields[
                            selectedPaymentFields[0].id
                          ] != "" &&
                            formData.additionalFields[
                              selectedPaymentFields[0].id
                            ] != null))
                      ) {
                        for (let i = 0; i < 3; i++) {
                          if (
                            formData.emails[i] ==
                              formData.emails[currentPerson] &&
                            i != currentPerson
                          ) {
                            customAlert(
                              "Please enter a unique email. Or set the email to " +
                                formData.emails[currentPerson].split("@")[0] +
                                (!formData.emails[currentPerson].includes("+")
                                  ? "+p"
                                  : "") +
                                (currentPerson + 1) +
                                "@" +
                                formData.emails[currentPerson].split("@")[1] +
                                " if you wish to recieve " +
                                formData.names[currentPerson] +
                                "'s ticket on the same email."
                            );
                            return;
                          }
                        }

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
                        else if (formData.paymentMethod == "")
                          document.getElementById("payment-method")!.focus();
                      }
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M8.21967 2.96967C8.51256 2.67678 8.98744 2.67678 9.28033 2.96967L13.5303 7.21967C13.8232 7.51256 13.8232 7.98744 13.5303 8.28033L9.28033 12.5303C8.98744 12.8232 8.51256 12.8232 8.21967 12.5303C7.92678 12.2374 7.92678 11.7626 8.21967 11.4697L11.1893 8.5H3.75C3.33579 8.5 3 8.16421 3 7.75C3 7.33579 3.33579 7 3.75 7H11.1893L8.21967 4.03033C7.92678 3.73744 7.92678 3.26256 8.21967 2.96967Z"
                        fill="#FFFFFF"
                      />
                    </svg>
                  </button>
                </motion.div>
              )}
          </div>

          <motion.div
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 1 }}
            transition={{ type: "tween", ease: "anticipate", duration: 2 }}
          >
            {currentPerson == 3 && (
              <button
                type="submit"
                style={{ ...title.style, width: "100%", marginTop: "2rem" }}
              >
                Submit
              </button>
            )}
          </motion.div>
        </form>
      </motion.div>
    </section>
  );
}
