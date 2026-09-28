import { useState, useRef, useCallback } from 'react'

export default function Sparkline({ data, color }) {
  const w = 420
  const h = 56
  const pad = 4
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const svgRef = useRef(null)
  const [hovered, setHovered] = useState(null) // { index, x, y, value }

  const coords = data.map((d, i) => ({
    x: pad + (i / (data.length - 1)) * (w - pad * 2),
    y: h - pad - ((d - min) / range) * (h - pad * 2),
    value: d,
  }))

  const points = coords.map((c) => `${c.x},${c.y}`).join(' ')
  const areaPoints = `${pad},${h - pad} ${points} ${w - pad},${h - pad}`

  // Time labels: spread over 24h — last point = now
  const timeLabels = data.map((_, i) => {
    const hoursAgo = Math.round(((data.length - 1 - i) / (data.length - 1)) * 24)
    return hoursAgo === 0 ? 'Now' : `${hoursAgo}h ago`
  })

  const handleMouseMove = useCallback(
    (e) => {
      const svg = svgRef.current
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      const svgX = ((e.clientX - rect.left) / rect.width) * w

      // Find the nearest data point
      let closest = 0
      let minDist = Infinity
      coords.forEach((c, i) => {
        const dist = Math.abs(c.x - svgX)
        if (dist < minDist) {
          minDist = dist
          closest = i
        }
      })

      setHovered({ index: closest, ...coords[closest], time: timeLabels[closest] })
    },
    [coords, timeLabels]
  )

  const handleMouseLeave = () => setHovered(null)

  // Tooltip position clamped so it never overflows left/right
  const tooltipW = 80 // estimated px width of tooltip
  const tooltipXPercent = hovered ? (hovered.x / w) * 100 : 50
  const tooltipLeftClamped = `clamp(0px, calc(${tooltipXPercent}% - ${tooltipW / 2}px), calc(100% - ${tooltipW}px))`

  return (
    <div className="relative select-none" onMouseLeave={handleMouseLeave}>
      <svg
        ref={svgRef}
        width="100%"
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="overflow-visible cursor-crosshair"
        onMouseMove={handleMouseMove}
      >
        {/* Area fill */}
        <polygon points={areaPoints} fill={color} opacity="0.08" />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Vertical guide line on hover */}
        {hovered && (
          <line
            x1={hovered.x}
            y1={pad}
            x2={hovered.x}
            y2={h - pad}
            stroke={color}
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.5"
          />
        )}

        {/* Dot on hovered point */}
        {hovered && (
          <>
            {/* Glow ring */}
            <circle cx={hovered.x} cy={hovered.y} r="6" fill={color} opacity="0.15" />
            {/* Inner dot */}
            <circle cx={hovered.x} cy={hovered.y} r="3.5" fill={color} />
            <circle cx={hovered.x} cy={hovered.y} r="1.5" fill="white" />
          </>
        )}
      </svg>

      {/* Tooltip */}
      {hovered && (
        <div
          className="pointer-events-none absolute -top-9 z-10"
          style={{ left: tooltipLeftClamped }}
        >
          <div
            className="flex flex-col items-center gap-0.5 rounded-lg border border-line bg-panel px-2.5 py-1.5 shadow-lg"
            style={{ borderColor: `${color}44` }}
          >
            <span className="font-mono text-[13px] font-bold tabular-nums" style={{ color }}>
              {hovered.value}%
            </span>
            <span className="font-mono text-[9.5px] text-dim tabular-nums leading-none">
              {hovered.time}
            </span>
          </div>
          {/* Caret */}
          <div className="flex justify-center">
            <div
              className="h-1.5 w-1.5 rotate-45 border-b border-r border-line bg-panel"
              style={{ borderColor: `${color}44` }}
            />
          </div>
        </div>
      )}

      {/* Min / Max annotation */}
      <div className="mt-1 flex items-center justify-between px-0.5">
        <span className="font-mono text-[9.5px] text-dim tabular-nums">
          Low: <span className="text-hi font-semibold">{min}%</span>
        </span>
        <span className="font-mono text-[9.5px] text-dim tabular-nums">
          High: <span className="text-hi font-semibold">{max}%</span>
        </span>
      </div>
    </div>
  )
}
