import { getIdentifiersForPaymentMethods } from "../../payment-methods";

export function verifyEmail(email: string | undefined): boolean {
  if (email === undefined) {
    return false;
  }

  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
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

  // replace .co with .com at the end of the email
  const co = /(?<=\.)co$/;
  if (co.test(email)) {
    email = email.replace(co, "com");
  }

  return email;
}

export function verifyPaymentMethod(paymentMethod: string): string | undefined {
  const method = paymentMethod.split("@")[0];
  let metadata = paymentMethod.split("@")[1];
  if (metadata && metadata.includes("@")) {
    return;
  }
  const options = getIdentifiersForPaymentMethods().map((id) => id.toString());
  if (!paymentMethod || !options.includes(method)) {
    return;
  }

  if (metadata && !checkSafety(metadata)) return;
  if (method === "VFCASH") {
    if (!checkPhone(metadata)) return;
    paymentMethod = "VFCASH@0" + metadata;
  }

  return paymentMethod;
}

export function checkSafety(str: string): boolean {
  const alphaNumericAndSymbols =
    /^[a-zA-Z0-9!@()_+\-=,. \u0600-\u065F\u066A-\u06EF\u06FA-\u06FF]*$/;
  if (alphaNumericAndSymbols.test(str)) return true;
  return false;
}

export function checkPhone(str: string): boolean {
  const alphaNumericAndSymbols = /^[0-9+]*$/;
  if (alphaNumericAndSymbols.test(str) && str.length >= 10) return true;
  return false;
}
