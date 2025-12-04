"use client"

import { useState, useEffect } from "react"
import { GitCompare, CheckCircle2, XCircle, TrendingUp, TrendingDown, BarChart3, RefreshCw, Target } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts"
import { apiClient } from "../../infrastructure/api.client"
import type { RouteComparison } from "../../../core/domain/entities/route.entity"

export function ComparePage() {
  const [comparisons, setComparisons] = useState<RouteComparison[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const TARGET_INTENSITY = 89.3368

  useEffect(() => {
    fetchComparisons()
  }, [])

  const fetchComparisons = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getComparison()
      setComparisons(data)
    } catch (err: any) {
      setError(err.message || "Failed to fetch comparisons. Please set a baseline first.")
      setComparisons(getMockComparisons())
    } finally {
      setLoading(false)
    }
  }

  const chartData =
    comparisons.length > 0
      ? [
          { name: "Baseline", ghgIntensity: comparisons[0]?.baseline.ghgIntensity || 0, isBaseline: true },
          ...comparisons.map((c) => ({
            name: c.comparison.routeId,
            ghgIntensity: c.comparison.ghgIntensity,
            compliant: c.compliant,
            isBaseline: false,
          })),
        ]
      : []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card-hover p-4 animate-scale-in stagger-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ background: "rgb(var(--primary) / 0.15)" }}>
              <Target className="w-5 h-5 icon-shake" style={{ color: "rgb(var(--primary))" }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>
                Target Intensity
              </p>
              <p className="text-xl font-bold glow-text">{TARGET_INTENSITY} gCO2e/MJ</p>
            </div>
          </div>
        </div>

        <div className="glass-card-hover p-4 animate-scale-in stagger-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ background: "rgb(var(--success) / 0.15)" }}>
              <CheckCircle2 className="w-5 h-5 icon-shake" style={{ color: "rgb(var(--success))" }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>
                Compliant Routes
              </p>
              <p className="text-xl font-bold" style={{ color: "rgb(var(--success))" }}>
                {comparisons.filter((c) => c.compliant).length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card-hover p-4 animate-scale-in stagger-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ background: "rgb(var(--destructive) / 0.15)" }}>
              <XCircle className="w-5 h-5 icon-shake" style={{ color: "rgb(var(--destructive))" }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>
                Non-Compliant
              </p>
              <p className="text-xl font-bold" style={{ color: "rgb(var(--destructive))" }}>
                {comparisons.filter((c) => !c.compliant).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card p-4 animate-fade-in stagger-2">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 icon-shake" style={{ color: "rgb(var(--primary))" }} />
          <h3 className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>
            GHG Intensity Comparison
          </h3>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" opacity={0.5} />
              <XAxis dataKey="name" tick={{ fill: "rgb(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis tick={{ fill: "rgb(var(--muted-foreground))", fontSize: 12 }} domain={[80, 100]} />
              <Tooltip
                contentStyle={{
                  background: "rgb(var(--card))",
                  border: "1px solid rgb(var(--border))",
                  borderRadius: "0.5rem",
                }}
                labelStyle={{ color: "rgb(var(--foreground))" }}
              />
              <ReferenceLine
                y={TARGET_INTENSITY}
                stroke="rgb(var(--warning))"
                strokeDasharray="5 5"
                label={{ value: "Target", fill: "rgb(var(--warning))", fontSize: 12 }}
              />
              <Bar dataKey="ghgIntensity" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.isBaseline
                        ? "rgb(var(--primary))"
                        : entry.compliant
                          ? "rgb(var(--success))"
                          : "rgb(var(--destructive))"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="glass-card overflow-hidden animate-fade-in stagger-3">
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: "rgb(var(--border) / 0.5)" }}
        >
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 icon-shake" style={{ color: "rgb(var(--primary))" }} />
            <h3 className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>
              Baseline vs Comparison
            </h3>
          </div>
          <button onClick={fetchComparisons} className="btn-secondary" disabled={loading}>
            <RefreshCw className={`w-4 h-4 icon-shake ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="spinner" />
          </div>
        ) : comparisons.length === 0 ? (
          <div className="p-8 text-center" style={{ color: "rgb(var(--muted-foreground))" }}>
            No baseline set. Please set a baseline route first.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Baseline GHG</th>
                  <th>Comparison GHG</th>
                  <th>% Difference</th>
                  <th>Compliant</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((comp, index) => (
                  <tr key={comp.comparison.id} className={`animate-fade-in stagger-${(index % 5) + 1}`}>
                    <td className="font-medium">{comp.comparison.routeId}</td>
                    <td className="font-mono">{comp.baseline.ghgIntensity.toFixed(2)}</td>
                    <td className="font-mono">{comp.comparison.ghgIntensity.toFixed(2)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        {comp.percentDiff > 0 ? (
                          <TrendingUp className="w-4 h-4 icon-shake" style={{ color: "rgb(var(--destructive))" }} />
                        ) : (
                          <TrendingDown className="w-4 h-4 icon-shake" style={{ color: "rgb(var(--success))" }} />
                        )}
                        <span
                          className="font-mono"
                          style={{ color: comp.percentDiff > 0 ? "rgb(var(--destructive))" : "rgb(var(--success))" }}
                        >
                          {comp.percentDiff > 0 ? "+" : ""}
                          {comp.percentDiff.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      {comp.compliant ? (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 icon-pulse" style={{ color: "rgb(var(--success))" }} />
                          <span style={{ color: "rgb(var(--success))" }}>Yes</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 icon-pulse" style={{ color: "rgb(var(--destructive))" }} />
                          <span style={{ color: "rgb(var(--destructive))" }}>No</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// Mock data fallback
function getMockComparisons(): RouteComparison[] {
  const baseline = {
    id: "1",
    routeId: "R001",
    vesselType: "Container",
    fuelType: "HFO",
    year: 2024,
    ghgIntensity: 91.0,
    fuelConsumption: 5000,
    distance: 12000,
    totalEmissions: 4500,
    isBaseline: true,
    createdAt: "",
    updatedAt: "",
  }
  return [
    {
      baseline,
      comparison: { ...baseline, id: "2", routeId: "R002", ghgIntensity: 88.0, isBaseline: false },
      percentDiff: -3.3,
      compliant: true,
    },
    {
      baseline,
      comparison: { ...baseline, id: "3", routeId: "R003", ghgIntensity: 93.5, isBaseline: false },
      percentDiff: 2.75,
      compliant: false,
    },
    {
      baseline,
      comparison: { ...baseline, id: "4", routeId: "R004", ghgIntensity: 89.2, isBaseline: false },
      percentDiff: -1.98,
      compliant: true,
    },
    {
      baseline,
      comparison: { ...baseline, id: "5", routeId: "R005", ghgIntensity: 90.5, isBaseline: false },
      percentDiff: -0.55,
      compliant: false,
    },
  ]
}
