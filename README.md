# TrustLoop

Digital lending circles — transparent group savings with a real ledger and trust scoring.

> Full documentation (setup, API reference, deployment) lands in Phase 11. This is a working scaffold, actively in development.

## Stack

- **Client:** React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Query, Zustand, React Router
- **Server:** Node.js, Express, TypeScript, MongoDB (Mongoose)

## Local development

```bash
npm install

# terminal 1
npm run dev:server   # http://localhost:5000

# terminal 2
npm run dev:client   # http://localhost:5173
```

Copy `server/.env.example` to `server/.env` and fill in a MongoDB URI and JWT secrets before starting the server.
