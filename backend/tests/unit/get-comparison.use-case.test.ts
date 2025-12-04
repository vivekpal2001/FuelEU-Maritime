import { GetComparisonUseCase } from "../../src/core/application/use-cases/get-comparison.use-case"
import { jest } from "@jest/globals"

describe("GetComparisonUseCase", () => {
  let useCase: GetComparisonUseCase
  let mockRouteRepository: any

  const baselineRoute = {
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
  }

  const comparisonRoutes = [
    baselineRoute,
    {
      id: "2",
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
    },
    {
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
    },
  ]

  beforeEach(() => {
    mockRouteRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByRouteId: jest.fn(),
      findBaseline: jest.fn(),
      clearBaseline: jest.fn(),
      update: jest.fn(),
    }

    useCase = new GetComparisonUseCase(mockRouteRepository)
  })

  it("should return comparisons with percent diff and compliance status", async () => {
    mockRouteRepository.findBaseline.mockResolvedValue(baselineRoute)
    mockRouteRepository.findAll.mockResolvedValue(comparisonRoutes)

    const result = await useCase.execute()

    expect(result).toHaveLength(2) // Excludes baseline itself

    // R002: 88.0 vs baseline 91.0
    const r002 = result.find((c: any) => c.comparison.routeId === "R002")!
    expect(r002.percentDiff).toBeCloseTo(-3.2967, 2) // (88/91 - 1) * 100
    expect(r002.compliant).toBe(true) // 88.0 < 89.3368

    // R003: 93.5 vs baseline 91.0
    const r003 = result.find((c: any) => c.comparison.routeId === "R003")!
    expect(r003.percentDiff).toBeCloseTo(2.7473, 2) // (93.5/91 - 1) * 100
    expect(r003.compliant).toBe(false) // 93.5 > 89.3368
  })

  it("should throw error when no baseline is set", async () => {
    mockRouteRepository.findBaseline.mockResolvedValue(null)

    await expect(useCase.execute()).rejects.toThrow("No baseline route set. Please set a baseline first.")
  })

  it("should include baseline reference in each comparison", async () => {
    mockRouteRepository.findBaseline.mockResolvedValue(baselineRoute)
    mockRouteRepository.findAll.mockResolvedValue(comparisonRoutes)

    const result = await useCase.execute()

    result.forEach((comparison: any) => {
      expect(comparison.baseline).toEqual(baselineRoute)
    })
  })
})
