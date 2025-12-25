import {
  DISCOUNTED_TICKET_PRICE,
  GROUP_TICKET_PRICE,
  INDIVIDUAL_TICKET_PRICE,
} from "@/app/metadata";
import { TicketType } from "../../ticket-types";

// Use this function to calculate the price of a ticket if fees are imposed on certain methods.
const getPrice = (type: TicketType, method: string) => {
  // return rounded price to nearest integer
  let basePrice = INDIVIDUAL_TICKET_PRICE;
  if (type === TicketType.GROUP) {
    basePrice = GROUP_TICKET_PRICE;
  } else if (type === TicketType.DISCOUNTED) {
    basePrice = DISCOUNTED_TICKET_PRICE;
  } else if (type === TicketType.TEACHER) {
    basePrice = 0.5 * INDIVIDUAL_TICKET_PRICE;
  } else if (type == TicketType.SPEAKER || type == TicketType.GIVEAWAY) {
    return 0;
  }

  return Math.round(basePrice);
};

export let price = {
  individual: INDIVIDUAL_TICKET_PRICE,
  group: GROUP_TICKET_PRICE,
  discounted: DISCOUNTED_TICKET_PRICE,
  teacher: 0.5 * INDIVIDUAL_TICKET_PRICE,
  getPrice: getPrice,
};
