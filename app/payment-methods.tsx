import { IPN, PHONE, TELDA, VFCASH } from "@/app/metadata";
import { ArrowRight, Building2, CreditCard, Phone, Wallet } from "lucide-react";
import { FC } from "react";
import { TicketType } from "./ticket-types";

export type PaymentMethodKey = "TLDA" | "IPN" | "VFCASH" | "CASH" | "CARD";

export interface PaymentOptionProps {
  methodKey: PaymentMethodKey;
  name: string;
  Icon: FC;
}

export interface PaymentMethod {
  displayName: string;
  identifier: PaymentMethodKey;
  to: string;
  automatic?: boolean;
  instructions?: FC<{ price: number }>;
  field?: Field;
  icon: FC;
  redirectLinks?: Partial<Record<TicketType, string>>;
  hidden?: boolean;
}

export interface Field {
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  id: string;
  prefix?: string;
  suffix?: string;
}

export function getPaymentMethods() {
  return Object.values(paymentOptions);
}

export function getIdentifiersForPaymentMethods() {
  return getPaymentMethods().map((method) => method.identifier);
}

const Telda: FC<{ price: number }> = ({ price }) => {
  return (
    <>
      <li>
        Open your <strong>Telda</strong> app on your phone.
      </li>
      <li>
        Select the <strong>Transfer</strong> option.
      </li>
      <li>
        Send <strong>EGP {price.toFixed(2)}</strong> to the username{" "}
        <strong>{TELDA}</strong>, with your email address as a note.
      </li>
      <li>
        Send a <strong>screenshot</strong> to the following WhatsApp number{" "}
        <strong>{PHONE}</strong>.
      </li>
      <li>
        Once transferred, enter your <strong>Telda Username</strong> below to
        confirm.
      </li>
    </>
  );
};

const Instapay: FC<{ price: number }> = ({ price }) => {
  return (
    <>
      <li>
        Open your <strong>Instapay</strong> app on your phone.
      </li>
      <li>
        Select <strong>Send Money</strong> and choose the{" "}
        <strong>Mobile Number</strong> option. Then, make sure the{" "}
        <strong>Account</strong> tab is selected.
      </li>
      <li>
        Send <strong>EGP {price.toFixed(2)}</strong> to the following number:{" "}
        <strong>{IPN}</strong>.
      </li>
      <li>
        Send a <strong>screenshot</strong> to the following WhatsApp number{" "}
        <strong>{PHONE}</strong>.
      </li>
      <li>
        Once transferred, enter your <strong>Instapay IPA</strong> below to
        confirm.
      </li>
    </>
  );
};

const EWallet: FC<{ price: number }> = ({ price }) => {
  return (
    <>
      <li>
        Go to the <strong>Payment Section</strong> of your mobile E-Wallet app
        (e.g., Vodafone Cash, Fawry).
      </li>
      <li>
        Choose <strong>Send Money</strong> and enter the number{" "}
        <strong>{VFCASH}</strong>.
      </li>
      <li>
        Send <strong>EGP {price.toFixed(2)}</strong>.
      </li>
      <li>
        Send a <strong>screenshot</strong> to the following WhatsApp number{" "}
        <strong>{PHONE}</strong>.
      </li>
      <li>
        Once transferred, enter your <strong>E-Wallet Phone Number</strong>{" "}
        below to confirm.
      </li>
    </>
  );
};

const Card: FC<{ price: number }> = ({ price }) => {
  return (
    <>
      <li>
        Click the <strong>Pay</strong> button below to get redirected to
        Bedayia&apos;s online payment gateway and pay the amount due{" "}
        <strong>EGP {price.toFixed(2)}</strong>.
      </li>
      <li>
        Click <strong>Book</strong>, choose the number of tickets, then click
        <strong>Register</strong> and Go to Payment.
      </li>
      <li>
        Enter your information and click <strong>Proceed to Payment</strong>.
      </li>
      <li>
        Once transferred, send a <strong>screenshot</strong> of the confirmation
        page to the following WhatsApp number <strong>{PHONE}</strong>. Note: it
        may take us around 48 hours to verify your payment.
      </li>
    </>
  );
};

export const paymentOptions: Record<PaymentMethodKey, PaymentMethod> = {
  CASH: {
    displayName: "Bedayia High School Office (Cash)",
    to: "School Office",
    identifier: "CASH",
    icon: Building2,
  },
  TLDA: {
    displayName: "Telda",
    identifier: "TLDA",
    to: TELDA,
    instructions: Telda,
    field: {
      type: "alphanumeric",
      id: "tlda",
      label: "Telda Username",
      placeholder: "Telda Username",
      prefix: "@",
      required: true,
    },

    icon: Wallet,
  },
  IPN: {
    displayName: "InstaPay",
    identifier: "IPN",
    to: IPN,
    instructions: Instapay,
    field: {
      type: "alphanumeric",
      id: "ipn",
      label: "InstaPay Address (IPA)",
      placeholder: "InstaPay Address",
      suffix: "@instapay",
      required: true,
    },

    icon: ArrowRight,
  },
  VFCASH: {
    displayName: "eWallet",
    identifier: "VFCASH",
    to: VFCASH,
    instructions: EWallet,
    field: {
      type: "phone",
      id: "wallet",
      label: "eWallet Phone Number",
      placeholder: "10XXXXXXXX",
      prefix: "+20",
      required: true,
    },

    icon: Phone,
  },
  CARD: {
    displayName: "Credit/Debit Card",
    identifier: "CARD",
    to: "Online Payment Gateway",
    instructions: Card,
    redirectLinks: {
      [TicketType.INDIVIDUAL]:
        "https://admission.bedayia.com/event/tedex1-2/register",
      [TicketType.GROUP]:
        "https://admission.bedayia.com/event/tedexg-3/register",
    },
    icon: CreditCard,
    hidden: true,
  },
};
