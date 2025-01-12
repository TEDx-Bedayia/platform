import {
  DISCOUNTED_TICKET_PRICE,
  GROUP_TICKET_PRICE,
  INDIVIDUAL_TICKET_PRICE,
} from "@/app/metadata";

// Use this function to calculate the price of a ticket if fees are imposed on certain methods.
let markupFunction = (price: number, method: string) => {
  // return rounded price to nearest integer
  return Math.round(price);
};

export let price = {
  individual: INDIVIDUAL_TICKET_PRICE,
  group: GROUP_TICKET_PRICE,
  discounted: DISCOUNTED_TICKET_PRICE,
  markup: markupFunction,
};
