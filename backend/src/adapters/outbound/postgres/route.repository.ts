import type { PrismaClient } from "@prisma/client"
import type { Route } from "../../../core/domain/entities/route.entity"
import type { IRouteRepository } from "../../../core/ports/outbound/route.repository"
import type { RouteFilters } from "../../../core/ports/inbound/route.port"

export class PostgresRouteRepository implements IRouteRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters?: RouteFilters): Promise<Route[]> {
    const where: any = {}

    if (filters?.vesselType) where.vesselType = filters.vesselType
    if (filters?.fuelType) where.fuelType = filters.fuelType
    if (filters?.year) where.year = filters.year

    const routes = await this.prisma.route.findMany({ where, orderBy: { routeId: "asc" } })
    return routes.map(this.mapToEntity)
  }

  async findById(id: string): Promise<Route | null> {
    const route = await this.prisma.route.findUnique({ where: { id } })
    return route ? this.mapToEntity(route) : null
  }

  async findByRouteId(routeId: string): Promise<Route | null> {
    const route = await this.prisma.route.findUnique({ where: { routeId } })
    return route ? this.mapToEntity(route) : null
  }

  async findBaseline(): Promise<Route | null> {
    const route = await this.prisma.route.findFirst({ where: { isBaseline: true } })
    return route ? this.mapToEntity(route) : null
  }

  async update(id: string, data: Partial<Route>): Promise<Route> {
    const route = await this.prisma.route.update({
      where: { id },
      data: {
        vesselType: data.vesselType,
        fuelType: data.fuelType,
        year: data.year,
        ghgIntensity: data.ghgIntensity,
        fuelConsumption: data.fuelConsumption,
        distance: data.distance,
        totalEmissions: data.totalEmissions,
        isBaseline: data.isBaseline,
      },
    })
    return this.mapToEntity(route)
  }

  async clearBaseline(): Promise<void> {
    await this.prisma.route.updateMany({
      where: { isBaseline: true },
      data: { isBaseline: false },
    })
  }

  private mapToEntity(record: any): Route {
    return {
      id: record.id,
      routeId: record.routeId,
      vesselType: record.vesselType,
      fuelType: record.fuelType,
      year: record.year,
      ghgIntensity: record.ghgIntensity,
      fuelConsumption: record.fuelConsumption,
      distance: record.distance,
      totalEmissions: record.totalEmissions,
      isBaseline: record.isBaseline,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }
  }
}
