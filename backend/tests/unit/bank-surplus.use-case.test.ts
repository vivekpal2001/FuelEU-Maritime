import { BankSurplusUseCase } from "../../src/core/application/use-cases/bank-surplus.use-case"
import { jest } from "@jest/globals"

describe("BankSurplusUseCase", () => {
  let useCase: BankSurplusUseCase
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

    useCase = new BankSurplusUseCase(mockBankingRepository, mockComplianceRepository)
  })

  it("should successfully bank positive surplus", async () => {
    mockComplianceRepository.findByShipAndYear.mockResolvedValue({
      id: "1",
      shipId: "R002",
      year: 2024,
      cbGco2eq: 1000000,
    })
    mockBankingRepository.getTotalBanked.mockResolvedValue(0)
    mockBankingRepository.create.mockResolvedValue({
      id: "1",
      shipId: "R002",
      year: 2024,
      amountGco2eq: 500000,
      type: "bank",
      createdAt: new Date(),
    })

    const result = await useCase.execute("R002", 2024, 500000)

    expect(result.amountGco2eq).toBe(500000)
    expect(result.type).toBe("bank")
    expect(mockBankingRepository.create).toHaveBeenCalledWith({
      shipId: "R002",
      year: 2024,
      amountGco2eq: 500000,
      type: "bank",
    })
  })

  it("should reject banking negative or zero amount", async () => {
    await expect(useCase.execute("R002", 2024, 0)).rejects.toThrow("Bank amount must be positive")

    await expect(useCase.execute("R002", 2024, -100)).rejects.toThrow("Bank amount must be positive")
  })

  it("should reject banking when CB is not positive", async () => {
    mockComplianceRepository.findByShipAndYear.mockResolvedValue({
      id: "1",
      shipId: "R003",
      year: 2024,
      cbGco2eq: -500000, // Deficit
    })

    await expect(useCase.execute("R003", 2024, 100000)).rejects.toThrow(
      "Cannot bank: Compliance Balance is not positive (no surplus)",
    )
  })

  it("should reject banking more than available surplus", async () => {
    mockComplianceRepository.findByShipAndYear.mockResolvedValue({
      id: "1",
      shipId: "R002",
      year: 2024,
      cbGco2eq: 1000000,
    })
    mockBankingRepository.getTotalBanked.mockResolvedValue(800000) // Already banked

    await expect(useCase.execute("R002", 2024, 300000)).rejects.toThrow(
      "Cannot bank 300000: only 200000 surplus available",
    )
  })

  it("should throw error for non-existent compliance record", async () => {
    mockComplianceRepository.findByShipAndYear.mockResolvedValue(null)

    await expect(useCase.execute("INVALID", 2024, 1000)).rejects.toThrow(
      "No compliance record found for ship INVALID in year 2024",
    )
  })
})
