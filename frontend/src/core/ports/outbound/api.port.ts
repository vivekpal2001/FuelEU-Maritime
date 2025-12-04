import type { Route, RouteComparison, RouteFilters } from "../../domain/entities/route.entity"
import type { ComplianceResult, AdjustedComplianceResult } from "../../domain/entities/compliance.entity"
import type { BankEntry, BankingRecord, BankingResult } from "../../domain/entities/banking.entity"
import type { Pool, CreatePoolRequest, PoolAllocationResult } from "../../domain/entities/pool.entity"

export interface IApiClient {
  // Routes
  getRoutes(filters?: RouteFilters): Promise<Route[]>
  setBaseline(routeId: string): Promise<Route>
  getComparison(): Promise<RouteComparison[]>

  // Compliance
  getComplianceBalance(shipId: string, year: number): Promise<ComplianceResult>
  getAdjustedComplianceBalance(shipId: string, year: number): Promise<AdjustedComplianceResult>

  // Banking
  getBankingRecords(shipId: string, year: number): Promise<BankingRecord>
  bankSurplus(shipId: string, year: number, amount: number): Promise<BankEntry>
  applyBanked(shipId: string, year: number, amount: number): Promise<BankingResult>

  // Pools
  createPool(request: CreatePoolRequest): Promise<PoolAllocationResult>
  getPools(): Promise<Pool[]>
}
