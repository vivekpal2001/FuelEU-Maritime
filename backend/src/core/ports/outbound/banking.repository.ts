import type { BankEntry } from "../../domain/entities/banking.entity"

export interface IBankingRepository {
  findByShipAndYear(shipId: string, year: number): Promise<BankEntry[]>
  create(data: Omit<BankEntry, "id" | "createdAt">): Promise<BankEntry>
  getTotalBanked(shipId: string, year: number): Promise<number>
  getTotalApplied(shipId: string, year: number): Promise<number>
}
