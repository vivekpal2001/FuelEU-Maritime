import type {
  Pool,
  CreatePoolDTO,
  UpdatePoolDTO,
  AddPoolMemberDTO,
  PoolWithMembers,
} from "../../core/domain/entities/pool.entity"

export interface IPoolRepository {
  findAll(): Promise<PoolWithMembers[]>
  findById(id: string): Promise<PoolWithMembers | null>
  create(data: CreatePoolDTO): Promise<Pool>
  update(id: string, data: UpdatePoolDTO): Promise<Pool>
  delete(id: string): Promise<void>
  addMember(poolId: string, data: AddPoolMemberDTO): Promise<void>
  removeMember(poolId: string, vesselId: string): Promise<void>
  updateMemberShare(poolId: string, vesselId: string, share: number): Promise<void>
  recalculatePoolBalance(poolId: string): Promise<number>
}
