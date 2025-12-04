import { PoolingAllocatorService } from "../../src/core/domain/services/pooling-allocator.service"

describe("PoolingAllocatorService", () => {
  describe("validatePool", () => {
    it("should validate pool with positive total CB", () => {
      const members = [
        { shipId: "SHIP1", cbBefore: 1000 },
        { shipId: "SHIP2", cbBefore: -500 },
      ]
      const result = PoolingAllocatorService.validatePool(members)
      expect(result.valid).toBe(true)
      expect(result.totalCB).toBe(500)
      expect(result.errors).toHaveLength(0)
    })

    it("should reject pool with negative total CB", () => {
      const members = [
        { shipId: "SHIP1", cbBefore: 100 },
        { shipId: "SHIP2", cbBefore: -500 },
      ]
      const result = PoolingAllocatorService.validatePool(members)
      expect(result.valid).toBe(false)
      expect(result.totalCB).toBe(-400)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it("should reject empty pool", () => {
      const result = PoolingAllocatorService.validatePool([])
      expect(result.valid).toBe(false)
      expect(result.errors).toContain("Pool must have at least one member.")
    })

    it("should accept pool with exactly zero total CB", () => {
      const members = [
        { shipId: "SHIP1", cbBefore: 500 },
        { shipId: "SHIP2", cbBefore: -500 },
      ]
      const result = PoolingAllocatorService.validatePool(members)
      expect(result.valid).toBe(true)
      expect(result.totalCB).toBe(0)
    })
  })

  describe("allocate", () => {
    it("should transfer surplus to deficit ships", () => {
      const members = [
        { shipId: "SURPLUS", cbBefore: 1000 },
        { shipId: "DEFICIT", cbBefore: -500 },
      ]
      const result = PoolingAllocatorService.allocate(members)

      const surplus = result.find((m) => m.shipId === "SURPLUS")!
      const deficit = result.find((m) => m.shipId === "DEFICIT")!

      // Surplus should have transferred 500 to cover deficit
      expect(surplus.cbAfter).toBe(500)
      expect(deficit.cbAfter).toBe(0)
    })

    it("should not allow surplus ship to go negative", () => {
      const members = [
        { shipId: "SURPLUS", cbBefore: 300 },
        { shipId: "DEFICIT", cbBefore: -500 },
      ]
      const result = PoolingAllocatorService.allocate(members)

      const surplus = result.find((m) => m.shipId === "SURPLUS")!
      expect(surplus.cbAfter).toBeGreaterThanOrEqual(0)
    })

    it("should handle multiple surplus and deficit ships", () => {
      const members = [
        { shipId: "SURPLUS1", cbBefore: 1000 },
        { shipId: "SURPLUS2", cbBefore: 500 },
        { shipId: "DEFICIT1", cbBefore: -300 },
        { shipId: "DEFICIT2", cbBefore: -200 },
      ]
      const result = PoolingAllocatorService.allocate(members)

      // Total surplus: 1500, Total deficit: -500
      // After allocation, deficits should be covered
      const deficit1 = result.find((m) => m.shipId === "DEFICIT1")!
      const deficit2 = result.find((m) => m.shipId === "DEFICIT2")!

      expect(deficit1.cbAfter).toBeGreaterThanOrEqual(deficit1.cbBefore)
      expect(deficit2.cbAfter).toBeGreaterThanOrEqual(deficit2.cbBefore)
    })

    it("should return empty array for empty input", () => {
      const result = PoolingAllocatorService.allocate([])
      expect(result).toHaveLength(0)
    })

    it("should preserve cbBefore values", () => {
      const members = [
        { shipId: "SHIP1", cbBefore: 1000 },
        { shipId: "SHIP2", cbBefore: -500 },
      ]
      const result = PoolingAllocatorService.allocate(members)

      const ship1 = result.find((m) => m.shipId === "SHIP1")!
      const ship2 = result.find((m) => m.shipId === "SHIP2")!

      expect(ship1.cbBefore).toBe(1000)
      expect(ship2.cbBefore).toBe(-500)
    })

    it("should not make deficit ship worse off", () => {
      const members = [
        { shipId: "SURPLUS", cbBefore: 100 },
        { shipId: "DEFICIT", cbBefore: -500 },
      ]
      const result = PoolingAllocatorService.allocate(members)

      const deficit = result.find((m) => m.shipId === "DEFICIT")!
      expect(deficit.cbAfter).toBeGreaterThanOrEqual(deficit.cbBefore)
    })
  })
})
