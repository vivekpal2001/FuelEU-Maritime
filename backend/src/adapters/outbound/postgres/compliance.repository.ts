import type { PrismaClient } from "@prisma/client"
import type { ShipCompliance } from "../../../core/domain/entities/compliance.entity"
import type { IComplianceRepository } from "../../../core/ports/outbound/compliance.repository"

export class PostgresComplianceRepository implements IComplianceRepository {
  constructor(private prisma: PrismaClient) {}

  async findByShipAndYear(shipId: string, year: number): Promise<ShipCompliance | null> {
    const record = await this.prisma.shipCompliance.findUnique({
      where: { shipId_year: { shipId, year } },
    })
    return record ? this.mapToEntity(record) : null
  }

  async upsert(data: Omit<ShipCompliance, "id" | "createdAt" | "updatedAt">): Promise<ShipCompliance> {
    const record = await this.prisma.shipCompliance.upsert({
      where: { shipId_year: { shipId: data.shipId, year: data.year } },
      update: { cbGco2eq: data.cbGco2eq },
      create: {
        shipId: data.shipId,
        year: data.year,
        cbGco2eq: data.cbGco2eq,
      },
    })
    return this.mapToEntity(record)
  }

  private mapToEntity(record: any): ShipCompliance {
    return {
      id: record.id,
      shipId: record.shipId,
      year: record.year,
      cbGco2eq: record.cbGco2eq,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }
  }
}
