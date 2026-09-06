# SkyBook

SkyBook is a production-style full-stack flight booking platform. Travellers can search live inventory, choose seats, enter passenger details, pay, download e-tickets, and manage bookings. Administrators can manage flights, airports, airlines, aircraft, users, bookings, payments, and analytics.

This is not a frontend-only demo. Search, booking, seat assignment, fare calculation, payments, tickets, and admin CRUD all go through the Express API and MongoDB.

## Features

- Guest flight search with airport autocomplete, filters, sorting, and pagination
- Registered user booking flow: seats → passengers → review → payment → confirmation
- Interactive seat map with occupied-seat protection
- Backend fare calculation (the browser cannot set the price)
- Stripe test-mode payments, plus a documented development fallback when Stripe keys are missing
- PDF e-tickets with QR booking references
- Booking cancellation, seat release, and refunds
- User dashboard and profile management
- Admin dashboard with Recharts analytics and full CRUD
- JWT auth, HTTP-only cookies, role-based authorization
- Email service that never crashes the app if SMTP is not configured

## Tech stack

**Frontend:** React, Vite, JavaScript, Tailwind CSS, React Router, Axios, React Hook Form, Lucide React, Recharts, Stripe.js

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Helmet, CORS, rate limiting, Nodemailer, PDFKit, Stripe

## Architecture

```text
skybook/
  client/                 React SPA
  server/                 Express API
    src/config
    src/controllers
    src/middleware
    src/models
    src/routes
    src/services
    src/utils
    src/validators
    src/jobs
    src/seed
```

## Installation

```bash
cd skybook
npm install
npm install --prefix server
npm install --prefix client
copy .env.example .env
```

On macOS/Linux use `cp .env.example .env`.

## Environment variables

See `.env.example`. Required for a normal run:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_URL`

Optional:

- Stripe keys for card testing
- SMTP for real emails
- Cloudinary for image hosting

Never commit `.env`.

## Database setup

1. Install and start MongoDB locally (`net start MongoDB` if the Windows service exists), **or**
2. Start a user-owned instance:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-mongo.ps1
```

3. If MongoDB is still unreachable, the API starts an in-memory MongoDB for development (first run downloads a binary).

If the database is empty, the server seeds demo data on startup.

## Seed command

```bash
npm run seed
```

## Running the app

```bash
npm run dev
```

This starts both API and Vite client.

```bash
npm run server
npm run client
npm run build
```

- API: http://127.0.0.1:5000/api/health
- Web: http://localhost:5173

## Demo credentials

| Role  | Email               | Password     |
| ----- | ------------------- | ------------ |
| Admin | admin@skybook.dev   | Admin@12345  |
| User  | user@skybook.dev    | User@12345   |

Passwords come from `SEED_ADMIN_PASSWORD` and `SEED_USER_PASSWORD`. Change them in `.env` before any public deployment.

Suggested search after seeding: **ISB → DXB**, departure about 7 days from today, 1 passenger, economy.

## Stripe test setup

1. Create a Stripe test account.
2. Set `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY`.
3. Restart the server.
4. Pay with card `4242 4242 4242 4242`, any future expiry, any CVC.

If Stripe keys are absent, checkout still confirms the booking through the backend payment service so local development keeps working. That path is development-only and is labelled in the UI.

## Email

Without SMTP credentials, emails are logged instead of sent and the API continues running. Ticket PDFs can still be downloaded.

## Cloudinary

Avatar and airline logo uploads work without Cloudinary (inline data URLs). Configure Cloudinary to store files remotely.

## API overview

| Area     | Base path          |
| -------- | ------------------ |
| Auth     | `/api/auth`        |
| Users    | `/api/users`       |
| Flights  | `/api/flights`     |
| Airports | `/api/airports`    |
| Airlines | `/api/airlines`    |
| Aircraft | `/api/aircraft`    |
| Bookings | `/api/bookings`    |
| Payments | `/api/payments`    |
| Admin    | `/api/admin`       |

Responses use `{ success, message, data, errors }`.

## Deployment

1. Set production environment variables, including strong JWT secrets.
2. Point `MONGO_URI` at a managed MongoDB cluster.
3. Set `CLIENT_URL` to the deployed frontend origin.
4. Build the client with `npm run build` and serve `client/dist`.
5. Run `npm start --prefix server`.
6. Configure Stripe live/test keys and SMTP for the target environment.

## Screenshots

Add product screenshots here after first run:

- Home search
- Flight results
- Seat map
- Payment
- Admin dashboard

## Future improvements

- Multi-city itineraries
- Real-time flight status webhooks
- 3-D Secure / webhook-only payment confirmation
- Loyalty accounts and stored passengers
- Multi-currency pricing

## License

Private project unless you add a license.
