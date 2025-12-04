import { Router, type Request, type Response } from "express"
import { ComplianceCalculatorService } from "../../../core/domain/services/compliance-calculator.service"
import { asyncHandler } from "../../../shared/middleware/async-handler"

const router = Router()

// POST /api/compliance/calculate
router.post(
  "/calculate",
  asyncHandler(async (req: Request, res: Response) => {
    const { fuelConsumed, fuelType, distance, year = 2025 } = req.body

    const co2Emissions = ComplianceCalculatorService.calculateCO2Emissions(fuelConsumed, fuelType)
    const ghgIntensity = ComplianceCalculatorService.calculateGHGIntensity(co2Emissions, distance)
    const complianceBalance = ComplianceCalculatorService.calculateComplianceBalance(ghgIntensity, year)
    const isCompliant = ComplianceCalculatorService.isCompliant(ghgIntensity, year)
    const penalty = isCompliant ? 0 : ComplianceCalculatorService.calculatePenalty(Math.abs(complianceBalance))

    res.json({
      success: true,
      data: {
        co2Emissions: Math.round(co2Emissions * 100) / 100,
        ghgIntensity: Math.round(ghgIntensity * 100) / 100,
        complianceBalance: Math.round(complianceBalance * 100) / 100,
        target: ComplianceCalculatorService.getTargetForYear(year),
        isCompliant,
        estimatedPenalty: penalty,
      },
    })
  }),
)

// GET /api/compliance/targets
router.get(
  "/targets",
  asyncHandler(async (req: Request, res: Response) => {
    const targets = [2025, 2030, 2035, 2040, 2050].map((year) => ({
      year,
      target: ComplianceCalculatorService.getTargetForYear(year),
    }))
    res.json({ success: true, data: targets })
  }),
)

export { router as complianceRouter }
