"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, ChevronDown, ChevronUp, Ship } from "lucide-react"
import { voyageApi, type VoyageWithVessel } from "../lib/api"
import { formatDate, formatNumber, getStatusColor, cn } from "../lib/utils"
import { Modal } from "../components/ui/Modal"

// Mock data
const mockVoyages: VoyageWithVessel[] = [
  {
    id: "1",
    vesselId: "1",
    voyageNumber: "VOY-2025-001",
    departurePort: "Rotterdam",
    arrivalPort: "Shanghai",
    departureDate: "2025-01-05",
    arrivalDate: "2025-02-02",
    distance: 10520,
    fuelConsumed: 2850,
    fuelType: "VLSFO",
    co2Emissions: 8980,
    ghgIntensity: 85.4,
    complianceBalance: 4.2,
    status: "completed",
    vessel: { name: "Atlantic Voyager", imo: "IMO9434567", type: "Container Ship" },
  },
  {
    id: "2",
    vesselId: "1",
    voyageNumber: "VOY-2025-002",
    departurePort: "Shanghai",
    arrivalPort: "Los Angeles",
    departureDate: "2025-02-10",
    arrivalDate: "2025-03-01",
    distance: 6250,
    fuelConsumed: 1920,
    fuelType: "LNG",
    co2Emissions: 5280,
    ghgIntensity: 84.5,
    complianceBalance: 5.1,
    status: "completed",
    vessel: { name: "Atlantic Voyager", imo: "IMO9434567", type: "Container Ship" },
  },
  {
    id: "3",
    vesselId: "2",
    voyageNumber: "VOY-2025-003",
    departurePort: "Santos",
    arrivalPort: "Qingdao",
    departureDate: "2025-01-15",
    arrivalDate: "2025-02-20",
    distance: 11200,
    fuelConsumed: 3200,
    fuelType: "HFO",
    co2Emissions: 9965,
    ghgIntensity: 88.9,
    complianceBalance: 0.7,
    status: "completed",
    vessel: { name: "Pacific Pioneer", imo: "IMO9523456", type: "Bulk Carrier" },
  },
  {
    id: "4",
    vesselId: "3",
    voyageNumber: "VOY-2025-004",
    departurePort: "Ras Tanura",
    arrivalPort: "Rotterdam",
    departureDate: "2025-02-01",
    arrivalDate: "2025-02-22",
    distance: 6580,
    fuelConsumed: 2100,
    fuelType: "VLSFO",
    co2Emissions: 6620,
    ghgIntensity: 100.6,
    complianceBalance: -11.1,
    status: "completed",
    vessel: { name: "Nordic Star", imo: "IMO9612345", type: "Tanker" },
  },
  {
    id: "5",
    vesselId: "4",
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
]

export function RoutesPage() {
  const [voyages, setVoyages] = useState<VoyageWithVessel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchVoyages = async () => {
      try {
        const response = await voyageApi.getAll()
        setVoyages(response.data.data)
      } catch (err) {
        console.log("Using mock data")
        setVoyages(mockVoyages)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVoyages()
  }, [])

  const filteredVoyages = voyages.filter(
    (v) =>
      v.voyageNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vessel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.departurePort.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.arrivalPort.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-3 border-[rgb(var(--primary))] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Search voyages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Voyage</span>
          </button>
        </div>
      </div>

      {/* Voyages Table */}
      <div className="glass-card overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgb(var(--border))]">
                <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--muted-foreground))]">
                  Voyage
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--muted-foreground))]">
                  Vessel
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--muted-foreground))]">Route</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--muted-foreground))]">Fuel</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--muted-foreground))]">
                  GHG Intensity
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--muted-foreground))]">CB</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--muted-foreground))]">
                  Status
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredVoyages.map((voyage) => (
                <>
                  <tr
                    key={voyage.id}
                    className="border-b border-[rgb(var(--border)/0.5)] hover:bg-[rgb(var(--secondary)/0.3)] transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === voyage.id ? null : voyage.id)}
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-[rgb(var(--primary))] font-medium">
                        {voyage.voyageNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[rgb(var(--primary)/0.15)] flex items-center justify-center">
                          <Ship className="w-4 h-4 text-[rgb(var(--primary))]" />
                        </div>
                        <div>
                          <p className="font-medium">{voyage.vessel.name}</p>
                          <p className="text-sm text-[rgb(var(--muted-foreground))]">{voyage.vessel.imo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">
                          {voyage.departurePort} → {voyage.arrivalPort}
                        </p>
                        <p className="text-sm text-[rgb(var(--muted-foreground))]">
                          {formatNumber(voyage.distance)} nm
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{voyage.fuelType}</p>
                        <p className="text-sm text-[rgb(var(--muted-foreground))]">
                          {formatNumber(voyage.fuelConsumed)} MT
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "font-mono font-medium",
                          voyage.ghgIntensity <= 89.34
                            ? "text-[rgb(var(--success))]"
                            : "text-[rgb(var(--destructive))]",
                        )}
                      >
                        {voyage.ghgIntensity.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "font-mono font-medium",
                          voyage.complianceBalance >= 0
                            ? "text-[rgb(var(--success))]"
                            : "text-[rgb(var(--destructive))]",
                        )}
                      >
                        {voyage.complianceBalance >= 0 ? "+" : ""}
                        {voyage.complianceBalance.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs border font-medium",
                          getStatusColor(voyage.status),
                        )}
                      >
                        {voyage.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {expandedId === voyage.id ? (
                        <ChevronUp className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                      )}
                    </td>
                  </tr>
                  {expandedId === voyage.id && (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 bg-[rgb(var(--secondary)/0.2)]">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div>
                            <p className="text-sm text-[rgb(var(--muted-foreground))]">Departure</p>
                            <p className="font-medium">{formatDate(voyage.departureDate)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-[rgb(var(--muted-foreground))]">Arrival</p>
                            <p className="font-medium">{formatDate(voyage.arrivalDate)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-[rgb(var(--muted-foreground))]">CO2 Emissions</p>
                            <p className="font-medium">{formatNumber(voyage.co2Emissions)} MT</p>
                          </div>
                          <div>
                            <p className="text-sm text-[rgb(var(--muted-foreground))]">Vessel Type</p>
                            <p className="font-medium">{voyage.vessel.type}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-[rgb(var(--border))]">
          {filteredVoyages.map((voyage) => (
            <div key={voyage.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-sm text-[rgb(var(--primary))] font-medium">{voyage.voyageNumber}</p>
                  <p className="font-medium">{voyage.vessel.name}</p>
                </div>
                <span
                  className={cn("px-2.5 py-1 rounded-xl text-xs border font-medium", getStatusColor(voyage.status))}
                >
                  {voyage.status}
                </span>
              </div>
              <div className="text-sm">
                <p className="font-medium">
                  {voyage.departurePort} → {voyage.arrivalPort}
                </p>
                <p className="text-[rgb(var(--muted-foreground))]">
                  {formatNumber(voyage.distance)} nm | {voyage.fuelType}
                </p>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-[rgb(var(--border)/0.5)]">
                <div>
                  <span className="text-[rgb(var(--muted-foreground))]">GHG: </span>
                  <span
                    className={cn(
                      "font-mono font-medium",
                      voyage.ghgIntensity <= 89.34 ? "text-[rgb(var(--success))]" : "text-[rgb(var(--destructive))]",
                    )}
                  >
                    {voyage.ghgIntensity.toFixed(1)}
                  </span>
                </div>
                <div>
                  <span className="text-[rgb(var(--muted-foreground))]">CB: </span>
                  <span
                    className={cn(
                      "font-mono font-medium",
                      voyage.complianceBalance >= 0 ? "text-[rgb(var(--success))]" : "text-[rgb(var(--destructive))]",
                    )}
                  >
                    {voyage.complianceBalance >= 0 ? "+" : ""}
                    {voyage.complianceBalance.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Voyage Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Voyage">
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Departure Port</label>
              <input type="text" className="input-field" placeholder="e.g., Rotterdam" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Arrival Port</label>
              <input type="text" className="input-field" placeholder="e.g., Shanghai" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Distance (nm)</label>
              <input type="number" className="input-field" placeholder="e.g., 10520" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fuel Type</label>
              <select className="input-field">
                <option>VLSFO</option>
                <option>MGO</option>
                <option>HFO</option>
                <option>LNG</option>
                <option>Methanol</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fuel Consumed (MT)</label>
            <input type="number" className="input-field" placeholder="e.g., 2850" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              Add Voyage
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
