import type {
  Pool,
  CreatePoolRequest,
  PoolAllocationResult,
  PoolValidationResult,
} from "../../domain/entities/pool.entity"

export interface IPoolService {
  createPool(request: CreatePoolRequest): Promise<PoolAllocationResult>
  validatePool(request: CreatePoolRequest): PoolValidationResult
  getPoolById(id: string): Promise<Pool | null>
  getAllPools(): Promise<Pool[]>
}
