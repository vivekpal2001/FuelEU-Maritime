import { describe, it, expect } from "vitest"

interface PoolMember {
  shipId: string
  cbBefore: number
}

function validatePool(members: PoolMember[]): { valid: boolean; errors: string[]; totalCB: number } {
  const errors: string[] = []
  const totalCB = members.reduce((sum, m) => sum + m.cbBefore, 0)

  if (totalCB < 0) {
    errors.push(`Total pool CB is negative (${totalCB.toFixed(2)}). Pool sum must be >= 0.`)
  }

  if (members.length === 0) {
    errors.push("Pool must have at least one member.")
  }

  return {
    valid: errors.length === 0,
    errors,
    totalCB,
  }
}

describe("Frontend Pooling Validator", () => {
  it("should validate pool with positive total CB", () => {
    const members = [
      { shipId: "SHIP1", cbBefore: 1000 },
      { shipId: "SHIP2", cbBefore: -500 },
    ]
    const result = validatePool(members)
    expect(result.valid).toBe(true)
    expect(result.totalCB).toBe(500)
  })

  it("should reject pool with negative total CB", () => {
    const members = [
      { shipId: "SHIP1", cbBefore: 100 },
      { shipId: "SHIP2", cbBefore: -500 },
    ]
    const result = validatePool(members)
    expect(result.valid).toBe(false)
    expect(result.totalCB).toBe(-400)
  })

  it("should reject empty pool", () => {
    const result = validatePool([])
    expect(result.valid).toBe(false)
    expect(result.errors).toContain("Pool must have at least one member.")
  })

  it("should accept pool with exactly zero total CB", () => {
    const members = [
      { shipId: "SHIP1", cbBefore: 500 },
      { shipId: "SHIP2", cbBefore: -500 },
    ]
    const result = validatePool(members)
    expect(result.valid).toBe(true)
    expect(result.totalCB).toBe(0)
  })
})
