import type { Author } from "next/dist/lib/metadata/types/metadata-types";

export const PHONE = "+20 105 578 2533"; // Change to WhatsApp Enabled phone number
export const TELDA = "@alymob"; // Change to Telda username
export const IPN = "omarelmandooh@instapay"; // Change to Instapay details

export const INDIVIDUAL_TICKET_PRICE = 400; // Change to individual ticket price
export const GROUP_TICKET_PRICE = 350; // Change to group ticket price per person

export const DISCOUNTED_TICKET_PRICE = 300; // Change to rush hour ticket price

export const TICKET_WINDOW = [
  new Date("2025-09-01T22:00:00Z"),
  new Date("2025-09-29T23:59:59Z"),
]; // Change to actual ticket window
export const EVENT_DATE = new Date("2026-01-31T23:59:59Z"); // Change to event date
export const HOST = "https://tedxbedayia.com"; // Change to your domain

export const EVENT_DESC =
  "TESTING PHASE";

export const YEAR = 26;

export const SPEAKER_FREE_TICKETS = 2; // Change to default number of free tickets

export const support: Author = {
  name: "Aly Mobarak",
  url: "mailto:alymmobarak@hotmail.com",
};
