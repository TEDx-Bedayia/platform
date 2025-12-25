import type { Author } from "next/dist/lib/metadata/types/metadata-types";

export const PHONE = "+20 105 578 2533"; // Leave as is
export const VFCASH = "01003993559"; // Change to Vodafone Cash number
export const TELDA = "@alykotb"; // Change to Telda username
export const IPN = "reemabdulghaffar@instapay"; // Change to Instapay details

export const INDIVIDUAL_TICKET_PRICE = 400; // Change to individual ticket price
export const GROUP_TICKET_PRICE = 350; // Change to group ticket price per person

export const DISCOUNTED_TICKET_PRICE = 300; // Change to rush hour ticket price

export const TICKET_WINDOW = [
  new Date("2025-08-01T22:00:00Z"),
  new Date("2025-11-29T23:59:59Z"),
]; // Change to actual ticket window
export const EVENT_DATE = new Date("2020-01-01T23:59:59Z"); // Change to event date
export const HOST = "https://tedxbedayia.com";

export const EVENT_DESC = "TESTING PHASE. ANY QR CODE TICKETS ARE INVALID."; // Change to event description

export const YEAR = 26; // Increment for each event

export const SPEAKER_FREE_TICKETS = 2; // Change to default number of free tickets

export const support: Author = {
  name: "Aly Mobarak",
  url: "mailto:alymmobarak@hotmail.com",
};

export const paymentProcessor = "PayMob"; // Change to payment processor name
