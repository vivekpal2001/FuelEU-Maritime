export interface PoolMemberInput {
  shipId: string
  cbBefore: number
}

export interface PoolMemberOutput {
  shipId: string
  cbBefore: number
  cbAfter: number
}

export class PoolingAllocatorService {
  /**
   * Validate pool according to PDF rules:
   * - Sum(adjustedCB) >= 0
   * - Deficit ship cannot exit worse
   * - Surplus ship cannot exit negative
   */
  static validatePool(members: PoolMemberInput[]): { valid: boolean; errors: string[]; totalCB: number } {
    const errors: string[] = []
    const totalCB = members.reduce((sum, m) => sum + m.cbBefore, 0)

    // Rule: Sum of CB must be >= 0
    if (totalCB < 0) {
      errors.push(`Total pool CB is negative (${totalCB.toFixed(2)}). Pool sum must be >= 0.`)
    }

    // Check for empty pool
    if (members.length === 0) {
      errors.push("Pool must have at least one member.")
    }

    return {
      valid: errors.length === 0,
      errors,
      totalCB,
    }
  }

  /**
   * Greedy allocation algorithm per PDF:
   * 1. Sort members descending by CB (surplus first)
   * 2. Transfer surplus to deficits
   * 3. Ensure deficit ship cannot exit worse
   * 4. Ensure surplus ship cannot exit negative
   */
  static allocate(members: PoolMemberInput[]): PoolMemberOutput[] {
    if (members.length === 0) return []

    // Sort by CB descending (surplus ships first)
    const sorted = [...members].sort((a, b) => b.cbBefore - a.cbBefore)

    // Initialize output with cbAfter = cbBefore
    const result: PoolMemberOutput[] = sorted.map((m) => ({
      shipId: m.shipId,
      cbBefore: m.cbBefore,
      cbAfter: m.cbBefore,
    }))

    // Separate surplus and deficit ships
    const surplusShips = result.filter((m) => m.cbBefore > 0)
    const deficitShips = result.filter((m) => m.cbBefore < 0)

    // Greedy transfer from surplus to deficit
    for (const deficit of deficitShips) {
      const deficitAmount = Math.abs(deficit.cbBefore)
      let remainingDeficit = deficitAmount

      for (const surplus of surplusShips) {
        if (remainingDeficit <= 0) break

        // Available surplus (cannot go negative per PDF rule)
        const availableSurplus = surplus.cbAfter
        if (availableSurplus <= 0) continue

        // Transfer amount
        const transfer = Math.min(availableSurplus, remainingDeficit)

        // Apply transfer
        surplus.cbAfter -= transfer
        deficit.cbAfter += transfer
        remainingDeficit -= transfer
      }
    }

    // Validate final state per PDF rules
    for (const member of result) {
      const original = members.find((m) => m.shipId === member.shipId)!

      // Rule: Deficit ship cannot exit worse than before
      if (original.cbBefore < 0 && member.cbAfter < original.cbBefore) {
        member.cbAfter = original.cbBefore
      }

      // Rule: Surplus ship cannot exit negative
      if (original.cbBefore > 0 && member.cbAfter < 0) {
        member.cbAfter = 0
      }
    }

    return result
  }
}
