import type { Route, RouteComparison } from "../../domain/entities/route.entity"

export interface IRouteService {
  getAllRoutes(filters?: RouteFilters): Promise<Route[]>
  getRouteById(id: string): Promise<Route | null>
  setBaseline(routeId: string): Promise<Route>
  getComparison(): Promise<RouteComparison[]>
}

export interface RouteFilters {
  vesselType?: string
  fuelType?: string
  year?: number
}
