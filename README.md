# Auth2

A JavaScript authentication monorepo using Next.js, Tailwind CSS, Express, Argon2id, JWT, and HTTP-only cookies. This development version uses an in-memory store and does not require PostgreSQL, Prisma, Docker, or any database.

## Structure

- `Frontend/`: Next.js App Router UI.
- `Backend/`: Express REST API, authentication services, validators, middleware, and in-memory store.
- `Backend/src/config/store.js`: users, sessions, verification tokens, and reset tokens held in memory.

## Features

Registration, email verification, login, logout, remember me, refresh-token rotation, forgot/reset password, password change, profile editing, account deletion, Argon2id hashing, secure HTTP-only cookies, CORS, Helmet, rate limiting, validation, and safe API errors.

## Local setup

Requirements: Node.js 20+ and pnpm 9+ through Corepack.

1. Install dependencies: `corepack pnpm install`.
2. Start the application: `npm run dev`.
3. Open `http://localhost:3000`.

The default `EMAIL_PROVIDER=console` prints verification and reset links in the API terminal. Use SMTP variables in `.env` for real email delivery. No database setup or migration is needed.

## Commands

```bash
npm run dev
npm run build
npm run start
```

The legacy `db:*` scripts remain as harmless compatibility commands and only print that no database is configured.

## Authentication flow

Registration creates an Argon2id password hash and a random verification token. Only the SHA-256 token hash is held in memory. Login creates a short-lived access JWT and a longer-lived refresh session. Both are sent through HTTP-only cookies and are never accessible to frontend JavaScript.

The frontend sends requests with `credentials: include`. When an access token expires, it calls the refresh endpoint. The previous refresh session is revoked and replaced with a new hashed session. Remember me selects the longer configured refresh lifetime. Logout revokes the server-side session and clears cookies.

Password reset tokens are short-lived and single-use. Password reset and password change revoke active sessions. Account deletion verifies the password and explicit `DELETE` confirmation.

## Environment

Required values are JWT secrets, token durations, `FRONTEND_URL`, and email configuration. `DATABASE_URL` is no longer used. Generate long random JWT secrets for any shared or deployed environment.

## Important limitation

The in-memory store is suitable for local demos and development only. All users, sessions, verification tokens, and reset tokens disappear when the API restarts, and multiple API instances do not share state. For production persistence, a database-backed store must be restored before deployment.

## Deployment

The frontend can deploy to Vercel and the API can deploy to Render. Set `FRONTEND_URL` to the exact deployed frontend origin, configure the API environment variables, use HTTPS, and configure SMTP. Because state is in memory, deploy a single API instance for development/demo use and expect data loss on restart.
