import dotenv from "dotenv"
import { PrismaClient } from "@prisma/client"
import { createApp } from "./infrastructure/server/app"

dotenv.config()

const prisma = new PrismaClient()
const PORT = process.env.PORT || 3001

async function main() {
  try {
    // Test database connection
    await prisma.$connect()
    console.log("Database connected successfully")

    const app = createApp(prisma)

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
      console.log(`
Available endpoints (per PDF spec):
  GET    /routes              - Get all routes
  POST   /routes/:id/baseline - Set baseline route
  GET    /routes/comparison   - Get baseline vs comparison
  GET    /compliance/cb       - Get compliance balance
  GET    /compliance/adjusted-cb - Get adjusted CB
  GET    /banking/records     - Get banking records
  POST   /banking/bank        - Bank surplus
  POST   /banking/apply       - Apply banked surplus
  POST   /pools               - Create pool
  GET    /pools               - Get all pools
  GET    /health              - Health check
      `)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect()
  process.exit(0)
})

process.on("SIGTERM", async () => {
  await prisma.$disconnect()
  process.exit(0)
})

main()
