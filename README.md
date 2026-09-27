# FLYXO — Movies & Spiritual Event Booking Platform

FLYXO is a full-stack web application that combines **movie ticket booking** with **spiritual and cultural event booking** — Jagran, Ramleela, Bhagwat Katha, Temple events, Satsang, Concerts, and more.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Node](https://img.shields.io/badge/Node.js-Express-green) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-blue) ![Razorpay](https://img.shields.io/badge/Razorpay-Payments-purple)

## Features

- **User Authentication** — JWT, bcrypt, roles (User, Organizer, Admin)
- **Event Discovery** — Search, filters, trending, spiritual & movie sections
- **Interactive Seat Booking** — Real-time seat map with availability
- **Razorpay Payments** — Tickets + optional temple donations
- **QR Digital Tickets** — Downloadable after booking
- **Organizer Dashboard** — Create events, analytics, manage bookings
- **Admin Dashboard** — User management, event approval, platform analytics
- **Wishlist, Reviews, Notifications, Email confirmations**
- **Dark/Light theme**, glassmorphism UI, responsive design

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Tailwind CSS, Axios, React Router, Framer Motion |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| Payments | Razorpay |

## Project Structure

```
FLYXO_APPLICATION/
├── backend/
│   ├── prisma/          # Schema & seed
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── config/
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        ├── layouts/
        ├── services/
        ├── context/
        └── hooks/
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Razorpay test account ([dashboard.razorpay.com](https://dashboard.razorpay.com))

## Setup

### 1. Database

Create a PostgreSQL database:

```sql
CREATE DATABASE flyxo_db;
```

### 2. Backend

```bash
cd backend
cp .env.example .env
```

**Important:** Edit `backend/.env` and set your real PostgreSQL password in `DATABASE_URL`:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/flyxo_db?schema=public"
```

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

When backend starts you should see `✅ Database connected`. If login shows errors, check http://localhost:5000/api/health — `database` must be `"connected"`.

API runs at **http://localhost:5000**

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL and VITE_RAZORPAY_KEY_ID

npm install
npm run dev
```

App runs at **http://localhost:5173**

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `RAZORPAY_KEY_ID` | Razorpay API key |
| `RAZORPAY_KEY_SECRET` | Razorpay secret |
| `FRONTEND_URL` | CORS origin (http://localhost:5173) |
| `SMTP_*` | Optional email notifications |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |
| `VITE_RAZORPAY_KEY_ID` | Razorpay public key |
| `VITE_GOOGLE_MAPS_API_KEY` | Optional maps integration |

## Demo Accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@flyxo.com | admin123 |
| User | user@flyxo.com | user123 |
| Organizer | organizer@flyxo.com | organizer123 |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/events` | List events (paginated) |
| GET | `/api/events/trending` | Trending events |
| POST | `/api/bookings/order` | Create booking + payment order |
| POST | `/api/bookings/verify` | Verify Razorpay payment |
| GET | `/api/admin/stats` | Admin analytics |

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure production PostgreSQL & Razorpay live keys
4. Build frontend: `npm run build`
5. Serve frontend static files or deploy separately
6. Enable HTTPS for secure payments

## License

MIT — Built for educational and production use.
