"use client"

import { useState, useEffect } from "react"
import {
  Users,
  Plus,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Ship,
  TrendingUp,
  TrendingDown,
  Trash2,
} from "lucide-react"
import { apiClient } from "../../infrastructure/api.client"
import type { Pool, PoolAllocationResult } from "../../../core/domain/entities/pool.entity"

interface PoolMemberInput {
  shipId: string
  cbBefore: number
}

export function PoolingPage() {
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(2024)
  const [members, setMembers] = useState<PoolMemberInput[]>([])
  const [shipCBs, setShipCBs] = useState<Record<string, number>>({})
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<PoolAllocationResult | null>(null)

  const ships = ["R001", "R002", "R003", "R004", "R005"]
  const years = [2024, 2025]

  useEffect(() => {
    fetchPools()
    fetchShipCBs()
  }, [selectedYear])

  const fetchPools = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getPools()
      setPools(data)
    } catch (err) {
      setPools([])
    } finally {
      setLoading(false)
    }
  }

  const fetchShipCBs = async () => {
    const cbs: Record<string, number> = {}
    for (const ship of ships) {
      try {
        const result = await apiClient.getAdjustedComplianceBalance(ship, selectedYear)
        cbs[ship] = result.adjustedCbGco2eq
      } catch {
        cbs[ship] = getMockCB(ship)
      }
    }
    setShipCBs(cbs)
  }

  const addMember = (shipId: string) => {
    if (members.find((m) => m.shipId === shipId)) return
    const cb = shipCBs[shipId] || 0
    setMembers([...members, { shipId, cbBefore: cb }])
  }

  const removeMember = (shipId: string) => {
    setMembers(members.filter((m) => m.shipId !== shipId))
  }

  const totalCB = members.reduce((sum, m) => sum + m.cbBefore, 0)
  const isValidPool = members.length >= 2 && totalCB >= 0

  const createPool = async () => {
    if (!isValidPool) return
    try {
      setCreating(true)
      setError(null)
      const result = await apiClient.createPool({ year: selectedYear, members })
      setLastResult(result)
      setSuccess("Pool created successfully!")
      setMembers([])
      await fetchPools()
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to create pool")
    } finally {
      setCreating(false)
      setTimeout(() => setSuccess(null), 5000)
    }
  }

  const availableShips = ships.filter((s) => !members.find((m) => m.shipId === s))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Year Selector */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium" style={{ color: "rgb(var(--muted-foreground))" }}>
            Year:
          </label>
          <select
            className="select-field w-auto"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number.parseInt(e.target.value))}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div
          className="p-4 rounded-xl flex items-center gap-3 toast-enter"
          style={{ background: "rgb(var(--destructive) / 0.15)", border: "1px solid rgb(var(--destructive) / 0.3)" }}
        >
          <AlertTriangle className="w-5 h-5 icon-shake" style={{ color: "rgb(var(--destructive))" }} />
          <span style={{ color: "rgb(var(--destructive))" }}>{error}</span>
        </div>
      )}
      {success && (
        <div
          className="p-4 rounded-xl flex items-center gap-3 toast-enter"
          style={{ background: "rgb(var(--success) / 0.15)", border: "1px solid rgb(var(--success) / 0.3)" }}
        >
          <CheckCircle2 className="w-5 h-5 icon-shake" style={{ color: "rgb(var(--success))" }} />
          <span style={{ color: "rgb(var(--success))" }}>{success}</span>
        </div>
      )}

      {/* Create Pool */}
      <div className="glass-card p-4 animate-fade-in stagger-1">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-5 h-5 icon-shake" style={{ color: "rgb(var(--primary))" }} />
          <h3 className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>
            Create New Pool
          </h3>
        </div>

        {/* Add Members */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: "rgb(var(--muted-foreground))" }}>
            Add Ships to Pool
          </label>
          <div className="flex flex-wrap gap-2">
            {availableShips.map((ship) => (
              <button key={ship} onClick={() => addMember(ship)} className="btn-secondary text-sm py-1.5 px-3 ripple">
                <Ship className="w-4 h-4 icon-shake" />
                {ship}
                <span
                  className="ml-1 font-mono text-xs"
                  style={{ color: shipCBs[ship] >= 0 ? "rgb(var(--success))" : "rgb(var(--destructive))" }}
                >
                  ({(shipCBs[ship] / 1000000).toFixed(1)}M)
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Members */}
        {members.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: "rgb(var(--muted-foreground))" }}>
              Pool Members
            </label>
            <div className="space-y-2">
              {members.map((member, index) => (
                <div
                  key={member.shipId}
                  className={`flex items-center justify-between p-3 rounded-xl animate-scale-in stagger-${index + 1}`}
                  style={{ background: "rgb(var(--secondary) / 0.5)" }}
                >
                  <div className="flex items-center gap-3">
                    <Ship className="w-5 h-5 icon-bounce" style={{ color: "rgb(var(--primary))" }} />
                    <span className="font-medium">{member.shipId}</span>
                    <div className="flex items-center gap-1">
                      {member.cbBefore >= 0 ? (
                        <TrendingUp className="w-4 h-4" style={{ color: "rgb(var(--success))" }} />
                      ) : (
                        <TrendingDown className="w-4 h-4" style={{ color: "rgb(var(--destructive))" }} />
                      )}
                      <span
                        className="font-mono text-sm"
                        style={{ color: member.cbBefore >= 0 ? "rgb(var(--success))" : "rgb(var(--destructive))" }}
                      >
                        {(member.cbBefore / 1000000).toFixed(2)}M gCO2eq
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMember(member.shipId)}
                    className="p-1.5 rounded-lg transition-colors icon-shake"
                    style={{ color: "rgb(var(--destructive))" }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pool Sum Indicator */}
        {members.length > 0 && (
          <div
            className={`p-4 rounded-xl mb-4 animate-fade-in`}
            style={{
              background: totalCB >= 0 ? "rgb(var(--success) / 0.1)" : "rgb(var(--destructive) / 0.1)",
              border: `1px solid ${totalCB >= 0 ? "rgb(var(--success) / 0.3)" : "rgb(var(--destructive) / 0.3)"}`,
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="font-medium"
                style={{ color: totalCB >= 0 ? "rgb(var(--success))" : "rgb(var(--destructive))" }}
              >
                Pool Sum: {(totalCB / 1000000).toFixed(2)}M gCO2eq
              </span>
              {totalCB >= 0 ? (
                <CheckCircle2 className="w-5 h-5 icon-pulse" style={{ color: "rgb(var(--success))" }} />
              ) : (
                <AlertTriangle className="w-5 h-5 icon-shake" style={{ color: "rgb(var(--destructive))" }} />
              )}
            </div>
            <p className="text-sm mt-1" style={{ color: "rgb(var(--muted-foreground))" }}>
              {totalCB >= 0 ? "Pool is valid - sum of CB >= 0" : "Pool is invalid - sum of CB must be >= 0"}
            </p>
          </div>
        )}

        {/* Create Button */}
        <button onClick={createPool} disabled={!isValidPool || creating} className="btn-primary w-full ripple">
          <Users className={`w-4 h-4 ${creating ? "" : "icon-shake"}`} />
          {creating ? "Creating Pool..." : "Create Pool"}
        </button>
        {members.length > 0 && members.length < 2 && (
          <p className="text-xs text-center mt-2" style={{ color: "rgb(var(--muted-foreground))" }}>
            Add at least 2 members to create a pool
          </p>
        )}
      </div>

      {/* Last Pool Result */}
      {lastResult && (
        <div className="glass-card p-4 animate-scale-in">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 icon-pulse" style={{ color: "rgb(var(--success))" }} />
            <h3 className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>
              Pool Allocation Result
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ship ID</th>
                  <th>CB Before</th>
                  <th>CB After</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {lastResult.members.map((member, index) => {
                  const change = member.cbAfter - member.cbBefore
                  return (
                    <tr key={member.shipId} className={`animate-fade-in stagger-${index + 1}`}>
                      <td className="font-medium">{member.shipId}</td>
                      <td className="font-mono">{(member.cbBefore / 1000000).toFixed(2)}M</td>
                      <td className="font-mono">{(member.cbAfter / 1000000).toFixed(2)}M</td>
                      <td>
                        <span
                          className="font-mono"
                          style={{ color: change >= 0 ? "rgb(var(--success))" : "rgb(var(--destructive))" }}
                        >
                          {change >= 0 ? "+" : ""}
                          {(change / 1000000).toFixed(2)}M
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Existing Pools */}
      <div className="glass-card overflow-hidden animate-fade-in stagger-3">
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: "rgb(var(--border) / 0.5)" }}
        >
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 icon-shake" style={{ color: "rgb(var(--primary))" }} />
            <h3 className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>
              Existing Pools
            </h3>
          </div>
          <button onClick={fetchPools} className="btn-secondary" disabled={loading}>
            <RefreshCw className={`w-4 h-4 icon-shake ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="spinner" />
          </div>
        ) : pools.length === 0 ? (
          <div className="p-8 text-center" style={{ color: "rgb(var(--muted-foreground))" }}>
            No pools created yet
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {pools.map((pool, index) => (
              <div
                key={pool.id}
                className={`p-4 rounded-xl animate-fade-in stagger-${index + 1}`}
                style={{ background: "rgb(var(--secondary) / 0.3)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Pool {pool.id.slice(0, 8)}...</span>
                  <span className="text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>
                    Year: {pool.year}
                  </span>
                </div>
                {pool.members && pool.members.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {pool.members.map((member) => (
                      <span
                        key={member.id}
                        className="px-3 py-1 rounded-full text-sm"
                        style={{ background: "rgb(var(--primary) / 0.15)", color: "rgb(var(--primary))" }}
                      >
                        {member.shipId}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Mock CB values
function getMockCB(shipId: string): number {
  const data: Record<string, number> = {
    R001: -34370000,
    R002: 27428000,
    R003: -86706600,
    R004: -291000,
    R005: -23412000,
  }
  return data[shipId] || 0
}
