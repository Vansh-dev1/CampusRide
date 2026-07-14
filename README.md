# CampusRide 🚗

A full-stack ride-sharing platform built for students, letting them post, search, and book rides securely within their campus community. Built with the MERN stack (MongoDB, Express, React, Node.js) with real-time chat via Socket.IO.

## Features

- **University-restricted signup** — only email addresses on your configured university domain can register, verified via OTP email
- **Post & search rides** — riders list trips with route, time, seats, fare, and vehicle details; passengers search and filter by route, date, and seat availability
- **Secure booking flow** — book a seat, track payment status (offline/cash), and cancel bookings
- **Real-time chat** — in-app messaging per ride room powered by Socket.IO, so riders and passengers can coordinate without leaving the app
- **Ratings & reviews** — passengers can rate and review riders after a ride; average ratings update automatically
- **Profile management** — avatar upload (via Cloudinary), ride history, and stats (rides posted/taken)
- **JWT authentication** with protected routes on both client and server

## Tech Stack

**Frontend**
- React 18 + Vite
- React Router
- Axios
- Socket.IO Client
- React Hot Toast
- CSS Modules

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT (jsonwebtoken) for auth
- bcryptjs for password hashing
- Multer + Cloudinary for image uploads
- Nodemailer / Resend for OTP emails
- express-validator for request validation

## Project Structure

```
CampusRide/
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── components/     # Shared UI (Navbar, RideCard, ProtectedRoute, etc.)
│       ├── context/        # Auth & Socket context providers
│       ├── pages/          # Route-level pages (Dashboard, FindRide, Chat, etc.)
│       └── services/       # API client (Axios)
│
└── server/                 # Express backend
    ├── config/             # DB & Cloudinary config
    ├── controllers/        # Route handlers (auth, ride, booking, message, review, user)
    ├── middleware/         # Auth guard, university email validator
    ├── models/             # Mongoose schemas (User, Ride, Booking, Review, Message)
    ├── routes/              # Express routers
    ├── socket/              # Socket.IO event handlers
    └── utils/               # Mailer, helpers
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local install, or a MongoDB Atlas cluster)

### 1. Clone & install dependencies

```bash
git clone <your-repo-url>
cd CampusRide

cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables

The `server/.env` file already contains commented placeholders for every variable it needs — open it and fill in your own values (MongoDB URI, JWT secret, email credentials, etc.). Never commit this file with real secrets.

Key variables in `server/.env`:

| Variable | Description |
|---|---|
| `PORT` | Port the Express server runs on |
| `MONGO_URI` | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | Secret used to sign JWTs — generate a long random string |
| `JWT_EXPIRE` | Token expiry (e.g. `7d`) |
| `UNIVERSITY_EMAIL_DOMAIN` | Restricts signup to emails ending in this domain (e.g. `adit.ac.in`) |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASS` / `EMAIL_FROM` | SMTP config for sending OTP verification emails |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | For profile photo uploads (optional — app works without it) |
| `CLIENT_URL` | URL of the frontend, for CORS (default `http://localhost:5173`) |

### 3. Run the app

In separate terminals:

```bash
# Backend (from /server)
node index.js

# Frontend (from /client)
npm run dev
```

The client runs on `http://localhost:5173` and the server on the port set in `.env` (default `5001`).


## API Overview

All routes are prefixed with `/api`.

| Resource | Endpoints |
|---|---|
| **Auth** | `POST /auth/signup`, `POST /auth/verify-otp`, `POST /auth/resend-otp`, `POST /auth/login`, `GET /auth/me` |
| **Rides** | `GET /rides`, `POST /rides`, `GET /rides/:id`, `PATCH /rides/:id/status`, `DELETE /rides/:id`, `GET /rides/my/posted` |
| **Bookings** | `POST /bookings`, `GET /bookings/my`, `GET /bookings/ride/:rideId`, `PATCH /bookings/:id/mark-paid`, `PATCH /bookings/:id/cancel` |
| **Messages** | `GET /messages/:rideId`, `POST /messages/:rideId`, `GET /messages/unread-count` |
| **Reviews** | `POST /reviews`, `GET /reviews/user/:userId` |
| **Users** | `GET /users/:id`, `PATCH /users/profile`, `PATCH /users/avatar` |

Most routes require a valid JWT (sent via the `protect` middleware).

## License

See [LICENSE](./LICENSE) for details.