"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 0,
  fontSize: 12,
  fontFamily: "var(--font-heading-stack)",
}

/**
 * A single-series bar chart. `highlightLast` paints the final bar with the
 * accent and the rest muted (the dashboard's "this week" emphasis); otherwise
 * every bar is accent. Dynamic-imported (ssr:false) to keep recharts out of the
 * initial route JS.
 */
export default function BarSeriesChart({
  data,
  xKey,
  yKey,
  height = 300,
  highlightLast = false,
}: {
  data: any[]
  xKey: string
  yKey: string
  height?: number
  highlightLast?: boolean
}) {
  return (
    <div style={{ height }} aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <XAxis dataKey={xKey} stroke="var(--text-secondary)" fontSize={10} />
          <YAxis stroke="var(--text-secondary)" fontSize={10} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey={yKey} fill="var(--accent)" radius={[0, 0, 0, 0]}>
            {highlightLast
              ? data.map((_, i) => (
                  <Cell key={i} fill={i === data.length - 1 ? "var(--accent)" : "var(--surface-elevated)"} />
                ))
              : null}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
