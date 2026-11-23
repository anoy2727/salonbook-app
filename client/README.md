# SalonBook Client

**SalonBook** is a salon appointment booking platform built with Next.js. Customers explore services, request appointments and pay for confirmed ones through Stripe. The salon admin manages everything from a dashboard.

## Important Features
- Better Auth: email/password and Google sign-in, role-based redirects
- Public home and browse pages with search, category filter and price sorting
- Protected service details page with appointment booking (date + time slot)
- Customer dashboard: overview, my appointments (cancel, pay, details), profile
- Admin dashboard: overview, services (add / edit / delete / activate), appointments, users (block / unblock), transactions, profile
- Stripe Checkout, success and cancel pages
- Responsive design, toast notifications, loaders and confirmation dialogs

## Technology Stack
Next.js 14 (App Router), React 18, Tailwind CSS, Better Auth (JWT plugin), MongoDB, react-hot-toast

## Installation
```bash
npm install
cp .env.example .env.local   # then fill in the values
```

## How to Run Locally
```bash
npm run dev    # http://localhost:3000   (the server must be running on http://localhost:5000)
```

## Required Environment Variables (names only)
`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `MONGODB_URI`, `MONGODB_DB`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

## Links
- Live Website: _add your link_
- Client Repository: _add your link_
- Server Repository: _add your link_
