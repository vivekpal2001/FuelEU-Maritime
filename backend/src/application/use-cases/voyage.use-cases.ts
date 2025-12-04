import { PrismaVoyageRepository } from "../../adapters/repositories/prisma-voyage.repository"
import type { VoyageFilters } from "../../ports/repositories/voyage.repository.port"
import type { CreateVoyageDTO, UpdateVoyageDTO, VoyageWithVessel } from "../../core/domain/entities/voyage.entity"
import { ComplianceCalculatorService } from "../../core/domain/services/compliance-calculator.service"

const voyageRepository = new PrismaVoyageRepository()

export class VoyageUseCases {
  static async getAllVoyages(filters?: VoyageFilters): Promise<VoyageWithVessel[]> {
    return voyageRepository.findAll(filters)
  }

  static async getVoyageById(id: string): Promise<VoyageWithVessel | null> {
    return voyageRepository.findById(id)
  }

  static async createVoyage(data: CreateVoyageDTO) {
    // Calculate compliance metrics
    const co2Emissions = ComplianceCalculatorService.calculateCO2Emissions(data.fuelConsumed, data.fuelType)
    const ghgIntensity = ComplianceCalculatorService.calculateGHGIntensity(co2Emissions, data.distance)
    const complianceBalance = ComplianceCalculatorService.calculateComplianceBalance(ghgIntensity)

    return voyageRepository.create({
      ...data,
      co2Emissions,
      ghgIntensity,
      complianceBalance,
    })
  }

  static async updateVoyage(id: string, data: UpdateVoyageDTO) {
    const existing = await voyageRepository.findById(id)
    if (!existing) {
      throw new Error("Voyage not found")
    }
    return voyageRepository.update(id, data)
  }

  static async deleteVoyage(id: string): Promise<void> {
    const existing = await voyageRepository.findById(id)
    if (!existing) {
      throw new Error("Voyage not found")
    }
    return voyageRepository.delete(id)
  }

  static async compareVoyages(voyageIds: string[]) {
    const voyages = await Promise.all(voyageIds.map((id) => voyageRepository.findById(id)))

    const validVoyages = voyages.filter((v): v is VoyageWithVessel => v !== null)

    if (validVoyages.length < 2) {
      throw new Error("At least 2 valid voyages required for comparison")
    }

    return {
      voyages: validVoyages,
      comparison: {
        avgGHGIntensity: validVoyages.reduce((sum, v) => sum + v.ghgIntensity, 0) / validVoyages.length,
        avgComplianceBalance: validVoyages.reduce((sum, v) => sum + v.complianceBalance, 0) / validVoyages.length,
        totalEmissions: validVoyages.reduce((sum, v) => sum + v.co2Emissions, 0),
        totalDistance: validVoyages.reduce((sum, v) => sum + v.distance, 0),
      },
    }
  }
}
