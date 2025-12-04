# Testing Guide - FuelEU Maritime

## Backend Testing

### Setup
\`\`\`bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
\`\`\`

### Run Tests
\`\`\`bash
# Run all tests with coverage
npm run test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Watch mode (re-run on file changes)
npm run test:watch
\`\`\`

### What's Tested

**Unit Tests:**
- `ComputeCBUseCase` - CB calculation logic
- `GetComparisonUseCase` - Route comparison
- `BankSurplusUseCase` - Banking surplus recording
- `ApplyBankedUseCase` - Applying banked surplus
- `CreatePoolUseCase` - Pool creation and member allocation
- `ComplianceCalculatorService` - Compliance calculations
- `PoolingAllocatorService` - Pool allocation logic

**Integration Tests:**
- `GET /routes` - Get all routes
- `GET /routes/:id` - Get route by ID
- `GET /compliance/cb` - Compute CB for ship
- `GET /compliance/adjusted-cb` - Get adjusted CB
- `GET /banking/records` - Get banking records
- `POST /banking/bank` - Bank surplus
- `POST /banking/apply` - Apply banked surplus
- `POST /pools` - Create pool
- `GET /pools` - Get all pools

---

## Frontend Testing

### Setup
\`\`\`bash
cd frontend
npm install
\`\`\`

### Run Tests
\`\`\`bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
\`\`\`

### What's Tested

**Unit Tests:**
- `api-client.test.ts` - API request handling and error management
- `compliance-calc.test.ts` - Compliance calculation formulas

### Test Files Location
- `src/__tests__/unit/` - Unit tests
- `src/__tests__/setup.ts` - Vitest setup configuration

---

## Running Both Suites

### Terminal 1 - Backend
\`\`\`bash
cd backend
npm run dev
# Runs on http://localhost:3001
\`\`\`

### Terminal 2 - Backend Tests
\`\`\`bash
cd backend
npm run test
\`\`\`

### Terminal 3 - Frontend Tests
\`\`\`bash
cd frontend
npm run test
\`\`\`

### Terminal 4 - Frontend Dev
\`\`\`bash
cd frontend
npm run dev
# Runs on http://localhost:5173
\`\`\`

---

## Troubleshooting

### Backend Tests Fail
1. Ensure PostgreSQL is running
2. Check `.env` has `DATABASE_URL` set correctly
3. Run `npm run prisma:migrate` to create tables
4. Clear Jest cache: `npm run test -- --clearCache`

### Frontend Tests Not Found
- Vitest looks in `src/**/*.test.ts` and `src/__tests__/**/*.test.ts`
- Tests must end with `.test.ts` or `.spec.ts`

### Database Connection Error
\`\`\`bash
# Reset database
rm -rf backend/prisma/dev.db
npm run prisma:migrate
npm run prisma:seed
\`\`\`

---

## CI/CD Integration

For GitHub Actions, use:
\`\`\`yaml
- name: Backend Tests
  run: cd backend && npm install && npm run test

- name: Frontend Tests
  run: cd frontend && npm install && npm run test
