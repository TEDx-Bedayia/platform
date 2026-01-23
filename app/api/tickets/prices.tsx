import {
  DISCOUNTED_TICKET_PRICE,
  EARLY_BIRD_UNTIL,
  GROUP_EARLY_PRICE,
  GROUP_TICKET_PRICE,
  INDIVIDUAL_EARLY_PRICE,
  INDIVIDUAL_TICKET_PRICE,
  TEACHER_TICKET_PRICE,
} from "@/app/metadata";
import { TicketType } from "../../ticket-types";

// Use this function to calculate the price of a ticket based on its type & payment method.
const getPrice = (
  type: TicketType,
  recieved_at: Date = new Date(),
  method: string = ""
) => {
  if (recieved_at > new Date()) recieved_at = new Date();
  // return rounded price to nearest integer
  let basePrice =
    EARLY_BIRD_UNTIL && recieved_at < EARLY_BIRD_UNTIL
      ? price.individual_early_bird
      : price.individual;
  if (type === TicketType.GROUP) {
    basePrice =
      EARLY_BIRD_UNTIL && recieved_at < EARLY_BIRD_UNTIL
        ? price.group_early_bird
        : price.group;
  } else if (type === TicketType.DISCOUNTED) {
    basePrice = price.discounted;
  } else if (type === TicketType.TEACHER) {
    basePrice = price.teacher;
  } else if (type === TicketType.INDIVIDUAL_EARLY_BIRD) {
    basePrice = price.individual_early_bird;
  } else if (type === TicketType.GROUP_EARLY_BIRD) {
    basePrice = price.group_early_bird;
  } else if (type === TicketType.SPEAKER || type === TicketType.GIVEAWAY) {
    return 0;
  }

  return Math.round(basePrice);
};

export const price = {
  individual: INDIVIDUAL_TICKET_PRICE,
  group: GROUP_TICKET_PRICE,
  discounted: DISCOUNTED_TICKET_PRICE,
  teacher: TEACHER_TICKET_PRICE,
  individual_early_bird: INDIVIDUAL_EARLY_PRICE,
  group_early_bird: GROUP_EARLY_PRICE,
  getPrice: getPrice,
};
