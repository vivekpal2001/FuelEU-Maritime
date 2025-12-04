import type { Route } from "../../domain/entities/route.entity"
import type { IRouteRepository } from "../../ports/outbound/route.repository"

export class SetBaselineUseCase {
  constructor(private routeRepository: IRouteRepository) {}

  async execute(routeId: string): Promise<Route> {
    // Find the route by routeId (e.g., "R001")
    const route = await this.routeRepository.findByRouteId(routeId)
    if (!route) {
      throw new Error(`Route with ID ${routeId} not found`)
    }

    // Clear any existing baseline
    await this.routeRepository.clearBaseline()

    // Set this route as baseline
    return this.routeRepository.update(route.id, { isBaseline: true })
  }
}
