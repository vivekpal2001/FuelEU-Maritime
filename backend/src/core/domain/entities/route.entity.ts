export interface Route {
  id: string
  routeId: string
  vesselType: string
  fuelType: string
  year: number
  ghgIntensity: number // gCO₂e/MJ
  fuelConsumption: number // tonnes
  distance: number // km
  totalEmissions: number // tonnes
  isBaseline: boolean
  createdAt: Date
  updatedAt: Date
}

export interface RouteComparison {
  baseline: Route
  comparison: Route
  percentDiff: number
  compliant: boolean
}

export type CreateRouteDTO = Omit<Route, "id" | "createdAt" | "updatedAt">
export type UpdateRouteDTO = Partial<CreateRouteDTO>
