"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 0,
  fontSize: 12,
  fontFamily: "var(--font-heading-stack)",
}

/**
 * A single-series line chart on the active-mode accent. Recharts is heavy
 * (~100kB+), so this is dynamic-imported (ssr:false) by chart pages — it stays
 * out of the initial route JS and loads when the chart is shown.
 */
export default function LineSeriesChart({
  data,
  xKey,
  yKey,
  height = 300,
}: {
  data: any[]
  xKey: string
  yKey: string
  height?: number
}) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <XAxis dataKey={xKey} stroke="var(--text-secondary)" fontSize={10} />
          <YAxis stroke="var(--text-secondary)" fontSize={10} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey={yKey} stroke="var(--accent)" strokeWidth={2} dot={{ fill: "var(--accent)", r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
