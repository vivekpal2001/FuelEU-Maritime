"use client"

import { useState, useEffect } from "react"
import { Landmark, ArrowUpRight, ArrowDownRight, RefreshCw, Plus, Wallet } from "lucide-react"
import { bankingApi, type BankingAccount, type BankingSummary } from "../lib/api"
import { cn, formatNumber, formatDate } from "../lib/utils"
import { Modal } from "../components/ui/Modal"

// Mock data
const mockAccounts: BankingAccount[] = [
  {
    id: "1",
    vesselId: "1",
    balance: 9300,
    surplus: 12500,
    deficit: 3200,
    vessel: { name: "Atlantic Voyager", imo: "IMO9434567" },
    transactions: [
      {
        id: "1",
        type: "deposit",
        amount: 4200,
        description: "VOY-2025-001 compliance surplus",
        balanceBefore: 5100,
        balanceAfter: 9300,
        createdAt: "2025-02-02",
      },
      {
        id: "2",
        type: "deposit",
        amount: 5100,
        description: "VOY-2025-002 compliance surplus",
        balanceBefore: 0,
        balanceAfter: 5100,
        createdAt: "2025-03-01",
      },
    ],
  },
  {
    id: "2",
    vesselId: "2",
    balance: 700,
    surplus: 2100,
    deficit: 1400,
    vessel: { name: "Pacific Pioneer", imo: "IMO9523456" },
    transactions: [
      {
        id: "3",
        type: "deposit",
        amount: 700,
        description: "VOY-2025-003 compliance surplus",
        balanceBefore: 0,
        balanceAfter: 700,
        createdAt: "2025-02-20",
      },
    ],
  },
  {
    id: "3",
    vesselId: "3",
    balance: -11100,
    surplus: 0,
    deficit: 11100,
    vessel: { name: "Nordic Star", imo: "IMO9612345" },
    transactions: [
      {
        id: "4",
        type: "withdrawal",
        amount: 11100,
        description: "VOY-2025-004 compliance deficit",
        balanceBefore: 0,
        balanceAfter: -11100,
        createdAt: "2025-02-22",
      },
    ],
  },
  {
    id: "4",
    vesselId: "4",
    balance: 19500,
    surplus: 19500,
    deficit: 0,
    vessel: { name: "Mediterranean Queen", imo: "IMO9701234" },
    transactions: [
      {
        id: "5",
        type: "deposit",
        amount: 19500,
        description: "VOY-2025-005 compliance surplus",
        balanceBefore: 0,
        balanceAfter: 19500,
        createdAt: "2025-03-02",
      },
    ],
  },
]

const mockSummary: BankingSummary = {
  totalSurplus: 34100,
  totalDeficit: 15700,
  netBalance: 18400,
}

export function BankingPage() {
  const [accounts, setAccounts] = useState<BankingAccount[]>([])
  const [summary, setSummary] = useState<BankingSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<"deposit" | "withdraw" | "transfer">("deposit")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountsRes, summaryRes] = await Promise.all([bankingApi.getAllAccounts(), bankingApi.getSummary()])
        setAccounts(accountsRes.data.data)
        setSummary(summaryRes.data.data)
      } catch (err) {
        console.log("Using mock data")
        setAccounts(mockAccounts)
        setSummary(mockSummary)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const openModal = (type: "deposit" | "withdraw" | "transfer") => {
    setModalType(type)
    setIsModalOpen(true)
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="glass-card-hover p-6 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-[rgb(var(--success)/0.15)] flex items-center justify-center group-hover:scale-105 transition-transform">
              <ArrowUpRight className="w-5 h-5 text-[rgb(var(--success))]" />
            </div>
            <span className="text-sm font-medium text-[rgb(var(--muted-foreground))]">Total Surplus</span>
          </div>
          <p className="text-3xl font-bold text-[rgb(var(--success))]">{formatNumber(summary?.totalSurplus || 0)}</p>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Available compliance credits</p>
        </div>

        <div className="glass-card-hover p-6 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-[rgb(var(--destructive)/0.15)] flex items-center justify-center group-hover:scale-105 transition-transform">
              <ArrowDownRight className="w-5 h-5 text-[rgb(var(--destructive))]" />
            </div>
            <span className="text-sm font-medium text-[rgb(var(--muted-foreground))]">Total Deficit</span>
          </div>
          <p className="text-3xl font-bold text-[rgb(var(--destructive))]">
            {formatNumber(summary?.totalDeficit || 0)}
          </p>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Outstanding compliance debt</p>
        </div>

        <div className="glass-card-hover p-6 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-[rgb(var(--primary)/0.15)] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5 text-[rgb(var(--primary))]" />
            </div>
            <span className="text-sm font-medium text-[rgb(var(--muted-foreground))]">Net Balance</span>
          </div>
          <p
            className={cn(
              "text-3xl font-bold",
              (summary?.netBalance || 0) >= 0 ? "text-[rgb(var(--success))]" : "text-[rgb(var(--destructive))]",
            )}
          >
            {formatNumber(summary?.netBalance || 0)}
          </p>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Fleet-wide compliance position</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => openModal("deposit")} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Deposit</span>
        </button>
        <button onClick={() => openModal("withdraw")} className="btn-secondary flex items-center gap-2">
          <ArrowDownRight className="w-4 h-4" />
          <span>Withdraw</span>
        </button>
        <button onClick={() => openModal("transfer")} className="btn-secondary flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          <span>Transfer</span>
        </button>
      </div>

      {/* Accounts List */}
      <div className="space-y-4">
        {accounts.map((account) => (
          <div key={account.id} className="glass-card-hover p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgb(var(--primary)/0.2)] to-[rgb(var(--accent)/0.1)] flex items-center justify-center">
                  <Landmark className="w-6 h-6 text-[rgb(var(--primary))]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{account.vessel.name}</h3>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">{account.vessel.imo}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">Current Balance</p>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      account.balance >= 0 ? "text-[rgb(var(--success))]" : "text-[rgb(var(--destructive))]",
                    )}
                  >
                    {account.balance >= 0 ? "+" : ""}
                    {formatNumber(account.balance)}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            {account.transactions.length > 0 && (
              <div className="border-t border-[rgb(var(--border))] pt-4">
                <p className="text-sm font-medium text-[rgb(var(--muted-foreground))] mb-3">Recent Transactions</p>
                <div className="space-y-2">
                  {account.transactions.slice(0, 3).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[rgb(var(--secondary)/0.3)] hover:bg-[rgb(var(--secondary)/0.5)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            tx.type === "deposit"
                              ? "bg-[rgb(var(--success)/0.15)]"
                              : "bg-[rgb(var(--destructive)/0.15)]",
                          )}
                        >
                          {tx.type === "deposit" ? (
                            <ArrowUpRight className="w-4 h-4 text-[rgb(var(--success))]" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-[rgb(var(--destructive))]" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium capitalize">{tx.type}</p>
                          <p className="text-xs text-[rgb(var(--muted-foreground))]">{tx.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            "font-mono text-sm font-medium",
                            tx.type === "deposit" ? "text-[rgb(var(--success))]" : "text-[rgb(var(--destructive))]",
                          )}
                        >
                          {tx.type === "deposit" ? "+" : "-"}
                          {formatNumber(tx.amount)}
                        </p>
                        <p className="text-xs text-[rgb(var(--muted-foreground))]">{formatDate(tx.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalType === "deposit"
            ? "Deposit Credits"
            : modalType === "withdraw"
              ? "Withdraw Credits"
              : "Transfer Credits"
        }
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {modalType === "transfer" ? "From Vessel" : "Vessel"}
            </label>
            <select className="input-field">
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.vesselId}>
                  {acc.vessel.name} (Balance: {formatNumber(acc.balance)})
                </option>
              ))}
            </select>
          </div>
          {modalType === "transfer" && (
            <div>
              <label className="block text-sm font-medium mb-2">To Vessel</label>
              <select className="input-field">
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.vesselId}>
                    {acc.vessel.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">Amount</label>
            <input type="number" className="input-field" placeholder="Enter amount" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
            <input type="text" className="input-field" placeholder="Transaction description" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              Confirm {modalType === "transfer" ? "Transfer" : modalType === "deposit" ? "Deposit" : "Withdrawal"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
