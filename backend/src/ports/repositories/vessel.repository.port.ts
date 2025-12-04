import type { Vessel, CreateVesselDTO, UpdateVesselDTO } from "../../core/domain/entities/vessel.entity"

export interface IVesselRepository {
  findAll(): Promise<Vessel[]>
  findById(id: string): Promise<Vessel | null>
  findByIMO(imo: string): Promise<Vessel | null>
  create(data: CreateVesselDTO): Promise<Vessel>
  update(id: string, data: UpdateVesselDTO): Promise<Vessel>
  delete(id: string): Promise<void>
  count(): Promise<number>
}
