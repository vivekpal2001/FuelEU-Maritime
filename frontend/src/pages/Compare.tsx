"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts"
import { GitCompare, Plus, X, BarChart3 } from "lucide-react"
import { cn, formatNumber } from "../lib/utils"

interface CompareVoyage {
  id: string
  voyageNumber: string
  vesselName: string
  route: string
  ghgIntensity: number
  complianceBalance: number
  distance: number
  fuelConsumed: number
  co2Emissions: number
}

const availableVoyages: CompareVoyage[] = [
  {
    id: "1",
    voyageNumber: "VOY-2025-001",
    vesselName: "Atlantic Voyager",
    route: "Rotterdam → Shanghai",
    ghgIntensity: 85.4,
    complianceBalance: 4.2,
    distance: 10520,
    fuelConsumed: 2850,
    co2Emissions: 8980,
  },
  {
    id: "2",
    voyageNumber: "VOY-2025-002",
    vesselName: "Atlantic Voyager",
    route: "Shanghai → Los Angeles",
    ghgIntensity: 84.5,
    complianceBalance: 5.1,
    distance: 6250,
    fuelConsumed: 1920,
    co2Emissions: 5280,
  },
  {
    id: "3",
    voyageNumber: "VOY-2025-003",
    vesselName: "Pacific Pioneer",
    route: "Santos → Qingdao",
    ghgIntensity: 88.9,
    complianceBalance: 0.7,
    distance: 11200,
    fuelConsumed: 3200,
    co2Emissions: 9965,
  },
  {
    id: "4",
    voyageNumber: "VOY-2025-004",
    vesselName: "Nordic Star",
    route: "Ras Tanura → Rotterdam",
    ghgIntensity: 100.6,
    complianceBalance: -11.1,
    distance: 6580,
    fuelConsumed: 2100,
    co2Emissions: 6620,
  },
  {
    id: "5",
    voyageNumber: "VOY-2025-005",
    vesselName: "Mediterranean Queen",
    route: "Barcelona → Genoa",
    ghgIntensity: 70.2,
    complianceBalance: 19.5,
    distance: 350,
    fuelConsumed: 45,
    co2Emissions: 62,
  },
]

export function ComparePage() {
  const [selectedVoyages, setSelectedVoyages] = useState<CompareVoyage[]>([availableVoyages[0], availableVoyages[4]])

  const addVoyage = (voyage: CompareVoyage) => {
    if (selectedVoyages.length < 4 && !selectedVoyages.find((v) => v.id === voyage.id)) {
      setSelectedVoyages([...selectedVoyages, voyage])
    }
  }

  const removeVoyage = (id: string) => {
    setSelectedVoyages(selectedVoyages.filter((v) => v.id !== id))
  }

  const barChartData = selectedVoyages.map((v) => ({
    name: v.voyageNumber,
    ghgIntensity: v.ghgIntensity,
    target: 89.34,
  }))

  const radarData = [
    {
      metric: "GHG Intensity",
      ...Object.fromEntries(selectedVoyages.map((v) => [v.voyageNumber, 100 - v.ghgIntensity])),
    },
    {
      metric: "Efficiency",
      ...Object.fromEntries(
        selectedVoyages.map((v) => [v.voyageNumber, Math.min(100, (v.distance / v.fuelConsumed) * 10)]),
      ),
    },
    {
      metric: "Compliance",
      ...Object.fromEntries(selectedVoyages.map((v) => [v.voyageNumber, Math.max(0, 50 + v.complianceBalance * 2)])),
    },
    {
      metric: "Distance",
      ...Object.fromEntries(selectedVoyages.map((v) => [v.voyageNumber, Math.min(100, v.distance / 120)])),
    },
    {
      metric: "Emissions",
      ...Object.fromEntries(selectedVoyages.map((v) => [v.voyageNumber, Math.max(0, 100 - v.co2Emissions / 100)])),
    },
  ]

  const colors = ["rgb(var(--primary))", "rgb(var(--accent))", "rgb(var(--chart-3))", "rgb(var(--chart-4))"]
  const colorValues = ["#22d3ee", "#2dd4bf", "#818cf8", "#fbbf24"]

  return (
    <div className="space-y-6">
      {/* Selection Area */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[rgb(var(--primary)/0.15)] flex items-center justify-center">
            <GitCompare className="w-5 h-5 text-[rgb(var(--primary))]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Select Voyages to Compare</h3>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">{selectedVoyages.length}/4 voyages selected</p>
          </div>
        </div>

        {/* Selected Voyages */}
        <div className="flex flex-wrap gap-3 mb-4">
          {selectedVoyages.map((voyage, index) => (
            <div
              key={voyage.id}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-[rgb(var(--secondary)/0.3)] hover:bg-[rgb(var(--secondary)/0.5)] transition-colors"
              style={{ borderColor: colorValues[index] }}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colorValues[index] }} />
              <span className="font-medium text-sm">{voyage.voyageNumber}</span>
              <span className="text-sm text-[rgb(var(--muted-foreground))]">({voyage.vesselName})</span>
              <button
                onClick={() => removeVoyage(voyage.id)}
                className="p-1 hover:bg-[rgb(var(--destructive)/0.2)] rounded-lg transition-colors ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Available Voyages */}
        {selectedVoyages.length < 4 && (
          <div className="flex flex-wrap gap-2">
            {availableVoyages
              .filter((v) => !selectedVoyages.find((sv) => sv.id === v.id))
              .map((voyage) => (
                <button
                  key={voyage.id}
                  onClick={() => addVoyage(voyage)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[rgb(var(--border))] hover:border-[rgb(var(--primary))] hover:bg-[rgb(var(--primary)/0.1)] transition-all text-sm"
                >
                  <Plus className="w-4 h-4" />
                  {voyage.voyageNumber}
                </button>
              ))}
          </div>
        )}
      </div>

      {selectedVoyages.length >= 2 ? (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[rgb(var(--primary)/0.15)] flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-[rgb(var(--primary))]" />
                </div>
                <h3 className="text-lg font-semibold">GHG Intensity Comparison</h3>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                    <XAxis dataKey="name" stroke="rgb(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="rgb(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgb(var(--card))",
                        border: "1px solid rgb(var(--border))",
                        borderRadius: "12px",
                        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.3)",
                      }}
                      labelStyle={{ color: "rgb(var(--foreground))" }}
                    />
                    <Bar dataKey="ghgIntensity" fill="rgb(var(--primary))" radius={[6, 6, 0, 0]} name="GHG Intensity" />
                    <Bar dataKey="target" fill="rgb(var(--success))" radius={[6, 6, 0, 0]} name="Target" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-6">Performance Metrics</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgb(var(--border))" />
                    <PolarAngleAxis dataKey="metric" stroke="rgb(var(--muted-foreground))" fontSize={11} />
                    <PolarRadiusAxis stroke="rgb(var(--muted-foreground))" fontSize={10} />
                    {selectedVoyages.map((voyage, index) => (
                      <Radar
                        key={voyage.id}
                        name={voyage.voyageNumber}
                        dataKey={voyage.voyageNumber}
                        stroke={colorValues[index]}
                        fill={colorValues[index]}
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    ))}
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgb(var(--border))]">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--muted-foreground))]">
                      Metric
                    </th>
                    {selectedVoyages.map((voyage, index) => (
                      <th key={voyage.id} className="px-6 py-4 text-left text-sm font-semibold">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colorValues[index] }} />
                          {voyage.voyageNumber}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[rgb(var(--border)/0.5)] hover:bg-[rgb(var(--secondary)/0.3)] transition-colors">
                    <td className="px-6 py-4 text-[rgb(var(--muted-foreground))]">Vessel</td>
                    {selectedVoyages.map((v) => (
                      <td key={v.id} className="px-6 py-4 font-medium">
                        {v.vesselName}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-[rgb(var(--border)/0.5)] hover:bg-[rgb(var(--secondary)/0.3)] transition-colors">
                    <td className="px-6 py-4 text-[rgb(var(--muted-foreground))]">Route</td>
                    {selectedVoyages.map((v) => (
                      <td key={v.id} className="px-6 py-4">
                        {v.route}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-[rgb(var(--border)/0.5)] hover:bg-[rgb(var(--secondary)/0.3)] transition-colors">
                    <td className="px-6 py-4 text-[rgb(var(--muted-foreground))]">Distance</td>
                    {selectedVoyages.map((v) => (
                      <td key={v.id} className="px-6 py-4 font-mono">
                        {formatNumber(v.distance)} nm
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-[rgb(var(--border)/0.5)] hover:bg-[rgb(var(--secondary)/0.3)] transition-colors">
                    <td className="px-6 py-4 text-[rgb(var(--muted-foreground))]">Fuel Consumed</td>
                    {selectedVoyages.map((v) => (
                      <td key={v.id} className="px-6 py-4 font-mono">
                        {formatNumber(v.fuelConsumed)} MT
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-[rgb(var(--border)/0.5)] hover:bg-[rgb(var(--secondary)/0.3)] transition-colors">
                    <td className="px-6 py-4 text-[rgb(var(--muted-foreground))]">CO2 Emissions</td>
                    {selectedVoyages.map((v) => (
                      <td key={v.id} className="px-6 py-4 font-mono">
                        {formatNumber(v.co2Emissions)} MT
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-[rgb(var(--border)/0.5)] hover:bg-[rgb(var(--secondary)/0.3)] transition-colors">
                    <td className="px-6 py-4 text-[rgb(var(--muted-foreground))]">GHG Intensity</td>
                    {selectedVoyages.map((v) => (
                      <td key={v.id} className="px-6 py-4">
                        <span
                          className={cn(
                            "font-mono font-medium",
                            v.ghgIntensity <= 89.34 ? "text-[rgb(var(--success))]" : "text-[rgb(var(--destructive))]",
                          )}
                        >
                          {v.ghgIntensity.toFixed(1)} gCO2eq/MJ
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[rgb(var(--secondary)/0.3)] transition-colors">
                    <td className="px-6 py-4 text-[rgb(var(--muted-foreground))]">Compliance Balance</td>
                    {selectedVoyages.map((v) => (
                      <td key={v.id} className="px-6 py-4">
                        <span
                          className={cn(
                            "font-mono font-medium",
                            v.complianceBalance >= 0 ? "text-[rgb(var(--success))]" : "text-[rgb(var(--destructive))]",
                          )}
                        >
                          {v.complianceBalance >= 0 ? "+" : ""}
                          {v.complianceBalance.toFixed(1)}%
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[rgb(var(--primary)/0.15)] flex items-center justify-center mx-auto mb-4">
            <GitCompare className="w-8 h-8 text-[rgb(var(--primary))]" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Select at least 2 voyages to compare</h3>
          <p className="text-[rgb(var(--muted-foreground))] max-w-md mx-auto">
            Choose voyages from the selection area above to see detailed comparison charts and performance metrics.
          </p>
        </div>
      )}
    </div>
  )
}
