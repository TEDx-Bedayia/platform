"use client";
import { PaymentMethod } from "@/app/api/tickets/payment-methods/payment-methods";
import { hidePopup, showPopup } from "@/app/api/utils/generic-popup";
import { ResponseCode } from "@/app/api/utils/response-codes";
import { addLoader, removeLoader } from "@/app/global_components/loader";
import { ticketIcon, whiteCheck, whiteCross } from "@/app/icons";
import { Poppins } from "next/font/google";
import { useEffect, useState } from "react";
import { customAlert } from "../custom-alert";
import { Applicant } from "../types/Applicant";
import AmbiguityResolver from "./ambiguous-popup";
import styles from "./payments.module.css";
const title = Poppins({ weight: "700", subsets: ["latin"] });

function IDCheckPopup(
  name: string,
  email: string,
  amount: number,
  id: string,
  handed_amount: number
) {
  return (
    <div className={styles.idCheckPopup}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          rotate: "-45deg",
          marginBottom: "1em",
        }}
      >
        {ticketIcon}
      </div>
      <p>
        <span style={{ fontWeight: "bold" }}>{name}</span> (ID: {id})
      </p>
      <p>{email}</p>
      <p>{amount} EGP</p>
      <p style={{ marginTop: "0.5rem", fontWeight: "bold" }}>
        Does this information look correct?
      </p>

      <div className="flex flex-row gap-8 items-center justify-center w-full mt-4">
        <button
          style={{ ...title.style, color: "#fff" }}
          className={styles.cancelButton}
          onClick={() => hidePopup("id-check-popup-container")}
        >
          {whiteCross}
        </button>

        <button
          style={{ ...title.style, color: "#fff" }}
          className={styles.confirmButton}
          onClick={async () =>
            hidePopup("id-check-popup-container", async () => {
              addLoader();
              // Do Complex Logic to Accept Payment
              const response = await fetch(
                `/api/admin/payment-reciever/cash?from=${encodeURIComponent(
                  id
                )}&amount=${encodeURIComponent(
                  handed_amount.toString()
                )}&date=${encodeURIComponent(
                  new Date().toISOString().split("T")[0]
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

              removeLoader();

              if (response.ok) {
                const { refund, paid } = await response.json();
                if (!refund && paid != -1) {
                  let refundText =
                    " Refund " +
                    (parseInt(handed_amount.toString()) - paid) +
                    " EGP.";
                  let ifRefund =
                    parseInt(handed_amount.toString()) - paid > 0
                      ? refundText
                      : "";
                  customAlert(
                    paid + " EGP were accepted successfully." + ifRefund,
                    true,
                    true
                  );
                } else if (
                  paid == -1 &&
                  parseInt(handed_amount.toString()) == 0
                )
                  customAlert("Speaker Ticket Accepted.", true, true);
                else customAlert("Refund Inserted.", true, true);
                document.getElementById("reset-form")?.click();
              } else {
                const json = await response.json();
                customAlert(json.message);
              }
            })
          }
        >
          {whiteCheck}
        </button>
      </div>
    </div>
  );
}

export default function Payments() {
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    method: "",
    from: "",
    amount: "",
    date: getCurrentDate(),
  });
  const [paymentOptions, setPaymentOptions] = useState([] as PaymentMethod[]);
  const [type, setType] = useState<"admin" | "school">("school");
  const [changingFieldTitle, setChangingFieldTitle] = useState(
    "Email Address Or ID"
  );

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

          const methods: PaymentMethod[] = data.paymentMethods
            .filter((method) => method.identifier != "CARD")
            .map((method) => ({
              displayName: method.displayName,
              identifier: method.identifier,
              to: method.to,
              fields: method.fields,
            }));

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
    if (
      name == "username" &&
      formData.method != "CASH" &&
      value.includes("@")
    ) {
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

    if (name == "method") {
      formData.from = "";
      formData.amount = "";
      formData.date = getCurrentDate();
      setFormData({
        ...formData,
        from: "",
        amount: "",
        date: getCurrentDate(),
      });

      if (
        paymentOptions.find((option) => option.identifier == value)?.fields
          .length == 0
      ) {
        setChangingFieldTitle("Email Address Or ID");
      } else {
        setChangingFieldTitle(
          paymentOptions.find((option) => option.identifier == value)?.fields[0]
            .placeholder ?? "Email Address Or ID"
        );
      }
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

  const resetForm = () => {
    formData.method = type == "admin" ? formData.method : "CASH";
    formData.from = "";
    formData.amount = "";
    formData.date = getCurrentDate();

    setFormData({
      method: type == "admin" ? formData.method : "CASH",
      from: "",
      amount: "",
      date: getCurrentDate(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    addLoader();
    e.preventDefault();
    if (formData.method && formData.from && formData.amount && formData.date) {
      const { method, from, amount, date } = formData;

      if (!isNaN(Number(from)) && method.trim() == "CASH") {
        // We're dealing with an ID input.
        if (Number(from) <= 0 || Number(from) > 500000) {
          removeLoader();
          setTimeout(() => {
            customAlert("Invalid ID.");
          }, 300);
          return;
        }

        const fetchTicketInfo = await fetch(
          `/api/admin/query-ticket?id=${encodeURIComponent(from)}`,
          {
            method: "GET",
            headers: {
              key: localStorage.getItem("school-token")
                ? (localStorage.getItem("school-token") as string)
                : (localStorage.getItem("admin-token") as string),
            },
          }
        );

        if (fetchTicketInfo.ok) {
          const ticketData = await fetchTicketInfo.json();
          showPopup(
            IDCheckPopup(
              ticketData.name,
              ticketData.email,
              ticketData.amount,
              from,
              Number(amount)
            ),
            "id-check-popup-container"
          );
        } else {
          const { message } = await fetchTicketInfo.json();
          customAlert(message);
        }
        removeLoader();
        return;
      }

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

      if (response.ok) {
        let { refund, paid } = await response.json();
        if (!refund && paid != -1) {
          let refundText = " Refund " + (parseInt(amount) - paid) + " EGP.";
          let ifRefund = parseInt(amount) - paid > 0 ? refundText : "";
          customAlert(
            paid + " EGP were accepted successfully." + ifRefund,
            true,
            true
          );
        } else if (paid == -1 && parseInt(amount) == 0)
          customAlert("Speaker Ticket Accepted.", true, true);
        else customAlert("Refund Inserted.", true, true);
        resetForm();
      } else {
        const json = await response.json();
        let message = json.message;
        if (response.status == ResponseCode.TICKET_AMBIGUITY) {
          const found = json.found as Applicant[];
          showPopup(
            <AmbiguityResolver
              found={found}
              groupMembers={json.groupMembers}
              amountIn={Number(amount)}
              callback={async (idList: number[]) => {
                addLoader();
                const response = await fetch(
                  `/api/admin/payment-reciever/${method.toLowerCase()}?from=${encodeURIComponent(
                    from
                  )}&amount=${encodeURIComponent(
                    amount
                  )}&date=${encodeURIComponent(
                    date
                  )}&identification=${encodeURIComponent(idList.join(","))}`,
                  {
                    method: "GET",
                    headers: {
                      key: localStorage.getItem("school-token")
                        ? (localStorage.getItem("school-token") as string)
                        : (localStorage.getItem("admin-token") as string),
                    },
                  }
                );

                if (response.ok) {
                  let { refund, paid } = await response.json();
                  if (!refund)
                    customAlert(
                      paid +
                        " EGP were accepted successfully. Refund " +
                        (parseInt(amount) - paid) +
                        " EGP.",
                      true,
                      true
                    );
                  else customAlert("Refund Inserted.");
                  if (parseInt(amount) - paid > 0) {
                    formData.amount = (paid - parseInt(amount)).toString();
                  } else {
                    formData.method =
                      type == "admin" ? formData.method : "CASH";
                    formData.from = "";
                    formData.amount = "";
                    formData.date = getCurrentDate();
                  }
                  setFormData({ ...formData });
                } else {
                  const { message } = await response.json();
                  customAlert(message);
                }
                removeLoader();
                return true;
              }}
            />,
            "ambiguity-popup-container"
          );
        } else customAlert(message);
      }
    } else {
      customAlert("All fields are required.");
    }
    removeLoader();
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
            <label htmlFor="from">{changingFieldTitle}</label>
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

        <button
          className="hidden overflow-hidden invisible pointer-events-none absolute top-0 left-0"
          onClick={resetForm}
          id="reset-form"
        ></button>

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
          For Refunds, enter a negative amount.
          <br />
          <strong>Developed by Aly with ❤️</strong>
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
          </span>
        )}
      </div>
    </section>
  );
}
