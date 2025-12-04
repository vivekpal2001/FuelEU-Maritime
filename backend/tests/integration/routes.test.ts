import request from "supertest"
import express from "express"
import { createRoutesController } from "../../src/adapters/inbound/http/routes.controller"
import { jest } from "@jest/globals"

describe("Routes API Integration", () => {
  let app: express.Application
  let mockRouteRepository: any

  const sampleRoutes = [
    {
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
    },
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

    app = express()
    app.use(express.json())
    app.use("/routes", createRoutesController(mockRouteRepository))
  })

  describe("GET /routes", () => {
    it("should return all routes", async () => {
      mockRouteRepository.findAll.mockResolvedValue(sampleRoutes)

      const response = await request(app).get("/routes").expect(200)

      expect(response.body).toHaveLength(2)
      expect(response.body[0].routeId).toBe("R001")
    })

    it("should return empty array when no routes", async () => {
      mockRouteRepository.findAll.mockResolvedValue([])

      const response = await request(app).get("/routes").expect(200)

      expect(response.body).toEqual([])
    })
  })

  describe("GET /routes/comparison", () => {
    it("should return comparisons with baseline", async () => {
      mockRouteRepository.findBaseline.mockResolvedValue(sampleRoutes[0])
      mockRouteRepository.findAll.mockResolvedValue(sampleRoutes)

      const response = await request(app).get("/routes/comparison").expect(200)

      expect(response.body).toHaveLength(1) // Excludes baseline
      expect(response.body[0]).toHaveProperty("percentDiff")
      expect(response.body[0]).toHaveProperty("compliant")
    })

    it("should return 400 when no baseline set", async () => {
      mockRouteRepository.findBaseline.mockResolvedValue(null)

      await request(app).get("/routes/comparison").expect(400)
    })
  })
})
