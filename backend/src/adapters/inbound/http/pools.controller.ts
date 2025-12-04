import { Router, type Request, type Response } from "express"
import { CreatePoolUseCase } from "../../../core/application/use-cases/create-pool.use-case"
import type { IPoolRepository } from "../../../core/ports/outbound/pool.repository"
import { PoolingAllocatorService } from "../../../core/domain/services/pooling-allocator.service"

export function createPoolsController(poolRepository: IPoolRepository): Router {
  const router = Router()

  // POST /pools - Create a pool with members
  router.post("/", async (req: Request, res: Response) => {
    try {
      const { year, members } = req.body

      if (!year || !members || !Array.isArray(members)) {
        return res.status(400).json({ error: "year and members array are required" })
      }

      // Validate pool first
      const validation = PoolingAllocatorService.validatePool(members)
      if (!validation.valid) {
        return res.status(400).json({
          error: "Pool validation failed",
          details: validation.errors,
          totalCB: validation.totalCB,
        })
      }

      const useCase = new CreatePoolUseCase(poolRepository)
      const result = await useCase.execute({ year, members })
      return res.status(201).json(result)
    } catch (error: any) {
      return res.status(400).json({ error: error.message })
    }
  })

  // GET /pools - Get all pools
  router.get("/", async (req: Request, res: Response) => {
    try {
      const pools = await poolRepository.findAll()
      return res.json(pools) // Added missing return statement
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  })

  // GET /pools/:id - Get pool by ID
  router.get("/:id", async (req: Request, res: Response) => {
    try {
      const pool = await poolRepository.findById(req.params.id)
      if (!pool) {
        return res.status(404).json({ error: "Pool not found" })
      }
      return res.json(pool) // Added missing return statement
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  })

  return router
}
