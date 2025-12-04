import { ComplianceCalculatorService } from "../../src/core/domain/services/compliance-calculator.service"

describe("ComplianceCalculatorService", () => {
  describe("getTargetIntensity", () => {
    it("should return 89.3368 for year 2025", () => {
      const target = ComplianceCalculatorService.getTargetIntensity(2025)
      expect(target).toBe(89.3368)
    })

    it("should return 89.3368 for year 2024", () => {
      const target = ComplianceCalculatorService.getTargetIntensity(2024)
      expect(target).toBe(89.3368)
    })

    it("should return default target for unknown year", () => {
      const target = ComplianceCalculatorService.getTargetIntensity(2023)
      expect(target).toBe(89.3368)
    })

    it("should return 80.0 for year 2030", () => {
      const target = ComplianceCalculatorService.getTargetIntensity(2030)
      expect(target).toBe(80.0)
    })
  })

  describe("calculateEnergyInScope", () => {
    it("should calculate energy as fuelConsumption * 41000 MJ/t", () => {
      const energy = ComplianceCalculatorService.calculateEnergyInScope(5000)
      expect(energy).toBe(205000000) // 5000 * 41000
    })

    it("should return 0 for zero fuel consumption", () => {
      const energy = ComplianceCalculatorService.calculateEnergyInScope(0)
      expect(energy).toBe(0)
    })
  })

  describe("calculateComplianceBalance", () => {
    it("should calculate positive CB for low intensity (surplus)", () => {
      // Route R002: ghgIntensity=88.0, fuelConsumption=4800
      // CB = (89.3368 - 88.0) * (4800 * 41000)
      // CB = 1.3368 * 196800000 ≈ 263090240
      const cb = ComplianceCalculatorService.calculateComplianceBalance(88.0, 4800)
      expect(cb).toBeCloseTo(263090240, -3)
    })

    it("should calculate negative CB for high intensity (deficit)", () => {
      // Route R003: ghgIntensity=93.5, fuelConsumption=5100
      // CB = (89.3368 - 93.5) * (5100 * 41000)
      // CB = -4.1632 * 209100000 = -870505120 (negative = deficit)
      const cb = ComplianceCalculatorService.calculateComplianceBalance(93.5, 5100)
      expect(cb).toBeLessThan(0)
    })

    it("should return zero CB when intensity equals target", () => {
      const cb = ComplianceCalculatorService.calculateComplianceBalance(89.3368, 5000)
      expect(cb).toBeCloseTo(0, 0)
    })

    it("should use custom target intensity when provided", () => {
      const cb = ComplianceCalculatorService.calculateComplianceBalance(85.0, 1000, 90.0)
      // CB = (90 - 85) * (1000 * 41000) = 5 * 41000000 = 205000000
      expect(cb).toBe(205000000)
    })
  })

  describe("calculatePercentDiff", () => {
    it("should calculate percent difference correctly", () => {
      // percentDiff = ((comparison / baseline) - 1) * 100
      const percentDiff = ComplianceCalculatorService.calculatePercentDiff(88.0, 91.0)
      // (88/91 - 1) * 100 = -3.2967...
      expect(percentDiff).toBeCloseTo(-3.2967, 2)
    })

    it("should return positive diff when comparison > baseline", () => {
      const percentDiff = ComplianceCalculatorService.calculatePercentDiff(95.0, 91.0)
      expect(percentDiff).toBeGreaterThan(0)
    })

    it("should return 0 when baseline is 0", () => {
      const percentDiff = ComplianceCalculatorService.calculatePercentDiff(88.0, 0)
      expect(percentDiff).toBe(0)
    })

    it("should return 0 when comparison equals baseline", () => {
      const percentDiff = ComplianceCalculatorService.calculatePercentDiff(91.0, 91.0)
      expect(percentDiff).toBe(0)
    })
  })

  describe("isCompliant", () => {
    it("should return true when intensity is below target", () => {
      expect(ComplianceCalculatorService.isCompliant(88.0)).toBe(true)
    })

    it("should return true when intensity equals target", () => {
      expect(ComplianceCalculatorService.isCompliant(89.3368)).toBe(true)
    })

    it("should return false when intensity exceeds target", () => {
      expect(ComplianceCalculatorService.isCompliant(93.5)).toBe(false)
    })
  })

  describe("calculateCO2Emissions", () => {
    it("should calculate emissions with HFO factor", () => {
      const emissions = ComplianceCalculatorService.calculateCO2Emissions(1000, "HFO")
      expect(emissions).toBe(3114) // 1000 * 3.114
    })

    it("should calculate emissions with LNG factor", () => {
      const emissions = ComplianceCalculatorService.calculateCO2Emissions(1000, "LNG")
      expect(emissions).toBe(2750) // 1000 * 2.75
    })

    it("should use default VLSFO factor for unknown fuel", () => {
      const emissions = ComplianceCalculatorService.calculateCO2Emissions(1000, "Unknown")
      expect(emissions).toBe(3151) // 1000 * 3.151
    })
  })

  describe("calculatePenalty", () => {
    it("should calculate penalty for deficit", () => {
      const penalty = ComplianceCalculatorService.calculatePenalty(1000)
      expect(penalty).toBe(2400000) // 1000 * 2400
    })

    it("should return 0 for surplus (negative deficit)", () => {
      const penalty = ComplianceCalculatorService.calculatePenalty(-1000)
      expect(penalty).toBe(0)
    })

    it("should use custom penalty rate", () => {
      const penalty = ComplianceCalculatorService.calculatePenalty(100, 1000)
      expect(penalty).toBe(100000)
    })
  })
})
