> Welcome to the main code documentation for TEDx'25 at Bedayia School.

# Sections

1. General Notes
2. eTicket System
3. Styling Guide

# 1. General Notes

> You are supposed to keep the HTML structure relatively the same, with only changing the styles in the different CSS files scattered around the project.
> If you'd like to add functionality, you can do so using [NextJS' documentation](https://nextjs.org/docs/getting-started), adding javascript files, etc.

## Quick Start a New Event

I may try to make a dashboard for simplifying this process, but for now here are the manual steps:

1. Start by editing `app/metadata.tsx` and providing event data, ticket window, etc.
2. Make an API request to `GET /api/admin/destructive/delete?verification=`{destruction_key}. You also need to provide the admin key in the `key` header when making this request.
3. To edit payment methods, add or remove variables from the `app/api/tickets/payment-methods/payment-methods.tsx`. Make sure you don't hardcode usernames for the recievers. You also need to edit the email template in `app/api/tickets/route.tsx` and `app/api/tickets/group/route.tsx` to reflect the new payment methods.
4. Create a Design on Figma (for the non-admin areas) with the team that relates to the theme and is asthetically appealing.
5. After creating a powerful, compelling design, update the various CSS files found in `app` without changing the class names to avoid errors and clashes. For adding elements or functionality to the base HTML, make sure you correctly set their `className` field to `styles.{yourNewClassName}`.
6. Have fun!!
