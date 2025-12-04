import type { CreatePoolRequest, PoolAllocationResult } from "../../domain/entities/pool.entity"
import type { IPoolRepository } from "../../ports/outbound/pool.repository"
import { PoolingAllocatorService } from "../../domain/services/pooling-allocator.service"

export class CreatePoolUseCase {
  constructor(private poolRepository: IPoolRepository) {}

  async execute(request: CreatePoolRequest): Promise<PoolAllocationResult> {
    // Validate pool
    const validation = PoolingAllocatorService.validatePool(request.members)
    if (!validation.valid) {
      throw new Error(`Pool validation failed: ${validation.errors.join(", ")}`)
    }

    // Allocate CB using greedy algorithm
    const allocatedMembers = PoolingAllocatorService.allocate(request.members)

    // Create pool in database
    const pool = await this.poolRepository.create(request.year)

    // Add members with allocations
    for (const member of allocatedMembers) {
      await this.poolRepository.addMember({
        poolId: pool.id,
        shipId: member.shipId,
        cbBefore: member.cbBefore,
        cbAfter: member.cbAfter,
      })
    }

    return {
      poolId: pool.id,
      year: request.year,
      members: allocatedMembers,
      totalCB: validation.totalCB,
    }
  }
}
