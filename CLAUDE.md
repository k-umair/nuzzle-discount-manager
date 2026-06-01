# Nuzzle Discount Code Manager — CLAUDE.md

## Project Overview
Internal tool for creating, tracking, and analysing promotional discount codes.
Monorepo with separate backend (NestJS) and frontend (Vite + React), both in TypeScript.

## Architecture
- **Backend**: NestJS REST API on port `3000`. In-memory store (no database).
- **Frontend**: Vite + React SPA on port `5173`. Single page, no router.
- **Communication**: Frontend fetches from `http://localhost:3000`. CORS is configured for `http://localhost:5173`.

## Running Locally
```bash
# Terminal 1 — Backend
cd backend && npm install && npm run start:dev

# Terminal 2 — Frontend
cd frontend && npm install && npm run dev
```

## Key Files

| File | Role |
|------|------|
| `backend/src/codes/codes.service.ts` | All business logic: create, list, redeem, summary |
| `backend/src/codes/codes.controller.ts` | REST endpoints — `/codes/summary` MUST stay above `/:id` |
| `backend/src/codes/interfaces/discount-code.interface.ts` | `DiscountCode` shape + `CodeStatus` type |
| `backend/src/codes/dto/create-code.dto.ts` | Input validation rules (class-validator) |
| `frontend/src/api/codes.ts` | All fetch calls — never fetch inline in components |
| `frontend/src/App.tsx` | Top-level state: `codes[]`, `campaigns[]`, `refresh()` callback |
| `frontend/src/components/` | `CreateCodeForm`, `CodeList`, `UsageSummary` |
| `frontend/src/types/index.ts` | Shared TypeScript types mirroring the backend interface |

## Data Model

```typescript
interface DiscountCode {
  id: string;                           // uuid, generated on create
  code: string;                         // uppercased, e.g. SUMMER20
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiryDate: string;                   // ISO date string, e.g. "2026-12-31"
  usageLimit: number;
  usageCount: number;                   // incremented on each successful redeem
  campaign: string;
  createdAt: string;
}

// Computed at read time — NOT stored
type CodeStatus = 'active' | 'expired' | 'exhausted';
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/codes` | Create a discount code |
| `GET` | `/codes` | List all codes with computed status |
| `GET` | `/codes/summary` | Campaign-level aggregate stats |
| `GET` | `/codes/:id` | Get one code's details |
| `POST` | `/codes/:id/redeem` | Redeem a code |

> **Important**: In `codes.controller.ts`, `GET /codes/summary` is declared before `GET /codes/:id`.
> Moving it below will cause NestJS to match `"summary"` as an `id` param.

## Redemption Rules (codes.service.ts `redeem()`)
- `new Date() > new Date(expiryDate)` → `400 "Code is expired"`
- `usageCount >= usageLimit` → `400 "Usage limit reached"`
- Otherwise → increment `usageCount`, return updated code with status

## State Flow (Frontend)
`App.tsx` holds all state. After any mutation (create or redeem), `refresh()` re-fetches
`GET /codes` and `GET /codes/summary` in parallel and pushes updated data down to children.
No external state library is used.

## Extending This Project

**Add persistence (replace in-memory store)**
Replace the `Map<string, DiscountCode>` in `CodesService` with a TypeORM or Prisma repository.
The service's public method signatures won't change — only the internal storage layer.

**Add authentication**
Add a NestJS `AuthGuard` at the `CodesModule` or controller level. No changes to route handlers needed.

**Add more fields to a discount code**
1. Update `discount-code.interface.ts`
2. Add the field to `create-code.dto.ts` with validation decorators
3. Update `CodesService.create()` to populate the new field
4. Mirror the type in `frontend/src/types/index.ts`

**Add frontend routing**
Install `react-router-dom` and wrap `App.tsx`. Each section (form, list, summary) can become
its own `<Route>`. The `api/codes.ts` functions and component props don't need to change.
