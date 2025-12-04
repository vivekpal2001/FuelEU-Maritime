import { Router, type Request, type Response } from "express"
import { VesselUseCases } from "../../../application/use-cases/vessel.use-cases"
import { asyncHandler } from "../../../shared/middleware/async-handler"

const router = Router()

// GET /api/vessels
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const vessels = await VesselUseCases.getAllVessels()
    res.json({ success: true, data: vessels })
  }),
)

// GET /api/vessels/:id
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const vessel = await VesselUseCases.getVesselById(req.params.id)
    if (!vessel) {
      return res.status(404).json({ success: false, error: "Vessel not found" })
    }
    res.json({ success: true, data: vessel })
  }),
)

// POST /api/vessels
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const vessel = await VesselUseCases.createVessel(req.body)
    res.status(201).json({ success: true, data: vessel })
  }),
)

// PUT /api/vessels/:id
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const vessel = await VesselUseCases.updateVessel(req.params.id, req.body)
    res.json({ success: true, data: vessel })
  }),
)

// DELETE /api/vessels/:id
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    await VesselUseCases.deleteVessel(req.params.id)
    res.json({ success: true, message: "Vessel deleted successfully" })
  }),
)

export { router as vesselRouter }
