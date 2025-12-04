import type {
  BankingAccount,
  Transaction,
  CreateTransactionDTO,
  BankingAccountWithTransactions,
} from "../../core/domain/entities/banking.entity"

export interface IBankingRepository {
  findAccountByVesselId(vesselId: string): Promise<BankingAccountWithTransactions | null>
  findAllAccounts(): Promise<BankingAccountWithTransactions[]>
  createAccount(vesselId: string): Promise<BankingAccount>
  createTransaction(data: CreateTransactionDTO): Promise<Transaction>
  getTransactionsByAccountId(accountId: string): Promise<Transaction[]>
  updateAccountBalance(vesselId: string, amount: number, type: "deposit" | "withdrawal"): Promise<BankingAccount>
  getTotalSurplus(): Promise<number>
  getTotalDeficit(): Promise<number>
}
