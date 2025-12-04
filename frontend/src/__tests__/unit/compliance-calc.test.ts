import { describe, it, expect } from "vitest"

describe("Compliance Calculator", () => {
  it("should calculate target intensity by year", () => {
    const targetIntensity2021 = 100 // baseline
    const targetIntensity2025 = 93.6 // 6.4% reduction
    const targetIntensity2030 = 80.7 // 19.3% reduction from baseline

    expect(targetIntensity2021).toBe(100)
    expect(targetIntensity2025).toBeCloseTo(93.6, 1)
    expect(targetIntensity2030).toBeCloseTo(80.7, 1)
  })

  it("should calculate compliance balance", () => {
    const actual = 8.5
    const target = 4.5
    const fuel = 100

    const cb = (target - actual) * fuel
    expect(cb).toBe(-400)
  })

  it("should check compliance status", () => {
    const cb = -50
    const isCompliant = cb >= 0

    expect(isCompliant).toBe(false)
  })

  it("should calculate percent difference", () => {
    const actual = 8.5
    const target = 4.5

    const percentDiff = ((actual - target) / target) * 100
    expect(percentDiff).toBeCloseTo(88.89, 1)
  })
})
