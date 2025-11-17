export enum ResponseCode {
  TICKET_AMBIGUITY = 431, // Sent when email is required for identifying a ticket, when the payment method alone isn't enough.
  MARKETING_ACTIVITY_OUT_OF_SYNC = 432, // Sent when the payment received does not match the expected amount for marketing activities.
}
