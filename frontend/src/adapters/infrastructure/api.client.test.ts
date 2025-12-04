import { describe, it, expect, vi, beforeEach } from "vitest"
import axios from "axios"

// Mock axios
vi.mock("axios")

const API_BASE_URL = "http://localhost:3001"

// Simplified API client for testing
const testApiClient = {
  async getRoutes() {
    const response = await axios.get(`${API_BASE_URL}/routes`)
    return response.data
  },
  async setBaseline(routeId: string) {
    const response = await axios.post(`${API_BASE_URL}/routes/${routeId}/baseline`)
    return response.data
  },
  async getComparison() {
    const response = await axios.get(`${API_BASE_URL}/routes/comparison`)
    return response.data
  },
}

describe("API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getRoutes", () => {
    it("should fetch routes from API", async () => {
      const mockRoutes = [
        { id: "1", routeId: "R001", ghgIntensity: 91.0 },
        { id: "2", routeId: "R002", ghgIntensity: 88.0 },
      ]

      vi.mocked(axios.get).mockResolvedValue({ data: mockRoutes })

      const result = await testApiClient.getRoutes()

      expect(axios.get).toHaveBeenCalledWith("http://localhost:3001/routes")
      expect(result).toEqual(mockRoutes)
    })
  })

  describe("setBaseline", () => {
    it("should call POST endpoint to set baseline", async () => {
      const mockResponse = { id: "1", routeId: "R001", isBaseline: true }

      vi.mocked(axios.post).mockResolvedValue({ data: mockResponse })

      const result = await testApiClient.setBaseline("1")

      expect(axios.post).toHaveBeenCalledWith("http://localhost:3001/routes/1/baseline")
      expect(result.isBaseline).toBe(true)
    })
  })

  describe("getComparison", () => {
    it("should fetch comparison data from API", async () => {
      const mockComparison = [
        { baseline: { routeId: "R001" }, comparison: { routeId: "R002" }, percentDiff: -3.3, compliant: true },
      ]

      vi.mocked(axios.get).mockResolvedValue({ data: mockComparison })

      const result = await testApiClient.getComparison()

      expect(axios.get).toHaveBeenCalledWith("http://localhost:3001/routes/comparison")
      expect(result).toHaveLength(1)
    })
  })
})
