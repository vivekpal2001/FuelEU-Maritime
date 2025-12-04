import { Router, type Request, type Response } from "express"
import { BankingUseCases } from "../../../application/use-cases/banking.use-cases"
import { asyncHandler } from "../../../shared/middleware/async-handler"

const router = Router()

// GET /api/banking/accounts
router.get(
  "/accounts",
  asyncHandler(async (req: Request, res: Response) => {
    const accounts = await BankingUseCases.getAllAccounts()
    res.json({ success: true, data: accounts })
  }),
)

// GET /api/banking/accounts/:vesselId
router.get(
  "/accounts/:vesselId",
  asyncHandler(async (req: Request, res: Response) => {
    const account = await BankingUseCases.getAccountByVesselId(req.params.vesselId)
    if (!account) {
      return res.status(404).json({ success: false, error: "Account not found" })
    }
    res.json({ success: true, data: account })
  }),
)

// GET /api/banking/summary
router.get(
  "/summary",
  asyncHandler(async (req: Request, res: Response) => {
    const summary = await BankingUseCases.getComplianceSummary()
    res.json({ success: true, data: summary })
  }),
)

// POST /api/banking/deposit
router.post(
  "/deposit",
  asyncHandler(async (req: Request, res: Response) => {
    const { vesselId, amount, description } = req.body
    const transaction = await BankingUseCases.deposit(vesselId, amount, description)
    res.status(201).json({ success: true, data: transaction })
  }),
)

// POST /api/banking/withdraw
router.post(
  "/withdraw",
  asyncHandler(async (req: Request, res: Response) => {
    const { vesselId, amount, description } = req.body
    const transaction = await BankingUseCases.withdraw(vesselId, amount, description)
    res.status(201).json({ success: true, data: transaction })
  }),
)

// POST /api/banking/transfer
router.post(
  "/transfer",
  asyncHandler(async (req: Request, res: Response) => {
    const { fromVesselId, toVesselId, amount } = req.body
    await BankingUseCases.transfer(fromVesselId, toVesselId, amount)
    res.status(201).json({ success: true, message: "Transfer completed successfully" })
  }),
)

// POST /api/banking/borrow
router.post(
  "/borrow",
  asyncHandler(async (req: Request, res: Response) => {
    const { vesselId, amount, description } = req.body
    const transaction = await BankingUseCases.borrow(vesselId, amount, description)
    res.status(201).json({ success: true, data: transaction })
  }),
)

export { router as bankingRouter }
