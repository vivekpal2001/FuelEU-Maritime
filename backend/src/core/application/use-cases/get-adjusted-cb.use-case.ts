import type { AdjustedComplianceResult } from "../../domain/entities/compliance.entity"
import type { IRouteRepository } from "../../ports/outbound/route.repository"
import type { IComplianceRepository } from "../../ports/outbound/compliance.repository"
import type { IBankingRepository } from "../../ports/outbound/banking.repository"
import { ComplianceCalculatorService } from "../../domain/services/compliance-calculator.service"

export class GetAdjustedCBUseCase {
  constructor(
    private routeRepository: IRouteRepository,
    private complianceRepository: IComplianceRepository,
    private bankingRepository: IBankingRepository,
  ) {}

  async execute(shipId: string, year: number): Promise<AdjustedComplianceResult> {
    const route = await this.routeRepository.findByRouteId(shipId)
    if (!route) {
      throw new Error(`Ship/Route with ID ${shipId} not found`)
    }

    const targetIntensity = ComplianceCalculatorService.getTargetIntensity(year)
    const energyInScope = ComplianceCalculatorService.calculateEnergyInScope(route.fuelConsumption)
    const cbGco2eq = ComplianceCalculatorService.calculateComplianceBalance(
      route.ghgIntensity,
      route.fuelConsumption,
      targetIntensity,
    )

    // Get banking adjustments
    const bankedAmount = await this.bankingRepository.getTotalBanked(shipId, year)
    const appliedAmount = await this.bankingRepository.getTotalApplied(shipId, year)

    // Adjusted CB = original CB - banked + applied
    const adjustedCbGco2eq = cbGco2eq - bankedAmount + appliedAmount

    return {
      shipId,
      year,
      cbGco2eq,
      energyInScope,
      targetIntensity,
      actualIntensity: route.ghgIntensity,
      bankedAmount,
      appliedAmount,
      adjustedCbGco2eq,
    }
  }
}
