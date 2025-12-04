"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { Ship, Route, GitCompare, Landmark, Users, Sun, Moon, Menu, X, Anchor } from "lucide-react"

interface LayoutProps {
  children: React.ReactNode
}

const navItems = [
  { path: "/routes", label: "Routes", icon: Route },
  { path: "/compare", label: "Compare", icon: GitCompare },
  { path: "/banking", label: "Banking", icon: Landmark },
  { path: "/pooling", label: "Pooling", icon: Users },
]

export function Layout({ children }: LayoutProps) {
  const [isDark, setIsDark] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const currentPage = navItems.find((item) => item.path === location.pathname)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "rgb(var(--background))" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b animate-fade-in"
        style={{
          background: "rgb(var(--card) / 0.8)",
          backdropFilter: "blur(20px)",
          borderColor: "rgb(var(--border) / 0.5)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-xl icon-shake"
                style={{
                  background: "linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--accent)) 100%)",
                }}
              >
                <Ship className="w-6 h-6" style={{ color: "rgb(var(--primary-foreground))" }} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold glow-text">FuelEU Maritime</h1>
                <p className="text-xs" style={{ color: "rgb(var(--muted-foreground))" }}>
                  Compliance Dashboard
                </p>
              </div>
            </div>

            {/* Desktop Navigation - Tab Style */}
            <nav className="hidden md:flex tab-nav">
              {navItems.map((item, index) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`tab-item flex items-center gap-2 animate-fade-in stagger-${index + 1} ${isActive ? "active" : ""}`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "" : "icon-shake"}`} />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2.5 rounded-xl transition-all duration-300 icon-shake"
                style={{
                  background: "rgb(var(--secondary))",
                  color: "rgb(var(--foreground))",
                }}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl icon-shake"
                style={{
                  background: "rgb(var(--secondary))",
                  color: "rgb(var(--foreground))",
                }}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden border-t animate-slide-in-left"
            style={{
              background: "rgb(var(--card))",
              borderColor: "rgb(var(--border) / 0.5)",
            }}
          >
            <nav className="px-4 py-3 space-y-1">
              {navItems.map((item, index) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all animate-fade-in stagger-${index + 1}`}
                    style={{
                      background: isActive ? "rgb(var(--primary) / 0.1)" : "transparent",
                      color: isActive ? "rgb(var(--primary))" : "rgb(var(--foreground))",
                    }}
                  >
                    <Icon className="w-5 h-5 icon-shake" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Page Title Bar */}
      <div
        className="border-b animate-fade-in"
        style={{
          background: "rgb(var(--secondary) / 0.3)",
          borderColor: "rgb(var(--border) / 0.3)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            {currentPage && (
              <>
                <currentPage.icon className="w-6 h-6 icon-bounce" style={{ color: "rgb(var(--primary))" }} />
                <div>
                  <h2 className="text-xl font-bold" style={{ color: "rgb(var(--foreground))" }}>
                    {currentPage.label}
                  </h2>
                  <p className="text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>
                    {currentPage.path === "/routes" && "View and manage all routes with compliance data"}
                    {currentPage.path === "/compare" && "Compare routes against baseline for compliance"}
                    {currentPage.path === "/banking" && "Manage compliance balance banking operations"}
                    {currentPage.path === "/pooling" && "Create and manage compliance pools"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</div>
      </main>

      {/* Footer */}
      <footer
        className="border-t py-4 animate-fade-in"
        style={{
          background: "rgb(var(--card) / 0.5)",
          borderColor: "rgb(var(--border) / 0.3)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Anchor className="w-4 h-4 icon-shake" style={{ color: "rgb(var(--muted-foreground))" }} />
              <span className="text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>
                FuelEU Maritime Compliance Platform
              </span>
            </div>
            <span className="text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>
              Target: 89.3368 gCO2e/MJ
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
