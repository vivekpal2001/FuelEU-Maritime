import type { PrismaClient } from "@prisma/client"
import type { BankEntry } from "../../../core/domain/entities/banking.entity"
import type { IBankingRepository } from "../../../core/ports/outbound/banking.repository"

export class PostgresBankingRepository implements IBankingRepository {
  constructor(private prisma: PrismaClient) {}

  async findByShipAndYear(shipId: string, year: number): Promise<BankEntry[]> {
    const records = await this.prisma.bankEntry.findMany({
      where: { shipId, year },
      orderBy: { createdAt: "desc" },
    })
    return records.map(this.mapToEntity)
  }

  async create(data: Omit<BankEntry, "id" | "createdAt">): Promise<BankEntry> {
    const record = await this.prisma.bankEntry.create({
      data: {
        shipId: data.shipId,
        year: data.year,
        amountGco2eq: data.amountGco2eq,
        type: data.type,
      },
    })
    return this.mapToEntity(record)
  }

  async getTotalBanked(shipId: string, year: number): Promise<number> {
    const result = await this.prisma.bankEntry.aggregate({
      where: { shipId, year, type: "bank" },
      _sum: { amountGco2eq: true },
    })
    return result._sum.amountGco2eq || 0
  }

  async getTotalApplied(shipId: string, year: number): Promise<number> {
    const result = await this.prisma.bankEntry.aggregate({
      where: { shipId, year, type: "apply" },
      _sum: { amountGco2eq: true },
    })
    return result._sum.amountGco2eq || 0
  }

  private mapToEntity(record: any): BankEntry {
    return {
      id: record.id,
      shipId: record.shipId,
      year: record.year,
      amountGco2eq: record.amountGco2eq,
      type: record.type,
      createdAt: record.createdAt,
    }
  }
}
