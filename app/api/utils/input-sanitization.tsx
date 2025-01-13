import { getIdentifiersForPaymentMethods } from "../tickets/payment-methods/payment-methods";

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
  email = email.replace("@gamil", "@gmail");
  email = email.replace("@gmai", "@gmail");
  email = email.replace("@gnail", "@gmail");
  email = email.replace("@gmali", "@gmail");
  email = email.replace("@gmal", "@gmail");
  email = email.replace("@gmalil", "@gmail");
  email = email.replace("@gmall", "@gmail");
  email = email.replace("@gmeil", "@gmail");
  email = email.replace("@gmil", "@gmail");
  email = email.replace("@gmla", "@gmail");
  email = email.replace("@gmaill", "@gmail");
  email = email.replace("@bedaya", "@bedayia");
  email = email.replace("@bedayiaa", "@bedayia");
  email = email.replace("@bdayia", "@bedayia");
  email = email.replace("@bdaya", "@bedayia");
  const gamil = /(?<=@)gma?i?l{1,2}/;
  if (gamil.test(email)) {
    email = email.replace(gamil, "gmail");
  }
  const gamil2 = /(?<=@)gam?i?l{1,2}/;
  if (gamil2.test(email)) {
    email = email.replace(gamil2, "gmail");
  }

  // RegEXP to check for .xom, .con, .cmo AT THE END of the email
  const xom = /(?<=\.)xom$/;
  if (xom.test(email)) {
    email = email.replace(xom, "com");
  }
  const con = /(?<=\.)con$/;
  if (con.test(email)) {
    email = email.replace(con, "com");
  }
  const cmo = /(?<=\.)cmo$/;
  if (cmo.test(email)) {
    email = email.replace(cmo, "com");
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
  const alphaNumericAndSymbols =
    /^[a-zA-Z0-9!@()_+\-=,. \u0600-\u065F\u066A-\u06EF\u06FA-\u06FF]*$/;
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
