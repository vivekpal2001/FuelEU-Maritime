import type { RouteComparison } from "../../domain/entities/route.entity"
import type { IRouteRepository } from "../../ports/outbound/route.repository"
import { ComplianceCalculatorService } from "../../domain/services/compliance-calculator.service"

export class GetComparisonUseCase {
  constructor(private routeRepository: IRouteRepository) {}

  async execute(): Promise<RouteComparison[]> {
    const baseline = await this.routeRepository.findBaseline()
    if (!baseline) {
      throw new Error("No baseline route set. Please set a baseline first.")
    }

    const allRoutes = await this.routeRepository.findAll()
    const comparisons: RouteComparison[] = []

    for (const route of allRoutes) {
      if (route.id === baseline.id) continue // Skip baseline itself

      // Formula: percentDiff = ((comparison / baseline) − 1) × 100
      const percentDiff = ComplianceCalculatorService.calculatePercentDiff(route.ghgIntensity, baseline.ghgIntensity)

      // Target = 89.3368 gCO₂e/MJ (2% below 91.16)
      const compliant = ComplianceCalculatorService.isCompliant(route.ghgIntensity)

      comparisons.push({
        baseline,
        comparison: route,
        percentDiff,
        compliant,
      })
    }

    return comparisons
  }
}
