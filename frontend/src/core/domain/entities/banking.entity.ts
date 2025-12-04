export interface BankEntry {
  id: string
  shipId: string
  year: number
  amountGco2eq: number
  type: "bank" | "apply"
  createdAt: string
}

export interface BankingRecord {
  shipId: string
  year: number
  entries: BankEntry[]
  totalBanked: number
  totalApplied: number
  availableBalance: number
}

export interface BankingResult {
  cbBefore: number
  applied: number
  cbAfter: number
}
