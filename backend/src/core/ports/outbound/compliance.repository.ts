import type { ShipCompliance } from "../../domain/entities/compliance.entity"

export interface IComplianceRepository {
  findByShipAndYear(shipId: string, year: number): Promise<ShipCompliance | null>
  upsert(data: Omit<ShipCompliance, "id" | "createdAt" | "updatedAt">): Promise<ShipCompliance>
}
