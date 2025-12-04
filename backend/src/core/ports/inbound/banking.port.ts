import type { BankEntry, BankingRecord, BankingResult } from "../../domain/entities/banking.entity"

export interface IBankingService {
  getBankingRecords(shipId: string, year: number): Promise<BankingRecord>
  bankSurplus(shipId: string, year: number, amount: number): Promise<BankEntry>
  applyBanked(shipId: string, year: number, amount: number): Promise<BankingResult>
}
