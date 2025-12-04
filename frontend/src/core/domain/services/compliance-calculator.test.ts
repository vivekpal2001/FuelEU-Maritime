import { describe, it, expect } from "vitest"

// Frontend compliance calculator (mirrors backend logic for UI validation)
const TARGET_INTENSITY_2025 = 89.3368
const MJ_PER_TON = 41000

function getTargetIntensity(year: number): number {
  const targets: { [key: number]: number } = {
    2024: 89.3368,
    2025: 89.3368,
    2030: 80.0,
  }
  return targets[year] || TARGET_INTENSITY_2025
}

function calculateEnergyInScope(fuelConsumption: number): number {
  return fuelConsumption * MJ_PER_TON
}

function calculateComplianceBalance(
  actualIntensity: number,
  fuelConsumption: number,
  targetIntensity: number = TARGET_INTENSITY_2025,
): number {
  const energyInScope = calculateEnergyInScope(fuelConsumption)
  return (targetIntensity - actualIntensity) * energyInScope
}

function calculatePercentDiff(comparisonIntensity: number, baselineIntensity: number): number {
  if (baselineIntensity === 0) return 0
  return (comparisonIntensity / baselineIntensity - 1) * 100
}

function isCompliant(ghgIntensity: number, year = 2025): boolean {
  const target = getTargetIntensity(year)
  return ghgIntensity <= target
}

describe("Frontend Compliance Calculator", () => {
  describe("getTargetIntensity", () => {
    it("should return 89.3368 for year 2025", () => {
      expect(getTargetIntensity(2025)).toBe(89.3368)
    })

    it("should return 89.3368 for year 2024", () => {
      expect(getTargetIntensity(2024)).toBe(89.3368)
    })
  })

  describe("calculateEnergyInScope", () => {
    it("should calculate energy as fuelConsumption * 41000", () => {
      expect(calculateEnergyInScope(5000)).toBe(205000000)
    })
  })

  describe("calculateComplianceBalance", () => {
    it("should calculate positive CB for low intensity (surplus)", () => {
      const cb = calculateComplianceBalance(88.0, 4800)
      expect(cb).toBeGreaterThan(0)
    })

    it("should calculate negative CB for high intensity (deficit)", () => {
      const cb = calculateComplianceBalance(93.5, 5100)
      expect(cb).toBeLessThan(0)
    })
  })

  describe("calculatePercentDiff", () => {
    it("should calculate percent difference correctly", () => {
      const percentDiff = calculatePercentDiff(88.0, 91.0)
      expect(percentDiff).toBeCloseTo(-3.2967, 2)
    })

    it("should return 0 when baseline is 0", () => {
      expect(calculatePercentDiff(88.0, 0)).toBe(0)
    })
  })

  describe("isCompliant", () => {
    it("should return true when intensity is below target", () => {
      expect(isCompliant(88.0)).toBe(true)
    })

    it("should return false when intensity exceeds target", () => {
      expect(isCompliant(93.5)).toBe(false)
    })
  })
})
