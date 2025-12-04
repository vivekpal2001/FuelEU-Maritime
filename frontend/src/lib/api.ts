import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api"

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

// Vessels
export const vesselApi = {
  getAll: () => api.get<ApiResponse<Vessel[]>>("/vessels"),
  getById: (id: string) => api.get<ApiResponse<Vessel>>(`/vessels/${id}`),
  create: (data: CreateVesselDTO) => api.post<ApiResponse<Vessel>>("/vessels", data),
  update: (id: string, data: UpdateVesselDTO) => api.put<ApiResponse<Vessel>>(`/vessels/${id}`, data),
  delete: (id: string) => api.delete(`/vessels/${id}`),
}

// Voyages
export const voyageApi = {
  getAll: (filters?: VoyageFilters) => api.get<ApiResponse<VoyageWithVessel[]>>("/voyages", { params: filters }),
  getById: (id: string) => api.get<ApiResponse<VoyageWithVessel>>(`/voyages/${id}`),
  compare: (ids: string[]) =>
    api.get<ApiResponse<VoyageComparison>>("/voyages/compare", { params: { ids: ids.join(",") } }),
  create: (data: CreateVoyageDTO) => api.post<ApiResponse<Voyage>>("/voyages", data),
  update: (id: string, data: UpdateVoyageDTO) => api.put<ApiResponse<Voyage>>(`/voyages/${id}`, data),
  delete: (id: string) => api.delete(`/voyages/${id}`),
}

// Pools
export const poolApi = {
  getAll: () => api.get<ApiResponse<PoolWithMembers[]>>("/pools"),
  getById: (id: string) => api.get<ApiResponse<PoolWithMembers>>(`/pools/${id}`),
  create: (data: CreatePoolDTO) => api.post<ApiResponse<Pool>>("/pools", data),
  update: (id: string, data: UpdatePoolDTO) => api.put<ApiResponse<Pool>>(`/pools/${id}`, data),
  delete: (id: string) => api.delete(`/pools/${id}`),
  addMember: (poolId: string, data: AddPoolMemberDTO) => api.post(`/pools/${poolId}/members`, data),
  removeMember: (poolId: string, vesselId: string) => api.delete(`/pools/${poolId}/members/${vesselId}`),
}

// Banking
export const bankingApi = {
  getAllAccounts: () => api.get<ApiResponse<BankingAccount[]>>("/banking/accounts"),
  getAccountByVessel: (vesselId: string) => api.get<ApiResponse<BankingAccount>>(`/banking/accounts/${vesselId}`),
  getSummary: () => api.get<ApiResponse<BankingSummary>>("/banking/summary"),
  deposit: (data: TransactionDTO) => api.post("/banking/deposit", data),
  withdraw: (data: TransactionDTO) => api.post("/banking/withdraw", data),
  transfer: (data: TransferDTO) => api.post("/banking/transfer", data),
  borrow: (data: TransactionDTO) => api.post("/banking/borrow", data),
}

// Dashboard
export const dashboardApi = {
  getData: () => api.get<ApiResponse<DashboardData>>("/dashboard"),
}

// Compliance
export const complianceApi = {
  calculate: (data: ComplianceCalculationDTO) => api.post<ApiResponse<ComplianceResult>>("/compliance/calculate", data),
  getTargets: () => api.get<ApiResponse<ComplianceTarget[]>>("/compliance/targets"),
}

// Types
export interface Vessel {
  id: string
  name: string
  imo: string
  type: string
  flag: string
  grossTonnage: number
  deadweight: number
  complianceScore: number
  status: "active" | "inactive" | "maintenance"
  createdAt: string
  updatedAt: string
}

export interface CreateVesselDTO {
  name: string
  imo: string
  type: string
  flag: string
  grossTonnage: number
  deadweight: number
}

export interface UpdateVesselDTO {
  name?: string
  type?: string
  flag?: string
  grossTonnage?: number
  deadweight?: number
  status?: "active" | "inactive" | "maintenance"
}

export interface Voyage {
  id: string
  vesselId: string
  voyageNumber: string
  departurePort: string
  arrivalPort: string
  departureDate: string
  arrivalDate: string
  distance: number
  fuelConsumed: number
  fuelType: string
  co2Emissions: number
  ghgIntensity: number
  complianceBalance: number
  status: "planned" | "in-progress" | "completed"
}

export interface VoyageWithVessel extends Voyage {
  vessel: {
    name: string
    imo: string
    type: string
  }
}

export interface VoyageFilters {
  vesselId?: string
  status?: string
  startDate?: string
  endDate?: string
}

export interface CreateVoyageDTO {
  vesselId: string
  voyageNumber: string
  departurePort: string
  arrivalPort: string
  departureDate: string
  arrivalDate: string
  distance: number
  fuelConsumed: number
  fuelType: string
}

export interface UpdateVoyageDTO {
  departurePort?: string
  arrivalPort?: string
  departureDate?: string
  arrivalDate?: string
  distance?: number
  fuelConsumed?: number
  fuelType?: string
  status?: string
}

export interface VoyageComparison {
  voyages: VoyageWithVessel[]
  comparison: {
    avgGHGIntensity: number
    avgComplianceBalance: number
    totalEmissions: number
    totalDistance: number
  }
}

export interface Pool {
  id: string
  name: string
  description: string | null
  totalBalance: number
  status: "active" | "inactive"
}

export interface PoolMember {
  id: string
  poolId: string
  vesselId: string
  share: number
  vessel: {
    id: string
    name: string
    imo: string
    complianceScore: number
  }
}

export interface PoolWithMembers extends Pool {
  members: PoolMember[]
}

export interface CreatePoolDTO {
  name: string
  description?: string
}

export interface UpdatePoolDTO {
  name?: string
  description?: string
  status?: "active" | "inactive"
}

export interface AddPoolMemberDTO {
  vesselId: string
  share: number
}

export interface BankingAccount {
  id: string
  vesselId: string
  balance: number
  surplus: number
  deficit: number
  transactions: Transaction[]
  vessel: {
    name: string
    imo: string
  }
}

export interface Transaction {
  id: string
  type: "deposit" | "withdrawal" | "transfer" | "borrow" | "penalty"
  amount: number
  description: string | null
  balanceBefore: number
  balanceAfter: number
  createdAt: string
}

export interface TransactionDTO {
  vesselId: string
  amount: number
  description?: string
}

export interface TransferDTO {
  fromVesselId: string
  toVesselId: string
  amount: number
}

export interface BankingSummary {
  totalSurplus: number
  totalDeficit: number
  netBalance: number
}

export interface DashboardData {
  stats: {
    totalVessels: number
    activeVessels: number
    avgComplianceScore: number
    completedVoyages: number
    totalEmissions: number
    avgGHGIntensity: number
    complianceTarget: number
    totalSurplus: number
    totalDeficit: number
    netBalance: number
    activePools: number
  }
  ghgTrendData: Array<{
    date: string
    intensity: number
    target: number
  }>
  recentVoyages: VoyageWithVessel[]
  fleetStatus: Array<{
    id: string
    name: string
    status: string
    complianceScore: number
  }>
}

export interface ComplianceCalculationDTO {
  fuelConsumed: number
  fuelType: string
  distance: number
  year?: number
}

export interface ComplianceResult {
  co2Emissions: number
  ghgIntensity: number
  complianceBalance: number
  target: number
  isCompliant: boolean
  estimatedPenalty: number
}

export interface ComplianceTarget {
  year: number
  target: number
}
