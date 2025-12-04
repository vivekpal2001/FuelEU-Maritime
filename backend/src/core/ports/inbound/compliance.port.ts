import type { ComplianceResult, AdjustedComplianceResult } from "../../domain/entities/compliance.entity"

export interface IComplianceService {
  getComplianceBalance(shipId: string, year: number): Promise<ComplianceResult>
  getAdjustedComplianceBalance(shipId: string, year: number): Promise<AdjustedComplianceResult>
}
