import request from "supertest"
import express from "express"
import { createPoolsController } from "../../src/adapters/inbound/http/pools.controller"
import { jest } from "@jest/globals"

describe("Pools API Integration", () => {
  let app: express.Application
  let mockPoolRepository: any

  beforeEach(() => {
    mockPoolRepository = {
      create: jest.fn(),
      addMember: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    }

    app = express()
    app.use(express.json())
    app.use("/pools", createPoolsController(mockPoolRepository))
  })

  describe("POST /pools", () => {
    it("should create pool with valid members", async () => {
      mockPoolRepository.create.mockResolvedValue({
        id: "pool-1",
        year: 2024,
        createdAt: new Date(),
      })

      const response = await request(app)
        .post("/pools")
        .send({
          year: 2024,
          members: [
            { shipId: "SURPLUS", cbBefore: 1000000 },
            { shipId: "DEFICIT", cbBefore: -500000 },
          ],
        })
        .expect(200)

      expect(response.body.poolId).toBe("pool-1")
      expect(response.body.members).toHaveLength(2)
      expect(response.body.totalCB).toBe(500000)
    })

    it("should return 400 for invalid pool (negative total CB)", async () => {
      await request(app)
        .post("/pools")
        .send({
          year: 2024,
          members: [
            { shipId: "SMALL", cbBefore: 100 },
            { shipId: "BIG_DEFICIT", cbBefore: -500 },
          ],
        })
        .expect(400)
    })

    it("should return 400 for empty pool", async () => {
      await request(app)
        .post("/pools")
        .send({
          year: 2024,
          members: [],
        })
        .expect(400)
    })
  })
})
