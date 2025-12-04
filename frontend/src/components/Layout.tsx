"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { useTheme } from "../contexts/ThemeContext"
import { cn } from "../lib/utils"
import {
  LayoutDashboard,
  Ship,
  Route,
  GitCompare,
  Landmark,
  Users,
  Settings,
  HelpCircle,
  Menu,
  X,
  Sun,
  Moon,
  Waves,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const mainNavItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/routes", icon: Route, label: "Routes" },
  { path: "/compare", icon: GitCompare, label: "Compare" },
  { path: "/banking", icon: Landmark, label: "Banking" },
  { path: "/pooling", icon: Users, label: "Pooling" },
  { path: "/fleet", icon: Ship, label: "Fleet" },
]

const secondaryNavItems = [
  { path: "/settings", icon: Settings, label: "Settings" },
  { path: "/help", icon: HelpCircle, label: "Help" },
]

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  const currentPage =
    [...mainNavItems, ...secondaryNavItems].find((item) => item.path === location.pathname)?.label || "Dashboard"

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [sidebarOpen])

  return (
    <div className="min-h-screen flex bg-[rgb(var(--background))]">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky inset-y-0 left-0 z-50 h-screen flex flex-col",
          "bg-[rgb(var(--card))] border-r border-[rgb(var(--border))]",
          "transform transition-all duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          sidebarCollapsed ? "lg:w-20" : "w-72 lg:w-64",
        )}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[rgb(var(--border))]">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--accent))] flex items-center justify-center shadow-lg glow-pulse">
                <Waves className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[rgb(var(--success))] rounded-full border-2 border-[rgb(var(--card))] animate-pulse" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-lg glow-text">FuelEU</span>
                <span className="text-xs text-[rgb(var(--muted-foreground))]">Maritime</span>
              </div>
            )}
          </NavLink>

          {/* Mobile Close Button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-[rgb(var(--secondary))] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {/* Main Navigation */}
          <div className="mb-6">
            {!sidebarCollapsed && (
              <p className="px-3 mb-2 text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
                Main
              </p>
            )}
            {mainNavItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                    isActive
                      ? "bg-gradient-to-r from-[rgb(var(--primary)/0.15)] to-[rgb(var(--accent)/0.1)] text-[rgb(var(--primary))]"
                      : "text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary)/0.5)]",
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-[rgb(var(--primary))] to-[rgb(var(--accent))] rounded-r-full" />
                  )}
                  <item.icon
                    className={cn(
                      "w-5 h-5 transition-transform duration-200 flex-shrink-0",
                      isActive && "text-[rgb(var(--primary))]",
                      !isActive && "group-hover:scale-110",
                    )}
                  />
                  {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-3 px-2 py-1 bg-[rgb(var(--card))] text-[rgb(var(--foreground))] text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-[rgb(var(--border))]">
                      {item.label}
                    </div>
                  )}
                </NavLink>
              )
            })}
          </div>

          {/* Secondary Navigation */}
          <div className="pt-4 border-t border-[rgb(var(--border))]">
            {!sidebarCollapsed && (
              <p className="px-3 mb-2 text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
                System
              </p>
            )}
            {secondaryNavItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                    isActive
                      ? "bg-[rgb(var(--secondary))] text-[rgb(var(--primary))]"
                      : "text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary)/0.5)]",
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-3 px-2 py-1 bg-[rgb(var(--card))] text-[rgb(var(--foreground))] text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-[rgb(var(--border))]">
                      {item.label}
                    </div>
                  )}
                </NavLink>
              )
            })}
          </div>
        </nav>

        {/* Collapse Button (Desktop Only) */}
        <div className="p-3 border-t border-[rgb(var(--border))] hidden lg:block">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary)/0.5)] transition-all duration-200"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-[rgb(var(--border))] bg-[rgb(var(--background)/0.8)] backdrop-blur-xl">
          <div className="h-full flex items-center justify-between px-4 lg:px-6">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-[rgb(var(--secondary))] transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="hidden sm:block">
                <h1 className="text-xl font-bold">{currentPage}</h1>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">FuelEU Maritime Compliance Platform</p>
              </div>

              {/* Search (Desktop) */}
              <div className="hidden md:block relative ml-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                <input type="text" placeholder="Search vessels, routes..." className="input-field pl-10 w-64 lg:w-80" />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Search Button */}
              <button className="md:hidden p-2 rounded-xl hover:bg-[rgb(var(--secondary))] transition-colors">
                <Search className="w-5 h-5" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl hover:bg-[rgb(var(--secondary))] transition-all duration-200 group"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-[rgb(var(--warning))] group-hover:rotate-45 transition-transform duration-300" />
                ) : (
                  <Moon className="w-5 h-5 text-[rgb(var(--primary))] group-hover:-rotate-12 transition-transform duration-300" />
                )}
              </button>

              {/* Notifications */}
              <button className="relative p-2.5 rounded-xl hover:bg-[rgb(var(--secondary))] transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[rgb(var(--destructive))] rounded-full" />
              </button>

              {/* Compliance Status */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgb(var(--success)/0.15)] border border-[rgb(var(--success)/0.3)]">
                <div className="w-2 h-2 rounded-full bg-[rgb(var(--success))] animate-pulse" />
                <span className="text-sm text-[rgb(var(--success))] font-medium">Compliant</span>
              </div>

              {/* User Avatar */}
              <button className="hidden sm:flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-[rgb(var(--secondary))] transition-colors">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--accent))] flex items-center justify-center text-white font-semibold text-sm">
                  JD
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">Fleet Manager</p>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
