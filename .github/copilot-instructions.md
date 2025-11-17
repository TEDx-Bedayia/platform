# TEDxBedayia AI Guide

## Architecture & Domains

- Next.js App Router project (`app/**`) with client-heavy booking flows (`app/book`, `app/book/group`) and admin/marketing portals under `app/admin` and `app/marketing`.
- Server logic lives in `app/api/**`; each subfolder mirrors a business domain (tickets, payments, marketing, qr, utils) and returns `Response`/`NextResponse` objects.
- Data persistence is through Vercel Postgres tables such as `attendees`, `groups`, `rush_hour`, `marketing_members`, `account_holders`, and `pay_backup` accessed via `@vercel/postgres` tagged queries.
- Shared constants (event dates, ticket prices, phone numbers) live in `app/metadata.tsx` and ripple through pricing (`app/api/tickets/price/prices.tsx`) and UI copy.

## Critical Flows

- Booking endpoints (`app/api/tickets/route.tsx`, `.../group/route.tsx`) sanitize inputs via `app/api/utils/input-sanitization.tsx`, insert attendees, and branch to PayMob (`CARD`) vs. manual (`CASH`). Revert DB rows if downstream email/payment calls fail.
- Payment fulfillment is centralized in `app/api/admin/payment-reciever/main.tsx`; helpers like `safeRandUUID` guarantee unique QR payloads and `pay()` resolves ambiguous cash deposits (HTTP 431 via `ResponseCode.TICKET_AMBIGUITY`).
- PayMob webhooks hit `app/api/payment_processed/route.tsx`, which validates HMAC (`PAYMOB_HMAC_SECRET`), updates attendees in bulk, fires `sendEmail`, and logs to `pay_backup`—do not skip HMAC/stringify ordering.
- Admin dashboards fetch and mutate via dedicated routes (`app/api/admin/**`), almost always gated through `canUserAccess` with `ProtectedResource` enums; keep new resources defined in `app/api/utils/auth.tsx` and referenced in UI.
- Marketing rush-hour codes are generated in `app/api/marketing/gen-code/route.tsx` using member-specific secrets; submissions update `rush_hour` and later redeemed in booking POSTs.

## Auth & Access Control

- `app/api/admin/auth/route.tsx` issues JWT cookies (`token`) backed by `JWT_SECRET`; roles (`UserRole`) grant resources + optional method whitelists (e.g., School Office limited to CASH).
- Every admin API must call `canUserAccess(req, Resource, method?)`; failure returns `401` JSON. Exposed client pages check `/api/admin/auth` before rendering sensitive data.
- Marketing members authenticate per-request by recomputing passwords with `getMarketingMemberPass(username)` seeded via `MARKETING_MEMBER_PASSWORD_GEN`.

## Data & Integrations

- Emails use Gmail OAuth2 (`EMAIL`, `CLIENT_ID`, `CLIENT_SECRET`, `REFRESH_TOKEN`) with HTML templates in `public/booked.html` and `public/eTicket-template.html`; replace `${}` placeholders before sending.
- PayMob integration needs `PAYMOB_SECRET_KEY`, `PAYMOB_CARD_INT_ID`, `PAYMOB_VFCASH_INT_ID`, `PAYMOB_PUBLIC_KEY`, `PAYMOB_BASE_URL`, `PAYMOB_BASE_API_URL`, and `PAYMOB_TEST_MODE`. Update attendee `payment_method` to `CARD@{orderId}` immediately so webhook reconciliation works.
- QR generation (`app/api/qr/route.tsx`) is stateless; admission scanning hits `app/api/tickets/admit/[uuid]/route.tsx` and requires `APP_KEY` plus proximity to `EVENT_DATE` (36h threshold) unless test mode.
- Cash payments recorded through `app/api/admin/payment-reciever/cash/route.tsx` or `pay()` also mirror transactions into `pay_backup` for audit.

## UI Patterns

- Client components rely on custom helpers: `customAlert`/`customAlert2` for modal messaging and `addLoader`/`removeLoader` from `app/global_components/loader.tsx` to block the UI around async calls—reuse them when adding interactivity.
- Styling is split between CSS Modules (e.g., `app/admin/dashboard.module.css`) and Tailwind utilities (`app/globals.css`, `tailwind.config.ts`). Fonts are loaded via `next/font` and applied per component.
- Payment method metadata comes from `app/payment-methods.tsx`; always derive identifiers via `getIdentifiersForPaymentMethods()` so server-side validation accepts the same tokens.

## Dev Workflow & Gotchas

- Install deps with `npm install`, run locally via `npm run dev`; production parity requires Node 18+ and a `.env.local` containing all secrets above plus Postgres connection vars (`POSTGRES_URL`, etc.). Use `npm run lint` before committing.
- Database rollbacks are manual: many routes delete/resequence `attendees` when downstream work fails, so keep related SQL mutations inside `try/catch` blocks and release `sql.connect()` clients.
- Group tickets expect exactly four attendee rows tied together through the `groups` table; any update to one member should consider synchronized updates (see `pay()` bulk logic).
- Custom HTTP codes (431/432) signal actionable UI states; preserve them when extending APIs so existing clients keep rendering ambiguous-payment dialogs or marketing warnings correctly.
