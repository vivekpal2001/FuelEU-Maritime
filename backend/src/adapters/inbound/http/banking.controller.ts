import { Router, type Request, type Response } from "express"
import { BankSurplusUseCase } from "../../../core/application/use-cases/bank-surplus.use-case"
import { ApplyBankedUseCase } from "../../../core/application/use-cases/apply-banked.use-case"
import type { IBankingRepository } from "../../../core/ports/outbound/banking.repository"
import type { IComplianceRepository } from "../../../core/ports/outbound/compliance.repository"

export function createBankingController(
  bankingRepository: IBankingRepository,
  complianceRepository: IComplianceRepository,
): Router {
  const router = Router()

  // GET /banking/records?shipId&year - Get banking records
  router.get("/records", async (req: Request, res: Response) => {
    try {
      const shipId = req.query.shipId as string
      const year = Number.parseInt(req.query.year as string)

      if (!shipId || isNaN(year)) {
        return res.status(400).json({ error: "shipId and year are required" })
      }

      const entries = await bankingRepository.findByShipAndYear(shipId, year)
      const totalBanked = await bankingRepository.getTotalBanked(shipId, year)
      const totalApplied = await bankingRepository.getTotalApplied(shipId, year)

      return res.json({
        shipId,
        year,
        entries,
        totalBanked,
        totalApplied,
        availableBalance: totalBanked - totalApplied,
      })
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  })

  // POST /banking/bank - Bank positive CB
  router.post("/bank", async (req: Request, res: Response) => {
    try {
      const { shipId, year, amount } = req.body

      if (!shipId || !year || !amount) {
        return res.status(400).json({ error: "shipId, year, and amount are required" })
      }

      const useCase = new BankSurplusUseCase(bankingRepository, complianceRepository)
      const entry = await useCase.execute(shipId, year, amount)
      return res.status(201).json(entry)
    } catch (error: any) {
      return res.status(400).json({ error: error.message })
    }
  })

  // POST /banking/apply - Apply banked surplus to deficit
  router.post("/apply", async (req: Request, res: Response) => {
    try {
      const { shipId, year, amount } = req.body

      if (!shipId || !year || !amount) {
        return res.status(400).json({ error: "shipId, year, and amount are required" })
      }

      const useCase = new ApplyBankedUseCase(bankingRepository, complianceRepository)
      const result = await useCase.execute(shipId, year, amount)
      return res.json(result)
    } catch (error: any) {
      return res.status(400).json({ error: error.message })
    }
  })

  return router
}
