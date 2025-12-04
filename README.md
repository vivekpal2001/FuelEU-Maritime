# FuelEU Maritime Compliance Platform

A full-stack web application implementing the FuelEU Maritime regulation for greenhouse gas (GHG) intensity monitoring, compliance balance tracking, banking (Article 20), and pooling (Article 21) mechanisms.

## Overview

This platform enables maritime fleet operators to:
- **Track Routes**: Monitor voyage data with GHG intensity calculations
- **Compare Performance**: Baseline comparison with compliance indicators
- **Bank Surplus**: Store positive compliance balance for future use
- **Pool Compliance**: Share compliance between vessels in a fleet

Built with **Hexagonal Architecture** (Ports & Adapters) for clean separation of concerns and maintainability.

---

## Screenshots

### Routes Dashboard
![Routes Dashboard](images/Screenshot%202025-12-04%20at%2010.48.11%20PM.png)

### Route Comparison
![Route Comparison](images/Screenshot%202025-12-04%20at%2010.48.23%20PM.png)

### Compliance Balance View
![Compliance Balance](images/Screenshot%202025-12-04%20at%2010.48.33%20PM.png)

### Banking Interface
![Banking Interface](images/Screenshot%202025-12-04%20at%2010.48.44%20PM.png)

### Pooling Management
![Pooling Management](images/Screenshot%202025-12-04%20at%2010.49.15%20PM.png)

### Performance Analytics
![Performance Analytics](images/Screenshot%202025-12-04%20at%2011.00.24%20PM.png)

---

## Architecture Summary

### Backend Structure (Node.js + Express + TypeScript + Prisma)

\`\`\`
backend/
├── src/
│   ├── core/                          # Business logic (framework-independent)
│   │   ├── domain/
│   │   │   ├── entities/              # Route, Compliance, Banking, Pool
│   │   │   └── services/              # ComplianceCalculator, PoolingAllocator
│   │   ├── application/
│   │   │   └── use-cases/             # ComputeCB, BankSurplus, CreatePool, etc.
│   │   └── ports/
│   │       ├── inbound/               # Use case interfaces
│   │       └── outbound/              # Repository interfaces
│   ├── adapters/
│   │   ├── inbound/http/              # Express controllers
│   │   └── outbound/postgres/         # Prisma repository implementations
│   └── infrastructure/
│       ├── db/                        # Database configuration
│       └── server/                    # Express app setup
├── prisma/
│   ├── schema.prisma                  # Database schema
│   └── seed.ts                        # Seed data (5 routes from KPIs)
├── tests/
│   ├── unit/                          # Use case and service tests
│   └── integration/                   # HTTP endpoint tests
└── package.json
\`\`\`

### Frontend Structure (React + TypeScript + TailwindCSS + Vite)

\`\`\`
frontend/
├── src/
│   ├── core/
│   │   ├── domain/                    # TypeScript entities
│   │   │   └── entities/              # Route, Compliance, Pool types
│   │   └── ports/                     # API interface definitions
│   ├── adapters/
│   │   ├── ui/
│   │   │   ├── components/            # Layout, shared components
│   │   │   └── pages/                 # Routes, Compare, Banking, Pooling
│   │   └── infrastructure/            # Axios API client
│   └── contexts/                      # Theme context
├── src/__tests__/                     # Vitest unit tests
└── package.json
\`\`\`

### Dependency Flow

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                        CORE                                  │
│  ┌─────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Domain    │  │   Application   │  │     Ports       │ │
│  │  Entities   │──│    Use Cases    │──│   Interfaces    │ │
│  │  Services   │  │                 │  │                 │ │
│  └─────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       ADAPTERS                               │
│  ┌─────────────────┐              ┌─────────────────────┐   │
│  │  Inbound (HTTP) │              │ Outbound (Postgres) │   │
│  │  Controllers    │              │    Repositories     │   │
│  └─────────────────┘              └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
\`\`\`

---

## Database Schema

| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `routes` | id, route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption, distance, total_emissions, is_baseline | Route voyage data |
| `ship_compliance` | id, ship_id, year, cb_gco2eq, energy_in_scope, target_intensity, actual_intensity | Computed CB snapshots |
| `bank_entries` | id, ship_id, year, amount_gco2eq, type (BANK/APPLY), created_at | Banking transactions |
| `pools` | id, name, year, total_balance, status, created_at | Pool registry |
| `pool_members` | id, pool_id, ship_id, cb_before, cb_after, share | Pool allocations |

---

## Setup & Run Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Docker)
- npm 9+

### 1. Database Setup

**Option A: Docker (Recommended)**
\`\`\`bash
docker run --name fueleu-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=fueleu_maritime \
  -p 5432:5432 \
  -d postgres:14
\`\`\`

**Option B: Local PostgreSQL**
\`\`\`bash
createdb fueleu_maritime
\`\`\`

### 2. Backend Setup

\`\`\`bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env if using different database credentials

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with KPIs data
npm run prisma:seed

# Start development server
npm run dev
\`\`\`

Backend runs at: `http://localhost:3001`

### 3. Frontend Setup

\`\`\`bash
cd frontend

# Install dependencies
npm install

# Configure environment (optional)
cp .env.example .env
# VITE_API_URL defaults to http://localhost:3001

# Start development server
npm run dev
\`\`\`

Frontend runs at: `http://localhost:5173`

### 4. Verify Installation

\`\`\`bash
# Health check
curl http://localhost:3001/health
# Expected: {"status":"ok","timestamp":"..."}

# Get routes
curl http://localhost:3001/routes
# Expected: Array of 5 routes (R001-R005)
\`\`\`

---

## API Endpoints

### Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/routes` | Get all routes (filters: ?vesselType, ?fuelType, ?year) |
| GET | `/routes/:id` | Get route by ID |
| POST | `/routes/:id/baseline` | Set route as baseline |
| GET | `/routes/comparison` | Get baseline vs other routes comparison |

### Compliance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/compliance/cb?shipId&year` | Compute and return compliance balance |
| GET | `/compliance/adjusted-cb?shipId&year` | Get CB adjusted for banking |

### Banking (Article 20)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/banking/records?shipId&year` | Get banking history |
| POST | `/banking/bank` | Bank positive CB surplus |
| POST | `/banking/apply` | Apply banked amount to deficit |

### Pools (Article 21)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pools` | Get all pools |
| GET | `/pools/:id` | Get pool by ID |
| POST | `/pools` | Create pool with members |

---

## Core Formulas

\`\`\`
Target Intensity (2025) = 89.3368 gCO₂e/MJ  (2% below 91.16)

Energy in Scope (MJ) = fuelConsumption × 41,000

Compliance Balance = (Target − Actual) × Energy in Scope
  • Positive CB = Surplus (compliant)
  • Negative CB = Deficit (non-compliant)

Percent Difference = ((comparison / baseline) − 1) × 100

Compliant = actualIntensity ≤ targetIntensity
\`\`\`

---

## How to Execute Tests

### Backend Tests

\`\`\`bash
cd backend

# Run all tests
npm run test

# Run with coverage
npm run test -- --coverage

# Run specific test file
npm run test -- tests/unit/compute-cb.use-case.test.ts
\`\`\`

### Frontend Tests

\`\`\`bash
cd frontend

# Run all tests
npm run test

# Run with UI
npm run test -- --ui
\`\`\`

### Test Coverage

| Area | Tests |
|------|-------|
| Unit - ComplianceCalculator | Target intensity, energy calculation, CB formula |
| Unit - PoolingAllocator | Validation, greedy allocation, edge cases |
| Unit - ComputeCB | Deficit route, surplus route, not found |
| Unit - BankSurplus | Valid banking, insufficient balance |
| Unit - CreatePool | Valid pool, invalid sum, member validation |
| Integration - /routes | GET all, GET filtered, POST baseline |
| Integration - /banking | GET records, POST bank, POST apply |
| Integration - /pools | POST create, validation errors |

---

## Sample Requests/Responses

### Get All Routes

\`\`\`bash
curl http://localhost:3001/routes
\`\`\`

**Response:**
\`\`\`json
[
  {
    "id": "uuid-1",
    "routeId": "R001",
    "vesselType": "Container",
    "fuelType": "HFO",
    "year": 2024,
    "ghgIntensity": 91.0,
    "fuelConsumption": 5000,
    "distance": 12000,
    "totalEmissions": 4500,
    "isBaseline": true
  },
  ...
]
\`\`\`

### Compute Compliance Balance

\`\`\`bash
curl "http://localhost:3001/compliance/cb?shipId=R001&year=2024"
\`\`\`

**Response:**
\`\`\`json
{
  "shipId": "R001",
  "year": 2024,
  "cbGco2eq": -34095600,
  "energyInScope": 205000000,
  "targetIntensity": 89.3368,
  "actualIntensity": 91.0,
  "status": "deficit"
}
\`\`\`

### Bank Surplus

\`\`\`bash
curl -X POST http://localhost:3001/banking/bank \
  -H "Content-Type: application/json" \
  -d '{"shipId": "R002", "year": 2024, "amount": 10000000}'
\`\`\`

**Response:**
\`\`\`json
{
  "id": "uuid",
  "shipId": "R002",
  "year": 2024,
  "amount": 10000000,
  "type": "BANK",
  "createdAt": "2024-01-15T10:30:00Z"
}
\`\`\`

### Create Pool

\`\`\`bash
curl -X POST http://localhost:3001/pools \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2024,
    "members": [
      {"shipId": "R001", "cbBefore": -34095600},
      {"shipId": "R002", "cbBefore": 26316038}
    ]
  }'
\`\`\`

**Response:**
\`\`\`json
{
  "id": "uuid",
  "year": 2024,
  "totalBalance": -7779562,
  "members": [
    {"shipId": "R002", "cbBefore": 26316038, "cbAfter": 0},
    {"shipId": "R001", "cbBefore": -34095600, "cbAfter": -7779562}
  ],
  "status": "INVALID"
}
\`\`\`

---

## KPIs Dataset

| routeId | vesselType | fuelType | year | ghgIntensity | fuelConsumption (t) | distance (km) | totalEmissions (t) |
|---------|------------|----------|------|--------------|---------------------|---------------|-------------------|
| R001 | Container | HFO | 2024 | 91.0 | 5000 | 12000 | 4500 |
| R002 | BulkCarrier | LNG | 2024 | 88.0 | 4800 | 11500 | 4200 |
| R003 | Tanker | MGO | 2024 | 93.5 | 5100 | 12500 | 4700 |
| R004 | RoRo | HFO | 2025 | 89.2 | 4900 | 11800 | 4300 |
| R005 | Container | LNG | 2025 | 90.5 | 4950 | 11900 | 4400 |

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | React 18 |
| Frontend Build | Vite |
| Styling | TailwindCSS |
| Charts | Recharts |
| Routing | React Router v6 |
| Backend Framework | Express |
| Language | TypeScript (strict mode) |
| ORM | Prisma |
| Database | PostgreSQL |
| Testing | Jest (backend), Vitest (frontend) |
| Architecture | Hexagonal (Ports & Adapters) |
