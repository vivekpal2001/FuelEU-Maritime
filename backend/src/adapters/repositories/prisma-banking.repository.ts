import { PrismaClient } from "@prisma/client"
import type { IBankingRepository } from "../../ports/repositories/banking.repository.port"
import type {
  BankingAccount,
  Transaction,
  CreateTransactionDTO,
  BankingAccountWithTransactions,
} from "../../core/domain/entities/banking.entity"

const prisma = new PrismaClient()

export class PrismaBankingRepository implements IBankingRepository {
  async findAccountByVesselId(vesselId: string): Promise<BankingAccountWithTransactions | null> {
    return prisma.bankingAccount.findUnique({
      where: { vesselId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
        },
        vessel: {
          select: {
            name: true,
            imo: true,
          },
        },
      },
    }) as Promise<BankingAccountWithTransactions | null>
  }

  async findAllAccounts(): Promise<BankingAccountWithTransactions[]> {
    return prisma.bankingAccount.findMany({
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        vessel: {
          select: {
            name: true,
            imo: true,
          },
        },
      },
      orderBy: { balance: "desc" },
    }) as Promise<BankingAccountWithTransactions[]>
  }

  async createAccount(vesselId: string): Promise<BankingAccount> {
    return prisma.bankingAccount.create({
      data: { vesselId },
    }) as Promise<BankingAccount>
  }

  async createTransaction(data: CreateTransactionDTO): Promise<Transaction> {
    const account = await prisma.bankingAccount.findFirst({
      where: { vesselId: data.vesselId },
    })

    if (!account) {
      throw new Error("Banking account not found for vessel")
    }

    const balanceBefore = account.balance
    let balanceAfter = balanceBefore

    if (data.type === "deposit") {
      balanceAfter = balanceBefore + data.amount
    } else if (data.type === "withdrawal" || data.type === "penalty") {
      balanceAfter = balanceBefore - data.amount
    } else if (data.type === "transfer") {
      balanceAfter = balanceBefore - data.amount
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        accountId: account.id,
        type: data.type,
        amount: data.amount,
        description: data.description,
        balanceBefore,
        balanceAfter,
        relatedEntityId: data.relatedEntityId,
      },
    })

    // Update account balance
    const surplus = balanceAfter > 0 ? balanceAfter : 0
    const deficit = balanceAfter < 0 ? Math.abs(balanceAfter) : 0

    await prisma.bankingAccount.update({
      where: { id: account.id },
      data: {
        balance: balanceAfter,
        surplus,
        deficit,
      },
    })

    return transaction as Transaction
  }

  async getTransactionsByAccountId(accountId: string): Promise<Transaction[]> {
    return prisma.transaction.findMany({
      where: { accountId },
      orderBy: { createdAt: "desc" },
    }) as Promise<Transaction[]>
  }

  async updateAccountBalance(
    vesselId: string,
    amount: number,
    type: "deposit" | "withdrawal",
  ): Promise<BankingAccount> {
    const account = await prisma.bankingAccount.findUnique({
      where: { vesselId },
    })

    if (!account) {
      throw new Error("Banking account not found")
    }

    const newBalance = type === "deposit" ? account.balance + amount : account.balance - amount

    return prisma.bankingAccount.update({
      where: { vesselId },
      data: {
        balance: newBalance,
        surplus: newBalance > 0 ? newBalance : 0,
        deficit: newBalance < 0 ? Math.abs(newBalance) : 0,
      },
    }) as Promise<BankingAccount>
  }

  async getTotalSurplus(): Promise<number> {
    const result = await prisma.bankingAccount.aggregate({
      _sum: { surplus: true },
    })
    return result._sum.surplus || 0
  }

  async getTotalDeficit(): Promise<number> {
    const result = await prisma.bankingAccount.aggregate({
      _sum: { deficit: true },
    })
    return result._sum.deficit || 0
  }
}
