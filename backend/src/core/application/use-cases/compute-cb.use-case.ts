import type { ComplianceResult } from "../../domain/entities/compliance.entity"
import type { IRouteRepository } from "../../ports/outbound/route.repository"
import type { IComplianceRepository } from "../../ports/outbound/compliance.repository"
import { ComplianceCalculatorService } from "../../domain/services/compliance-calculator.service"

export class ComputeCBUseCase {
  constructor(
    private routeRepository: IRouteRepository,
    private complianceRepository: IComplianceRepository,
  ) {}

  async execute(shipId: string, year: number): Promise<ComplianceResult> {
    // Find the route by shipId (which is routeId in our case)
    const route = await this.routeRepository.findByRouteId(shipId)
    if (!route) {
      throw new Error(`Ship/Route with ID ${shipId} not found`)
    }

    // Get target intensity for the year
    const targetIntensity = ComplianceCalculatorService.getTargetIntensity(year)

    // Calculate energy in scope (MJ)
    const energyInScope = ComplianceCalculatorService.calculateEnergyInScope(route.fuelConsumption)

    // Calculate CB
    const cbGco2eq = ComplianceCalculatorService.calculateComplianceBalance(
      route.ghgIntensity,
      route.fuelConsumption,
      targetIntensity,
    )

    // Store/update the compliance record
    await this.complianceRepository.upsert({
      shipId,
      year,
      cbGco2eq,
    })

    return {
      shipId,
      year,
      cbGco2eq,
      energyInScope,
      targetIntensity,
      actualIntensity: route.ghgIntensity,
    }
  }
}
