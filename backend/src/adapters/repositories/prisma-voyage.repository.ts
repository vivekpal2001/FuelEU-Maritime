import { PrismaClient } from "@prisma/client"
import type { IVoyageRepository, VoyageFilters } from "../../ports/repositories/voyage.repository.port"
import type {
  Voyage,
  CreateVoyageDTO,
  UpdateVoyageDTO,
  VoyageWithVessel,
} from "../../core/domain/entities/voyage.entity"

const prisma = new PrismaClient()

export class PrismaVoyageRepository implements IVoyageRepository {
  async findAll(filters?: VoyageFilters): Promise<VoyageWithVessel[]> {
    const where: any = {}

    if (filters?.vesselId) where.vesselId = filters.vesselId
    if (filters?.status) where.status = filters.status
    if (filters?.startDate || filters?.endDate) {
      where.departureDate = {}
      if (filters.startDate) where.departureDate.gte = filters.startDate
      if (filters.endDate) where.departureDate.lte = filters.endDate
    }

    return prisma.voyage.findMany({
      where,
      include: {
        vessel: {
          select: {
            name: true,
            imo: true,
            type: true,
          },
        },
      },
      orderBy: { departureDate: "desc" },
    }) as Promise<VoyageWithVessel[]>
  }

  async findById(id: string): Promise<VoyageWithVessel | null> {
    return prisma.voyage.findUnique({
      where: { id },
      include: {
        vessel: {
          select: {
            name: true,
            imo: true,
            type: true,
          },
        },
      },
    }) as Promise<VoyageWithVessel | null>
  }

  async findByVesselId(vesselId: string): Promise<Voyage[]> {
    return prisma.voyage.findMany({
      where: { vesselId },
      orderBy: { departureDate: "desc" },
    }) as Promise<Voyage[]>
  }

  async create(
    data: CreateVoyageDTO & { co2Emissions: number; ghgIntensity: number; complianceBalance: number },
  ): Promise<Voyage> {
    return prisma.voyage.create({
      data: {
        ...data,
        status: "completed",
      },
    }) as Promise<Voyage>
  }

  async update(id: string, data: UpdateVoyageDTO): Promise<Voyage> {
    return prisma.voyage.update({
      where: { id },
      data,
    }) as Promise<Voyage>
  }

  async delete(id: string): Promise<void> {
    await prisma.voyage.delete({
      where: { id },
    })
  }

  async count(): Promise<number> {
    return prisma.voyage.count()
  }
}
