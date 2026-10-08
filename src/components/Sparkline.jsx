import { useState, useRef, useCallback } from 'react'

export default function Sparkline({ data, labels, color = 'var(--color-accent)' }) {
  const points = Array.isArray(data) ? data : data?.points || []
  const timeLabels = labels || (Array.isArray(data) ? null : data?.labels) || points.map((_, i) => {
    const daysAgo = points.length - 1 - i
    return daysAgo === 0 ? 'Today' : `${daysAgo}d ago`
  })

  const w = 420
  const h = 60
  const pad = 6

  const validPoints = points.length > 0 ? points : [50]
  const max = Math.max(...validPoints)
  const min = Math.min(...validPoints)
  const avg = Math.round(validPoints.reduce((a, b) => a + b, 0) / validPoints.length)
  const range = max - min || 1

  const svgRef = useRef(null)
  const [hovered, setHovered] = useState(null) // { index, x, y, value, time }

  const coords = validPoints.map((d, i) => ({
    x: pad + (i / Math.max(1, validPoints.length - 1)) * (w - pad * 2),
    y: h - pad - ((d - min) / range) * (h - pad * 2),
    value: d,
    time: timeLabels[i] || `Day ${i + 1}`,
  }))

  const polyPoints = coords.map((c) => `${c.x},${c.y}`).join(' ')
  const areaPoints = `${pad},${h - pad} ${polyPoints} ${w - pad},${h - pad}`

  const handleMouseMove = useCallback(
    (e) => {
      const svg = svgRef.current
      if (!svg || coords.length === 0) return
      const rect = svg.getBoundingClientRect()
      const svgX = ((e.clientX - rect.left) / rect.width) * w

      let closest = 0
      let minDist = Infinity
      coords.forEach((c, i) => {
        const dist = Math.abs(c.x - svgX)
        if (dist < minDist) {
          minDist = dist
          closest = i
        }
      })

      setHovered({ index: closest, ...coords[closest] })
    },
    [coords, w]
  )

  const handleMouseLeave = () => setHovered(null)

  const tooltipW = 90
  const tooltipXPercent = hovered ? (hovered.x / w) * 100 : 50
  const tooltipLeftClamped = `clamp(4px, calc(${tooltipXPercent}% - ${tooltipW / 2}px), calc(100% - ${tooltipW + 4}px))`

  const startLabel = timeLabels[0] || '30d ago'
  const midIndex = Math.floor(timeLabels.length / 2)
  const midLabel = timeLabels[midIndex] || '15d ago'
  const endLabel = timeLabels[timeLabels.length - 1] || 'Today'

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
        <defs>
          <linearGradient id={`spark-grad-${color.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <polygon
          points={areaPoints}
          fill={`url(#spark-grad-${color.replace(/[^a-zA-Z0-9]/g, '')})`}
        />

        {/* Soft grid line */}
        <line
          x1={pad}
          y1={h / 2}
          x2={w - pad}
          y2={h / 2}
          stroke="currentColor"
          strokeWidth="0.75"
          strokeDasharray="4 4"
          className="text-line-soft opacity-60"
        />

        {/* Trend Line */}
        <polyline
          points={polyPoints}
          fill="none"
          stroke={color}
          strokeWidth="2.2"
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
            strokeWidth="1.2"
            strokeDasharray="3 3"
            opacity="0.6"
          />
        )}

        {/* Dot on hovered point */}
        {hovered && (
          <>
            <circle cx={hovered.x} cy={hovered.y} r="7" fill={color} opacity="0.2" />
            <circle cx={hovered.x} cy={hovered.y} r="3.5" fill={color} />
            <circle cx={hovered.x} cy={hovered.y} r="1.5" fill="#ffffff" />
          </>
        )}
      </svg>

      {/* Tooltip */}
      {hovered && (
        <div
          className="pointer-events-none absolute -top-10 z-20"
          style={{ left: tooltipLeftClamped }}
        >
          <div
            className="flex flex-col items-center gap-0.5 rounded-lg border border-line bg-panel px-2.5 py-1 shadow-lg backdrop-blur-md"
            style={{ borderColor: `${color}55` }}
          >
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="font-mono text-[12.5px] font-bold tabular-nums" style={{ color }}>
                {hovered.value}%
              </span>
            </div>
            <span className="font-mono text-[9px] text-dim tabular-nums leading-none">
              {hovered.time}
            </span>
          </div>
          <div className="flex justify-center">
            <div
              className="h-1.5 w-1.5 rotate-45 border-b border-r border-line bg-panel"
              style={{ borderColor: `${color}55` }}
            />
          </div>
        </div>
      )}

      {/* Timeline markers & monthly stats */}
      <div className="mt-2 flex items-center justify-between border-t border-line-soft/60 pt-1.5 px-0.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9.5px] text-dim">
            Min: <span className="text-hi font-semibold">{min}%</span>
          </span>
          <span className="text-line-soft">•</span>
          <span className="font-mono text-[9.5px] text-dim">
            Avg: <span className="text-accent font-semibold">{avg}%</span>
          </span>
          <span className="text-line-soft">•</span>
          <span className="font-mono text-[9.5px] text-dim">
            Max: <span className="text-hi font-semibold">{max}%</span>
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[9px] text-dim">
          <span>{startLabel}</span>
          <span>→</span>
          <span className="text-lo font-medium">{endLabel}</span>
        </div>
      </div>
    </div>
  )
}

