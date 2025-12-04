"use client"

import { useState, useEffect } from "react"
import { Ship, Plus, Search, MoreVertical, Anchor, MapPin, Gauge, Scale } from "lucide-react"
import { vesselApi, type Vessel } from "../lib/api"
import { cn, formatNumber, getStatusColor } from "../lib/utils"
import { Modal } from "../components/ui/Modal"

// Mock data
const mockVessels: Vessel[] = [
  {
    id: "1",
    name: "Atlantic Voyager",
    imo: "IMO9434567",
    type: "Container Ship",
    flag: "Panama",
    grossTonnage: 94000,
    deadweight: 109000,
    complianceScore: 87.5,
    status: "active",
    createdAt: "2024-01-15",
    updatedAt: "2025-03-01",
  },
  {
    id: "2",
    name: "Pacific Pioneer",
    imo: "IMO9523456",
    type: "Bulk Carrier",
    flag: "Liberia",
    grossTonnage: 45000,
    deadweight: 82000,
    complianceScore: 92.3,
    status: "active",
    createdAt: "2024-02-20",
    updatedAt: "2025-02-20",
  },
  {
    id: "3",
    name: "Nordic Star",
    imo: "IMO9612345",
    type: "Tanker",
    flag: "Norway",
    grossTonnage: 62000,
    deadweight: 115000,
    complianceScore: 78.9,
    status: "active",
    createdAt: "2024-03-10",
    updatedAt: "2025-02-22",
  },
  {
    id: "4",
    name: "Mediterranean Queen",
    imo: "IMO9701234",
    type: "RoRo",
    flag: "Greece",
    grossTonnage: 35000,
    deadweight: 12000,
    complianceScore: 95.2,
    status: "active",
    createdAt: "2024-04-05",
    updatedAt: "2025-03-02",
  },
  {
    id: "5",
    name: "Baltic Trader",
    imo: "IMO9801234",
    type: "General Cargo",
    flag: "Denmark",
    grossTonnage: 8500,
    deadweight: 12500,
    complianceScore: 82.1,
    status: "maintenance",
    createdAt: "2024-05-18",
    updatedAt: "2025-01-10",
  },
]

export function FleetPage() {
  const [vessels, setVessels] = useState<Vessel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await vesselApi.getAll()
        setVessels(response.data.data)
      } catch (err) {
        console.log("Using mock data")
        setVessels(mockVessels)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredVessels = vessels.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.imo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.type.toLowerCase().includes(searchQuery.toLowerCase()),
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
            placeholder="Search vessels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 self-start">
          <Plus className="w-4 h-4" />
          <span>Add Vessel</span>
        </button>
      </div>

      {/* Vessels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredVessels.map((vessel) => (
          <div key={vessel.id} className="glass-card-hover p-6 group">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgb(var(--primary)/0.2)] to-[rgb(var(--accent)/0.1)] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Anchor className="w-6 h-6 text-[rgb(var(--primary))]" />
                </div>
                <div>
                  <h3 className="font-semibold">{vessel.name}</h3>
                  <p className="text-sm text-[rgb(var(--muted-foreground))] font-mono">{vessel.imo}</p>
                </div>
              </div>
              <div className="relative">
                <button className="p-2 rounded-xl hover:bg-[rgb(var(--secondary))] transition-colors opacity-0 group-hover:opacity-100">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-[rgb(var(--secondary)/0.3)] transition-colors">
                <div className="flex items-center gap-2">
                  <Ship className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                  <span className="text-sm text-[rgb(var(--muted-foreground))]">Type</span>
                </div>
                <span className="text-sm font-medium">{vessel.type}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-[rgb(var(--secondary)/0.3)] transition-colors">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                  <span className="text-sm text-[rgb(var(--muted-foreground))]">Flag</span>
                </div>
                <span className="text-sm font-medium">{vessel.flag}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-[rgb(var(--secondary)/0.3)] transition-colors">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                  <span className="text-sm text-[rgb(var(--muted-foreground))]">Gross Tonnage</span>
                </div>
                <span className="text-sm font-medium font-mono">{formatNumber(vessel.grossTonnage)} GT</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-[rgb(var(--secondary)/0.3)] transition-colors">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                  <span className="text-sm text-[rgb(var(--muted-foreground))]">Deadweight</span>
                </div>
                <span className="text-sm font-medium font-mono">{formatNumber(vessel.deadweight)} DWT</span>
              </div>
            </div>

            <div className="border-t border-[rgb(var(--border))] mt-5 pt-5">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">Compliance Score</p>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      vessel.complianceScore >= 89.34
                        ? "text-[rgb(var(--success))]"
                        : vessel.complianceScore >= 80
                          ? "text-[rgb(var(--warning))]"
                          : "text-[rgb(var(--destructive))]",
                    )}
                  >
                    {vessel.complianceScore}%
                  </p>
                </div>
                <span
                  className={cn("px-3 py-1.5 rounded-xl text-xs border font-medium", getStatusColor(vessel.status))}
                >
                  {vessel.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Vessel Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Vessel">
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Vessel Name</label>
              <input type="text" className="input-field" placeholder="e.g., Atlantic Voyager" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">IMO Number</label>
              <input type="text" className="input-field" placeholder="e.g., IMO9434567" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select className="input-field">
                <option>Container Ship</option>
                <option>Bulk Carrier</option>
                <option>Tanker</option>
                <option>RoRo</option>
                <option>General Cargo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Flag</label>
              <input type="text" className="input-field" placeholder="e.g., Panama" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Gross Tonnage</label>
              <input type="number" className="input-field" placeholder="e.g., 94000" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Deadweight</label>
              <input type="number" className="input-field" placeholder="e.g., 109000" />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              Add Vessel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
