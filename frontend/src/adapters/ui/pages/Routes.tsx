"use client"

import { useState, useEffect } from "react"
import { RouteIcon, Filter, Flag, RefreshCw, Fuel, Ship, MapPin, Flame } from "lucide-react"
import { apiClient } from "../../infrastructure/api.client"
import type { Route, RouteFilters } from "../../../core/domain/entities/route.entity"

export function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<RouteFilters>({})
  const [settingBaseline, setSettingBaseline] = useState<string | null>(null)

  const vesselTypes = ["Container", "BulkCarrier", "Tanker", "RoRo"]
  const fuelTypes = ["HFO", "LNG", "MGO"]
  const years = [2024, 2025]

  useEffect(() => {
    fetchRoutes()
  }, [filters])

  const fetchRoutes = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getRoutes(filters)
      setRoutes(data)
    } catch (err: any) {
      setError(err.message || "Failed to fetch routes")
      // Use mock data if API fails
      setRoutes(getMockRoutes())
    } finally {
      setLoading(false)
    }
  }

  const handleSetBaseline = async (routeId: string) => {
    try {
      setSettingBaseline(routeId)
      await apiClient.setBaseline(routeId)
      await fetchRoutes()
    } catch (err: any) {
      // Update locally if API fails
      setRoutes((prev) => prev.map((r) => ({ ...r, isBaseline: r.routeId === routeId })))
    } finally {
      setSettingBaseline(null)
    }
  }

  const TARGET_INTENSITY = 89.3368

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 icon-shake" style={{ color: "rgb(var(--primary))" }} />
          <h3 className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>
            Filters
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "rgb(var(--muted-foreground))" }}>
              Vessel Type
            </label>
            <select
              className="select-field"
              value={filters.vesselType || ""}
              onChange={(e) => setFilters({ ...filters, vesselType: e.target.value || undefined })}
            >
              <option value="">All Types</option>
              {vesselTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "rgb(var(--muted-foreground))" }}>
              Fuel Type
            </label>
            <select
              className="select-field"
              value={filters.fuelType || ""}
              onChange={(e) => setFilters({ ...filters, fuelType: e.target.value || undefined })}
            >
              <option value="">All Fuels</option>
              {fuelTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "rgb(var(--muted-foreground))" }}>
              Year
            </label>
            <select
              className="select-field"
              value={filters.year || ""}
              onChange={(e) =>
                setFilters({ ...filters, year: e.target.value ? Number.parseInt(e.target.value) : undefined })
              }
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Routes Table */}
      <div className="glass-card overflow-hidden">
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: "rgb(var(--border) / 0.5)" }}
        >
          <div className="flex items-center gap-2">
            <RouteIcon className="w-5 h-5 icon-shake" style={{ color: "rgb(var(--primary))" }} />
            <h3 className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>
              All Routes
            </h3>
          </div>
          <button onClick={fetchRoutes} className="btn-secondary" disabled={loading}>
            <RefreshCw className={`w-4 h-4 icon-shake ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="spinner" />
          </div>
        ) : error ? (
          <div className="p-4 text-center" style={{ color: "rgb(var(--destructive))" }}>
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Route ID</th>
                  <th>Vessel Type</th>
                  <th>Fuel Type</th>
                  <th>Year</th>
                  <th>GHG Intensity (gCO2e/MJ)</th>
                  <th>Fuel Consumption (t)</th>
                  <th>Distance (km)</th>
                  <th>Total Emissions (t)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route, index) => {
                  const isCompliant = route.ghgIntensity <= TARGET_INTENSITY
                  return (
                    <tr key={route.id} className={`animate-fade-in stagger-${(index % 5) + 1}`}>
                      <td>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 icon-bounce" style={{ color: "rgb(var(--primary))" }} />
                          <span className="font-medium">{route.routeId}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Ship className="w-4 h-4 icon-shake" style={{ color: "rgb(var(--muted-foreground))" }} />
                          {route.vesselType}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Fuel className="w-4 h-4 icon-shake" style={{ color: "rgb(var(--muted-foreground))" }} />
                          {route.fuelType}
                        </div>
                      </td>
                      <td>{route.year}</td>
                      <td>
                        <span
                          className="font-mono font-medium"
                          style={{ color: isCompliant ? "rgb(var(--success))" : "rgb(var(--destructive))" }}
                        >
                          {route.ghgIntensity.toFixed(2)}
                        </span>
                      </td>
                      <td>{route.fuelConsumption.toLocaleString()}</td>
                      <td>{route.distance.toLocaleString()}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 icon-shake" style={{ color: "rgb(var(--warning))" }} />
                          {route.totalEmissions.toLocaleString()}
                        </div>
                      </td>
                      <td>
                        {route.isBaseline ? (
                          <span className="status-baseline px-2 py-1 rounded-full text-xs font-medium">Baseline</span>
                        ) : isCompliant ? (
                          <span className="status-compliant px-2 py-1 rounded-full text-xs font-medium">Compliant</span>
                        ) : (
                          <span className="status-non-compliant px-2 py-1 rounded-full text-xs font-medium">
                            Non-Compliant
                          </span>
                        )}
                      </td>
                      <td>
                        {!route.isBaseline && (
                          <button
                            onClick={() => handleSetBaseline(route.routeId)}
                            disabled={settingBaseline === route.routeId}
                            className="btn-primary text-xs py-1.5 px-3"
                          >
                            <Flag className={`w-3.5 h-3.5 ${settingBaseline === route.routeId ? "" : "icon-shake"}`} />
                            {settingBaseline === route.routeId ? "Setting..." : "Set Baseline"}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// Mock data fallback
function getMockRoutes(): Route[] {
  return [
    {
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
    },
    {
      id: "2",
      routeId: "R002",
      vesselType: "BulkCarrier",
      fuelType: "LNG",
      year: 2024,
      ghgIntensity: 88.0,
      fuelConsumption: 4800,
      distance: 11500,
      totalEmissions: 4200,
      isBaseline: false,
      createdAt: "",
      updatedAt: "",
    },
    {
      id: "3",
      routeId: "R003",
      vesselType: "Tanker",
      fuelType: "MGO",
      year: 2024,
      ghgIntensity: 93.5,
      fuelConsumption: 5100,
      distance: 12500,
      totalEmissions: 4700,
      isBaseline: false,
      createdAt: "",
      updatedAt: "",
    },
    {
      id: "4",
      routeId: "R004",
      vesselType: "RoRo",
      fuelType: "HFO",
      year: 2025,
      ghgIntensity: 89.2,
      fuelConsumption: 4900,
      distance: 11800,
      totalEmissions: 4300,
      isBaseline: false,
      createdAt: "",
      updatedAt: "",
    },
    {
      id: "5",
      routeId: "R005",
      vesselType: "Container",
      fuelType: "LNG",
      year: 2025,
      ghgIntensity: 90.5,
      fuelConsumption: 4950,
      distance: 11900,
      totalEmissions: 4400,
      isBaseline: false,
      createdAt: "",
      updatedAt: "",
    },
  ]
}
