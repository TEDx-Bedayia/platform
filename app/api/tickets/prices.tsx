import {
  DISCOUNTED_TICKET_PRICE,
  EARLY_BIRD_UNTIL,
  GROUP_EARLY_PRICE,
  GROUP_TICKET_PRICE,
  INDIVIDUAL_EARLY_PRICE,
  INDIVIDUAL_TICKET_PRICE,
} from "@/app/metadata";
import { TicketType } from "../../ticket-types";

// Use this function to calculate the price of a ticket based on its type & payment method.
const getPrice = (type: TicketType, method: string = "") => {
  // return rounded price to nearest integer
  let basePrice =
    EARLY_BIRD_UNTIL && new Date() < EARLY_BIRD_UNTIL
      ? INDIVIDUAL_EARLY_PRICE
      : INDIVIDUAL_TICKET_PRICE;
  if (type === TicketType.GROUP) {
    basePrice =
      EARLY_BIRD_UNTIL && new Date() < EARLY_BIRD_UNTIL
        ? GROUP_EARLY_PRICE
        : GROUP_TICKET_PRICE;
  } else if (type === TicketType.DISCOUNTED) {
    basePrice = DISCOUNTED_TICKET_PRICE;
  } else if (type === TicketType.TEACHER) {
    basePrice = 0.5 * INDIVIDUAL_TICKET_PRICE;
  } else if (type === TicketType.SPEAKER || type === TicketType.GIVEAWAY) {
    return 0;
  }

  return Math.round(basePrice);
};

export let price = {
  individual: getPrice(TicketType.INDIVIDUAL),
  group: getPrice(TicketType.GROUP),
  discounted: getPrice(TicketType.DISCOUNTED),
  teacher: getPrice(TicketType.TEACHER),
  getPrice: getPrice,
};
