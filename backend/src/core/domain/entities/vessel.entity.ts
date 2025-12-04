export interface Vessel {
  id: string
  name: string
  imo: string
  type: string
  flag: string
  grossTonnage: number
  deadweight: number
  complianceScore: number
  status: "active" | "inactive" | "maintenance"
  createdAt: Date
  updatedAt: Date
}

export interface CreateVesselDTO {
  name: string
  imo: string
  type: string
  flag: string
  grossTonnage: number
  deadweight: number
}

export interface UpdateVesselDTO {
  name?: string
  type?: string
  flag?: string
  grossTonnage?: number
  deadweight?: number
  status?: "active" | "inactive" | "maintenance"
}
