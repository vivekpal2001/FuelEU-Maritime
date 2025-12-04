import { PrismaClient } from "@prisma/client"
import type { IPoolRepository } from "../../ports/repositories/pool.repository.port"
import type {
  Pool,
  CreatePoolDTO,
  UpdatePoolDTO,
  AddPoolMemberDTO,
  PoolWithMembers,
} from "../../core/domain/entities/pool.entity"

const prisma = new PrismaClient()

export class PrismaPoolRepository implements IPoolRepository {
  async findAll(): Promise<PoolWithMembers[]> {
    return prisma.pool.findMany({
      include: {
        members: {
          include: {
            vessel: {
              select: {
                id: true,
                name: true,
                imo: true,
                complianceScore: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }) as Promise<PoolWithMembers[]>
  }

  async findById(id: string): Promise<PoolWithMembers | null> {
    return prisma.pool.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            vessel: {
              select: {
                id: true,
                name: true,
                imo: true,
                complianceScore: true,
              },
            },
          },
        },
      },
    }) as Promise<PoolWithMembers | null>
  }

  async create(data: CreatePoolDTO): Promise<Pool> {
    return prisma.pool.create({
      data,
    }) as Promise<Pool>
  }

  async update(id: string, data: UpdatePoolDTO): Promise<Pool> {
    return prisma.pool.update({
      where: { id },
      data,
    }) as Promise<Pool>
  }

  async delete(id: string): Promise<void> {
    await prisma.pool.delete({
      where: { id },
    })
  }

  async addMember(poolId: string, data: AddPoolMemberDTO): Promise<void> {
    await prisma.poolMember.create({
      data: {
        poolId,
        vesselId: data.vesselId,
        share: data.share,
      },
    })
    await this.recalculatePoolBalance(poolId)
  }

  async removeMember(poolId: string, vesselId: string): Promise<void> {
    await prisma.poolMember.deleteMany({
      where: {
        poolId,
        vesselId,
      },
    })
    await this.recalculatePoolBalance(poolId)
  }

  async updateMemberShare(poolId: string, vesselId: string, share: number): Promise<void> {
    await prisma.poolMember.updateMany({
      where: {
        poolId,
        vesselId,
      },
      data: { share },
    })
    await this.recalculatePoolBalance(poolId)
  }

  async recalculatePoolBalance(poolId: string): Promise<number> {
    const members = await prisma.poolMember.findMany({
      where: { poolId },
      include: {
        vessel: {
          include: {
            bankingAccount: true,
          },
        },
      },
    })

    const totalBalance = members.reduce((sum, member) => {
      const accountBalance = member.vessel.bankingAccount?.balance || 0
      return sum + accountBalance * (member.share / 100)
    }, 0)

    await prisma.pool.update({
      where: { id: poolId },
      data: { totalBalance },
    })

    return totalBalance
  }
}
