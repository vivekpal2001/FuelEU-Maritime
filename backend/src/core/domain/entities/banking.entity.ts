export interface BankEntry {
  id: string
  shipId: string
  year: number
  amountGco2eq: number
  type: "bank" | "apply"
  createdAt: Date
}

export interface BankingRecord {
  shipId: string
  year: number
  entries: BankEntry[]
  totalBanked: number
  totalApplied: number
  availableBalance: number
}

export interface BankRequest {
  shipId: string
  year: number
  amount: number
}

export interface ApplyRequest {
  shipId: string
  year: number
  amount: number
}

export interface BankingResult {
  cbBefore: number
  applied: number
  cbAfter: number
}

// Legacy types for vessel banking (keeping for compatibility)
export interface BankingAccount {
  id: string
  vesselId: string
  balance: number
  surplus: number
  deficit: number
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  accountId: string
  type: "deposit" | "withdrawal" | "transfer" | "borrow" | "penalty"
  amount: number
  description: string | null
  balanceBefore: number
  balanceAfter: number
  relatedEntityId: string | null
  createdAt: Date
}

export interface CreateTransactionDTO {
  vesselId: string
  type: "deposit" | "withdrawal" | "transfer" | "borrow" | "penalty"
  amount: number
  description?: string
  relatedEntityId?: string
}

export interface BankingAccountWithTransactions extends BankingAccount {
  transactions: Transaction[]
  vessel: {
    name: string
    imo: string
  }
}
