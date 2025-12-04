"use client"

import { useState } from "react"
import { Bell, Shield, Database, Moon, Sun, User, Globe, Download, Trash2, Save } from "lucide-react"
import { useTheme } from "../contexts/ThemeContext"
import { cn } from "../lib/utils"

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const [notifications, setNotifications] = useState({
    complianceAlerts: true,
    voyageUpdates: true,
    bankingNotifications: false,
    poolChanges: true,
  })
  const [apiUrl, setApiUrl] = useState("http://localhost:3001/api")
  const [targetYear, setTargetYear] = useState("2025")
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveSettings = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const handleExportData = () => {
    const data = {
      notifications,
      apiUrl,
      targetYear,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "fueleu-settings.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const ghgTargets = [
    { year: "2025", reduction: "-2%", value: 89.34 },
    { year: "2030", reduction: "-6%", value: 85.69 },
    { year: "2035", reduction: "-14.5%", value: 77.93 },
    { year: "2040", reduction: "-31%", value: 62.91 },
    { year: "2050", reduction: "-80%", value: 18.22 },
  ]

  const currentTarget = ghgTargets.find((t) => t.year === targetYear)

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences and configurations</p>
      </div>

      {/* Appearance */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            {theme === "dark" ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
          </div>
          <div>
            <h3 className="font-semibold">Appearance</h3>
            <p className="text-sm text-muted-foreground">Customize how the app looks</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">Toggle between light and dark mode</p>
            </div>
            <button
              onClick={toggleTheme}
              className={cn(
                "relative w-14 h-8 rounded-full transition-colors",
                theme === "dark" ? "bg-primary" : "bg-muted",
              )}
            >
              <div
                className={cn(
                  "absolute top-1 w-6 h-6 rounded-full bg-white transition-transform shadow-md",
                  theme === "dark" ? "translate-x-7" : "translate-x-1",
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">Compact Mode</p>
              <p className="text-sm text-muted-foreground">Reduce spacing for more content on screen</p>
            </div>
            <button className="relative w-14 h-8 rounded-full bg-muted transition-colors">
              <div className="absolute top-1 translate-x-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Profile</h3>
            <p className="text-sm text-muted-foreground">Manage your account details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Company Name</label>
            <input
              type="text"
              className="input-field"
              defaultValue="Maritime Shipping Co."
              placeholder="Enter company name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <input
              type="email"
              className="input-field"
              defaultValue="compliance@maritimeco.com"
              placeholder="Enter email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">IMO Company Number</label>
            <input type="text" className="input-field" defaultValue="IMO1234567" placeholder="Enter IMO number" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Contact Phone</label>
            <input type="tel" className="input-field" defaultValue="+1 234 567 8900" placeholder="Enter phone number" />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Notifications</h3>
            <p className="text-sm text-muted-foreground">Manage notification preferences</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            {
              key: "complianceAlerts",
              label: "Compliance Alerts",
              description: "Get notified about compliance threshold breaches",
            },
            { key: "voyageUpdates", label: "Voyage Updates", description: "Notifications for voyage status changes" },
            {
              key: "bankingNotifications",
              label: "Banking Notifications",
              description: "Alerts for balance changes and transactions",
            },
            {
              key: "poolChanges",
              label: "Pool Changes",
              description: "Updates about pool membership and balance changes",
            },
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <button
                onClick={() => setNotifications((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                className={cn(
                  "relative w-14 h-8 rounded-full transition-colors",
                  notifications[key as keyof typeof notifications] ? "bg-primary" : "bg-muted",
                )}
              >
                <div
                  className={cn(
                    "absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform",
                    notifications[key as keyof typeof notifications] ? "translate-x-7" : "translate-x-1",
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* API Configuration */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">API Configuration</h3>
            <p className="text-sm text-muted-foreground">Backend connection settings</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">API Base URL</label>
            <input
              type="text"
              className="input-field"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="Enter API URL"
            />
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-green-400">Connected to backend</span>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">API Timeout (seconds)</label>
            <input type="number" className="input-field" defaultValue={30} min={5} max={120} />
          </div>
        </div>
      </div>

      {/* Compliance Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Compliance Settings</h3>
            <p className="text-sm text-muted-foreground">Configure compliance thresholds</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Target Year</label>
              <select className="input-field" value={targetYear} onChange={(e) => setTargetYear(e.target.value)}>
                <option value="2025">2025</option>
                <option value="2030">2030</option>
                <option value="2035">2035</option>
                <option value="2040">2040</option>
                <option value="2050">2050</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">GHG Target (gCO2eq/MJ)</label>
              <input type="number" className="input-field bg-muted/50" value={currentTarget?.value || 89.34} disabled />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="font-medium mb-3">FuelEU Maritime Targets Timeline</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-center text-sm">
              {ghgTargets.map((target) => (
                <div
                  key={target.year}
                  className={cn(
                    "p-3 rounded-lg transition-all",
                    targetYear === target.year
                      ? "bg-primary/20 border border-primary/50"
                      : "bg-muted hover:bg-muted/80",
                  )}
                >
                  <p className="font-bold text-base">{target.year}</p>
                  <p
                    className={cn(
                      "font-semibold",
                      targetYear === target.year ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {target.reduction}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{target.value} gCO2eq/MJ</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Compliance Warning Threshold (%)</label>
            <input type="range" className="w-full accent-primary" defaultValue={90} min={70} max={100} />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>70%</span>
              <span>Warning at 90%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Regional Settings</h3>
            <p className="text-sm text-muted-foreground">Localization preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <select className="input-field">
              <option>English (US)</option>
              <option>English (UK)</option>
              <option>German (DE)</option>
              <option>French (FR)</option>
              <option>Spanish (ES)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Timezone</label>
            <select className="input-field">
              <option>UTC (Coordinated Universal Time)</option>
              <option>CET (Central European Time)</option>
              <option>EST (Eastern Standard Time)</option>
              <option>PST (Pacific Standard Time)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Date Format</label>
            <select className="input-field">
              <option>DD/MM/YYYY</option>
              <option>MM/DD/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Unit System</label>
            <select className="input-field">
              <option>Metric (tonnes, km)</option>
              <option>Imperial (tons, miles)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Download className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Data Management</h3>
            <p className="text-sm text-muted-foreground">Export and manage your data</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleExportData} className="btn-secondary flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Export Settings
            </button>
            <button className="btn-secondary flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Export All Data (CSV)
            </button>
          </div>

          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="flex items-start gap-3">
              <Trash2 className="w-5 h-5 text-red-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-400">Danger Zone</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Once you delete your data, there is no going back. Please be certain.
                </p>
                <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors">
                  Delete All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4">
        <button className="btn-secondary">Reset to Defaults</button>
        <button onClick={handleSaveSettings} disabled={isSaving} className="btn-primary flex items-center gap-2">
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default SettingsPage
