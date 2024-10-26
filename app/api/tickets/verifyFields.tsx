import { getIdentifiersForPaymentMethods } from "./payment-methods/payment-methods";

export function verifyEmail(email: string | undefined): boolean {
  if (email === undefined) {
    return false;
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (emailRegex.test(email)) {
    return true;
  }

  return false;
}

export async function verifyPaymentMethod(
  paymentMethod: string
): Promise<string | undefined> {
  const method = paymentMethod.split("@")[0];
  let metadata = paymentMethod.split("@")[1];
  const options = await getIdentifiersForPaymentMethods();
  if (!paymentMethod || !options.includes(method)) {
    return;
  }

  const vfcash = /^[0-9]{11}$/;

  if (method === "VFCASH") {
    // Replace ٠-٩ with 0-9
    metadata = metadata.replace(/[\u0660-\u0669]/g, (c) =>
      (c.charCodeAt(0) - 0x0660).toString()
    );
    if (vfcash.test(metadata)) return method + "@" + metadata;
  }
  if (checkSafety(metadata)) return paymentMethod;
  return;
}

export function checkSafety(str: string): boolean {
  const alphaNumericAndSymbols = /^[a-zA-Z0-9!@()_+\-=,. ]*$/;
  if (alphaNumericAndSymbols.test(str)) return true;
  return false;
}
