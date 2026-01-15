"use client";
import { hidePopup, showPopup } from "@/app/api/utils/generic-popup";
import { ResponseCode } from "@/app/api/utils/response-codes";
import { addLoader, removeLoader } from "@/app/global_components/loader";
import { ticketIcon, whiteCheck, whiteCross } from "@/app/icons";
import { getPaymentMethods, PaymentMethod } from "@/app/payment-methods";
import {
  getTicketTypeFromName,
  getTicketTypeName,
  TicketType,
} from "@/app/ticket-types";
import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { customAlert } from "../custom-alert";
import { Applicant } from "../types/Applicant";
import AmbiguityResolver from "./ambiguous-popup";
import styles from "./payments.module.css";
const title = Poppins({ weight: "700", subsets: ["latin"] });

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function IDCheckPopup(
  name: string,
  email: string,
  amount: number,
  type: string,
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
      <p>
        {toTitleCase(
          getTicketTypeName(
            getTicketTypeFromName(type) ?? TicketType.INDIVIDUAL
          )
        )}{" "}
        Ticket
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
  const router = useRouter();
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
  const [changingFieldTitle, setChangingFieldTitle] = useState(
    "Email Address Or ID"
  );

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const resp = await fetch("/api/admin/auth");
        const res = await resp.json();
        if (!resp.ok) {
          router.push("/admin/login");
          return;
        }
        const allowedMethods = (res.methods as string[]) ?? [];

        const paymentMethods = getPaymentMethods();

        const methods: PaymentMethod[] = paymentMethods
          .filter((method) => !method.automatic)
          .map((method) => ({
            displayName: method.displayName,
            identifier: method.identifier,
            to: method.to,
            field: method.field,
            icon: method.icon,
          }));

        setPaymentOptions(
          methods.filter((m) => allowedMethods.includes(m.identifier))
        );
        if (allowedMethods.length === 0) setPaymentOptions(methods);
        if (allowedMethods.length === 1) {
          setFormData((prev) => ({
            ...prev,
            method: allowedMethods[0],
          }));

          const field = methods.find(
            (option) => option.identifier == allowedMethods[0]
          )?.field;

          if (!field) {
            setChangingFieldTitle("Email Address Or ID");
          } else {
            setChangingFieldTitle(
              field.type === "phone" ? "Phone Number" : field.placeholder
            );
          }
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

      const field = paymentOptions.find(
        (option) => option.identifier == value
      )?.field;

      if (!field) {
        setChangingFieldTitle("Email Address Or ID");
      } else {
        setChangingFieldTitle(
          field.type === "phone" ? "Phone Number" : field.placeholder
        );
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const resetForm = () => {
    formData.from = "";
    formData.amount = "";
    formData.date = getCurrentDate();

    setFormData({
      method: formData.method,
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
          }
        );

        if (fetchTicketInfo.ok) {
          const ticketData = await fetchTicketInfo.json();
          showPopup(
            IDCheckPopup(
              ticketData.name,
              ticketData.email,
              ticketData.amount,
              ticketData.type,
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
              dateReceived={new Date(date)}
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
      <div className={styles.pageContainer}>
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
