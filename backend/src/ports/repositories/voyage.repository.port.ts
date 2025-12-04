import type {
  Voyage,
  CreateVoyageDTO,
  UpdateVoyageDTO,
  VoyageWithVessel,
} from "../../core/domain/entities/voyage.entity"

export interface IVoyageRepository {
  findAll(filters?: VoyageFilters): Promise<VoyageWithVessel[]>
  findById(id: string): Promise<VoyageWithVessel | null>
  findByVesselId(vesselId: string): Promise<Voyage[]>
  create(
    data: CreateVoyageDTO & { co2Emissions: number; ghgIntensity: number; complianceBalance: number },
  ): Promise<Voyage>
  update(id: string, data: UpdateVoyageDTO): Promise<Voyage>
  delete(id: string): Promise<void>
  count(): Promise<number>
}

export interface VoyageFilters {
  vesselId?: string
  status?: string
  startDate?: Date
  endDate?: Date
}
