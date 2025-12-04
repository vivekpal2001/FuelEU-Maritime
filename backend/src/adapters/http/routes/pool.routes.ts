import { Router, type Request, type Response } from "express"
import { PoolUseCases } from "../../../application/use-cases/pool.use-cases"
import { asyncHandler } from "../../../shared/middleware/async-handler"

const router = Router()

// GET /api/pools
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const pools = await PoolUseCases.getAllPools()
    res.json({ success: true, data: pools })
  }),
)

// GET /api/pools/:id
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const pool = await PoolUseCases.getPoolById(req.params.id)
    if (!pool) {
      return res.status(404).json({ success: false, error: "Pool not found" })
    }
    res.json({ success: true, data: pool })
  }),
)

// POST /api/pools
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const pool = await PoolUseCases.createPool(req.body)
    res.status(201).json({ success: true, data: pool })
  }),
)

// PUT /api/pools/:id
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const pool = await PoolUseCases.updatePool(req.params.id, req.body)
    res.json({ success: true, data: pool })
  }),
)

// DELETE /api/pools/:id
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    await PoolUseCases.deletePool(req.params.id)
    res.json({ success: true, message: "Pool deleted successfully" })
  }),
)

// POST /api/pools/:id/members
router.post(
  "/:id/members",
  asyncHandler(async (req: Request, res: Response) => {
    await PoolUseCases.addMemberToPool(req.params.id, req.body)
    res.status(201).json({ success: true, message: "Member added to pool" })
  }),
)

// DELETE /api/pools/:id/members/:vesselId
router.delete(
  "/:id/members/:vesselId",
  asyncHandler(async (req: Request, res: Response) => {
    await PoolUseCases.removeMemberFromPool(req.params.id, req.params.vesselId)
    res.json({ success: true, message: "Member removed from pool" })
  }),
)

// PATCH /api/pools/:id/members/:vesselId
router.patch(
  "/:id/members/:vesselId",
  asyncHandler(async (req: Request, res: Response) => {
    await PoolUseCases.updateMemberShare(req.params.id, req.params.vesselId, req.body.share)
    res.json({ success: true, message: "Member share updated" })
  }),
)

export { router as poolRouter }
