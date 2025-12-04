import type { Route } from "../../domain/entities/route.entity"
import type { IRouteRepository } from "../../ports/outbound/route.repository"
import type { RouteFilters } from "../../ports/inbound/route.port"

export class GetRoutesUseCase {
  constructor(private routeRepository: IRouteRepository) {}

  async execute(filters?: RouteFilters): Promise<Route[]> {
    return this.routeRepository.findAll(filters)
  }
}
