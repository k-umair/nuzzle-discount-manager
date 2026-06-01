# Nuzzle Discount Code Manager

A small internal tool to create, track, and analyse promotional discount codes.

Built with **NestJS + TypeScript** (backend) and **Vite + React + TypeScript** (frontend).

---

## Running Locally

You need Node.js 18+ installed.

**Terminal 1 — Backend** (runs on `http://localhost:3000`)
```bash
cd backend
npm install
npm run start:dev
```

**Terminal 2 — Frontend** (runs on `http://localhost:5173`)
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Features

- **Create discount codes** with code string, type (percentage/fixed), value, expiry date, usage limit, and campaign label
- **List all codes** with live status (`active`, `expired`, `exhausted`) and redemption count
- **Redeem a code** directly from the list — UI updates without a full page reload
- **Usage summary** panel showing per-campaign aggregate stats (total codes, redemptions, active count)
- Redemption rejects expired codes (`400 "Code is expired"`) and exhausted codes (`400 "Usage limit reached"`)

---

## Architecture Decisions & Trade-offs

### In-memory store
Data is stored in a `Map` inside the NestJS service. This means data resets when the server restarts, which is fine for a take-home assessment. To add persistence, swap the `Map` for a TypeORM or Prisma repository — the service's public interface doesn't need to change.

### Single `codes` module
All discount code logic lives in one NestJS module (`CodesModule`). At this scale, splitting it further would be over-engineering. If the domain grew (e.g. separate redemption events, audit log), the redemption and summary logic would be natural candidates to extract.

### No external state management on the frontend
`App.tsx` holds `codes[]` and `campaigns[]` state and passes a `refresh()` callback to children. After any mutation, `refresh()` re-fetches both endpoints in parallel. React's built-in hooks are sufficient for a single-page tool of this size — Redux or Zustand would be premature.

### Route ordering in NestJS
`GET /codes/summary` is declared before `GET /codes/:id` in the controller. NestJS matches routes in declaration order, so without this ordering, the string `"summary"` would be interpreted as an `id` parameter.

### No tests
Skipped per project scope decision. If adding them, the priority would be unit tests on `CodesService.redeem()` covering the expired, exhausted, and success paths.

---

## Project Structure

```
nuzzle_take_home/
├── backend/
│   ├── src/
│   │   ├── main.ts                  # bootstrap, CORS config
│   │   ├── app.module.ts
│   │   └── codes/
│   │       ├── codes.module.ts
│   │       ├── codes.controller.ts  # REST endpoints
│   │       ├── codes.service.ts     # business logic + in-memory store
│   │       ├── dto/
│   │       │   └── create-code.dto.ts
│   │       └── interfaces/
│   │           └── discount-code.interface.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx                  # state + layout
│   │   ├── api/codes.ts             # all fetch calls
│   │   ├── components/
│   │   │   ├── CreateCodeForm.tsx
│   │   │   ├── CodeList.tsx
│   │   │   └── UsageSummary.tsx
│   │   └── types/index.ts
│   ├── index.html
│   ├── package.json
│   └── tsconfig.json
├── CLAUDE.md
└── README.md
```
