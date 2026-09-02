# WheelBuddy Backend

Node.js + Express + MongoDB (Mongoose) + JWT auth + Socket.io (real-time GPS/notifications).

## Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run dev            # requires nodemon; or `npm start`
```

Requires a running MongoDB instance (local `mongod`, or a MongoDB Atlas connection string in `MONGO_URI`).

## API Overview

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | /api/auth/signup | Public | Register parent/driver/admin |
| POST | /api/auth/login | Public | Login, returns JWT |
| GET | /api/auth/me | Auth | Current user |
| GET/POST/PUT/DELETE | /api/buses | Admin (write), all roles (read) | Bus CRUD |
| PATCH | /api/buses/:id/location | Driver | Live GPS ping (emits `locationUpdate`) |
| GET/POST/PUT/DELETE | /api/students | Admin (write) | Student CRUD |
| PATCH | /api/students/:id/attendance | Driver | Mark boarded/absent |
| GET/PUT/DELETE | /api/drivers | Admin | Driver management |
| PATCH | /api/drivers/:id/trip | Driver | Start/end trip |
| GET/POST/PUT/DELETE | /api/routes | Admin (write) | Route + stops |
| POST/GET/PUT | /api/schools | Mixed | School onboarding |
| GET/PATCH | /api/notifications | Auth | Notification inbox |
| POST/GET/PATCH | /api/sos | Driver (trigger), Admin (resolve/list) | Emergency alerts |

## Real-time (Socket.io)

Clients emit `joinBus`, `joinUser`, `joinSchool` with the relevant ID after connecting.
Server emits: `locationUpdate`, `attendanceUpdate`, `notification`, `sosAlert`.

## Auth

All protected routes require `Authorization: Bearer <token>`. Roles: `parent`, `driver`, `admin`, enforced via `middleware/auth.js` (`protect` + `authorize(...roles)`).
