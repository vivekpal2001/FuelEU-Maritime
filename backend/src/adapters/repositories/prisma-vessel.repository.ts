import { PrismaClient } from "@prisma/client"
import type { IVesselRepository } from "../../ports/repositories/vessel.repository.port"
import type { Vessel, CreateVesselDTO, UpdateVesselDTO } from "../../core/domain/entities/vessel.entity"

const prisma = new PrismaClient()

export class PrismaVesselRepository implements IVesselRepository {
  async findAll(): Promise<Vessel[]> {
    return prisma.vessel.findMany({
      orderBy: { createdAt: "desc" },
    }) as Promise<Vessel[]>
  }

  async findById(id: string): Promise<Vessel | null> {
    return prisma.vessel.findUnique({
      where: { id },
    }) as Promise<Vessel | null>
  }

  async findByIMO(imo: string): Promise<Vessel | null> {
    return prisma.vessel.findUnique({
      where: { imo },
    }) as Promise<Vessel | null>
  }

  async create(data: CreateVesselDTO): Promise<Vessel> {
    return prisma.vessel.create({
      data,
    }) as Promise<Vessel>
  }

  async update(id: string, data: UpdateVesselDTO): Promise<Vessel> {
    return prisma.vessel.update({
      where: { id },
      data,
    }) as Promise<Vessel>
  }

  async delete(id: string): Promise<void> {
    await prisma.vessel.delete({
      where: { id },
    })
  }

  async count(): Promise<number> {
    return prisma.vessel.count()
  }
}
