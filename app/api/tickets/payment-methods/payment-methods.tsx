import { IPN, PHONE, TELDA } from "@/app/metadata";

export interface PaymentMethod {
  displayName: string;
  identifier: string;
  to: string;
  automatic?: boolean;
  fields: Field[];
}

export interface Field {
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  id: string;
}

const TLDA: PaymentMethod = {
  displayName: "Telda",
  identifier: "TLDA",
  to: TELDA,
  fields: [
    {
      type: "string",
      id: "tlda",
      label: "Telda Username",
      placeholder: "Telda Username",
      required: true,
    },
  ],
};

const INSTAPAY: PaymentMethod = {
  displayName: "Instapay",
  identifier: "IPN",
  to: IPN,
  fields: [
    {
      type: "string",
      id: "ipn",
      label: "InstaPay Address (IPA)",
      placeholder: "InstaPay Address (without @instapay)",
      required: true,
    },
  ],
};

const VFCASH: PaymentMethod = {
  displayName: "E-Wallet (e.g. Vodafone Cash)",
  identifier: "VFCASH",
  to: PHONE,
  fields: [
    {
      type: "string",
      label: "Phone Number",
      id: "vfcash",
      placeholder: "E-Wallet Phone Number",
      required: true,
    },
  ],
};

const CASH: PaymentMethod = {
  displayName: "Bedayia High School Office (Cash)",
  identifier: "CASH",
  to: "School Office",
  fields: [],
};

const CARD: PaymentMethod = {
  displayName: "Credit/Debit Card (or Telda Card)",
  identifier: "CARD",
  to: "Paymob",
  automatic: true,
  fields: [],
};

export async function getPaymentMethods() {
  return [CARD, TLDA, INSTAPAY, VFCASH, CASH];
}

export async function getIdentifiersForPaymentMethods() {
  return (await getPaymentMethods()).map((method) => method.identifier);
}
