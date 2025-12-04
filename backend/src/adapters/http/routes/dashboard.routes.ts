import { Router, type Request, type Response } from "express"
import { VesselUseCases } from "../../../application/use-cases/vessel.use-cases"
import { VoyageUseCases } from "../../../application/use-cases/voyage.use-cases"
import { BankingUseCases } from "../../../application/use-cases/banking.use-cases"
import { PoolUseCases } from "../../../application/use-cases/pool.use-cases"
import { asyncHandler } from "../../../shared/middleware/async-handler"

const router = Router()

// GET /api/dashboard
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const [vessels, voyages, bankingSummary, pools] = await Promise.all([
      VesselUseCases.getAllVessels(),
      VoyageUseCases.getAllVoyages(),
      BankingUseCases.getComplianceSummary(),
      PoolUseCases.getAllPools(),
    ])

    // Calculate stats
    const activeVessels = vessels.filter((v) => v.status === "active").length
    const avgComplianceScore =
      vessels.length > 0 ? vessels.reduce((sum, v) => sum + v.complianceScore, 0) / vessels.length : 0

    const completedVoyages = voyages.filter((v) => v.status === "completed").length
    const totalEmissions = voyages.reduce((sum, v) => sum + v.co2Emissions, 0)
    const avgGHGIntensity =
      voyages.length > 0 ? voyages.reduce((sum, v) => sum + v.ghgIntensity, 0) / voyages.length : 0

    // GHG Intensity trend data for chart
    const ghgTrendData = voyages
      .slice(0, 12)
      .reverse()
      .map((v) => ({
        date: v.departureDate,
        intensity: v.ghgIntensity,
        target: 89.34,
      }))

    res.json({
      success: true,
      data: {
        stats: {
          totalVessels: vessels.length,
          activeVessels,
          avgComplianceScore: Math.round(avgComplianceScore * 10) / 10,
          completedVoyages,
          totalEmissions: Math.round(totalEmissions),
          avgGHGIntensity: Math.round(avgGHGIntensity * 10) / 10,
          complianceTarget: 89.34,
          totalSurplus: bankingSummary.totalSurplus,
          totalDeficit: bankingSummary.totalDeficit,
          netBalance: bankingSummary.netBalance,
          activePools: pools.filter((p) => p.status === "active").length,
        },
        ghgTrendData,
        recentVoyages: voyages.slice(0, 5),
        fleetStatus: vessels.map((v) => ({
          id: v.id,
          name: v.name,
          status: v.status,
          complianceScore: v.complianceScore,
        })),
      },
    })
  }),
)

export { router as dashboardRouter }
