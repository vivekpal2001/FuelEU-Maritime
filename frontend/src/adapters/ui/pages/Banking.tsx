"use client"

import { useState, useEffect } from "react"
import { ArrowDownCircle, ArrowUpCircle, Wallet, TrendingUp, AlertCircle, RefreshCw, History } from "lucide-react"
import { apiClient } from "../../infrastructure/api.client"
import type { ComplianceResult } from "../../../core/domain/entities/compliance.entity"
import type { BankingRecord } from "../../../core/domain/entities/banking.entity"

export function BankingPage() {
  const [selectedShip, setSelectedShip] = useState("R001")
  const [selectedYear, setSelectedYear] = useState(2024)
  const [compliance, setCompliance] = useState<ComplianceResult | null>(null)
  const [bankingRecord, setBankingRecord] = useState<BankingRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [bankAmount, setBankAmount] = useState("")
  const [applyAmount, setApplyAmount] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const ships = ["R001", "R002", "R003", "R004", "R005"]
  const years = [2024, 2025]

  useEffect(() => {
    fetchData()
  }, [selectedShip, selectedYear])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [cb, records] = await Promise.all([
        apiClient.getComplianceBalance(selectedShip, selectedYear),
        apiClient.getBankingRecords(selectedShip, selectedYear),
      ])
      setCompliance(cb)
      setBankingRecord(records)
    } catch (err: any) {
      setCompliance(getMockCompliance(selectedShip))
      setBankingRecord(getMockBankingRecord(selectedShip))
    } finally {
      setLoading(false)
    }
  }

  const handleBank = async () => {
    if (!bankAmount || Number.parseFloat(bankAmount) <= 0) return
    try {
      setActionLoading(true)
      setError(null)
      await apiClient.bankSurplus(selectedShip, selectedYear, Number.parseFloat(bankAmount))
      setSuccess("Successfully banked surplus!")
      setBankAmount("")
      await fetchData()
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to bank surplus")
    } finally {
      setActionLoading(false)
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  const handleApply = async () => {
    if (!applyAmount || Number.parseFloat(applyAmount) <= 0) return
    try {
      setActionLoading(true)
      setError(null)
      const result = await apiClient.applyBanked(selectedShip, selectedYear, Number.parseFloat(applyAmount))
      setSuccess(
        `Applied ${result.applied.toFixed(0)} gCO2eq. CB: ${result.cbBefore.toFixed(0)} → ${result.cbAfter.toFixed(0)}`,
      )
      setApplyAmount("")
      await fetchData()
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to apply banked surplus")
    } finally {
      setActionLoading(false)
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  const cbValue = compliance?.cbGco2eq || 0
  const isPositive = cbValue > 0
  const canBank = isPositive && Number.parseFloat(bankAmount) > 0 && Number.parseFloat(bankAmount) <= cbValue
  const canApply = (bankingRecord?.availableBalance || 0) > 0 && Number.parseFloat(applyAmount) > 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Ship & Year Selector */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "rgb(var(--muted-foreground))" }}>
              Ship/Route ID
            </label>
            <select className="select-field" value={selectedShip} onChange={(e) => setSelectedShip(e.target.value)}>
              {ships.map((ship) => (
                <option key={ship} value={ship}>
                  {ship}
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
      </div>

      {/* Alerts */}
      {error && (
        <div
          className="p-4 rounded-xl flex items-center gap-3 toast-enter"
          style={{ background: "rgb(var(--destructive) / 0.15)", border: "1px solid rgb(var(--destructive) / 0.3)" }}
        >
          <AlertCircle className="w-5 h-5 icon-shake" style={{ color: "rgb(var(--destructive))" }} />
          <span style={{ color: "rgb(var(--destructive))" }}>{error}</span>
        </div>
      )}
      {success && (
        <div
          className="p-4 rounded-xl flex items-center gap-3 toast-enter"
          style={{ background: "rgb(var(--success) / 0.15)", border: "1px solid rgb(var(--success) / 0.3)" }}
        >
          <TrendingUp className="w-5 h-5 icon-shake" style={{ color: "rgb(var(--success))" }} />
          <span style={{ color: "rgb(var(--success))" }}>{success}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card-hover p-4 animate-scale-in stagger-1">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl"
              style={{ background: isPositive ? "rgb(var(--success) / 0.15)" : "rgb(var(--destructive) / 0.15)" }}
            >
              <Wallet
                className="w-5 h-5 icon-shake"
                style={{ color: isPositive ? "rgb(var(--success))" : "rgb(var(--destructive))" }}
              />
            </div>
            <div>
              <p className="text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>
                Current CB
              </p>
              <p
                className="text-xl font-bold animate-number"
                style={{ color: isPositive ? "rgb(var(--success))" : "rgb(var(--destructive))" }}
              >
                {loading ? "..." : cbValue.toLocaleString()} gCO2eq
              </p>
              <p className="text-xs" style={{ color: "rgb(var(--muted-foreground))" }}>
                {isPositive ? "Surplus" : "Deficit"}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card-hover p-4 animate-scale-in stagger-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ background: "rgb(var(--primary) / 0.15)" }}>
              <ArrowDownCircle className="w-5 h-5 icon-shake" style={{ color: "rgb(var(--primary))" }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>
                Total Banked
              </p>
              <p className="text-xl font-bold glow-text animate-number">
                {loading ? "..." : (bankingRecord?.totalBanked || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card-hover p-4 animate-scale-in stagger-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ background: "rgb(var(--accent) / 0.15)" }}>
              <ArrowUpCircle className="w-5 h-5 icon-shake" style={{ color: "rgb(var(--accent))" }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>
                Available Balance
              </p>
              <p className="text-xl font-bold animate-number" style={{ color: "rgb(var(--accent))" }}>
                {loading ? "..." : (bankingRecord?.availableBalance || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Banking Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bank Surplus */}
        <div className="glass-card p-4 animate-slide-in-left">
          <div className="flex items-center gap-2 mb-4">
            <ArrowDownCircle className="w-5 h-5 icon-shake" style={{ color: "rgb(var(--primary))" }} />
            <h3 className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>
              Bank Positive CB
            </h3>
          </div>
          <p className="text-sm mb-4" style={{ color: "rgb(var(--muted-foreground))" }}>
            Bank your surplus compliance balance for future use.
          </p>
          <div className="space-y-3">
            <input
              type="number"
              placeholder="Amount to bank (gCO2eq)"
              className="input-field"
              value={bankAmount}
              onChange={(e) => setBankAmount(e.target.value)}
              disabled={!isPositive}
            />
            <button onClick={handleBank} disabled={!canBank || actionLoading} className="btn-primary w-full ripple">
              <ArrowDownCircle className={`w-4 h-4 ${actionLoading ? "" : "icon-shake"}`} />
              {actionLoading ? "Banking..." : "Bank Surplus"}
            </button>
            {!isPositive && (
              <p className="text-xs text-center" style={{ color: "rgb(var(--destructive))" }}>
                Cannot bank: CB is not positive
              </p>
            )}
          </div>
        </div>

        {/* Apply Banked */}
        <div className="glass-card p-4 animate-slide-in-right">
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpCircle className="w-5 h-5 icon-shake" style={{ color: "rgb(var(--accent))" }} />
            <h3 className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>
              Apply Banked Surplus
            </h3>
          </div>
          <p className="text-sm mb-4" style={{ color: "rgb(var(--muted-foreground))" }}>
            Apply your banked surplus to cover a deficit.
          </p>
          <div className="space-y-3">
            <input
              type="number"
              placeholder="Amount to apply (gCO2eq)"
              className="input-field"
              value={applyAmount}
              onChange={(e) => setApplyAmount(e.target.value)}
              disabled={(bankingRecord?.availableBalance || 0) <= 0}
            />
            <button onClick={handleApply} disabled={!canApply || actionLoading} className="btn-secondary w-full ripple">
              <ArrowUpCircle className={`w-4 h-4 ${actionLoading ? "" : "icon-shake"}`} />
              {actionLoading ? "Applying..." : "Apply to Deficit"}
            </button>
            {(bankingRecord?.availableBalance || 0) <= 0 && (
              <p className="text-xs text-center" style={{ color: "rgb(var(--muted-foreground))" }}>
                No banked surplus available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="glass-card overflow-hidden animate-fade-in stagger-4">
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: "rgb(var(--border) / 0.5)" }}
        >
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 icon-shake" style={{ color: "rgb(var(--primary))" }} />
            <h3 className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>
              Transaction History
            </h3>
          </div>
          <button onClick={fetchData} className="btn-secondary" disabled={loading}>
            <RefreshCw className={`w-4 h-4 icon-shake ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="spinner" />
          </div>
        ) : (bankingRecord?.entries?.length || 0) === 0 ? (
          <div className="p-8 text-center" style={{ color: "rgb(var(--muted-foreground))" }}>
            No transactions yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount (gCO2eq)</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {bankingRecord?.entries.map((entry, index) => (
                  <tr key={entry.id} className={`animate-fade-in stagger-${(index % 5) + 1}`}>
                    <td>
                      <span
                        className={entry.type === "bank" ? "status-surplus" : "status-baseline"}
                        style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                        }}
                      >
                        {entry.type === "bank" ? "Bank" : "Apply"}
                      </span>
                    </td>
                    <td className="font-mono">{entry.amountGco2eq.toLocaleString()}</td>
                    <td>{new Date(entry.createdAt).toLocaleDateString()}</td>
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

// Mock data functions
function getMockCompliance(shipId: string): ComplianceResult {
  const data: Record<string, number> = {
    R001: -34370000,
    R002: 27428000,
    R003: -86706600,
    R004: -291000,
    R005: -23412000,
  }
  return {
    shipId,
    year: 2024,
    cbGco2eq: data[shipId] || 0,
    energyInScope: 0,
    targetIntensity: 89.3368,
    actualIntensity: 91,
  }
}

function getMockBankingRecord(shipId: string): BankingRecord {
  return { shipId, year: 2024, entries: [], totalBanked: 0, totalApplied: 0, availableBalance: 0 }
}
