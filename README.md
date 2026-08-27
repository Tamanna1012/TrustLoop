# TrustLoop

Digital lending circles — transparent group savings with a real ledger, automated payout rotation, and a trust score every member can see.

> **Verification status:** every phase below has been typechecked, linted, and unit-tested (32 tests, mocked models — see [Testing](#testing)). The database-backed paths and full end-to-end flow (register → create circle → join → activate → contribute → payout) have **not** been run against a real MongoDB yet — this development sandbox cannot reach one (see [Known limitations](#known-limitations)). Deployment configuration for Vercel/Render/Atlas is prepared and documented ([`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)) but **not deployed** — nothing here has run against a live hosted instance. Don't treat this app as production-verified until the real deployment checklist in that doc has actually passed.

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Database design](#database-design)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API reference](#api-reference)
- [Testing](#testing)
- [Security](#security)
- [Project structure](#project-structure)
- [Known limitations](#known-limitations)
- [Roadmap](#roadmap)

## Overview

Rotating savings circles (chit funds / ROSCAs) are a huge, informal financial system — a fixed group of people each contribute a fixed amount every cycle, and one member collects the full pot each round. It works entirely on trust: no ledger, no proof of payment, no record of who's reliable. TrustLoop replaces the group chat and the notebook with an auditable system — every contribution and payout is a permanent ledger entry, payout rotation is automatic, and a trust score tracks who actually pays on time.

## Features

**Core loop**
- Create a circle (contribution amount, frequency, member cap) or join one via invite code
- Round-robin payout rotation, generated automatically once a circle activates
- Every contribution and payout is an append-only ledger entry — the `Transaction` model blocks mutation/deletion at the schema level, not just in application code
- Trust score adjusts after every contribution: +1 on time, −5 late, clamped 0–100
- A cycle auto-completes and fires its payout the moment it's fully collected; the next cycle opens automatically

**Payments**
- Contributions are admin-confirmed by default (the circle admin marks who paid) — no payment gateway required to use the app
- Optional Razorpay **test-mode** checkout for self-service contributions, if `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` are configured; falls back cleanly to admin-confirmed mode if they're not

**Disputes & notifications**
- Members can raise a dispute on a circle; the circle admin (or a platform admin, for any circle) can resolve or reject it
- In-app notifications for payouts received and dispute activity, polled every 30s (no websocket — see [Roadmap](#roadmap))

**Not built** (explicitly out of scope for this pass, not overlooked):
- Automated email reminders before due dates (needs an email service API key)
- Bidding-based payout as an alternative to round-robin (a large scope increase for what round-robin already solves)

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 19 + TypeScript + Vite | Fast dev loop, standard SPA stack |
| Styling | Tailwind CSS v4 | Utility-first, CSS-native theming via `@theme` |
| Server state | TanStack Query | Caching/loading/error states for free — no Redux needed for what's almost entirely server data |
| Client state | Zustand | The only real client-only state is auth — didn't need more than this |
| Forms | React Hook Form + Zod | Same validation library as the backend, just re-declared client-side for UX |
| Backend | Node.js + Express + TypeScript | |
| Database | MongoDB + Mongoose | Document model fits circles/cycles/transactions naturally |
| Auth | JWT access token (in-memory) + httpOnly refresh cookie | Access token never touches `localStorage` — closes the XSS-exfiltration path a stored token would open |
| Validation | Zod | Same schema-first approach on both ends of the API boundary |
| Payments | Razorpay (test mode) | Optional; the app is fully usable without it |
| Testing | Vitest | Service-layer unit tests with mocked Mongoose models |

## Architecture

```
React (Vite)  →  Express REST API  →  Service layer  →  MongoDB (Mongoose)
                        │
                        ├── JWT auth (access token + httpOnly refresh cookie)
                        ├── Zod validation on every mutating route
                        ├── Rate limiting (tighter on auth + payment routes)
                        └── Razorpay (optional, test mode only)
```

- **Authentication:** JWT access token (15 min, kept in memory client-side) + refresh token (7 days, `httpOnly`/`secure`-in-prod/`sameSite=strict` cookie scoped to `/api/auth`).
- **Authorization:** role middleware (`user` / `platformAdmin`) plus resource-ownership checks on every circle-scoped route — a circle admin can only act on the circle they created, verified server-side on every request.
- **No cache layer, no websockets.** Deliberately absent — at this scale neither solves a problem the app actually has. Notifications poll every 30s instead of a live socket connection.

## Database design

Seven collections. `Transaction` is the one worth reading closely — it's append-only by design (see [Security](#security)).

| Collection | Purpose | Key fields |
|---|---|---|
| `User` | Account + trust score | `email` (unique), `passwordHash` (bcrypt, `select:false`), `role`, `trustScore` (0–100) |
| `Circle` | A savings circle | `contributionAmount`, `cycleFrequency`, `maxMembers`, `status`, `inviteCode` (unique) |
| `Membership` | Circle ↔ User junction | `payoutPosition`, `hasReceivedPayout`; unique compound index on `{circleId, userId}` |
| `Cycle` | One rotation period | `cycleNumber`, `dueDate`, `payoutRecipient`, `status`; unique compound index on `{circleId, cycleNumber}` |
| `Transaction` | The ledger — append-only | `type` (`contribution`/`payout`), `amount`, `paymentReference`; partial unique index on `{cycleId, userId, type:'contribution'}` blocks double-contribution at the DB level, not just in application code |
| `Dispute` | Raised issues | `status` (`open`/`underReview`/`resolved`/`rejected`), `resolvedBy`, `resolutionNote` |
| `Notification` | In-app alerts | `type`, `message`, `isRead` |

## Getting started

```bash
git clone https://github.com/Tamanna1012/TrustLoop.git
cd TrustLoop
npm install

cp server/.env.example server/.env
# fill in MONGODB_URI (MongoDB Atlas free tier works) and generate JWT secrets:
#   openssl rand -base64 48

npm run dev:server   # http://localhost:5000
npm run dev:client   # http://localhost:5173
```

## Environment variables

Server: see [`server/.env.example`](server/.env.example) for the full list with inline comments. Summary:

| Variable | Required | Notes |
|---|---|---|
| `MONGODB_URI` | Yes | Atlas connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Yes | 32+ characters, generate with `openssl rand -base64 48` |
| `CLIENT_ORIGIN` | Yes in production | Comma-separated allowed frontend origins for CORS. Has a `localhost:5173` default for local dev, but the app **refuses to boot in production without this set explicitly** — a silent CORS misconfiguration is worse than a loud startup failure |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | No | Test-mode keys; omit to keep admin-confirmed-only contributions |

Client: see [`client/.env.example`](client/.env.example).

| Variable | Required | Notes |
|---|---|---|
| `VITE_API_URL` | Yes in production | Backend's full origin + `/api`, e.g. `https://trustloop-api.onrender.com/api`. Unset locally — Vite's dev proxy handles it (see `vite.config.ts`) |

## API reference

Full endpoint-by-endpoint reference: [`docs/API.md`](docs/API.md). Every response follows `{status: 'success', data}` or `{status: 'error', error: {message}}` — the frontend never branches on response shape.

## Testing

```bash
npm run test --workspace server
```

32 unit tests across the service layer, run against mocked Mongoose models (no database required):

- **trust.service** — score clamps at 0/100, +1 on-time vs −5 late
- **contribution.service** — partial vs. fully-collected cycles, payout firing, cycle rollover, circle completion, late-vs-on-time detection, duplicate-contribution rejection
- **cycle.service** — minimum member count, payout order, due-date spacing (7d weekly / 30d monthly)
- **circle.service** — invite-code collision retry, join-capacity and duplicate-join rejection
- **dispute.service** — circle-admin vs. platform-admin vs. unauthorized-member resolution paths
- **payment.service** — genuine vs. forged vs. tampered Razorpay signature verification

**What this doesn't cover:** the actual MongoDB read/write path, and the full HTTP request→response round trip. Those need a real database — see [Known limitations](#known-limitations).

## Security

- Passwords hashed with bcrypt (12 rounds), never logged or returned in any API response
- Access token in memory only, never `localStorage` — refresh token is `httpOnly`, `sameSite=strict`, scoped to `/api/auth`
- Every mutating route validated with Zod before touching the database
- `express-mongo-sanitize` strips NoSQL operator injection attempts (`$gt`, `$ne`, etc.) as defense-in-depth behind Zod
- Razorpay signature verification uses `crypto.timingSafeEqual` — a plain string comparison would leak match-length through response timing
- Rate limiting: 300 req/15min blanket on `/api`, 20 req/15min on auth and payment routes specifically
- Resource ownership checked server-side on every circle-scoped route — never trusted from the client
- `helmet` + CORS restricted to `CLIENT_ORIGIN` + 10kb JSON body limit
- `npm audit`: 0 vulnerabilities across the workspace

## Project structure

```
server/src/
  config/       env validation, DB connection, Razorpay client
  models/       Mongoose schemas
  schemas/      Zod request-validation schemas
  services/     business logic (+ *.test.ts unit tests)
  controllers/  thin HTTP layer over services
  middleware/   auth, circle-access, validation, error handling
  routes/       route wiring

client/src/
  pages/        route-level components
  components/   shared UI (ui/ = design-system primitives)
  hooks/        TanStack Query hooks per resource
  lib/          API clients, formatting, validation schemas
  store/        Zustand auth store
```

## Known limitations

- **No live database test yet.** This was built in a sandboxed environment whose network policy blocks both MongoDB binary downloads and raw-TCP database connections (confirmed, not assumed — see commit history on the `claude/mern-portfolio-project-zj2gar` branch for what was actually tried). The full flow needs to be run against a real MongoDB Atlas cluster before this is production-trustworthy.
- No E2E test suite (Playwright/Cypress) — blocked by the same database gap.
- **Not yet deployed.** Deployment *configuration* is prepared (build commands, env vars, Vercel/Render settings, the cross-site cookie fix — see [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)) and locally verified where that's possible without live accounts, but none of it has been confirmed against an actual running Vercel/Render deployment. Don't read "deployment-ready" as "deployed."
- No Razorpay webhook — payment confirmation relies solely on the client calling back after checkout completes. See `docs/DEPLOYMENT.md` for why, and what closing that gap would take.

## Roadmap

- Run the real-database smoke test ([`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) has the exact checklist) and fix whatever it surfaces
- E2E tests once a database is reachable
- Actually deploy (frontend → Vercel, backend → Render, DB → MongoDB Atlas) and confirm the checklist above passes for real
- Razorpay webhook as a fallback confirmation path
- Email reminders before due dates
- Bidding-based payout as an alternative to round-robin

## More docs

- [`docs/API.md`](docs/API.md) — full endpoint reference
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — exact steps to deploy to Vercel + Render + Atlas, and the post-deploy verification checklist
- [`docs/RESUME.md`](docs/RESUME.md) — resume title + bullets for this project
- [`docs/INTERVIEW_PREP.md`](docs/INTERVIEW_PREP.md) — 70 interview questions (technical, architecture, MongoDB, React, Node/Express, project-specific), each pointing at the actual code it's about
