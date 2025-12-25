export enum TicketType {
  INDIVIDUAL = "individual",
  EARLY_BIRD_INDIVIDUAL = "early_bird_individual",
  GROUP = "group",
  EARLY_BIRD_GROUP = "early_bird_group",
  SPEAKER = "speaker",
  GIVEAWAY = "giveaway",
  DISCOUNTED = "discounted",
  TEACHER = "teacher",
}

export function getTicketTypeName(type: TicketType): string {
  switch (type) {
    case TicketType.DISCOUNTED:
      return "Rush Hour";
    case TicketType.EARLY_BIRD_GROUP:
      return "Early Group";
    case TicketType.EARLY_BIRD_INDIVIDUAL:
      return "Early Individual";
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
    case "early_bird_individual":
    case "i early bird":
      return TicketType.EARLY_BIRD_INDIVIDUAL;
    case "early_bird_group":
    case "g early bird":
      return TicketType.EARLY_BIRD_GROUP;
    default:
      return null;
  }
}
