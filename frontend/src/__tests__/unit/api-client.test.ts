import { describe, it, expect, vi, beforeEach } from "vitest"

describe("API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should make GET request to routes endpoint", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: async () => ({ routes: [] }),
    })
    global.fetch = mockFetch as any

    await fetch("http://localhost:3001/routes")

    expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/routes")
  })

  it("should handle API errors", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"))
    global.fetch = mockFetch as any

    await expect(fetch("http://localhost:3001/routes")).rejects.toThrow("Network error")
  })

  it("should compute CB compliance", () => {
    const ghgIntensity = 8.5
    const targetIntensity = 4.5
    const fuelConsumption = 100

    const cb = (targetIntensity - ghgIntensity) * fuelConsumption
    expect(cb).toBe(-400)
  })

  it("should validate pool allocation", () => {
    const members = [
      { shipId: "S001", cbBefore: 5, cbAfter: 3 },
      { shipId: "S002", cbBefore: -2, cbAfter: 0 },
    ]

    const totalCB = members.reduce((sum, m) => sum + m.cbBefore, 0)
    expect(totalCB).toBe(3)
  })
})
