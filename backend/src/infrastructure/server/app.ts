import express from "express"
import cors from "cors"
import type { PrismaClient } from "@prisma/client"
import { createRoutesController } from "../../adapters/inbound/http/routes.controller"
import { createComplianceController } from "../../adapters/inbound/http/compliance.controller"
import { createBankingController } from "../../adapters/inbound/http/banking.controller"
import { createPoolsController } from "../../adapters/inbound/http/pools.controller"
import { PostgresRouteRepository } from "../../adapters/outbound/postgres/route.repository"
import { PostgresComplianceRepository } from "../../adapters/outbound/postgres/compliance.repository"
import { PostgresBankingRepository } from "../../adapters/outbound/postgres/banking.repository"
import { PostgresPoolRepository } from "../../adapters/outbound/postgres/pool.repository"

export function createApp(prisma: PrismaClient) {
  const app = express()

  // Middleware
  app.use(cors())
  app.use(express.json())

  // Initialize repositories
  const routeRepository = new PostgresRouteRepository(prisma)
  const complianceRepository = new PostgresComplianceRepository(prisma)
  const bankingRepository = new PostgresBankingRepository(prisma)
  const poolRepository = new PostgresPoolRepository(prisma)

  // Mount controllers - exact endpoints per PDF
  app.use("/routes", createRoutesController(routeRepository))
  app.use("/compliance", createComplianceController(routeRepository, complianceRepository, bankingRepository))
  app.use("/banking", createBankingController(bankingRepository, complianceRepository))
  app.use("/pools", createPoolsController(poolRepository))

  // Health check
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() })
  })

  // Error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack)
    res.status(500).json({ error: "Internal server error" })
  })

  return app
}
