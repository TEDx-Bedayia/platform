import { GROUP_TICKET_PRICE, INDIVIDUAL_TICKET_PRICE } from "@/app/metadata";

let markupFunction = (price: number, method: string) => {
  // return rounded price to nearest integer
  return Math.round(price);
};

export let price = {
  individual: INDIVIDUAL_TICKET_PRICE,
  group: GROUP_TICKET_PRICE,
  markup: markupFunction,
};
