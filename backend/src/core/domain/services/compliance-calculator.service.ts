interface FuelEmissionFactor {
  [key: string]: number
}

const FUEL_EMISSION_FACTORS: FuelEmissionFactor = {
  VLSFO: 3.151,
  MGO: 3.206,
  HFO: 3.114,
  LNG: 2.75,
  Methanol: 1.375,
  Biodiesel: 0.0,
  "E-Ammonia": 0.0,
}

// Target intensity per PDF: 89.3368 gCO2e/MJ (2% below 91.16)
const TARGET_INTENSITY_2025 = 89.3368
const MJ_PER_TON = 41000 // Energy conversion factor per PDF

export class ComplianceCalculatorService {
  static readonly TARGET_INTENSITY_2025 = TARGET_INTENSITY_2025

  /**
   * Get target intensity for a specific year
   * Per PDF: Target = 89.3368 gCO₂e/MJ for 2025
   */
  static getTargetIntensity(year: number): number {
    const targets: { [key: number]: number } = {
      2024: 89.3368, // Using same as 2025 for 2024
      2025: 89.3368,
      2030: 80.0,
      2035: 65.0,
      2040: 47.5,
      2050: 0.0,
    }
    return targets[year] || TARGET_INTENSITY_2025
  }

  /**
   * Calculate target intensity for a year
   * Alias for getTargetIntensity
   */
  static getTargetForYear(year: number): number {
    return this.getTargetIntensity(year)
  }

  /**
   * Calculate energy in scope (MJ)
   * Per PDF: Energy in scope (MJ) ≈ fuelConsumption × 41,000 MJ/t
   */
  static calculateEnergyInScope(fuelConsumption: number): number {
    return fuelConsumption * MJ_PER_TON
  }

  /**
   * Calculate Compliance Balance
   * Per PDF: Compliance Balance = (Target − Actual) × Energy in scope
   * Positive CB = Surplus; Negative CB = Deficit
   */
  static calculateComplianceBalance(
    actualIntensity: number,
    fuelConsumption: number,
    targetIntensity: number = TARGET_INTENSITY_2025,
  ): number {
    const energyInScope = this.calculateEnergyInScope(fuelConsumption)
    return (targetIntensity - actualIntensity) * energyInScope
  }

  /**
   * Calculate percent difference between comparison and baseline
   * Per PDF: percentDiff = ((comparison / baseline) − 1) × 100
   */
  static calculatePercentDiff(comparisonIntensity: number, baselineIntensity: number): number {
    if (baselineIntensity === 0) return 0
    return (comparisonIntensity / baselineIntensity - 1) * 100
  }

  /**
   * Check if a route is compliant (intensity <= target)
   * Per PDF: Target = 89.3368 gCO₂e/MJ
   */
  static isCompliant(ghgIntensity: number, year = 2025): boolean {
    const target = this.getTargetIntensity(year)
    return ghgIntensity <= target
  }

  /**
   * Calculate CO2 emissions from fuel consumption
   */
  static calculateCO2Emissions(fuelConsumed: number, fuelType: string): number {
    const emissionFactor = FUEL_EMISSION_FACTORS[fuelType] || FUEL_EMISSION_FACTORS.VLSFO
    return fuelConsumed * emissionFactor
  }

  /**
   * Calculate GHG intensity (gCO2eq/MJ)
   */
  static calculateGHGIntensity(co2Emissions: number, distance: number): number {
    if (distance === 0) return 0
    const transportWork = distance * 1000
    return (co2Emissions / transportWork) * 1000000
  }

  /**
   * Calculate penalty for non-compliance
   */
  static calculatePenalty(deficitAmount: number, penaltyPerUnit = 2400): number {
    return Math.max(0, deficitAmount) * penaltyPerUnit
  }

  /**
   * Calculate pool compliance from member contributions
   */
  static calculatePoolCompliance(members: Array<{ balance: number; share: number }>): number {
    return members.reduce((total, member) => {
      return total + member.balance * (member.share / 100)
    }, 0)
  }
}
