export interface PaymentMethod {
  displayName: string;
  identifier: string;
  to: string;
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
  to: "@alymob",
  fields: [
    {
      type: "string",
      id: "tlda",
      label: "Telda Username",
      placeholder: "Enter your Username",
      required: true,
    },
  ],
};

const INSTAPAY: PaymentMethod = {
  displayName: "Instapay",
  identifier: "IPN",
  to: "XXXXXXXX",
  fields: [
    {
      type: "string",
      id: "ipn",
      label: "Account Number/Name",
      placeholder: "Enter your Account Number (IPN)",
      required: true,
    },
  ],
};

const VFCASH: PaymentMethod = {
  displayName: "Mobile Wallet (e.g. Vodafone Cash)",
  identifier: "VFCASH",
  to: "The Phone Number for the wallet will be sent to your Email/WhatsApp",
  fields: [
    {
      type: "string",
      label: "Phone Number",
      id: "vfcash",
      placeholder: "Enter the Phone Number you'll transfer from",
      required: true,
    },
  ],
};

const CASH: PaymentMethod = {
  displayName: "Bedayia High School Office",
  identifier: "CASH",
  to: "Pay at the School Office",
  fields: [],
};

export async function getPaymentMethods() {
  return [TLDA, INSTAPAY, VFCASH, CASH];
}

export async function getIdentifiersForPaymentMethods() {
  return (await getPaymentMethods()).map((method) => method.identifier);
}
