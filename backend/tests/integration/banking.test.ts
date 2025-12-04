import request from "supertest"
import express from "express"
import { createBankingController } from "../../src/adapters/inbound/http/banking.controller"
import { jest } from "@jest/globals"

describe("Banking API Integration", () => {
  let app: express.Application
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

    app = express()
    app.use(express.json())
    app.use("/banking", createBankingController(mockBankingRepository, mockComplianceRepository))
  })

  describe("POST /banking/bank", () => {
    it("should bank surplus successfully", async () => {
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

      const response = await request(app)
        .post("/banking/bank")
        .send({ shipId: "R002", year: 2024, amount: 500000 })
        .expect(201)

      expect(response.body.type).toBe("bank")
      expect(response.body.amountGco2eq).toBe(500000)
    })

    it("should return 400 for invalid request", async () => {
      mockComplianceRepository.findByShipAndYear.mockResolvedValue({
        id: "1",
        shipId: "R003",
        year: 2024,
        cbGco2eq: -500000, // Deficit - cannot bank
      })

      await request(app).post("/banking/bank").send({ shipId: "R003", year: 2024, amount: 100000 }).expect(400)
    })
  })

  describe("POST /banking/apply", () => {
    it("should apply banked surplus successfully", async () => {
      mockComplianceRepository.findByShipAndYear.mockResolvedValue({
        id: "1",
        shipId: "R003",
        year: 2024,
        cbGco2eq: -500000,
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

      const response = await request(app)
        .post("/banking/apply")
        .send({ shipId: "R003", year: 2024, amount: 300000 })
        .expect(200)

      expect(response.body.cbBefore).toBe(-500000)
      expect(response.body.applied).toBe(300000)
      expect(response.body.cbAfter).toBe(-200000)
    })

    it("should return 400 when applying more than available", async () => {
      mockComplianceRepository.findByShipAndYear.mockResolvedValue({
        id: "1",
        shipId: "R003",
        year: 2024,
        cbGco2eq: -500000,
      })
      mockBankingRepository.getTotalBanked.mockResolvedValue(100000)
      mockBankingRepository.getTotalApplied.mockResolvedValue(0)

      await request(app).post("/banking/apply").send({ shipId: "R003", year: 2024, amount: 200000 }).expect(400)
    })
  })
})
