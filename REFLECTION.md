# Development Reflection

## What I Learned Using AI Agents

### The Power of Precise Specifications

The most significant learning was understanding how literal AI agents interpret prompts. When the FuelEU specification stated "89.3368 gCO₂e/MJ" as the target intensity, providing the exact value was critical. Initial outputs using "approximately 89.34" led to calculation errors that cascaded through the entire compliance system. This taught me that domain precision cannot be compromised when working with AI tools.

### Iterative Refinement Over One-Shot Perfection

The pooling allocator required three iterations to handle all edge cases correctly:

1. **First attempt**: Basic sorting and allocation without validation
2. **Second attempt**: Added pool sum validation (total CB >= 0)
3. **Third attempt**: Added post-allocation rules (deficit ships can't exit worse, surplus ships can't go negative)

Each iteration came from testing against specific scenarios. Trying to capture all requirements in a single prompt proved less effective than building incrementally with validation at each step.

### Architecture as Communication

Using hexagonal architecture wasn't just about code organization—it became a communication framework with the AI agent. Prompts referencing "core domain," "ports," and "adapters" produced more consistent outputs than generic requests. The agent understood these patterns and generated code that naturally fit the established structure.

---

## Efficiency Gains vs Manual Coding

### Quantitative Analysis

| Development Phase | Manual Estimate | With AI Agents | Time Saved |
|-------------------|-----------------|----------------|------------|
| Project Setup & Scaffolding | 4 hours | 0.5 hours | 87% |
| Domain Entities & Interfaces | 3 hours | 0.5 hours | 83% |
| Business Logic (Services) | 5 hours | 1.5 hours | 70% |
| Use Cases Implementation | 4 hours | 1 hour | 75% |
| Repository Layer | 3 hours | 0.5 hours | 83% |
| HTTP Controllers | 3 hours | 1 hour | 67% |
| Frontend Components | 6 hours | 2 hours | 67% |
| API Integration | 2 hours | 0.5 hours | 75% |
| Styling & Responsiveness | 4 hours | 1 hour | 75% |
| Unit Tests | 4 hours | 1.5 hours | 63% |
| Integration Tests | 3 hours | 1 hour | 67% |
| Documentation | 2 hours | 0.5 hours | 75% |
| **Total** | **43 hours** | **11.5 hours** | **73%** |

### Qualitative Benefits

1. **Consistency**: Generated code followed the same patterns throughout—naming conventions, error handling, type definitions all aligned without manual enforcement.

2. **Completeness**: Agent-generated components included edge cases I might have overlooked initially, such as null checks, loading states, and error boundaries.

3. **Learning Acceleration**: Seeing well-structured implementations helped me understand hexagonal architecture patterns better than reading documentation alone.

### Challenges Encountered

1. **Context Drift**: Long prompts sometimes caused the agent to forget earlier requirements, necessitating shorter, focused prompts with explicit references.

2. **Hallucinated APIs**: The agent occasionally generated calls to methods that didn't exist in libraries, requiring manual verification of all imports and method calls.

3. **Test Precision**: Floating-point assertions needed careful tuning—`toBeCloseTo(value, -4)` for large numbers like compliance balance calculations.

---

## Improvements I'd Make Next Time

### 1. Specification Document First

Before any code generation, I would create a structured specification document containing:

\`\`\`markdown
## Compliance Balance
- Formula: CB = (Target - Actual) × Energy
- Target (2025): 89.3368 gCO₂e/MJ (exactly 2% below 91.16)
- Energy: fuelConsumption × 41000 MJ/t
- Positive = Surplus, Negative = Deficit

## Banking Rules
- Can only bank positive CB
- Cannot apply more than banked amount
- 3-year expiration (not implemented in MVP)

## Pooling Rules
- Minimum 2 members
- Sum of CB must be >= 0
- Deficit ships cannot exit worse than start
- Surplus ships cannot exit negative
\`\`\`

This would serve as a single source of truth for all prompts and validation.

### 2. Test-First Development

Instead of writing tests after implementation, I would generate test cases first:

\`\`\`typescript
describe('CreatePoolUseCase', () => {
  it('should reject pool with total CB < 0');
  it('should not let deficit ship exit worse');
  it('should not let surplus ship go negative');
  it('should distribute surplus fairly via greedy allocation');
});
\`\`\`

This approach would have caught formula errors earlier and provided clear acceptance criteria for the AI-generated implementation.

### 3. Prompt Templates

Developing reusable prompt templates for common patterns:

\`\`\`
[USE CASE PROMPT TEMPLATE]
Create {UseCaseName} implementing {IUseCasePort}:
- Input: {InputDTO}
- Output: {OutputDTO}
- Dependencies: {Repository interfaces}
- Validation: {Business rules}
- Error cases: {Expected errors}
\`\`\`

### 4. Incremental Integration Testing

Rather than writing all integration tests at the end, I would test each endpoint immediately after implementation:

\`\`\`
Implement Controller → Write Integration Test → Verify → Move to Next
\`\`\`

This would prevent accumulation of bugs and reduce debugging time.

---

## Conclusion

AI agents transformed a 43-hour project into an 11.5-hour sprint while maintaining code quality and architectural integrity. The key success factors were:

1. **Precise prompts** with exact specifications from domain documents
2. **Iterative refinement** rather than expecting perfect first outputs
3. **Consistent architecture** that the agent could understand and extend
4. **Rigorous validation** of all generated code against business requirements

The 73% time savings is significant, but the real value lies in the ability to explore more solutions, test more edge cases, and produce more comprehensive documentation than would be feasible in manual development. AI agents are not replacements for engineering judgment—they are force multipliers that make good practices easier to implement consistently.

For future projects, I would invest more time upfront in specification documents and test case definitions, allowing the AI to generate implementation details while I focus on business logic correctness and system architecture.
