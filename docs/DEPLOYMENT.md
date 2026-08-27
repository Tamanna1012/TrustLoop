# Deployment Guide

**Status: not deployed.** Everything in this document is configuration prepared and locally verified where possible — none of it has been confirmed against a live Vercel, Render, or MongoDB Atlas account, because this build environment cannot reach any of them (see the root README's "Known limitations"). Treat every step below as instructions to follow and then verify yourself, not as a report of something already working in production.

## 1. MongoDB Atlas

1. Create a free (M0) cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas).
2. Database Access → add a database user (username/password).
3. Network Access → allow the IPs that need to reach it. For getting started, `0.0.0.0/0` is simplest; tighten to Render's static IPs (if your plan has them) once it's working.
4. Connect → Drivers → copy the connection string, append `/trustloop` before the `?` query params so it targets a named database.

## 2. Backend (Render)

Two ways to do this — pick one.

**Option A — Blueprint (`render.yaml`, prepared but unverified):** In Render, "New" → "Blueprint" → point it at this repo. It should read [`render.yaml`](../render.yaml) and propose the `trustloop-api` service. You'll still be prompted to fill in every `sync: false` variable manually (Render never lets a blueprint set secrets for you). **Check the blueprint's proposed settings against what Render's UI shows before accepting them** — this file was written against Render's documented spec, not tested against Render's actual parser.

**Option B — Manual dashboard setup:**
- New → Web Service → connect this repo
- Root Directory: leave **blank** (repo root) — this is an npm-workspaces monorepo; pointing Root Directory at `server/` in isolation skips hoisted dependency resolution
- Build Command: `npm install && npm run build --workspace server`
- Start Command: `npm run start --workspace server`
- Health Check Path: `/api/health`

**Environment variables** (either option, set these in Render's dashboard):

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your Atlas connection string from step 1 |
| `JWT_ACCESS_SECRET` | `openssl rand -base64 48` |
| `JWT_REFRESH_SECRET` | `openssl rand -base64 48` (different from the above) |
| `JWT_ACCESS_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `CLIENT_ORIGIN` | Your Vercel URL once you have it (step 3) — e.g. `https://trustloop.vercel.app`. **The app will refuse to boot without this set in production** (added deliberately — see `env.ts`) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Optional — see [section 4](#4-razorpay-optional) |

## 3. Frontend (Vercel)

- New Project → import this repo
- Root Directory: `client`
- Framework Preset: Vite (should auto-detect)
- Build Command / Output Directory: defaults (`npm run build` / `dist`) are correct
- [`client/vercel.json`](../client/vercel.json) is already in the repo — it adds the SPA rewrite rule so refreshing the browser on a client-side route (e.g. `/dashboard`) doesn't 404 against Vercel's static host

**Environment variable:**

| Key | Value |
|---|---|
| `VITE_API_URL` | Your Render backend's URL + `/api`, e.g. `https://trustloop-api.onrender.com/api` |

Then go back to Render and set `CLIENT_ORIGIN` to whatever Vercel URL you actually got — the two platforms need each other's URLs, so deploy the backend first, then the frontend, then update the backend's `CLIENT_ORIGIN` and redeploy it.

## 4. Razorpay (optional)

Only needed for self-service online payment; the app works fully without it (contributions stay admin-confirmed). If you want it:

1. Create a Razorpay account, switch the dashboard to **Test Mode**.
2. Settings → API Keys → generate a test key pair.
3. Set `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` on Render.

**Known gap, not built:** there's no Razorpay webhook endpoint. The current flow verifies payment via the signature the client receives directly from Razorpay Checkout after payment — that's a valid, documented integration pattern, but it means a payment that succeeds while the user's browser loses connectivity before calling back won't get recorded. A webhook as a fallback would close that gap; it's not implemented because it needs a live, publicly reachable HTTPS URL registered in the Razorpay dashboard to build against, which isn't available until this is actually deployed.

## 5. Post-deploy verification (do this — don't skip it)

Nothing above has been confirmed to actually work end-to-end. Once both services are live:

1. Open the Vercel URL, register two accounts.
2. As account A: create a circle (small amount, `maxMembers: 2`, weekly).
3. As account B: join it with the invite code shown.
4. As account A (circle admin): activate the circle. Confirm `GET /circles/:id/cycles` shows cycle 1 `collecting`, cycle 2 `pending`.
5. Mark both members' contributions paid. Confirm: a payout transaction appears in the ledger, cycle 1 flips to `completed`, cycle 2 flips to `collecting`.
6. Check account A's trust score changed (Profile page).
7. Log out, close the tab, reopen the Vercel URL — confirm you're still logged in (tests the refresh-cookie flow across the real cross-site Vercel↔Render boundary, which is the specific thing the `sameSite: 'none'` fix in this phase was for).
8. Open browser dev tools → Application → Cookies while on the Vercel domain, confirm the `refreshToken` cookie is present, `HttpOnly`, `Secure`, and `SameSite=None`.

If all eight pass, the app is genuinely verified end-to-end for the first time. If any step fails, that's real signal about what's actually broken — more useful than anything a mocked test could tell you.

## What's actually different from before this phase

Two real bugs would have broken production if deployed as-is prior to this pass, both fixed here:

- The API client's `baseURL` was hardcoded to `/api` (relative), which only resolves correctly through Vite's dev-only proxy. On separate Vercel/Render domains, every API call would have 404'd. Fixed with `VITE_API_URL`.
- The refresh cookie used `sameSite: 'strict'`. Vercel and Render are different sites from the browser's perspective — `strict` (and even `lax`) would have silently stopped the browser from ever sending that cookie cross-site, breaking login persistence and the whole refresh flow with no obvious error. Fixed: `sameSite: 'none'` (+ `secure: true`, already required alongside it) in production, unchanged (`strict`) in local dev where frontend and backend share a site.

Neither of these would have been caught by the unit tests or any of the mocked-API browser checks done earlier — they're specifically about the production network topology, which nothing before this phase had reason to model.
