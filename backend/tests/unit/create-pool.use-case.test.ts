import { CreatePoolUseCase } from "../../src/core/application/use-cases/create-pool.use-case"
import { jest } from "@jest/globals"

describe("CreatePoolUseCase", () => {
  let useCase: CreatePoolUseCase
  let mockPoolRepository: any

  beforeEach(() => {
    mockPoolRepository = {
      create: jest.fn(),
      addMember: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    }

    useCase = new CreatePoolUseCase(mockPoolRepository)
  })

  it("should create pool with valid members and allocate CB", async () => {
    mockPoolRepository.create.mockResolvedValue({
      id: "pool-1",
      year: 2024,
      createdAt: new Date(),
    })
    mockPoolRepository.addMember.mockResolvedValue({
      id: "member-1",
      poolId: "pool-1",
      shipId: "SURPLUS",
      cbBefore: 1000000,
      cbAfter: 500000,
    })

    const result = await useCase.execute({
      year: 2024,
      members: [
        { shipId: "SURPLUS", cbBefore: 1000000 },
        { shipId: "DEFICIT", cbBefore: -500000 },
      ],
    })

    expect(result.poolId).toBe("pool-1")
    expect(result.year).toBe(2024)
    expect(result.totalCB).toBe(500000)
    expect(result.members).toHaveLength(2)

    // Verify allocation occurred
    const surplus = result.members.find((m: any) => m.shipId === "SURPLUS")!
    const deficit = result.members.find((m: any) => m.shipId === "DEFICIT")!

    expect(surplus.cbAfter).toBeLessThan(surplus.cbBefore) // Transferred some
    expect(deficit.cbAfter).toBeGreaterThan(deficit.cbBefore) // Received some
  })

  it("should reject pool with negative total CB", async () => {
    await expect(
      useCase.execute({
        year: 2024,
        members: [
          { shipId: "SMALL_SURPLUS", cbBefore: 100000 },
          { shipId: "BIG_DEFICIT", cbBefore: -500000 },
        ],
      }),
    ).rejects.toThrow("Pool validation failed")
  })

  it("should reject empty pool", async () => {
    await expect(
      useCase.execute({
        year: 2024,
        members: [],
      }),
    ).rejects.toThrow("Pool validation failed")
  })

  it("should add all members to repository", async () => {
    mockPoolRepository.create.mockResolvedValue({
      id: "pool-1",
      year: 2024,
      createdAt: new Date(),
    })

    mockPoolRepository.addMember.mockResolvedValue({
      id: "member-1",
      poolId: "pool-1",
      shipId: "SHIP1",
      cbBefore: 1000,
      cbAfter: 900,
    })

    await useCase.execute({
      year: 2024,
      members: [
        { shipId: "SHIP1", cbBefore: 1000 },
        { shipId: "SHIP2", cbBefore: 500 },
        { shipId: "SHIP3", cbBefore: -300 },
      ],
    })

    expect(mockPoolRepository.addMember).toHaveBeenCalledTimes(3)
  })
})
