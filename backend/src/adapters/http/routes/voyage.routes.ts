import { Router, type Request, type Response } from "express"
import { VoyageUseCases } from "../../../application/use-cases/voyage.use-cases"
import { asyncHandler } from "../../../shared/middleware/async-handler"

const router = Router()

// GET /api/voyages
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const filters: any = {}
    if (req.query.vesselId) filters.vesselId = req.query.vesselId
    if (req.query.status) filters.status = req.query.status
    if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string)
    if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string)

    const voyages = await VoyageUseCases.getAllVoyages(filters)
    res.json({ success: true, data: voyages })
  }),
)

// GET /api/voyages/compare
router.get(
  "/compare",
  asyncHandler(async (req: Request, res: Response) => {
    const ids = (req.query.ids as string)?.split(",") || []
    if (ids.length < 2) {
      return res.status(400).json({
        success: false,
        error: "At least 2 voyage IDs required for comparison",
      })
    }
    const comparison = await VoyageUseCases.compareVoyages(ids)
    res.json({ success: true, data: comparison })
  }),
)

// GET /api/voyages/:id
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const voyage = await VoyageUseCases.getVoyageById(req.params.id)
    if (!voyage) {
      return res.status(404).json({ success: false, error: "Voyage not found" })
    }
    res.json({ success: true, data: voyage })
  }),
)

// POST /api/voyages
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const voyage = await VoyageUseCases.createVoyage({
      ...req.body,
      departureDate: new Date(req.body.departureDate),
      arrivalDate: new Date(req.body.arrivalDate),
    })
    res.status(201).json({ success: true, data: voyage })
  }),
)

// PUT /api/voyages/:id
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const voyage = await VoyageUseCases.updateVoyage(req.params.id, req.body)
    res.json({ success: true, data: voyage })
  }),
)

// DELETE /api/voyages/:id
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    await VoyageUseCases.deleteVoyage(req.params.id)
    res.json({ success: true, message: "Voyage deleted successfully" })
  }),
)

export { router as voyageRouter }
