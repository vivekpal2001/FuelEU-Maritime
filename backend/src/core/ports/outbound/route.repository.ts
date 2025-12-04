import type { Route } from "../../domain/entities/route.entity"
import type { RouteFilters } from "../inbound/route.port"

export interface IRouteRepository {
  findAll(filters?: RouteFilters): Promise<Route[]>
  findById(id: string): Promise<Route | null>
  findByRouteId(routeId: string): Promise<Route | null>
  findBaseline(): Promise<Route | null>
  update(id: string, data: Partial<Route>): Promise<Route>
  clearBaseline(): Promise<void>
}
