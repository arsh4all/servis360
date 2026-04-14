# 3A Services — Production MVP

A full-stack service marketplace platform for Mauritius.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 (App Router), Tailwind CSS |
| Backend | Next.js API Routes |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (access + refresh tokens) + HTTP-only cookies |
| Validation | Zod |
| Forms | React Hook Form + @hookform/resolvers |

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
# Edit .env with your PostgreSQL DATABASE_URL
```

### 3. Set up database

```bash
# Create the database, run migrations
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed with sample data
npm run db:seed
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@3aservices.mu | Admin@3A2024 |
| Customer | jean.paul@example.mu | Customer@123 |
| Worker | amina.rashid@worker.mu | Worker@123 |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, Register pages
│   ├── (main)/          # Public-facing pages (Homepage, Services, Workers, Booking, Dashboard)
│   ├── admin/           # Admin dashboard (admin-only)
│   ├── worker/          # Worker dashboard (worker-only)
│   └── api/             # All API routes
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Navbar, Footer
│   └── home/            # Homepage sections
├── lib/                 # prisma, jwt, auth, utils
├── types/               # TypeScript types
└── middleware.ts         # Route protection + RBAC
prisma/
├── schema.prisma         # Full DB schema
└── seed.ts              # Seed data
```

---

## Key Features

- **Two-sided marketplace** — Customers book, Workers fulfill
- **JWT + refresh token** authentication with secure HTTP-only cookies
- **Role-based access** — Customer / Worker / Admin routes
- **Admin approval flow** — Workers require admin approval
- **Booking lifecycle** — PENDING → ACCEPTED → COMPLETED
- **Review system** — Customers review after completed bookings
- **Platform commission** — 10% fee automatically calculated
- **Premium subscription** — Rs 100/month for workers (featured placement)
- **Privacy-first** — Worker contact info never exposed to customers

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| POST | /api/auth/refresh | Refresh access token |
| GET | /api/auth/me | Get current user |
| GET | /api/services | List all services |
| GET | /api/workers | List/search workers |
| GET | /api/workers/:id | Worker public profile |
| GET | /api/bookings | List user's bookings |
| POST | /api/bookings | Create booking |
| GET | /api/bookings/:id | Get single booking |
| PATCH | /api/bookings/:id | Update booking status |
| POST | /api/reviews | Submit review |
| GET | /api/admin/stats | Admin dashboard stats |
| GET | /api/admin/workers | Admin: list workers |
| PATCH | /api/admin/workers/:id/approve | Approve/reject worker |
| GET | /api/admin/users | Admin: list users |
| GET | /api/worker/stats | Worker earnings stats |
| PATCH | /api/worker/profile | Update worker profile |
