enum ResponseCode {
  EMAIL_REQUIRED = 431, // Sent when email is required for identifying a ticket, when the payment method alone isn't enough.
  UPDATE_ID = 455, // Sent along with the email of the user and the amount they should pay after Office enters ID.
}
