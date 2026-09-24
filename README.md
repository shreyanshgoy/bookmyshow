# 🎬 BookMyShow Clone - Full-Stack MERN Movie Ticket Booking Platform

An enterprise-grade, full-stack movie ticketing platform built with the **MERN** stack (MongoDB, Express.js, React 18, Node.js) featuring **real-time seat locking with Socket.io**, atomic concurrency handling to mathematically eliminate double-booking, JWT access/refresh token rotation, scannable QR e-tickets, and an administrative cinema operations console.

---

## 🌟 Key Features

### 1. 🛡️ Real-Time Seat Locking (Zero Double-Booking Guarantee)
- **Atomic Database Operations**: Prevents race conditions using compound unique MongoDB indexes (`showId` + `seatNumber`) and conditional atomic updates.
- **WebSocket Broadcasts**: Instant seat status propagation (`seat:locked`, `seat:released`, `seat:booked`) across all connected clients viewing that show.
- **10-Minute Hold Window**: When a user selects a seat, it is temporarily locked for 10 minutes with a live countdown timer.
- **Auto-Release Janitor**: Background interval checks and automatically releases expired reservations, instantly turning seats back to available for everyone.
- **Automated Stress Test**: Built-in test script (`npm run test:concurrency`) proves race condition safety by dispatching simultaneous conflicting lock attempts at the exact same millisecond.

### 2. 🔐 Authentication & Session Security
- **JWT Dual-Token Rotation**: Short-lived Access Tokens (15m) + Long-lived Refresh Tokens (7d).
- **Bcrypt Password Hashing**: Salt rounds for user security.
- **Role-Based Access Control**: Strict segregation between `user` and `admin`.
- **Password Reset Flow**: Cryptographic token generation and verification.
- **Rate Limiting**: Brute-force protection on authentication endpoints.

### 3. 🍿 Movies & Theaters Discovery
- **City-Aware Filtering**: Automatically displays shows and movies active in selected cities (Mumbai, Delhi-NCR, Bengaluru, Hyderabad, Chennai, Pune).
- **Curved Cinema Projection**: Visually stunning SVG theater screen projection with ambient lighting.
- **Tiered Seat Map**: Realistic cinema seating tiers (**Recliner**, **Premium**, **Gold**, **Silver**) with distinct color coding, walkways, and pricing.
- **Trailer Video Modal**: Integrated YouTube trailer previews.

### 4. 💳 Checkout, QR E-Tickets & Notifications
- **Itemized Checkout**: Ticket subtotal + standard convenience fee + 18% GST calculation.
- **Interactive Payment Simulator**: Supports UPI, Credit/Debit Cards, and Net Banking, plus a "Simulate Payment Failure" toggle to verify error recovery.
- **Scannable QR E-Ticket Pass**: Perforated cinema pass with dynamic QR code verification.
- **Automated Email Notifications**: Formatted HTML receipt sent via Nodemailer.
- **Booking Cancellation**: One-click cancellation with automated seat release broadcast and simulated refund.

### 5. 📊 Admin Management Console
- **Dashboard Analytics**: Total revenue, tickets sold, active movies/theaters, and top-grossing films chart.
- **Movie Catalog Manager**: Add, edit, and archive movie titles and trailers.
- **Theaters & Screens Network**: Manage cinema venues, cities, and tiered auditorium screens.
- **Showtime Scheduler**: Schedule shows with date, time, format (2D, 3D, IMAX), and tier prices.
- **User Directory**: View registered customers and toggle security suspensions.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18+ or v20+)
- **npm** (v9+)
- *MongoDB is optional*: If no local MongoDB is running, the server automatically boots an embedded in-memory MongoDB runner (`mongodb-memory-server`) with zero external installation hurdles!

### 1. Install Dependencies
Run the following from the root directory:
```bash
npm run install:all
```
*(Or navigate into `/server` and `/client` individually and run `npm install`)*

### 2. Seed Sample Database
Populate sample movies (*Dune: Part Two*, *Deadpool & Wolverine*, *Kalki 2898 AD*, *Interstellar*), theaters across top cities, auditorium screens, showtimes, and default users:
```bash
npm run seed
```

### 3. Launch Development Servers
Start both the Express API server (port 5000) and the Vite React frontend (port 5173) simultaneously:
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser!

---

## 🔑 Default Credentials

For quick testing, the login screen includes **one-click demo autofill buttons**:

| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | `admin@bookmyshow.com` | `admin123` | Full Admin Console & Customer Features |
| **Customer** | `user@bookmyshow.com` | `user123` | Customer Booking, Profile & Ticket History |

---

## 🧪 Testing Concurrency & Race Conditions

To verify that two users can never lock or book the exact same seat simultaneously:
```bash
npm run test:concurrency
```
This script fires two asynchronous requests targeted at the exact same seat at the exact same millisecond and verifies:
- Request 1: **200 OK / Locked**
- Request 2: **409 Conflict / Blocked**

---

## 📡 Real-Time WebSocket Events

| Event | Direction | Payload | Description |
|---|---|---|---|
| `show:join` | Client ➔ Server | `showId` | Joins the real-time show room |
| `show:leave` | Client ➔ Server | `showId` | Leaves the show room |
| `seat:locked` | Server ➔ Room | `{ seatNumber, tier, lockedBy, expiresAt }` | Broadcasts new temporary lock |
| `seat:released` | Server ➔ Room | `{ showId, seatNumber }` | Broadcasts seat release or timer expiration |
| `seat:booked` | Server ➔ Room | `{ showId, seats }` | Broadcasts permanent ticket booking |

---

## 📁 Project Structure

```
movie-booking-platform/
├── package.json               # Root orchestrator
├── README.md                  # System documentation
├── server/
│   ├── .env                   # Configuration & secrets
│   ├── src/
│   │   ├── config/            # db.js, socket.js
│   │   ├── controllers/       # auth, movie, theater, show, seat, booking, admin
│   │   ├── middleware/        # auth, roleCheck, rateLimiter, errorHandler
│   │   ├── models/            # User, Movie, Theater, Screen, Show, SeatLock, Booking
│   │   ├── routes/            # REST API endpoints
│   │   ├── services/          # seatLockService, emailService, qrService
│   │   ├── utils/             # seedData.js, seed.js, tokens.js
│   │   └── server.js          # Server bootstrap
│   └── test-concurrency.js    # Automated race-condition test
└── client/
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── components/        # Navbar, Footer, SeatMap, TicketCard, Timer, etc.
        ├── context/           # AuthContext, SocketContext
        ├── pages/             # Home, MovieDetails, SeatSelection, Checkout, Confirmation, Admin
        └── services/          # api.js, socket.js
```

---

## 📜 License
ISC License. Built for modern cinema ticketing experiences.
