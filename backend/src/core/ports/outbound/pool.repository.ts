import type { Pool, PoolMember } from "../../domain/entities/pool.entity"

export interface IPoolRepository {
  create(year: number): Promise<Pool>
  findById(id: string): Promise<Pool | null>
  findAll(): Promise<Pool[]>
  addMember(data: Omit<PoolMember, "id">): Promise<PoolMember>
}
