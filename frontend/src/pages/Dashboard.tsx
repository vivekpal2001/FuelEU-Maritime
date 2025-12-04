"use client"

import { useEffect, useState } from "react"
import { Ship, Route, TrendingUp, Landmark, AlertTriangle, CheckCircle, Activity, Anchor } from "lucide-react"
import { StatsCard } from "../components/ui/StatsCard"
import { GHGIntensityChart } from "../components/charts/GHGIntensityChart"
import { dashboardApi, type DashboardData } from "../lib/api"
import { formatNumber, getStatusColor, cn } from "../lib/utils"

// Mock data for when API is not available
const mockDashboardData: DashboardData = {
  stats: {
    totalVessels: 5,
    activeVessels: 4,
    avgComplianceScore: 87.2,
    completedVoyages: 5,
    totalEmissions: 30907,
    avgGHGIntensity: 85.9,
    complianceTarget: 89.34,
    totalSurplus: 34100,
    totalDeficit: 15700,
    netBalance: 18400,
    activePools: 1,
  },
  ghgTrendData: [
    { date: "2025-01-05", intensity: 85.4, target: 89.34 },
    { date: "2025-01-15", intensity: 88.9, target: 89.34 },
    { date: "2025-02-01", intensity: 100.6, target: 89.34 },
    { date: "2025-02-10", intensity: 84.5, target: 89.34 },
    { date: "2025-03-01", intensity: 70.2, target: 89.34 },
  ],
  recentVoyages: [
    {
      id: "1",
      vesselId: "1",
      voyageNumber: "VOY-2025-005",
      departurePort: "Barcelona",
      arrivalPort: "Genoa",
      departureDate: "2025-03-01",
      arrivalDate: "2025-03-02",
      distance: 350,
      fuelConsumed: 45,
      fuelType: "Methanol",
      co2Emissions: 62,
      ghgIntensity: 70.2,
      complianceBalance: 19.5,
      status: "completed",
      vessel: { name: "Mediterranean Queen", imo: "IMO9701234", type: "RoRo" },
    },
  ],
  fleetStatus: [
    { id: "1", name: "Atlantic Voyager", status: "active", complianceScore: 87.5 },
    { id: "2", name: "Pacific Pioneer", status: "active", complianceScore: 92.3 },
    { id: "3", name: "Nordic Star", status: "active", complianceScore: 78.9 },
    { id: "4", name: "Mediterranean Queen", status: "active", complianceScore: 95.2 },
    { id: "5", name: "Baltic Trader", status: "maintenance", complianceScore: 82.1 },
  ],
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardApi.getData()
        setData(response.data.data)
      } catch (err) {
        console.log("Using mock data - API not available")
        setData(mockDashboardData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-3 border-[rgb(var(--primary))] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-[rgb(var(--muted-foreground))]">Failed to load dashboard data</p>
      </div>
    )
  }

  const { stats, ghgTrendData, fleetStatus } = data

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Active Vessels"
          value={stats.activeVessels}
          subtitle={`${stats.totalVessels} total in fleet`}
          icon={Ship}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Avg. GHG Intensity"
          value={`${stats.avgGHGIntensity}`}
          subtitle={`Target: ${stats.complianceTarget} gCO2eq/MJ`}
          icon={Activity}
          trend={{ value: 5.2, isPositive: true }}
        />
        <StatsCard
          title="Completed Voyages"
          value={stats.completedVoyages}
          subtitle="This compliance year"
          icon={Route}
        />
        <StatsCard
          title="Net Balance"
          value={formatNumber(stats.netBalance)}
          subtitle={`+${formatNumber(stats.totalSurplus)} / -${formatNumber(stats.totalDeficit)}`}
          icon={Landmark}
          trend={{ value: 8.3, isPositive: stats.netBalance > 0 }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <GHGIntensityChart data={ghgTrendData} />
        </div>

        {/* Fleet Status */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Fleet Status</h3>
            <span className="text-xs text-[rgb(var(--muted-foreground))] px-2 py-1 rounded-full bg-[rgb(var(--secondary))]">
              {fleetStatus.length} vessels
            </span>
          </div>
          <div className="space-y-3">
            {fleetStatus.map((vessel) => (
              <div
                key={vessel.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[rgb(var(--secondary)/0.3)] hover:bg-[rgb(var(--secondary)/0.5)] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[rgb(var(--primary)/0.2)] to-[rgb(var(--accent)/0.1)] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Anchor className="w-4 h-4 text-[rgb(var(--primary))]" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{vessel.name}</p>
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs border",
                        getStatusColor(vessel.status),
                      )}
                    >
                      {vessel.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {vessel.complianceScore >= 89.34 ? (
                    <CheckCircle className="w-4 h-4 text-[rgb(var(--success))]" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-[rgb(var(--warning))]" />
                  )}
                  <span className="text-sm font-mono font-medium">{vessel.complianceScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card-hover p-6 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[rgb(var(--success)/0.15)] flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle className="w-6 h-6 text-[rgb(var(--success))]" />
            </div>
            <div>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">Total Surplus</p>
              <p className="text-2xl font-bold text-[rgb(var(--success))]">{formatNumber(stats.totalSurplus)}</p>
            </div>
          </div>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Available for banking or pooling operations</p>
        </div>

        <div className="glass-card-hover p-6 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[rgb(var(--destructive)/0.15)] flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-6 h-6 text-[rgb(var(--destructive))]" />
            </div>
            <div>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">Total Deficit</p>
              <p className="text-2xl font-bold text-[rgb(var(--destructive))]">{formatNumber(stats.totalDeficit)}</p>
            </div>
          </div>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Requires compensation or penalty payment</p>
        </div>

        <div className="glass-card-hover p-6 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[rgb(var(--primary)/0.15)] flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-6 h-6 text-[rgb(var(--primary))]" />
            </div>
            <div>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">Avg. Compliance</p>
              <p className="text-2xl font-bold glow-text">{stats.avgComplianceScore}%</p>
            </div>
          </div>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Fleet-wide compliance score average</p>
        </div>
      </div>
    </div>
  )
}
