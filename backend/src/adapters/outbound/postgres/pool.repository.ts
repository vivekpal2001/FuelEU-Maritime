import type { PrismaClient } from "@prisma/client"
import type { Pool, PoolMember } from "../../../core/domain/entities/pool.entity"
import type { IPoolRepository } from "../../../core/ports/outbound/pool.repository"

export class PostgresPoolRepository implements IPoolRepository {
  constructor(private prisma: PrismaClient) {}

  async create(year: number): Promise<Pool> {
    const record = await this.prisma.pool.create({
      data: { year },
      include: { members: true },
    })
    return this.mapToEntity(record)
  }

  async findById(id: string): Promise<Pool | null> {
    const record = await this.prisma.pool.findUnique({
      where: { id },
      include: { members: true },
    })
    return record ? this.mapToEntity(record) : null
  }

  async findAll(): Promise<Pool[]> {
    const records = await this.prisma.pool.findMany({
      include: { members: true },
      orderBy: { createdAt: "desc" },
    })
    return records.map((r) => this.mapToEntity(r))
  }

  async addMember(data: Omit<PoolMember, "id">): Promise<PoolMember> {
    const record = await this.prisma.poolMember.create({
      data: {
        poolId: data.poolId,
        shipId: data.shipId,
        cbBefore: data.cbBefore,
        cbAfter: data.cbAfter,
      },
    })
    return {
      id: record.id,
      poolId: record.poolId,
      shipId: record.shipId,
      cbBefore: record.cbBefore,
      cbAfter: record.cbAfter,
    }
  }

  private mapToEntity(record: any): Pool {
    return {
      id: record.id,
      year: record.year,
      createdAt: record.createdAt,
      members: record.members?.map((m: any) => ({
        id: m.id,
        poolId: m.poolId,
        shipId: m.shipId,
        cbBefore: m.cbBefore,
        cbAfter: m.cbAfter,
      })),
    }
  }
}
