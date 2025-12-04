import axios, { type AxiosInstance } from "axios"
import type { IApiClient } from "../../core/ports/outbound/api.port"
import type { Route, RouteComparison, RouteFilters } from "../../core/domain/entities/route.entity"
import type { ComplianceResult, AdjustedComplianceResult } from "../../core/domain/entities/compliance.entity"
import type { BankEntry, BankingRecord, BankingResult } from "../../core/domain/entities/banking.entity"
import type { Pool, CreatePoolRequest, PoolAllocationResult } from "../../core/domain/entities/pool.entity"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001"

class ApiClient implements IApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Routes
  async getRoutes(filters?: RouteFilters): Promise<Route[]> {
    const params = new URLSearchParams()
    if (filters?.vesselType) params.append("vesselType", filters.vesselType)
    if (filters?.fuelType) params.append("fuelType", filters.fuelType)
    if (filters?.year) params.append("year", String(filters.year))

    const { data } = await this.client.get(`/routes?${params.toString()}`)
    return data
  }

  async setBaseline(routeId: string): Promise<Route> {
    const { data } = await this.client.post(`/routes/${routeId}/baseline`)
    return data
  }

  async getComparison(): Promise<RouteComparison[]> {
    const { data } = await this.client.get("/routes/comparison")
    return data
  }

  // Compliance
  async getComplianceBalance(shipId: string, year: number): Promise<ComplianceResult> {
    const { data } = await this.client.get(`/compliance/cb?shipId=${shipId}&year=${year}`)
    return data
  }

  async getAdjustedComplianceBalance(shipId: string, year: number): Promise<AdjustedComplianceResult> {
    const { data } = await this.client.get(`/compliance/adjusted-cb?shipId=${shipId}&year=${year}`)
    return data
  }

  // Banking
  async getBankingRecords(shipId: string, year: number): Promise<BankingRecord> {
    const { data } = await this.client.get(`/banking/records?shipId=${shipId}&year=${year}`)
    return data
  }

  async bankSurplus(shipId: string, year: number, amount: number): Promise<BankEntry> {
    const { data } = await this.client.post("/banking/bank", { shipId, year, amount })
    return data
  }

  async applyBanked(shipId: string, year: number, amount: number): Promise<BankingResult> {
    const { data } = await this.client.post("/banking/apply", { shipId, year, amount })
    return data
  }

  // Pools
  async createPool(request: CreatePoolRequest): Promise<PoolAllocationResult> {
    const { data } = await this.client.post("/pools", request)
    return data
  }

  async getPools(): Promise<Pool[]> {
    const { data } = await this.client.get("/pools")
    return data
  }
}

export const apiClient = new ApiClient()
