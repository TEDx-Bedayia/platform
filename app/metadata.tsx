import type { Author } from "next/dist/lib/metadata/types/metadata-types";

export const PHONE = "+20 105 578 2533"; // Change to E-Wallet & WhatsApp Enabled phone number
export const TELDA = "@alymob"; // Change to Telda username
export const IPN = "omarelmandooh@instapay"; // Change to Instapay details

export const INDIVIDUAL_TICKET_PRICE = 400; // Change to individual ticket price
export const GROUP_TICKET_PRICE = 350; // Change to group ticket price per person

export const TICKET_WINDOW = [
  new Date("2025-01-01T22:00:00Z"),
  new Date("2025-01-31T23:59:59Z"),
]; // Change to actual ticket window
export const EVENT_DATE = new Date("2025-01-31T23:59:59Z"); // Change to event date
export const HOST = "https://tedxbedayia.com"; // Change to your domain

export const EVENT_DESC =
  "The event will be held on Friday, 31st of January, 2025.";

export const YEAR = 25;

export const SPEAKER_FREE_TICKETS = 2; // Change to number of free tickets for speakers

export const support: Author = {
  name: "Aly Mobarak", // Change with your name (head)
  url: "mailto:alymmobarak@hotmail.com", // Change with your public email
};
