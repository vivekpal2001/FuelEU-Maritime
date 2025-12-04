import { PrismaBankingRepository } from "../../adapters/repositories/prisma-banking.repository"
import type { CreateTransactionDTO, BankingAccountWithTransactions } from "../../core/domain/entities/banking.entity"

const bankingRepository = new PrismaBankingRepository()

export class BankingUseCases {
  static async getAccountByVesselId(vesselId: string): Promise<BankingAccountWithTransactions | null> {
    return bankingRepository.findAccountByVesselId(vesselId)
  }

  static async getAllAccounts(): Promise<BankingAccountWithTransactions[]> {
    return bankingRepository.findAllAccounts()
  }

  static async createTransaction(data: CreateTransactionDTO) {
    // Validate transaction
    if (data.amount <= 0) {
      throw new Error("Transaction amount must be positive")
    }

    // For withdrawals, check if sufficient balance exists
    if (data.type === "withdrawal") {
      const account = await bankingRepository.findAccountByVesselId(data.vesselId)
      if (!account || account.balance < data.amount) {
        throw new Error("Insufficient balance for withdrawal")
      }
    }

    return bankingRepository.createTransaction(data)
  }

  static async deposit(vesselId: string, amount: number, description?: string) {
    return this.createTransaction({
      vesselId,
      type: "deposit",
      amount,
      description: description || "Manual deposit",
    })
  }

  static async withdraw(vesselId: string, amount: number, description?: string) {
    return this.createTransaction({
      vesselId,
      type: "withdrawal",
      amount,
      description: description || "Manual withdrawal",
    })
  }

  static async transfer(fromVesselId: string, toVesselId: string, amount: number) {
    // Withdraw from source
    await this.createTransaction({
      vesselId: fromVesselId,
      type: "transfer",
      amount,
      description: `Transfer to vessel`,
      relatedEntityId: toVesselId,
    })

    // Deposit to destination
    await this.createTransaction({
      vesselId: toVesselId,
      type: "deposit",
      amount,
      description: `Transfer from vessel`,
      relatedEntityId: fromVesselId,
    })
  }

  static async borrow(vesselId: string, amount: number, description?: string) {
    return this.createTransaction({
      vesselId,
      type: "borrow",
      amount,
      description: description || "Compliance balance borrowed",
    })
  }

  static async getComplianceSummary() {
    const [totalSurplus, totalDeficit] = await Promise.all([
      bankingRepository.getTotalSurplus(),
      bankingRepository.getTotalDeficit(),
    ])

    return {
      totalSurplus,
      totalDeficit,
      netBalance: totalSurplus - totalDeficit,
    }
  }
}
