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

export function getTicketTypeFromName(name: string): TicketType | null {
  switch (name.toLowerCase()) {
    case "individual":
      return TicketType.INDIVIDUAL;
    case "group":
      return TicketType.GROUP;
    case "speaker":
      return TicketType.SPEAKER;
    case "giveaway":
      return TicketType.GIVEAWAY;
    case "discounted":
    case "rush hour":
      return TicketType.DISCOUNTED;
    case "teacher":
      return TicketType.TEACHER;
    default:
      return null;
  }
}
