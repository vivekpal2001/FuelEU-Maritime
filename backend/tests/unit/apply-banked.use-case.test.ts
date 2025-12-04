import { ApplyBankedUseCase } from "../../src/core/application/use-cases/apply-banked.use-case"
import { jest } from "@jest/globals"

describe("ApplyBankedUseCase", () => {
  let useCase: ApplyBankedUseCase
  let mockBankingRepository: any
  let mockComplianceRepository: any

  beforeEach(() => {
    mockBankingRepository = {
      create: jest.fn(),
      findByShipAndYear: jest.fn(),
      getTotalBanked: jest.fn(),
      getTotalApplied: jest.fn(),
    }

    mockComplianceRepository = {
      findByShipAndYear: jest.fn(),
      upsert: jest.fn(),
    }

    useCase = new ApplyBankedUseCase(mockBankingRepository, mockComplianceRepository)
  })

  it("should successfully apply banked surplus to deficit", async () => {
    mockComplianceRepository.findByShipAndYear.mockResolvedValue({
      id: "1",
      shipId: "R003",
      year: 2024,
      cbGco2eq: -500000, // Deficit
    })
    mockBankingRepository.getTotalBanked.mockResolvedValue(1000000)
    mockBankingRepository.getTotalApplied.mockResolvedValue(0)
    mockBankingRepository.create.mockResolvedValue({
      id: "1",
      shipId: "R003",
      year: 2024,
      amountGco2eq: 300000,
      type: "apply",
      createdAt: new Date(),
    })

    const result = await useCase.execute("R003", 2024, 300000)

    expect(result.cbBefore).toBe(-500000)
    expect(result.applied).toBe(300000)
    expect(result.cbAfter).toBe(-200000) // -500000 + 300000
  })

  it("should reject applying negative or zero amount", async () => {
    await expect(useCase.execute("R003", 2024, 0)).rejects.toThrow("Apply amount must be positive")
  })

  it("should reject applying more than available banked amount", async () => {
    mockComplianceRepository.findByShipAndYear.mockResolvedValue({
      id: "1",
      shipId: "R003",
      year: 2024,
      cbGco2eq: -500000,
    })
    mockBankingRepository.getTotalBanked.mockResolvedValue(200000)
    mockBankingRepository.getTotalApplied.mockResolvedValue(100000)
    // Available: 200000 - 100000 = 100000

    await expect(useCase.execute("R003", 2024, 150000)).rejects.toThrow(
      "Cannot apply 150000: only 100000 banked surplus available",
    )
  })

  it("should throw error for non-existent compliance record", async () => {
    mockComplianceRepository.findByShipAndYear.mockResolvedValue(null)

    await expect(useCase.execute("INVALID", 2024, 1000)).rejects.toThrow(
      "No compliance record found for ship INVALID in year 2024",
    )
  })
})
