# WheelBuddy — Complete Project Package

Real-time school bus tracking platform: Parent, Driver, and Admin portals.

## What's in this package

```
wheelbuddy/
├── docs/
│   ├── UX-UI-Design-Prompt.md   ← Full design brief (colors, type, pages, components)
│   └── Database-Schema.md       ← MongoDB collection schemas + ER diagram
├── backend/                      ← Node.js + Express + MongoDB + JWT + Socket.io API
└── frontend/                     ← React + Tailwind CSS app (all pages, mock data)
```

## Quick start

**Frontend (runs standalone with mock data — no backend needed to preview):**
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. Demo login: any email/password on the Login page logs you into that role's dashboard (Parent / Driver / Admin).

**Backend (needs a MongoDB connection to run):**
```bash
cd backend
npm install
cp .env.example .env   # add your MONGO_URI and JWT_SECRET
npm run dev
```

**Connecting them:** the frontend's `src/context/AuthContext.jsx` and page components use mock data (`src/data/mockData.js`) so the UI works immediately. Each place that would call the real API has a comment showing the exact `axios` call to swap in (e.g. `POST /api/auth/login`, `PATCH /api/buses/:id/location`). Live GPS and notifications are wired for Socket.io on the backend (`server.js`) — connect with `socket.io-client` on the frontend and join the `bus:<id>` / `user:<id>` rooms.

## What's real vs. mocked
- **Real, working code:** full Express API with JWT auth and role permissions, all Mongoose models, Socket.io events, the entire React UI (routing, dark/light mode, 3 languages, all pages).
- **Mocked for the demo:** the map (animated SVG marker — swap in `@react-google-maps/api` with your Google Maps key), and frontend data (swap mock data calls for the real API once MongoDB is running).

## Design & data reference
See `docs/UX-UI-Design-Prompt.md` for the full design system this UI was built from, and `docs/Database-Schema.md` for how the backend's collections relate.
"# wheelbuddy3dsite" 
