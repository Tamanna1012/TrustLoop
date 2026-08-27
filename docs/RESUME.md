# Resume material

## Project title

**TrustLoop — Digital Lending Circle Platform**
*React, TypeScript, Node.js, Express, MongoDB · JWT auth · Razorpay (test mode)*

## Resume bullets

- Architected and built a full-stack MERN platform digitizing rotating savings circles (ROSCAs), including an **append-only transaction ledger** enforced at the schema level (Mongoose pre-hooks block mutation/deletion of financial records) and an automated payout-rotation state machine spanning circle → cycle → transaction lifecycles.
- Designed a **trust-scoring algorithm** and role-based authorization model (member / circle admin / platform admin) with server-side resource-ownership checks on every request; implemented JWT authentication with an in-memory access token and `httpOnly` refresh cookie to eliminate client-side token storage as an XSS attack surface.
- Integrated Razorpay payment gateway (test mode) with **HMAC-SHA256 signature verification using constant-time comparison** (`crypto.timingSafeEqual`) to close a timing side-channel, alongside a manual admin-confirmed fallback so the application remains fully functional without payment credentials configured.
- Wrote 32 unit tests against the core financial business logic (cycle rollover, payout firing, duplicate-contribution rejection, trust-score clamping) using mocked Mongoose models with Vitest; hardened the API with Zod schema validation, NoSQL-injection defense-in-depth (`express-mongo-sanitize`), and endpoint-specific rate limiting.
- Built a TypeScript React frontend (TanStack Query, Zustand, React Hook Form + Zod) with a token-refresh Axios interceptor that de-duplicates concurrent 401 retries into a single in-flight refresh request.

## Notes for interviews

- Every bullet above maps to a real file in the repo — if asked to elaborate, open the corresponding service (`contribution.service.ts` for the ledger/rollover claim, `payment.service.ts` for the signature verification, `authStore.ts` + `lib/api.ts` for the token-refresh interceptor) rather than describing it from memory.
- Be upfront if asked whether it's deployed / tested end-to-end: it isn't yet (see the README's "Known limitations" section) — say so plainly and explain *why* (a specific, confirmed sandbox network restriction, not vague hand-waving), then pivot to what *is* verified (unit tests, live route/validation checks) and how you'd close the gap. That's a more credible answer than claiming full verification.
