export enum TicketType {
  INDIVIDUAL = "individual",
  GROUP = "group",
  SPEAKER = "speaker",
  GIVEAWAY = "giveaway",
  DISCOUNTED = "discounted",
  TEACHER = "teacher",
}

export function getTicketTypeName(type: TicketType): string {
  switch (type) {
    case TicketType.DISCOUNTED:
      return "Rush Hour";
    default:
      return type.toString();
  }
}
