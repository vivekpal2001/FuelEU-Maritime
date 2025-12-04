import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from "recharts"
import { formatDate } from "../../lib/utils"
import { TrendingUp } from "lucide-react"

interface GHGIntensityChartProps {
  data: Array<{
    date: string
    intensity: number
    target: number
  }>
}

export function GHGIntensityChart({ data }: GHGIntensityChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    date: formatDate(item.date),
  }))

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgb(var(--primary)/0.15)] flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[rgb(var(--primary))]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">GHG Intensity Trajectory</h3>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">Historical performance vs target</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[rgb(var(--primary))]" />
            <span className="text-[rgb(var(--muted-foreground))]">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[rgb(var(--success))]" />
            <span className="text-[rgb(var(--muted-foreground))]">Target</span>
          </div>
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="intensityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="rgb(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="rgb(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "rgb(var(--border))" }}
            />
            <YAxis
              stroke="rgb(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "rgb(var(--border))" }}
              domain={["dataMin - 10", "dataMax + 10"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgb(var(--card))",
                border: "1px solid rgb(var(--border))",
                borderRadius: "12px",
                boxShadow: "0 10px 40px -10px rgba(0,0,0,0.3)",
              }}
              labelStyle={{ color: "rgb(var(--foreground))", fontWeight: 600 }}
              itemStyle={{ color: "rgb(var(--foreground))" }}
            />
            <ReferenceLine
              y={89.34}
              stroke="rgb(var(--success))"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: "2025 Target (89.34)",
                position: "right",
                fill: "rgb(var(--success))",
                fontSize: 11,
                fontWeight: 500,
              }}
            />
            <Area
              type="monotone"
              dataKey="intensity"
              stroke="rgb(var(--primary))"
              strokeWidth={3}
              fill="url(#intensityGradient)"
              dot={{ fill: "rgb(var(--primary))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "rgb(var(--primary))", stroke: "rgb(var(--card))", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
