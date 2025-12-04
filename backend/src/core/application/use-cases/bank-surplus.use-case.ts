import type { BankEntry } from "../../domain/entities/banking.entity"
import type { IBankingRepository } from "../../ports/outbound/banking.repository"
import type { IComplianceRepository } from "../../ports/outbound/compliance.repository"

export class BankSurplusUseCase {
  constructor(
    private bankingRepository: IBankingRepository,
    private complianceRepository: IComplianceRepository,
  ) {}

  async execute(shipId: string, year: number, amount: number): Promise<BankEntry> {
    // Validate amount is positive
    if (amount <= 0) {
      throw new Error("Bank amount must be positive")
    }

    // Get current compliance balance
    const compliance = await this.complianceRepository.findByShipAndYear(shipId, year)
    if (!compliance) {
      throw new Error(`No compliance record found for ship ${shipId} in year ${year}`)
    }

    // Validate CB is positive (can only bank surplus)
    if (compliance.cbGco2eq <= 0) {
      throw new Error("Cannot bank: Compliance Balance is not positive (no surplus)")
    }

    // Validate amount doesn't exceed available surplus
    const totalBanked = await this.bankingRepository.getTotalBanked(shipId, year)
    const availableSurplus = compliance.cbGco2eq - totalBanked

    if (amount > availableSurplus) {
      throw new Error(`Cannot bank ${amount}: only ${availableSurplus} surplus available`)
    }

    // Create bank entry
    return this.bankingRepository.create({
      shipId,
      year,
      amountGco2eq: amount,
      type: "bank",
    })
  }
}
