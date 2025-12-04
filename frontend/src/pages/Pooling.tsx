"use client"

import { useState, useEffect } from "react"
import { Users, Plus, Ship, Percent, X, Users2, TrendingUp } from "lucide-react"
import { poolApi, type PoolWithMembers } from "../lib/api"
import { cn, formatNumber } from "../lib/utils"
import { Modal } from "../components/ui/Modal"

// Mock data
const mockPools: PoolWithMembers[] = [
  {
    id: "1",
    name: "Atlantic Fleet Pool",
    description: "Compliance balance sharing pool for Atlantic region vessels",
    totalBalance: 28800,
    status: "active",
    members: [
      {
        id: "1",
        poolId: "1",
        vesselId: "1",
        share: 50.5,
        vessel: { id: "1", name: "Atlantic Voyager", imo: "IMO9434567", complianceScore: 87.5 },
      },
      {
        id: "2",
        poolId: "1",
        vesselId: "4",
        share: 49.5,
        vessel: { id: "4", name: "Mediterranean Queen", imo: "IMO9701234", complianceScore: 95.2 },
      },
    ],
  },
]

const availableVessels = [
  { id: "2", name: "Pacific Pioneer", imo: "IMO9523456", complianceScore: 92.3 },
  { id: "3", name: "Nordic Star", imo: "IMO9612345", complianceScore: 78.9 },
  { id: "5", name: "Baltic Trader", imo: "IMO9801234", complianceScore: 82.1 },
]

export function PoolingPage() {
  const [pools, setPools] = useState<PoolWithMembers[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await poolApi.getAll()
        setPools(response.data.data)
      } catch (err) {
        console.log("Using mock data")
        setPools(mockPools)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const openAddMemberModal = (poolId: string) => {
    setSelectedPoolId(poolId)
    setIsAddMemberModalOpen(true)
  }

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
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Compliance Pools</h2>
          <p className="text-[rgb(var(--muted-foreground))]">Manage vessel pooling for shared compliance balance</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary flex items-center gap-2 self-start">
          <Plus className="w-4 h-4" />
          <span>Create Pool</span>
        </button>
      </div>

      {/* Pools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pools.map((pool) => (
          <div key={pool.id} className="glass-card-hover p-6">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgb(var(--primary)/0.2)] to-[rgb(var(--accent)/0.1)] flex items-center justify-center">
                  <Users2 className="w-6 h-6 text-[rgb(var(--primary))]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{pool.name}</h3>
                  {pool.description && (
                    <p className="text-sm text-[rgb(var(--muted-foreground))] mt-0.5">{pool.description}</p>
                  )}
                </div>
              </div>
              <span
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs border font-medium",
                  pool.status === "active"
                    ? "bg-[rgb(var(--success)/0.15)] text-[rgb(var(--success))] border-[rgb(var(--success)/0.3)]"
                    : "bg-[rgb(var(--muted-foreground)/0.15)] text-[rgb(var(--muted-foreground))] border-[rgb(var(--muted-foreground)/0.3)]",
                )}
              >
                {pool.status}
              </span>
            </div>

            {/* Pool Stats */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="p-4 rounded-xl bg-[rgb(var(--secondary)/0.3)]">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">Total Balance</p>
                </div>
                <p
                  className={cn(
                    "text-xl font-bold",
                    pool.totalBalance >= 0 ? "text-[rgb(var(--success))]" : "text-[rgb(var(--destructive))]",
                  )}
                >
                  {pool.totalBalance >= 0 ? "+" : ""}
                  {formatNumber(pool.totalBalance)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[rgb(var(--secondary)/0.3)]">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">Members</p>
                </div>
                <p className="text-xl font-bold">{pool.members.length}</p>
              </div>
            </div>

            {/* Members List */}
            <div className="space-y-2 mb-5">
              <p className="text-sm font-medium text-[rgb(var(--muted-foreground))]">Pool Members</p>
              {pool.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[rgb(var(--secondary)/0.2)] hover:bg-[rgb(var(--secondary)/0.4)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[rgb(var(--primary)/0.15)] flex items-center justify-center">
                      <Ship className="w-4 h-4 text-[rgb(var(--primary))]" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{member.vessel.name}</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">{member.vessel.imo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[rgb(var(--primary)/0.1)]">
                      <Percent className="w-3 h-3 text-[rgb(var(--primary))]" />
                      <span className="font-mono text-sm font-medium text-[rgb(var(--primary))]">{member.share}%</span>
                    </div>
                    <button className="p-1.5 hover:bg-[rgb(var(--destructive)/0.2)] rounded-lg transition-colors">
                      <X className="w-4 h-4 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--destructive))]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => openAddMemberModal(pool.id)}
              className="w-full btn-secondary flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Vessel to Pool
            </button>
          </div>
        ))}

        {/* Empty State */}
        {pools.length === 0 && (
          <div className="col-span-full glass-card p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[rgb(var(--primary)/0.15)] flex items-center justify-center mx-auto mb-4">
              <Users2 className="w-8 h-8 text-[rgb(var(--primary))]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No pools created yet</h3>
            <p className="text-[rgb(var(--muted-foreground))] mb-6 max-w-md mx-auto">
              Create a compliance pool to share balance between vessels and optimize your fleet's compliance strategy.
            </p>
            <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
              Create First Pool
            </button>
          </div>
        )}
      </div>

      {/* Create Pool Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Pool">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Pool Name</label>
            <input type="text" className="input-field" placeholder="e.g., Atlantic Fleet Pool" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
            <textarea
              className="input-field min-h-[100px] resize-none"
              placeholder="Describe the purpose of this pool..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              Create Pool
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={isAddMemberModalOpen} onClose={() => setIsAddMemberModalOpen(false)} title="Add Vessel to Pool">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Vessel</label>
            <select className="input-field">
              {availableVessels.map((vessel) => (
                <option key={vessel.id} value={vessel.id}>
                  {vessel.name} ({vessel.imo})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Share Percentage</label>
            <input type="number" className="input-field" placeholder="e.g., 25" min="0" max="100" />
            <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
              Percentage of pool balance this vessel will share
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsAddMemberModalOpen(false)} className="btn-secondary flex-1">
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
