import { Router, type Request, type Response } from "express"
import { GetRoutesUseCase } from "../../../core/application/use-cases/get-routes.use-case"
import { SetBaselineUseCase } from "../../../core/application/use-cases/set-baseline.use-case"
import { GetComparisonUseCase } from "../../../core/application/use-cases/get-comparison.use-case"
import type { IRouteRepository } from "../../../core/ports/outbound/route.repository"

export function createRoutesController(routeRepository: IRouteRepository): Router {
  const router = Router()

  // GET /routes - Get all routes with optional filters
  router.get("/", async (req: Request, res: Response) => {
    try {
      const filters = {
        vesselType: req.query.vesselType as string | undefined,
        fuelType: req.query.fuelType as string | undefined,
        year: req.query.year ? Number.parseInt(req.query.year as string) : undefined,
      }

      const useCase = new GetRoutesUseCase(routeRepository)
      const routes = await useCase.execute(filters)
      res.json(routes)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  })

  // POST /routes/:id/baseline - Set a route as baseline
  router.post("/:id/baseline", async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const useCase = new SetBaselineUseCase(routeRepository)
      const route = await useCase.execute(id)
      res.json(route)
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  })

  // GET /routes/comparison - Get baseline vs other routes comparison
  router.get("/comparison", async (req: Request, res: Response) => {
    try {
      const useCase = new GetComparisonUseCase(routeRepository)
      const comparisons = await useCase.execute()
      res.json(comparisons)
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  })

  return router
}
