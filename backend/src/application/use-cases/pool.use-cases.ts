import { PrismaPoolRepository } from "../../adapters/repositories/prisma-pool.repository"
import type {
  CreatePoolDTO,
  UpdatePoolDTO,
  AddPoolMemberDTO,
  PoolWithMembers,
} from "../../core/domain/entities/pool.entity"

const poolRepository = new PrismaPoolRepository()

export class PoolUseCases {
  static async getAllPools(): Promise<PoolWithMembers[]> {
    return poolRepository.findAll()
  }

  static async getPoolById(id: string): Promise<PoolWithMembers | null> {
    return poolRepository.findById(id)
  }

  static async createPool(data: CreatePoolDTO) {
    return poolRepository.create(data)
  }

  static async updatePool(id: string, data: UpdatePoolDTO) {
    const existing = await poolRepository.findById(id)
    if (!existing) {
      throw new Error("Pool not found")
    }
    return poolRepository.update(id, data)
  }

  static async deletePool(id: string): Promise<void> {
    const existing = await poolRepository.findById(id)
    if (!existing) {
      throw new Error("Pool not found")
    }
    return poolRepository.delete(id)
  }

  static async addMemberToPool(poolId: string, data: AddPoolMemberDTO): Promise<void> {
    const pool = await poolRepository.findById(poolId)
    if (!pool) {
      throw new Error("Pool not found")
    }

    // Check if vessel is already in pool
    const existingMember = pool.members.find((m) => m.vesselId === data.vesselId)
    if (existingMember) {
      throw new Error("Vessel is already a member of this pool")
    }

    // Validate total share doesn't exceed 100%
    const currentTotalShare = pool.members.reduce((sum, m) => sum + m.share, 0)
    if (currentTotalShare + data.share > 100) {
      throw new Error("Total share cannot exceed 100%")
    }

    return poolRepository.addMember(poolId, data)
  }

  static async removeMemberFromPool(poolId: string, vesselId: string): Promise<void> {
    const pool = await poolRepository.findById(poolId)
    if (!pool) {
      throw new Error("Pool not found")
    }

    const member = pool.members.find((m) => m.vesselId === vesselId)
    if (!member) {
      throw new Error("Vessel is not a member of this pool")
    }

    return poolRepository.removeMember(poolId, vesselId)
  }

  static async updateMemberShare(poolId: string, vesselId: string, share: number): Promise<void> {
    if (share < 0 || share > 100) {
      throw new Error("Share must be between 0 and 100")
    }
    return poolRepository.updateMemberShare(poolId, vesselId, share)
  }
}
