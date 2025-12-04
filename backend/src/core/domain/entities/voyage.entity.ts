export interface Voyage {
  id: string
  vesselId: string
  voyageNumber: string
  departurePort: string
  arrivalPort: string
  departureDate: Date
  arrivalDate: Date
  distance: number
  fuelConsumed: number
  fuelType: string
  co2Emissions: number
  ghgIntensity: number
  complianceBalance: number
  status: "planned" | "in-progress" | "completed"
  createdAt: Date
  updatedAt: Date
}

export interface CreateVoyageDTO {
  vesselId: string
  voyageNumber: string
  departurePort: string
  arrivalPort: string
  departureDate: Date
  arrivalDate: Date
  distance: number
  fuelConsumed: number
  fuelType: string
}

export interface UpdateVoyageDTO {
  departurePort?: string
  arrivalPort?: string
  departureDate?: Date
  arrivalDate?: Date
  distance?: number
  fuelConsumed?: number
  fuelType?: string
  status?: "planned" | "in-progress" | "completed"
}

export interface VoyageWithVessel extends Voyage {
  vessel: {
    name: string
    imo: string
    type: string
  }
}
