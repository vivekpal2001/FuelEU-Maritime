export interface Pool {
  id: string
  year: number
  createdAt: string
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
