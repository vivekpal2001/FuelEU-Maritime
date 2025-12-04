import { ComputeCBUseCase } from "../../src/core/application/use-cases/compute-cb.use-case"
import jest from "jest"

describe("ComputeCBUseCase", () => {
  let useCase: ComputeCBUseCase
  let mockRouteRepository: any
  let mockComplianceRepository: any

  beforeEach(() => {
    mockRouteRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByRouteId: jest.fn(),
      findBaseline: jest.fn(),
      clearBaseline: jest.fn(),
      update: jest.fn(),
    }

    mockComplianceRepository = {
      findByShipAndYear: jest.fn(),
      upsert: jest.fn(),
    }

    useCase = new ComputeCBUseCase(mockRouteRepository, mockComplianceRepository)
  })

  it("should compute positive CB for low intensity route", async () => {
    // Route R002: ghgIntensity=88.0 (below target 89.3368)
    mockRouteRepository.findByRouteId.mockResolvedValue({
      id: "1",
      routeId: "R002",
      vesselType: "BulkCarrier",
      fuelType: "LNG",
      year: 2024,
      ghgIntensity: 88.0,
      fuelConsumption: 4800,
      distance: 11500,
      totalEmissions: 4200,
      isBaseline: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockComplianceRepository.upsert.mockResolvedValue({
      id: "1",
      shipId: "R002",
      year: 2024,
      cbGco2eq: 263106240,
    })

    const result = await useCase.execute("R002", 2024)

    expect(result.cbGco2eq).toBeGreaterThan(0) // Surplus
    expect(result.shipId).toBe("R002")
    expect(result.year).toBe(2024)
    expect(mockComplianceRepository.upsert).toHaveBeenCalled()
  })

  it("should compute negative CB for high intensity route", async () => {
    // Route R003: ghgIntensity=93.5 (above target 89.3368)
    mockRouteRepository.findByRouteId.mockResolvedValue({
      id: "3",
      routeId: "R003",
      vesselType: "Tanker",
      fuelType: "MGO",
      year: 2024,
      ghgIntensity: 93.5,
      fuelConsumption: 5100,
      distance: 12500,
      totalEmissions: 4700,
      isBaseline: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockComplianceRepository.upsert.mockResolvedValue({
      id: "1",
      shipId: "R003",
      year: 2024,
      cbGco2eq: -870505120,
    })

    const result = await useCase.execute("R003", 2024)

    expect(result.cbGco2eq).toBeLessThan(0) // Deficit
    expect(result.actualIntensity).toBe(93.5)
  })

  it("should throw error for non-existent ship", async () => {
    mockRouteRepository.findByRouteId.mockResolvedValue(null)

    await expect(useCase.execute("INVALID", 2024)).rejects.toThrow("Ship/Route with ID INVALID not found")
  })

  it("should calculate correct energy in scope", async () => {
    mockRouteRepository.findByRouteId.mockResolvedValue({
      id: "1",
      routeId: "R001",
      vesselType: "Container",
      fuelType: "HFO",
      year: 2024,
      ghgIntensity: 91.0,
      fuelConsumption: 5000,
      distance: 12000,
      totalEmissions: 4500,
      isBaseline: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockComplianceRepository.upsert.mockResolvedValue({
      id: "1",
      shipId: "R001",
      year: 2024,
      cbGco2eq: 0,
    })

    const result = await useCase.execute("R001", 2024)

    // Energy = 5000 * 41000 = 205,000,000 MJ
    expect(result.energyInScope).toBe(205000000)
  })
})
