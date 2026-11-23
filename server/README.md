# SalonBook Server

REST API for **SalonBook**, a salon appointment booking platform. Customers browse services, request appointments and pay through Stripe. The admin manages services, appointments, users and transactions.

## Important Features
- JWT verification middleware (tokens issued by Better Auth, verified with its public JWKS)
- Server-side role verification (admin / customer) and blocked-user check on every protected route
- Services CRUD with search, category filter and price sorting
- Appointment booking with time-slot conflict prevention
- Stripe Checkout; payment status is updated ONLY by a verified Stripe webhook
- Image upload to ImgBB
- Admin stats, users, transactions

## Technology Stack
Node.js, Express.js 5, MongoDB (native driver), jose (JWT), Stripe, Multer, ImgBB

## Installation
```bash
npm install
cp .env.example .env   # then fill in the values
```

## How to Run Locally
```bash
npm run dev            # http://localhost:5000
npm run seed           # optional: adds sample services
npm run make-admin -- admin@example.com   # after that email has signed up on the website
```
Stripe webhook locally: `stripe listen --forward-to localhost:5000/api/payments/webhook`

## Required Environment Variables (names only)
`PORT`, `MONGODB_URI`, `MONGODB_DB`, `CLIENT_URL`, `AUTH_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `IMGBB_API_KEY`

## Links
- Live Website: _add your link_
- Client Repository: _add your link_
- Server Repository: _add your link_
