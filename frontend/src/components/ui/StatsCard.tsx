import { cn } from "../../lib/utils"
import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  iconColor?: string
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  iconColor = "text-[rgb(var(--primary))]",
}: StatsCardProps) {
  return (
    <div className={cn("glass-card-hover p-5 sm:p-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[rgb(var(--muted-foreground))] truncate">{title}</p>
          <p className="stat-value mt-2 truncate">{value}</p>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[rgb(var(--muted-foreground))] mt-1 truncate">{subtitle}</p>
          )}
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1.5 mt-3 text-sm font-medium",
                trend.isPositive ? "text-[rgb(var(--success))]" : "text-[rgb(var(--destructive))]",
              )}
            >
              {trend.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-[rgb(var(--muted-foreground))] font-normal">vs last month</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgb(var(--primary)/0.2)] to-[rgb(var(--accent)/0.1)] flex items-center justify-center flex-shrink-0">
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
      </div>
    </div>
  )
}
