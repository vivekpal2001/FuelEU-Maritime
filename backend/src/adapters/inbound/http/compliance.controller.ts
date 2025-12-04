import { Router, type Request, type Response } from "express"
import { ComputeCBUseCase } from "../../../core/application/use-cases/compute-cb.use-case"
import { GetAdjustedCBUseCase } from "../../../core/application/use-cases/get-adjusted-cb.use-case"
import type { IRouteRepository } from "../../../core/ports/outbound/route.repository"
import type { IComplianceRepository } from "../../../core/ports/outbound/compliance.repository"
import type { IBankingRepository } from "../../../core/ports/outbound/banking.repository"

export function createComplianceController(
  routeRepository: IRouteRepository,
  complianceRepository: IComplianceRepository,
  bankingRepository: IBankingRepository,
): Router {
  const router = Router()

  // GET /compliance/cb?shipId&year - Compute and return CB
  router.get("/cb", async (req: Request, res: Response) => {
    try {
      const shipId = req.query.shipId as string
      const year = Number.parseInt(req.query.year as string)

      if (!shipId || isNaN(year)) {
        return res.status(400).json({ error: "shipId and year are required" })
      }

      const useCase = new ComputeCBUseCase(routeRepository, complianceRepository)
      const result = await useCase.execute(shipId, year)
      return res.json(result) // Added missing return statement
    } catch (error: any) {
      return res.status(400).json({ error: error.message })
    }
  })

  // GET /compliance/adjusted-cb?shipId&year - Get adjusted CB after banking
  router.get("/adjusted-cb", async (req: Request, res: Response) => {
    try {
      const shipId = req.query.shipId as string
      const year = Number.parseInt(req.query.year as string)

      if (!shipId || isNaN(year)) {
        return res.status(400).json({ error: "shipId and year are required" })
      }

      const useCase = new GetAdjustedCBUseCase(routeRepository, complianceRepository, bankingRepository)
      const result = await useCase.execute(shipId, year)
      return res.json(result) // Added missing return statement
    } catch (error: any) {
      return res.status(400).json({ error: error.message })
    }
  })

  return router
}
