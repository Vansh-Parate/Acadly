# PixxelHack Round 2 – React + Vite + Express + Prisma

This repository contains two apps:

- `react-mentornow/` – React (Vite) frontend
- `server/` – Express backend with Prisma (PostgreSQL/Neon)

## Getting Started

1) Environment
- Copy `.env.example` from repo root → `server/.env` and fill values
- Create `react-mentornow/.env` with: `VITE_API_BASE=http://localhost:3001`

2) Install deps (from repo root)
```
npm install
```

3) Run both apps concurrently
```
npm run dev
```
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Environment Variables

Backend (`server/.env`):
- `DATABASE_URL` (Neon/Postgres URL; quote if it contains `&` or `?`)
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL` (e.g. `http://localhost:3001/auth/google/callback`)
- `CORS_ORIGIN` (e.g. `http://localhost:5173`)

Frontend (`react-mentornow/.env`):
- `VITE_API_BASE` (backend URL)

## Scripts
- `npm run dev` – run backend and frontend together
- `npm run build` – build both
- `npm start` – start backend + preview frontend build
