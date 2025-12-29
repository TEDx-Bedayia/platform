"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { CSSProperties, FC, useEffect, useState } from "react";
import image from "../../public/Item-Icon.png";
import { customAlert } from "../admin/custom-alert";
import { addLoader, removeLoader } from "../global_components/loader";
import {
  PaymentMethodKey,
  PaymentOptionProps,
  paymentOptions,
} from "../payment-methods";
import { TicketType } from "../ticket-types";
import styles from "./page.module.css";

interface CustomerDetailsProps {
  name: string;
  phone: string;
  email: string;
}

interface CustomerDetailsState {
  name: string;
  phone: string;
  email: string;
  price: number;
  type: TicketType;
  paymentMethod?: PaymentMethodKey;
  additionalInfo?: string;
  extraNames?: string[];
  extraEmails?: string[];
}

const CustomerDetails: FC<CustomerDetailsProps> = ({ name, phone, email }) => {
  return (
    <div className={styles.customer_details}>
      <h2 className={styles.customer_details_h2}>Your Information</h2>
      <div className={styles.customer_details_grid}>
        <div className={styles.customer_details_row}>
          <span className={styles.customer_details_label}>Full Name</span>
          <span className={styles.customer_details_value}>{name}</span>
        </div>
        <div className={styles.customer_details_row}>
          <span className={styles.customer_details_label}>Phone Number</span>
          <span className={styles.customer_details_value}>{phone}</span>
        </div>
        <div className={styles.customer_details_row}>
          <span className={styles.customer_details_label}>Email Address</span>
          <span className={styles.customer_details_value}>{email}</span>
        </div>
      </div>
      <hr className={styles.customer_details_hr} />
    </div>
  );
};

export default function Page() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerDetailsState>({
    name: "Loading...",
    phone: "Loading...",
    email: "Loading...",
    price: 0,
    type: TicketType.INDIVIDUAL,
    paymentMethod: "TLDA",
  });

  useEffect(() => {
    try {
      const storedData = sessionStorage.getItem("checkout");
      if (storedData)
        setCustomer({ ...JSON.parse(storedData), paymentMethod: "TLDA" });
      else router.push("/book");
    } catch (err) {
      console.error("Failed to load checkout data from sessionStorage:", err);
      customAlert(
        "There was a problem loading your booking details. Please try again."
      );
      router.push("/book?error=invalid_checkout_data");
    }
  }, [router]);

  const activeMethod = customer.paymentMethod || paymentOptions.TLDA.identifier;
  const currentOption = paymentOptions[activeMethod];

  const PaymentOption: FC<PaymentOptionProps> = ({ methodKey, name, Icon }) => {
    const isActive = activeMethod === methodKey;

    return (
      <div
        className={`${styles.payment_option}${
          isActive ? ` ${styles.active}` : ""
        }`}
        onClick={() => {
          if (!isActive) {
            setCustomer((prev) => ({
              ...prev,
              additionalInfo: "",
            }));
          }
          setCustomer((prev) => ({
            ...prev,
            paymentMethod: methodKey,
          }));
        }}
      >
        <span className={styles.payment_option_icon}>
          <Icon />
        </span>
        <span className={styles.payment_option_name}>{name}</span>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.product_area}>
        <div className={styles.product_info}>
          <Image
            width={70}
            height={70}
            src={image.src}
            alt="Item Icon"
            className={styles.product_info_img}
          />
          <h1 className={styles.product_info_h1}>TEDx Bedayia eTickets</h1>
        </div>
        <hr className={styles.product_area_hr} />
        <div className={styles.purchase_details}>
          <h2 className={styles.purchase_details_h2}>Order Cost</h2>
          <h1 className={styles.purchase_details_h1}>
            EGP {customer.price.toFixed(2)}
          </h1>
          <p>
            Ticket For{" "}
            {customer.type === TicketType.INDIVIDUAL
              ? "1 Person"
              : "Group of 4"}
          </p>
        </div>
      </div>

      <div className={styles.payment_area}>
        <h1 className={styles.payment_area_h1}>Checkout</h1>
        <hr className={styles.payment_area_hr} />

        <form
          onSubmit={async (e) => {
            e.preventDefault();

            addLoader();
            const redirectLink = currentOption.redirectLinks?.[customer.type];
            if (redirectLink) {
              router.push(redirectLink);
              removeLoader();
              return;
            }
            const response =
              customer.type !== TicketType.GROUP ||
              !customer.extraNames ||
              customer.extraNames.length !== 3 ||
              !customer.extraEmails ||
              customer.extraEmails.length !== 3
                ? await fetch("/api/tickets", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      name: customer.name,
                      email: customer.email,
                      phone: customer.phone,
                      paymentMethod: customer.additionalInfo
                        ? `${customer.paymentMethod}@${customer.additionalInfo}`
                        : customer.paymentMethod,
                    }),
                  })
                : await fetch("/api/tickets/group", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      name1: customer.name,
                      email1: customer.email,
                      name2: customer.extraNames[0],
                      email2: customer.extraEmails[0],
                      name3: customer.extraNames[1],
                      email3: customer.extraEmails[1],
                      name4: customer.extraNames[2],
                      email4: customer.extraEmails[2],
                      phone: customer.phone,
                      paymentMethod: customer.additionalInfo
                        ? `${customer.paymentMethod}@${customer.additionalInfo}`
                        : customer.paymentMethod,
                    }),
                  });

            if (response.ok) {
              customAlert(
                "Ticket booked successfully! It may take us up to 2 days to process your ticket."
              );
              sessionStorage.removeItem("checkout");
              removeLoader();
              router.push(
                customer.type === TicketType.INDIVIDUAL
                  ? "/book"
                  : "/book/group"
              );
            } else {
              customAlert(
                (await response.json()).message ?? "An Error Occurred."
              );
              removeLoader();
            }
          }}
        >
          <CustomerDetails
            name={customer.name}
            phone={customer.phone}
            email={customer.email}
          />

          <h2 className={styles.payment_area_h2}>Payment Method</h2>
          <div className={styles.payment_options_list}>
            {Object.keys(paymentOptions)
              .filter((key) => {
                if (key === "CASH") return false;
                const option = paymentOptions[key as PaymentMethodKey];
                // If method has redirectLinks, only show if there's a link for this ticket type
                if (option.redirectLinks) {
                  return !!option.redirectLinks[customer.type];
                }
                return true;
              })
              .map((key) => {
                const methodKey = key as PaymentMethodKey;
                const option = paymentOptions[methodKey];
                return (
                  <PaymentOption
                    key={methodKey}
                    methodKey={methodKey}
                    name={option.displayName}
                    Icon={option.icon}
                  />
                );
              })}
          </div>

          <div className={styles.instruction_block}>
            {currentOption.instructions && (
              <>
                <h3 className={styles.instruction_title}>
                  How to Pay with {currentOption.displayName}
                </h3>

                <ol className={styles.instruction_list}>
                  <currentOption.instructions price={customer.price} />
                </ol>
              </>
            )}

            {currentOption.field && (
              <div className={styles.pay_input_container}>
                {currentOption.field.prefix && (
                  <div className={styles.pay_input_prefix}>
                    {currentOption.field.prefix}
                  </div>
                )}
                <input
                  id={currentOption.field.id}
                  placeholder={currentOption.field.placeholder}
                  className={styles.pay_input}
                  required={currentOption.field.required}
                  value={customer.additionalInfo || ""}
                  onChange={(e) => {
                    if (!currentOption.field) return;
                    if (currentOption.field.type === "phone") {
                      if (!/^\d*$/.test(e.target.value)) return;
                      if (e.target.value.length > 10) return;
                      if (e.target.value.startsWith("0")) {
                        setCustomer((prev) => ({
                          ...prev,
                          additionalInfo: e.target.value.slice(1),
                        }));
                        return;
                      }
                    } else if (currentOption.field.type === "alphanumeric") {
                      if (!/^[a-zA-Z0-9\-_.]*$/.test(e.target.value)) return;
                    }
                    setCustomer((prev) => ({
                      ...prev,
                      additionalInfo: e.target.value,
                    }));
                  }}
                />
                {currentOption.field.suffix && (
                  <div className={styles.pay_input_suffix}>
                    {currentOption.field.suffix}
                  </div>
                )}
              </div>
            )}

            <button type="submit" className={styles.pay_button}>
              {currentOption.redirectLinks?.[customer.type]
                ? `Pay with ${currentOption.displayName}`
                : `Confirm EGP ${customer.price.toFixed(2)} Payment`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
