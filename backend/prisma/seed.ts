import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.transaction.deleteMany()
  await prisma.poolMember.deleteMany()
  await prisma.pool.deleteMany()
  await prisma.bankingAccount.deleteMany()
  await prisma.voyage.deleteMany()
  await prisma.vessel.deleteMany()
  await prisma.fuelType.deleteMany()
  await prisma.complianceThreshold.deleteMany()
  await prisma.bankEntry.deleteMany()
  await prisma.shipCompliance.deleteMany()
  await prisma.route.deleteMany()

  // Seed Fuel Types
  await Promise.all([
    prisma.fuelType.create({ data: { name: "VLSFO", emissionFactor: 3.151, category: "Fossil" } }),
    prisma.fuelType.create({ data: { name: "MGO", emissionFactor: 3.206, category: "Fossil" } }),
    prisma.fuelType.create({ data: { name: "HFO", emissionFactor: 3.114, category: "Fossil" } }),
    prisma.fuelType.create({ data: { name: "LNG", emissionFactor: 2.75, category: "Fossil" } }),
    prisma.fuelType.create({ data: { name: "Methanol", emissionFactor: 1.375, category: "Alternative" } }),
    prisma.fuelType.create({ data: { name: "Biodiesel", emissionFactor: 0.0, category: "Biofuel" } }),
    prisma.fuelType.create({ data: { name: "E-Ammonia", emissionFactor: 0.0, category: "E-Fuel" } }),
  ])

  // Seed Compliance Thresholds per PDF
  await Promise.all([
    prisma.complianceThreshold.create({ data: { year: 2025, target: 89.3368, penalty: 2400 } }),
    prisma.complianceThreshold.create({ data: { year: 2030, target: 80.0, penalty: 2400 } }),
    prisma.complianceThreshold.create({ data: { year: 2035, target: 65.0, penalty: 2400 } }),
    prisma.complianceThreshold.create({ data: { year: 2040, target: 47.5, penalty: 2400 } }),
    prisma.complianceThreshold.create({ data: { year: 2050, target: 0.0, penalty: 2400 } }),
  ])

  // Seed Vessels
  const vessels = await Promise.all([
    prisma.vessel.create({
      data: {
        name: "Atlantic Voyager",
        imo: "IMO9434567",
        type: "Container Ship",
        flag: "Panama",
        grossTonnage: 94000,
        deadweight: 109000,
        complianceScore: 87.5,
        status: "active",
      },
    }),
    prisma.vessel.create({
      data: {
        name: "Pacific Pioneer",
        imo: "IMO9523456",
        type: "Bulk Carrier",
        flag: "Liberia",
        grossTonnage: 45000,
        deadweight: 82000,
        complianceScore: 92.3,
        status: "active",
      },
    }),
    prisma.vessel.create({
      data: {
        name: "Nordic Star",
        imo: "IMO9612345",
        type: "Tanker",
        flag: "Norway",
        grossTonnage: 62000,
        deadweight: 115000,
        complianceScore: 78.9,
        status: "active",
      },
    }),
    prisma.vessel.create({
      data: {
        name: "Mediterranean Queen",
        imo: "IMO9701234",
        type: "RoRo",
        flag: "Greece",
        grossTonnage: 35000,
        deadweight: 12000,
        complianceScore: 95.2,
        status: "active",
      },
    }),
    prisma.vessel.create({
      data: {
        name: "Baltic Trader",
        imo: "IMO9801234",
        type: "General Cargo",
        flag: "Denmark",
        grossTonnage: 8500,
        deadweight: 12500,
        complianceScore: 82.1,
        status: "maintenance",
      },
    }),
  ])

  // Seed Voyages
  await Promise.all([
    prisma.voyage.create({
      data: {
        vesselId: vessels[0].id,
        voyageNumber: "VOY-2025-001",
        departurePort: "Rotterdam",
        arrivalPort: "Shanghai",
        departureDate: new Date("2025-01-05"),
        arrivalDate: new Date("2025-02-02"),
        distance: 10520,
        fuelConsumed: 2850,
        fuelType: "VLSFO",
        co2Emissions: 8980,
        ghgIntensity: 85.4,
        complianceBalance: 4.2,
        status: "completed",
      },
    }),
    prisma.voyage.create({
      data: {
        vesselId: vessels[0].id,
        voyageNumber: "VOY-2025-002",
        departurePort: "Shanghai",
        arrivalPort: "Los Angeles",
        departureDate: new Date("2025-02-10"),
        arrivalDate: new Date("2025-03-01"),
        distance: 6250,
        fuelConsumed: 1920,
        fuelType: "LNG",
        co2Emissions: 5280,
        ghgIntensity: 84.5,
        complianceBalance: 5.1,
        status: "completed",
      },
    }),
    prisma.voyage.create({
      data: {
        vesselId: vessels[1].id,
        voyageNumber: "VOY-2025-003",
        departurePort: "Santos",
        arrivalPort: "Qingdao",
        departureDate: new Date("2025-01-15"),
        arrivalDate: new Date("2025-02-20"),
        distance: 11200,
        fuelConsumed: 3200,
        fuelType: "HFO",
        co2Emissions: 9965,
        ghgIntensity: 88.9,
        complianceBalance: 0.7,
        status: "completed",
      },
    }),
    prisma.voyage.create({
      data: {
        vesselId: vessels[2].id,
        voyageNumber: "VOY-2025-004",
        departurePort: "Ras Tanura",
        arrivalPort: "Rotterdam",
        departureDate: new Date("2025-02-01"),
        arrivalDate: new Date("2025-02-22"),
        distance: 6580,
        fuelConsumed: 2100,
        fuelType: "VLSFO",
        co2Emissions: 6620,
        ghgIntensity: 100.6,
        complianceBalance: -11.1,
        status: "completed",
      },
    }),
    prisma.voyage.create({
      data: {
        vesselId: vessels[3].id,
        voyageNumber: "VOY-2025-005",
        departurePort: "Barcelona",
        arrivalPort: "Genoa",
        departureDate: new Date("2025-03-01"),
        arrivalDate: new Date("2025-03-02"),
        distance: 350,
        fuelConsumed: 45,
        fuelType: "Methanol",
        co2Emissions: 62,
        ghgIntensity: 70.2,
        complianceBalance: 19.5,
        status: "completed",
      },
    }),
  ])

  // Seed Banking Accounts
  const accounts = await Promise.all([
    prisma.bankingAccount.create({
      data: {
        vesselId: vessels[0].id,
        balance: 9300,
        surplus: 12500,
        deficit: 3200,
      },
    }),
    prisma.bankingAccount.create({
      data: {
        vesselId: vessels[1].id,
        balance: 700,
        surplus: 2100,
        deficit: 1400,
      },
    }),
    prisma.bankingAccount.create({
      data: {
        vesselId: vessels[2].id,
        balance: -11100,
        surplus: 0,
        deficit: 11100,
      },
    }),
    prisma.bankingAccount.create({
      data: {
        vesselId: vessels[3].id,
        balance: 19500,
        surplus: 19500,
        deficit: 0,
      },
    }),
  ])

  // Seed Transactions
  await Promise.all([
    prisma.transaction.create({
      data: {
        accountId: accounts[0].id,
        type: "deposit",
        amount: 4200,
        description: "Voyage VOY-2025-001 compliance surplus",
        balanceBefore: 5100,
        balanceAfter: 9300,
      },
    }),
    prisma.transaction.create({
      data: {
        accountId: accounts[0].id,
        type: "deposit",
        amount: 5100,
        description: "Voyage VOY-2025-002 compliance surplus",
        balanceBefore: 0,
        balanceAfter: 5100,
      },
    }),
    prisma.transaction.create({
      data: {
        accountId: accounts[2].id,
        type: "withdrawal",
        amount: 11100,
        description: "Voyage VOY-2025-004 compliance deficit",
        balanceBefore: 0,
        balanceAfter: -11100,
      },
    }),
    prisma.transaction.create({
      data: {
        accountId: accounts[3].id,
        type: "deposit",
        amount: 19500,
        description: "Voyage VOY-2025-005 compliance surplus",
        balanceBefore: 0,
        balanceAfter: 19500,
      },
    }),
  ])

  const routes = await Promise.all([
    prisma.route.create({
      data: {
        routeId: "R001",
        vesselType: "Container",
        fuelType: "HFO",
        year: 2024,
        ghgIntensity: 91.0,
        fuelConsumption: 5000,
        distance: 12000,
        totalEmissions: 4500,
        isBaseline: true,
      },
    }),
    prisma.route.create({
      data: {
        routeId: "R002",
        vesselType: "BulkCarrier",
        fuelType: "LNG",
        year: 2024,
        ghgIntensity: 88.0,
        fuelConsumption: 4800,
        distance: 11500,
        totalEmissions: 4200,
        isBaseline: false,
      },
    }),
    prisma.route.create({
      data: {
        routeId: "R003",
        vesselType: "Tanker",
        fuelType: "MGO",
        year: 2024,
        ghgIntensity: 93.5,
        fuelConsumption: 5100,
        distance: 12500,
        totalEmissions: 4700,
        isBaseline: false,
      },
    }),
    prisma.route.create({
      data: {
        routeId: "R004",
        vesselType: "RoRo",
        fuelType: "HFO",
        year: 2025,
        ghgIntensity: 89.2,
        fuelConsumption: 4900,
        distance: 11800,
        totalEmissions: 4300,
        isBaseline: false,
      },
    }),
    prisma.route.create({
      data: {
        routeId: "R005",
        vesselType: "Container",
        fuelType: "LNG",
        year: 2025,
        ghgIntensity: 90.5,
        fuelConsumption: 4950,
        distance: 11900,
        totalEmissions: 4400,
        isBaseline: false,
      },
    }),
  ])

  // CB = (Target - Actual) × Energy in scope
  // Energy in scope = fuelConsumption × 41000 MJ/ton
  const TARGET_INTENSITY = 89.3368

  for (const route of routes) {
    const energyInScope = route.fuelConsumption * 41000
    const cb = (TARGET_INTENSITY - route.ghgIntensity) * energyInScope

    await prisma.shipCompliance.create({
      data: {
        shipId: route.routeId,
        year: route.year,
        cbGco2eq: cb,
      },
    })
  }

  // Seed bank entries for ships with positive CB (surplus)
  const positiveComplianceShips = await prisma.shipCompliance.findMany({
    where: { cbGco2eq: { gt: 0 } },
  })

  for (const ship of positiveComplianceShips) {
    await prisma.bankEntry.create({
      data: {
        shipId: ship.shipId,
        year: ship.year,
        amountGco2eq: ship.cbGco2eq * 0.5, // Bank 50% of surplus
        type: "bank",
      },
    })
  }

  const pool = await prisma.pool.create({
    data: { year: 2024 },
  })

  // Get R002 (surplus) and R003 (deficit) for pool allocation example
  const r002Compliance = await prisma.shipCompliance.findFirst({ where: { shipId: "R002" } })
  const r003Compliance = await prisma.shipCompliance.findFirst({ where: { shipId: "R003" } })

  if (r002Compliance && r003Compliance) {
    const totalCB = r002Compliance.cbGco2eq + r003Compliance.cbGco2eq
    const avgCB = totalCB / 2

    await Promise.all([
      prisma.poolMember.create({
        data: {
          poolId: pool.id,
          shipId: "R002",
          cbBefore: r002Compliance.cbGco2eq,
          cbAfter: avgCB,
        },
      }),
      prisma.poolMember.create({
        data: {
          poolId: pool.id,
          shipId: "R003",
          cbBefore: r003Compliance.cbGco2eq,
          cbAfter: avgCB,
        },
      }),
    ])
  }

  console.log("Database seeded successfully with PDF specification data!")
  console.log(`Created ${routes.length} routes (R001-R005)`)
  console.log(`Created 1 pool with 2 members`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
