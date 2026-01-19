export enum TicketType {
  INDIVIDUAL = "individual",
  GROUP = "group",
  SPEAKER = "speaker",
  GIVEAWAY = "giveaway",
  DISCOUNTED = "discounted",
  TEACHER = "teacher",
  INDIVIDUAL_EARLY_BIRD = "individual_early_bird",
  GROUP_EARLY_BIRD = "group_early_bird",
}

export function getTicketTypeName(type: TicketType): string {
  switch (type) {
    case TicketType.DISCOUNTED:
      return "Rush Hour";
    case TicketType.INDIVIDUAL_EARLY_BIRD:
      return "Individual Early Bird";
    case TicketType.GROUP_EARLY_BIRD:
      return "Group Early Bird";
    default:
      return type
        .toString()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
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
    case "individual early bird":
      return TicketType.INDIVIDUAL_EARLY_BIRD;
    case "group early bird":
      return TicketType.GROUP_EARLY_BIRD;
    default:
      return null;
  }
}

export function isGroup(type: TicketType | null): boolean {
  return type === TicketType.GROUP || type === TicketType.GROUP_EARLY_BIRD;
}

export function isGroupString(type: string): boolean {
  return isGroup(getTicketTypeFromName(type) as TicketType | null);
}
