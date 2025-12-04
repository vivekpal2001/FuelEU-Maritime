import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number, decimals = 0): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  }).format(amount)
}

export function getComplianceColor(score: number): string {
  if (score >= 90) return "text-green-500"
  if (score >= 80) return "text-yellow-500"
  return "text-red-500"
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "active":
    case "completed":
      return "bg-green-500/20 text-green-400 border-green-500/30"
    case "inactive":
    case "planned":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    case "maintenance":
    case "in-progress":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }
}
