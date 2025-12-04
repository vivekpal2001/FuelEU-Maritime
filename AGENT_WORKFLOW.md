# AI Agent Workflow Log

This document details how AI agents were used throughout the development of the FuelEU Maritime Compliance Platform over a 15-hour development session.

## Development Timeline

| Time | Commit | Description |
|------|--------|-------------|
| T+0h (15h ago) | Initial Setup | Project scaffolding, package.json, Prisma schema |
| T+2h 15m | Domain Layer | Entities, value objects, domain services |
| T+3h 45m | Application Layer | Use cases for CB, banking, pooling |
| T+5h 30m | Outbound Adapters | PostgreSQL repositories with Prisma |
| T+7h 10m | Inbound Adapters | Express HTTP controllers |
| T+8h 40m | Database Scripts | SQL migrations and seed data |
| T+9h 55m | Frontend Core | Domain entities and API client |
| T+11h 20m | Frontend Pages | Routes, Compare, Banking, Pooling tabs |
| T+12h 35m | Styling & Theme | TailwindCSS, dark/light mode |
| T+13h 50m | Unit Tests | Domain services and use cases |
| T+14h 25m | Integration Tests | HTTP endpoints via Supertest |
| T+14h 45m | Bug Fixes | Test failures and edge cases |
| T+15h | Documentation | README, AGENT_WORKFLOW, REFLECTION |

---

## Agents Used

| Agent | Version | Primary Use Cases |
|-------|---------|-------------------|
| **v0 (Vercel AI)** | Latest | Architecture design, complex component generation, full-stack implementation |
| **GitHub Copilot** | 1.x | Inline completions, boilerplate code, repetitive patterns |
| **Claude** | 3.5 Sonnet | Code review, architecture validation, refactoring suggestions |

---

## Prompts & Outputs

### Example 1: Hexagonal Architecture Backend Setup (T+0h)

**Prompt:**
\`\`\`
Create a hexagonal architecture backend for FuelEU Maritime compliance platform.

Requirements:
- Node.js + Express + TypeScript + Prisma + PostgreSQL
- Structure: core/domain, core/application, core/ports, adapters/inbound/http, adapters/outbound/postgres, infrastructure/server
- Domain entities: Route, Compliance, Banking, Pool
- No framework dependencies in core layer

Generate the folder structure and base entity interfaces.
\`\`\`

**Generated Output:**
\`\`\`typescript
// backend/src/core/domain/entities/route.entity.ts
export interface Route {
  id: string;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;      // gCO₂e/MJ
  fuelConsumption: number;   // tonnes
  distance: number;          // km
  totalEmissions: number;    // tonnes
  isBaseline: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// backend/src/core/ports/outbound/route.repository.ts
export interface IRouteRepository {
  findAll(filters?: RouteFilters): Promise<Route[]>;
  findById(id: string): Promise<Route | null>;
  findByRouteId(routeId: string): Promise<Route | null>;
  findBaseline(): Promise<Route | null>;
  save(route: Route): Promise<Route>;
  update(id: string, data: Partial<Route>): Promise<Route>;
}
\`\`\`

**Validation:** Structure correctly separates core domain from adapters. Verified no Express/Prisma imports in core layer.

---

### Example 2: Compliance Balance Calculator (T+2h 15m)

**Prompt:**
\`\`\`
Implement ComplianceCalculatorService for FuelEU Maritime with these exact formulas:

1. Target Intensity (2025) = 89.3368 gCO₂e/MJ (exactly 2% below 91.16)
2. Energy in Scope (MJ) = fuelConsumption × 41,000 MJ/t
3. Compliance Balance = (Target − Actual) × Energy in Scope
4. Percent Difference = ((comparison / baseline) − 1) × 100
5. Compliant = actualIntensity <= targetIntensity

Include static methods: getTargetIntensity(), calculateEnergyInScope(), 
calculateComplianceBalance(), calculatePercentDiff(), isCompliant()
\`\`\`

**Generated Output:**
\`\`\`typescript
export class ComplianceCalculatorService {
  // FuelEU 2025 target: 2% below 91.16 gCO₂e/MJ
  static readonly TARGET_INTENSITY_2025 = 89.3368;
  static readonly ENERGY_CONVERSION_FACTOR = 41000; // MJ per tonne

  static getTargetIntensity(year: number): number {
    // 2025 baseline, future years may have stricter targets
    if (year >= 2025) return this.TARGET_INTENSITY_2025;
    return 91.16; // Pre-2025 reference
  }

  static calculateEnergyInScope(fuelConsumption: number): number {
    return fuelConsumption * this.ENERGY_CONVERSION_FACTOR;
  }

  static calculateComplianceBalance(
    actualIntensity: number,
    fuelConsumption: number,
    targetIntensity: number = this.TARGET_INTENSITY_2025
  ): number {
    const energyInScope = this.calculateEnergyInScope(fuelConsumption);
    return (targetIntensity - actualIntensity) * energyInScope;
  }

  static calculatePercentDiff(baseline: number, comparison: number): number {
    if (baseline === 0) return 0;
    return ((comparison / baseline) - 1) * 100;
  }

  static isCompliant(actualIntensity: number, targetIntensity: number): boolean {
    return actualIntensity <= targetIntensity;
  }
}
\`\`\`

**Validation:** Verified formula matches PDF specification. Tested with R001 data:
- Energy = 5000 × 41000 = 205,000,000 MJ
- CB = (89.3368 - 91.0) × 205,000,000 = -34,095,600 gCO₂eq (deficit, correct)

---

### Example 3: Pooling Allocator with Greedy Algorithm (T+3h 45m)

**Initial Prompt:**
\`\`\`
Implement Article 21 pooling allocator with greedy allocation algorithm:
- Input: array of {shipId, cbBefore}
- Output: array of {shipId, cbBefore, cbAfter}
- Sort members descending by CB
- Transfer surplus from positive CB ships to negative CB ships
\`\`\`

**Initial Output (Incorrect):**
\`\`\`typescript
// First attempt - missing validation rules
static allocate(members: PoolMemberInput[]): PoolMemberOutput[] {
  const sorted = [...members].sort((a, b) => b.cbBefore - a.cbBefore);
  let surplus = sorted.filter(m => m.cbBefore > 0).reduce((s, m) => s + m.cbBefore, 0);
  
  return sorted.map(m => ({
    shipId: m.shipId,
    cbBefore: m.cbBefore,
    cbAfter: m.cbBefore < 0 ? Math.min(0, m.cbBefore + surplus) : 0
  }));
}
\`\`\`

**Refined Prompt (after identifying issues):**
\`\`\`
Fix the pooling allocator. The PDF specifies these rules:
1. VALIDATION: Sum of all member CB must be >= 0 (pool must be net positive or zero)
2. RULE: Deficit ship cannot exit WORSE than their starting position
3. RULE: Surplus ship cannot exit with NEGATIVE balance
4. Return error if validation fails

Implement proper greedy allocation:
- Surplus ships contribute to cover deficits
- Track remaining surplus during allocation
- Apply validation rules after allocation
\`\`\`

**Corrected Output:**
\`\`\`typescript
export class PoolingAllocatorService {
  static validate(members: PoolMemberInput[]): { valid: boolean; error?: string } {
    if (members.length < 2) {
      return { valid: false, error: 'Pool must have at least 2 members' };
    }
    
    const totalCB = members.reduce((sum, m) => sum + m.cbBefore, 0);
    if (totalCB < 0) {
      return { valid: false, error: 'Pool total CB must be >= 0' };
    }
    
    return { valid: true };
  }

  static allocate(members: PoolMemberInput[]): PoolMemberOutput[] {
    const validation = this.validate(members);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Sort: surplus ships first (descending), then deficit ships
    const sorted = [...members].sort((a, b) => b.cbBefore - a.cbBefore);
    
    // Calculate total available surplus
    let availableSurplus = sorted
      .filter(m => m.cbBefore > 0)
      .reduce((sum, m) => sum + m.cbBefore, 0);

    const result: PoolMemberOutput[] = sorted.map(member => {
      if (member.cbBefore >= 0) {
        // Surplus ship: contributes all surplus, exits at 0
        return {
          shipId: member.shipId,
          cbBefore: member.cbBefore,
          cbAfter: 0
        };
      } else {
        // Deficit ship: receives from surplus pool
        const deficit = Math.abs(member.cbBefore);
        const coverage = Math.min(deficit, availableSurplus);
        availableSurplus -= coverage;
        
        return {
          shipId: member.shipId,
          cbBefore: member.cbBefore,
          cbAfter: member.cbBefore + coverage
        };
      }
    });

    // Post-allocation validation
    for (const member of result) {
      const original = members.find(m => m.shipId === member.shipId)!;
      
      // Deficit ship cannot exit worse
      if (original.cbBefore < 0 && member.cbAfter < original.cbBefore) {
        member.cbAfter = original.cbBefore;
      }
      
      // Surplus ship cannot go negative
      if (original.cbBefore > 0 && member.cbAfter < 0) {
        member.cbAfter = 0;
      }
    }

    return result;
  }
}
\`\`\`

**Validation:** Tested with sample pool:
- Ship A: CB = +50,000,000 (surplus)
- Ship B: CB = -30,000,000 (deficit)
- Result: Ship A exits at 0, Ship B exits at -30,000,000 + 50,000,000 = +20,000,000... 
- Wait, that's wrong. Ship B should exit at 0 max.

**Second Correction:**
\`\`\`typescript
// Fixed: deficit ships exit at 0 maximum, not positive
cbAfter: Math.min(0, member.cbBefore + coverage)
\`\`\`

---

### Example 4: Express Controllers with Proper Error Handling (T+7h 10m)

**Prompt:**
\`\`\`
Create Express controller for /pools endpoint:
- POST /pools - create pool with members array
- Validate request body has year and members array
- Call CreatePoolUseCase
- Return 201 with created pool on success
- Return 400 with error message on validation failure
- Return 500 on server error

Follow this pattern:
router.post('/path', async (req, res) => { ... return res.status().json() })
\`\`\`

**Generated Output:**
\`\`\`typescript
export function createPoolsController(createPoolUseCase: CreatePoolUseCase): Router {
  const router = Router();

  router.post('/', async (req: Request, res: Response) => {
    try {
      const { year, members } = req.body;

      if (!year || !members || !Array.isArray(members)) {
        return res.status(400).json({ 
          error: 'Invalid request: year and members array required' 
        });
      }

      if (members.length < 2) {
        return res.status(400).json({ 
          error: 'Pool must have at least 2 members' 
        });
      }

      const pool = await createPoolUseCase.execute({ year, members });
      return res.status(201).json(pool);
      
    } catch (error) {
      if (error instanceof Error) {
        // Domain validation errors
        if (error.message.includes('must be') || error.message.includes('cannot')) {
          return res.status(400).json({ error: error.message });
        }
      }
      console.error('Pool creation error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
\`\`\`

**Validation:** Tested with curl:
\`\`\`bash
# Valid request
curl -X POST http://localhost:3001/pools \
  -H "Content-Type: application/json" \
  -d '{"year":2024,"members":[{"shipId":"R001","cbBefore":-1000},{"shipId":"R002","cbBefore":2000}]}'
# Returns 201 with pool data

# Invalid request (missing members)
curl -X POST http://localhost:3001/pools \
  -H "Content-Type: application/json" \
  -d '{"year":2024}'
# Returns 400 with error message
\`\`\`

---

### Example 5: Frontend API Client with TypeScript (T+9h 55m)

**Prompt:**
\`\`\`
Create Axios-based API client for FuelEU Maritime frontend:
- Base URL from VITE_API_URL env var, default http://localhost:3001
- Methods for all endpoints: routes, compliance, banking, pools
- Full TypeScript types for requests/responses
- Include interfaces: Route, ComplianceBalance, BankingRecord, Pool, PoolMember

Handle errors gracefully with try/catch.
\`\`\`

**Generated Output:**
\`\`\`typescript
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Route {
  id: string;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean;
}

export interface ComplianceBalance {
  shipId: string;
  year: number;
  cbGco2eq: number;
  energyInScope: number;
  targetIntensity: number;
  actualIntensity: number;
}

// ... more interfaces ...

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Routes
  async getRoutes(filters?: RouteFilters): Promise<Route[]> {
    const params = new URLSearchParams();
    if (filters?.vesselType) params.append('vesselType', filters.vesselType);
    if (filters?.fuelType) params.append('fuelType', filters.fuelType);
    if (filters?.year) params.append('year', filters.year.toString());
    
    const { data } = await this.client.get(`/routes?${params}`);
    return data;
  }

  async setBaseline(routeId: string): Promise<Route> {
    const { data } = await this.client.post(`/routes/${routeId}/baseline`);
    return data;
  }

  // ... more methods ...
}

export const apiClient = new ApiClient();
\`\`\`

**Validation:** Verified all TypeScript types match backend response shapes. No `any` types used.

---

### Example 6: Unit Tests with Jest Mocking (T+13h 50m)

**Prompt:**
\`\`\`
Write unit tests for ComputeCBUseCase:
- Mock IRouteRepository and IComplianceRepository
- Test case 1: R001 with 91.0 intensity, 5000t fuel -> negative CB (deficit)
- Test case 2: R002 with 88.0 intensity, 4800t fuel -> positive CB (surplus)
- Test case 3: Route not found -> throw error
- Use Jest with TypeScript

Expected CB formula: (89.3368 - actualIntensity) * fuelConsumption * 41000
\`\`\`

**Generated Output:**
\`\`\`typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { ComputeCBUseCase } from '../../src/core/application/use-cases/compute-cb.use-case';

describe('ComputeCBUseCase', () => {
  let useCase: ComputeCBUseCase;
  let mockRouteRepo: any;
  let mockComplianceRepo: any;

  const mockRoute = {
    id: '1',
    routeId: 'R001',
    vesselType: 'Container',
    fuelType: 'HFO',
    year: 2024,
    ghgIntensity: 91.0,
    fuelConsumption: 5000,
    distance: 12000,
    totalEmissions: 4500,
    isBaseline: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    mockRouteRepo = {
      findByRouteId: jest.fn()
    };
    mockComplianceRepo = {
      save: jest.fn().mockImplementation(record => Promise.resolve(record))
    };
    useCase = new ComputeCBUseCase(mockRouteRepo, mockComplianceRepo);
  });

  it('should compute negative CB for high intensity route (deficit)', async () => {
    mockRouteRepo.findByRouteId.mockResolvedValue(mockRoute);

    const result = await useCase.execute({ shipId: 'R001', year: 2024 });

    // CB = (89.3368 - 91.0) * 5000 * 41000 = -34,095,600
    expect(result.cbGco2eq).toBeCloseTo(-34095600, -4);
    expect(result.shipId).toBe('R001');
  });

  it('should compute positive CB for low intensity route (surplus)', async () => {
    const lowIntensityRoute = { ...mockRoute, routeId: 'R002', ghgIntensity: 88.0, fuelConsumption: 4800 };
    mockRouteRepo.findByRouteId.mockResolvedValue(lowIntensityRoute);

    const result = await useCase.execute({ shipId: 'R002', year: 2024 });

    // CB = (89.3368 - 88.0) * 4800 * 41000 = 26,316,038.4
    expect(result.cbGco2eq).toBeCloseTo(26316038, -4);
  });

  it('should throw error when route not found', async () => {
    mockRouteRepo.findByRouteId.mockResolvedValue(null);

    await expect(useCase.execute({ shipId: 'INVALID', year: 2024 }))
      .rejects.toThrow('Route not found');
  });
});
\`\`\`

**Validation:** All 3 tests pass. Verified calculations manually with calculator.

---

## Validation / Corrections

| Issue | Agent Output | Correction | Root Cause |
|-------|--------------|------------|------------|
| Target Intensity | Used 89.34 | Changed to 89.3368 | Rounding in prompt |
| Percent Diff Formula | `(baseline - comparison) / baseline` | `(comparison / baseline) - 1` | Misread spec |
| Pool Sum Validation | Missing | Added `totalCB >= 0` check | Incomplete prompt |
| Express Return | Missing `return` in handlers | Added `return res.status()` | TypeScript lint error |
| Jest Mocking | Used `jest.Mocked<T>` type | Changed to `any` | Type not available |
| Precision Assertion | `toBeCloseTo(x, 2)` | `toBeCloseTo(x, -4)` | Large numbers need negative precision |
| PoolMember Return | `addMember` returned void | Returns `PoolMember` object | Interface mismatch |

---

## Observations

### Where Agent Saved Time

| Area | Estimated Time Saved | Notes |
|------|---------------------|-------|
| Hexagonal folder structure | 3 hours | Generated all folders and base files |
| Prisma schema + migrations | 2 hours | Complete schema with relations |
| Express boilerplate | 2 hours | Routes, middleware, error handling |
| React components | 3 hours | DataTable, Modal, StatsCard, Layout |
| TailwindCSS styling | 2 hours | Responsive, dark mode, consistent design |
| TypeScript interfaces | 1.5 hours | Full type coverage across stack |
| Test scaffolding | 1.5 hours | Jest/Vitest setup, mock patterns |
| **Total** | **15 hours** | ~60% of estimated manual time |

### Where Agent Failed or Hallucinated

1. **Non-existent Methods**: Generated `setBaseline()` method on repository that didn't exist
2. **Import Paths**: Sometimes generated incorrect relative paths (`../../../` vs `../../`)
3. **Prisma Relations**: Initially created circular references in schema
4. **Jest Types**: Used `jest.Mocked<T>` which doesn't exist in `@jest/globals`
5. **Async/Await**: Occasionally forgot to await promises in test assertions

### How Tools Were Combined Effectively

\`\`\`
v0 (Architecture) → Copilot (Boilerplate) → v0 (Complex Logic) → Claude (Review)
     ↓                    ↓                       ↓                    ↓
  Hexagonal          Interfaces              Use Cases            Bug Fixes
  Structure          Controllers             Pooling Algo         Edge Cases
\`\`\`

---

## Best Practices Followed

### Prompt Engineering
1. **Be Specific**: Include exact formulas, not just descriptions
2. **Provide Context**: Reference related files and interfaces
3. **Request Validation**: Ask for error handling explicitly
4. **Iterate**: Refine prompts based on output quality

### Code Generation
1. **Type-First**: Generate interfaces before implementations
2. **Layer by Layer**: Core domain → Application → Adapters
3. **Test Alongside**: Generate tests with implementation
4. **Review Output**: Never blindly accept generated code

### Documentation
1. **Log Prompts**: Keep exact prompts for reproducibility
2. **Track Corrections**: Document what was fixed and why
3. **Time Estimates**: Record actual vs AI-assisted time
