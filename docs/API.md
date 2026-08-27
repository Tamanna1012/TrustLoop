# API Reference

Base URL: `/api`. All request/response bodies are JSON. Every response follows one of:

```json
{ "status": "success", "data": { ... } }
{ "status": "error", "error": { "message": "...", "details": { } } }
```

`Auth` column: **—** = public, **Bearer** = requires `Authorization: Bearer <accessToken>`, **Circle member** = Bearer + caller must be an active member of the circle in the URL, **Circle admin** = Bearer + caller must be the circle's creator, **Circle admin or platform admin** = enforced inside the service layer rather than route middleware (see `dispute.service.ts`).

## Auth

| Method | Endpoint | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/auth/register` | — | `{name, email, password}` | Returns `{user, accessToken}`; sets refresh cookie |
| POST | `/auth/login` | — | `{email, password}` | Same response shape as register |
| POST | `/auth/refresh` | — (cookie) | — | Reads the `refreshToken` cookie, returns `{accessToken}` |
| POST | `/auth/logout` | — | — | Clears the refresh cookie |
| GET | `/auth/me` | Bearer | — | Returns `{user}` |

Auth endpoints share a stricter rate limit (20 req/15min) than the rest of the API.

## Circles

| Method | Endpoint | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/circles` | Bearer | `{name, description?, contributionAmount, cycleFrequency, maxMembers}` | Creator becomes the first member at `payoutPosition: 0` |
| GET | `/circles` | Bearer | — | Circles the caller is an active member of |
| POST | `/circles/join` | Bearer | `{inviteCode}` | Not nested under `/:id` — the caller only has the code, not the circle's id |
| GET | `/circles/:id` | Circle member | — | |
| GET | `/circles/:id/members` | Circle member | — | |
| GET | `/circles/:id/cycles` | Circle member | — | Full rotation, in order |
| GET | `/circles/:id/transactions` | Circle member | — | Ledger, newest first, capped at 200 |
| POST | `/circles/:id/activate` | Circle admin | — | Generates the full cycle rotation; needs ≥2 members |
| POST | `/circles/:id/cycles/:cycleId/contributions` | Circle admin | `{userId}` | Admin-confirmed contribution path |

## Payments (Razorpay, test mode)

| Method | Endpoint | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/circles/:id/cycles/:cycleId/payment-order` | Circle member | — | Creates a Razorpay order for the caller's own contribution; amount is server-derived from the circle, never client-supplied |
| POST | `/circles/:id/cycles/:cycleId/payment-verify` | Circle member | `{razorpay_order_id, razorpay_payment_id, razorpay_signature}` | Verifies the HMAC-SHA256 signature (constant-time comparison), then calls the same `recordContribution()` the admin-confirm path uses |

Both routes 400 with a clear message if `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` aren't configured, and share their own rate limit (20 req/15min).

## Disputes

| Method | Endpoint | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/circles/:id/disputes` | Circle member | `{description, againstUser?}` | Notifies the circle admin (unless they raised it themselves) |
| GET | `/circles/:id/disputes` | Circle member | — | |
| PATCH | `/circles/:id/disputes/:disputeId` | Circle admin or platform admin | `{status, resolutionNote?}` | `status` is `underReview` \| `resolved` \| `rejected`; notifies the person who raised it |

## Notifications

| Method | Endpoint | Auth | Body | Notes |
|---|---|---|---|---|
| GET | `/notifications` | Bearer | — | Caller's own, newest first, capped at 50 |
| PATCH | `/notifications/:id/read` | Bearer | — | |
| PATCH | `/notifications/read-all` | Bearer | — | |

## Health

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| GET | `/health` | — | Liveness check, no DB access |

---

### Example: joining a circle

```
POST /api/circles/join
Authorization: Bearer <token>
Content-Type: application/json

{ "inviteCode": "TL-8F2K1A9C" }
```

```json
{
  "status": "success",
  "data": {
    "circle": { "_id": "...", "name": "Hostel Block C Savings", "status": "forming", ... },
    "membership": { "_id": "...", "payoutPosition": 2, "hasReceivedPayout": false, "status": "active" }
  }
}
```
