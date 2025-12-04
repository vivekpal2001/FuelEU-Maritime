export interface Pool {
  id: string
  year: number
  createdAt: Date
  members?: PoolMember[]
}

export interface PoolMember {
  id: string
  poolId: string
  shipId: string
  cbBefore: number
  cbAfter: number
}

export interface CreatePoolRequest {
  year: number
  members: Array<{
    shipId: string
    cbBefore: number
  }>
}

export interface PoolValidationResult {
  valid: boolean
  errors: string[]
  totalCB: number
}

export interface PoolAllocationResult {
  poolId: string
  year: number
  members: Array<{
    shipId: string
    cbBefore: number
    cbAfter: number
  }>
  totalCB: number
}

// Legacy types for compatibility
export interface LegacyPool {
  id: string
  name: string
  description: string | null
  totalBalance: number
  status: "active" | "inactive"
  createdAt: Date
  updatedAt: Date
}

export interface LegacyPoolMember {
  id: string
  poolId: string
  vesselId: string
  share: number
  joinedAt: Date
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

export interface PoolWithMembers extends LegacyPool {
  members: Array<
    LegacyPoolMember & {
      vessel: {
        id: string
        name: string
        imo: string
        complianceScore: number
      }
    }
  >
}
