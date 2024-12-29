import { getIdentifiersForPaymentMethods } from "./payment-methods/payment-methods";

export function verifyEmail(email: string | undefined): boolean {
  if (email === undefined) {
    return false;
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (emailRegex.test(email.trim())) {
    return true;
  }

  return false;
}

export function handleMisspelling(email: string): string {
  if (email.includes("gamil")) {
    email = email.replace("gamil", "gmail");
  }

  if (email.includes("gmai")) {
    email = email.replace("gmai", "gmail");
  }
  if (email.includes("gnail")) {
    email = email.replace("gnail", "gmail");
  }
  if (email.includes("gmali")) {
    email = email.replace("gmali", "gmail");
  }
  // Regexp to replace gamil, gmaill, gmal, gmalil, gmall, gmall, gmeil, gmil, gmla MUST BE AFTER THE @ symbol
  const gamil = /(?<=@)gma?i?l{1,2}/;
  if (gamil.test(email)) {
    email = email.replace(gamil, "gmail");
  }

  const gamil2 = /(?<=@)gam?i?l{1,2}/;
  if (gamil2.test(email)) {
    email = email.replace(gamil2, "gmail");
  }
  return email;
}

export async function verifyPaymentMethod(
  paymentMethod: string
): Promise<string | undefined> {
  const method = paymentMethod.split("@")[0];
  let metadata = paymentMethod.split("@")[1];
  if (metadata && metadata.includes("@")) {
    return;
  }
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
    if (metadata.length === 13 && metadata.startsWith("+")) {
      metadata = metadata.slice(2);
    }
    if (vfcash.test(metadata)) return method + "@" + metadata;
    else return;
  }
  if (checkSafety(metadata)) return paymentMethod;
  return;
}

export function checkSafety(str: string): boolean {
  const alphaNumericAndSymbols = /^[a-zA-Z0-9!@()_+\-=,. ]*$/;
  if (alphaNumericAndSymbols.test(str)) return true;
  return false;
}

export function checkPhone(str: string): boolean {
  const alphaNumericAndSymbols = /^[0-9+]*$/;
  if (alphaNumericAndSymbols.test(str)) return true;
  return false;
}

export function generateRandomString(length: number) {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
