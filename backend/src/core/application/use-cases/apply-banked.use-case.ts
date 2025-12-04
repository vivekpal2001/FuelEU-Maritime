import type { BankingResult } from "../../domain/entities/banking.entity"
import type { IBankingRepository } from "../../ports/outbound/banking.repository"
import type { IComplianceRepository } from "../../ports/outbound/compliance.repository"

export class ApplyBankedUseCase {
  constructor(
    private bankingRepository: IBankingRepository,
    private complianceRepository: IComplianceRepository,
  ) {}

  async execute(shipId: string, year: number, amount: number): Promise<BankingResult> {
    if (amount <= 0) {
      throw new Error("Apply amount must be positive")
    }

    // Get current compliance balance
    const compliance = await this.complianceRepository.findByShipAndYear(shipId, year)
    if (!compliance) {
      throw new Error(`No compliance record found for ship ${shipId} in year ${year}`)
    }

    const cbBefore = compliance.cbGco2eq

    // Get available banked amount
    const totalBanked = await this.bankingRepository.getTotalBanked(shipId, year)
    const totalApplied = await this.bankingRepository.getTotalApplied(shipId, year)
    const availableBanked = totalBanked - totalApplied

    // Validate amount <= available banked
    if (amount > availableBanked) {
      throw new Error(`Cannot apply ${amount}: only ${availableBanked} banked surplus available`)
    }

    // Create apply entry
    await this.bankingRepository.create({
      shipId,
      year,
      amountGco2eq: amount,
      type: "apply",
    })

    const cbAfter = cbBefore + amount

    return {
      cbBefore,
      applied: amount,
      cbAfter,
    }
  }
}
