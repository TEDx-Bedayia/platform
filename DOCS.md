# TEDx Bedayia

> Welcome to the main documentation for TEDx at Bedayia School.

**Author**: Aly Mobarak.

# Sections

1. General Notes
2. eTicket System
3. Styling Guide

# 1. General Notes

> You are generally supposed to keep the HTML structure relatively the same, with only changing the styles in the different CSS files scattered around the project and the text to be related to the new theme and event.

> If you'd like to add functionality, you can do so using [NextJS Documentation](https://nextjs.org/docs/getting-started), adding typescript files, etc.

## Quick Start a New Event

I may try to make a dashboard for simplifying this process, but for now here are the manual steps:

1. Start by editing `app/metadata.tsx` and providing event data, ticket window, etc.
2. In the admin dashboard, there will be a shield X button when the event is concluded. Press it to reset the data (after downloading if you would like to use it next year for marketing).
3. To edit payment methods, add or remove variables from the `app/api/tickets/payment-methods/payment-methods.tsx`. Make sure you don't hardcode usernames for the receivers. You also need to edit the email template in `app/api/tickets/route.tsx` and `app/api/tickets/group/route.tsx` to reflect the new payment methods.
4. Create a Design on Figma (for the non-admin areas) with the team that relates to the theme and is asthetically appealing.
5. After creating a powerful, compelling design, update the various CSS files found in `app` without changing the class names to avoid errors and clashes. For adding elements or functionality to the base HTML, make sure you correctly set their `className` field to `styles.{yourNewClassName}`.
6. Have fun!!

## Things to Maintain

- Domain Name: <https://tedxbedayia.com> renew around 31st of December.
- Vercel Hosting: make sure everything is set up and running and linked to a GitHub Repository and Domain. (I may keep it under my account for simlicity but give the head full permissions)
- Database: make sure you clear it after last year's event and after testing.
- GMail Account: We no longer need to turn on less secure apps for v1.1.

# 2. eTicket System 1.0 & 1.1

This section will describe the flow of events in this current system while including comments and suggestions for future revisions of the system.

## Booking a Ticket

1. Attendees fill in their name, email address, payment method, and phone number.
2. An email is sent guiding them to pay and how much to pay.
3. They send the payment following the procedures sent by mail which currently are sending to telda, vodafone cash, instapay, or cash at the school office. In all cases, the user should provide his attendee ID, to ensure the payment is linked to the correct ticket in case there are multiple tickets with the same payment method.

### Related Accessible Routes

- Book One Ticket `/book/`
- Book a Group Ticket (4 People) `/book/group/`

- Submit One Ticket `POST /api/tickets/`
- Submit a Group Ticket `POST /api/tickets/group/`
- Retrieve Available Payment Methods `GET /api/tickets/payment-methods/`
- Retrieve Prices `GET /api/tickets/price/?type={ticket_type}`

### Related Files

- Email Template `/public/booked.html`
- Check Safety and Validity of Inputs `/api/tickets/utils.tsx`
- Different Payment Methods Available `/api/tickets/payment-methods/payment-methods.tsx`

### Styling Files

- All CSS Related to Booking an individual or group Ticket `/book/book.module.css`
- All CSS Related to the shared Navigation Bar `/book/booking_nav.module.css`

## Accepting the Payment

1. School Office has a special portal where it can input an attendee ID or an email address and the amount of money received.
2. Admins holding other payment methods have access to everything else (should be updated in the future if finance department will handle this part such that finance can accept payments but not see all tickets, etc.). Once these admins receive a payment, they try to accept it from the admin dashboard using only the username of the sender, and if duplicate tickets are found, a popout of different tickets to choose from is shown. The admins use the provided attendee ID to identify the correct tickets.
3. An email is sent with a randomly generated unique UUID (long string) in a QR code. This UUID is what identifies the attendee and allows only one entry at the event.

### Related Accessible Routes

- Form for Accepting Payments `/admin/payments/`

- API for Accepting Payments `GET /api/payment-reciever/{method_id}/?from={email/username/phone}&amount={recieved_amount}&date={date}&email_id={email_if_multiple_tickets_found}`
- API for returning QR Code Image for GMail `GET /api/qr/?uuid={text_to_put_in_qr}` \*\* **NOTE**: This API Route is public so you should NOT introduce any SQL checks in it checking whether the UUID is valid or not since that could allow for bruteforcing UUIDs into the event.

### Related Files

- Email Template `/public/eTicket-template.html`
- Payment Processor `/api/admin/payment-reciever/main.tsx`
- eTicket Email Sender `/api/admin/payment-reciever/eTicketEmail.tsx`

### Styling Files

- Form's CSS Stylesheet `/admin/payments/payments.module.css`

## Admitting into the Event

1. People come in with their unique QR codes in print or on phone.
2. Gate Ushers have access to a website that scans this QR code and with an API Key, makes a call to admit the person.
3. If the QR code has been already used, wasn't paid for (impossible since uuid is only generated when a user pays but hey we should account for all possibilities including the "impossible"), or doesn't even exist on the system (made up QR Code), the usher would receive a message to further investigate and send them to the head who has access to the full database. The head would just make sure the guy is completely faking it and that it was not a technical error of some sort by manually checking the database from the dashboard.
4. Otherwise, the name of the attendee is shown and the usher is instructed to admit them normally into the event.

> P.S. There is a 2.5 second window for scanning QR codes since for the event'2025 some codes were double scanned from the same phone due to iPhone weird glitches with the ushers website.

### Related Accessible Routes

- API accessible to Ushers `GET /api/tickets/admin/{UUID}/?key={APP_KEY}` (**security: this API can only admit and can't deadmit since ushers shouldn't have this authority**)

### Related Files

### Styling Files

- Styles and Usher's App Code are present in the usher website at `AlyMobarak/PWA`... request access from me if you don't have access.

## Dashboard and Credentials (/admin)

1. Full Power Admin or whoever is responsible (roles should be created in the future, each with specific usernames and passwords) should review the tickets booked frequently for any weird entries and act accordingly.
2. School Office
3. Marketing Head

### Related Accessible Routes

- Login as Full Power Admin or School Office or Marketing Head (with credentials saved in .env) `/admin/login/`
- Logout `/admin/logout/`
- Dashboard where All Tickets are Shown `/admin/`

## Marketing System

Basically, this system is made to simplify the hectic process associated with the sale of rush hour tickets, where event'2025 had missing money and missing emails. This system simplifies the process and even allows marketing members to sell rush hour tickets to people who don't have an email memorized through random code generation. To understand more, there is a tutorials page on the site at tedxbedayia.com/tutorials.

## For the Future

- Classify Portal into different roles.

  - Maintaner (Web Design Head)
  - Payment Acceptor (Finance Department or TEDx Head)
  - Cash Acceptor (School Office)
  - Speaker Ticket Generator (Curation Department)

- Fix Spelling Error in `payment-reciever`.
- Optimize Receiving Payments in `main.tsx` since it takes some time to process payments where multiple group and individual tickets are found.
- Always use sql.connect() for multiple sql queries to save time and bandwidth.

# 3. Styling Guide
