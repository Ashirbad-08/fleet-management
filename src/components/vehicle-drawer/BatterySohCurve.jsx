import { useMemo, useState } from 'react'
import { TrendingUp } from '../icons'

/**
 * BatterySohCurve Component
 * Displays State of Health (SoH) metrics and an interactive SVG degradation trend curve
 * based on vehicle odometer and estimated battery cycles.
 * Features: hover tooltips, X-axis dual labels (month + odometer), Y-axis percentage labels.
 */
export default function BatterySohCurve({ selectedVehicle }) {
  const [hoveredIdx, setHoveredIdx] = useState(null)

  const soh = useMemo(() => {
    if (selectedVehicle?.health !== undefined && selectedVehicle?.health !== null) {
      return Number(selectedVehicle.health)
    }
    const soc = Number(selectedVehicle?.battery) || 82
    return soc > 50 ? 91.4 : 88.2
  }, [selectedVehicle])

  const odo = Number(selectedVehicle?.odometerKm) || 48210
  const maxCapacityKwh = selectedVehicle?.batteryCapacityKwh || 12.8
  const currentRetainedKwh = ((soh / 100) * maxCapacityKwh).toFixed(1)

  // Equivalent Full Cycles (EFC)
  const fullRangeKm = selectedVehicle?.totalRangeKm || 120
  const cycles = Math.max(12, Math.round(odo / fullRangeKm))

  // Estimated Remaining Useful Life (RUL) until 80% warranty threshold
  const rulData = useMemo(() => {
    const degradation = 100 - soh
    if (degradation <= 0.5) {
      return { years: '> 6.0', km: '120k' }
    }
    const degPerKm = degradation / Math.max(odo, 1000)
    const remainingPct = Math.max(0, soh - 80)
    const remainingKm = Math.round(remainingPct / degPerKm)
    const annualKm = 24000 // typical commercial fleet usage per year
    const remainingYears = (remainingKm / annualKm).toFixed(1)
    return {
      years: remainingPct > 0 ? `${remainingYears} Yrs` : '0 Yrs',
      km: remainingPct > 0 ? `${Math.round(remainingKm / 1000)}k` : 'EOL',
    }
  }, [soh, odo])

  // Month labels and odometer labels aligned to each curve point
  const months = ['Jan', 'Apr', 'Aug', 'Dec', 'Apr', 'Aug', 'Now']
  const odoLabels = ['0', '8k', '16k', '24k', '32k', '40k', `${Math.round(odo / 1000)}k`]

  // Generate 7-point degradation curve leading to current SoH
  const curvePoints = useMemo(() => {
    return [
      { label: 'Start (0k)', val: 100 },
      { label: '8k km',      val: 98.5 },
      { label: '16k km',     val: 96.8 },
      { label: '24k km',     val: 95.2 },
      { label: '32k km',     val: 93.8 },
      { label: '40k km',     val: 92.5 },
      { label: 'Current',    val: soh  },
    ]
  }, [soh])

  // SVG dimensions — matched to the 420px container width of 24 Hours Battery Trend
  const svgWidth   = 420
  const svgHeight  = 165   // expanded height for larger, more legible labels & numbers
  const padXLeft   = 36    // left margin for larger Y-axis percentage labels
  const padXRight  = 8     // right margin matching Sparkline's edge
  const padY       = 18
  const chartBottom = svgHeight - 32  // baseline for the chart area (room for larger dual labels)

  // SoH value range shown on chart (extended below 80% to 65%)
  const minSoH = 65
  const maxSoH = 100

  const getX = (idx) => padXLeft + (idx / (curvePoints.length - 1)) * (svgWidth - padXLeft - padXRight)
  const getY = (val) => chartBottom - padY - ((val - minSoH) / (maxSoH - minSoH)) * (chartBottom - padY * 2)

  const lineD = useMemo(() => {
    return curvePoints
      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(pt.val).toFixed(1)}`)
      .join(' ')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curvePoints])

  const areaD = useMemo(() => {
    const baselineY = chartBottom - padY
    const firstX = getX(0).toFixed(1)
    const lastX  = getX(curvePoints.length - 1).toFixed(1)
    return `${lineD} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineD, curvePoints])

  const warrantyY = getY(80)

  const healthColor =
    soh >= 88 ? 'text-emerald-400' : soh >= 80 ? 'text-amber-400' : 'text-rose-400'
  const strokeColor =
    soh >= 88 ? '#34d399' : soh >= 80 ? '#fbbf24' : '#f87171'

  // Y-axis tick values (including numbers below 80%: 75%, 70%, 65%)
  const yTicks = [100, 95, 90, 85, 80, 75, 70, 65]

  return (
    <div
      data-component="BatterySohCurve"
      data-slot="battery-health-section"
      className="border-b border-line-soft bg-panel-2/15"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-line-soft bg-panel-2/60 px-5 py-2.5">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-hi">
          <span className="flex h-4.5 w-4.5 items-center justify-center rounded bg-emerald-500/15 text-emerald-400">
            <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
          </span>
          <span>State of Health (SoH) Curve</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[11px] text-dim">{cycles} Life Cycles</span>
          <span className={`font-mono text-[12px] font-bold tabular-nums ${healthColor}`}>
            {soh}% Retained
          </span>
        </div>
      </div>

      {/* Main Card Content */}
      <div className="px-5 py-3.5 bg-panel space-y-3">
        {/* KPI Strip: Retained Cap, Cycle Count, Estimated Remaining Useful Life */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-line-soft bg-panel-2/60 p-2.5 text-center">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-dim">Retained Cap</div>
            <div className="mt-0.5 font-mono text-[15px] font-bold text-hi tabular-nums">
              {currentRetainedKwh} <span className="text-[11px] text-dim font-normal">/ {maxCapacityKwh} kWh</span>
            </div>
          </div>
          <div className="rounded-lg border border-line-soft bg-panel-2/60 p-2.5 text-center">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-dim">Cycle Count</div>
            <div className="mt-0.5 font-mono text-[15px] font-bold text-accent tabular-nums">
              {cycles} <span className="text-[11px] text-dim font-normal">EFC</span>
            </div>
          </div>
          <div className="rounded-lg border border-line-soft bg-panel-2/60 p-2.5 text-center">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-dim">Estimated RUL</div>
            <div className="mt-0.5 font-mono text-[15px] font-bold text-emerald-400 tabular-nums">
              {rulData.years} <span className="text-[11px] text-dim font-normal">({rulData.km})</span>
            </div>
          </div>
        </div>

        {/* SVG Degradation Curve (Unboxed & Full Width) */}
        <div className="pt-1">
          <div className="w-full overflow-visible">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full overflow-visible"
              style={{ height: '195px' }}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="sohGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* ── Y-axis grid lines (subtle) ── */}
              {yTicks.slice(1, -1).map((pct) => {
                if (pct === 80) return null // Handled distinctly by 80% warranty dashed line
                return (
                  <line
                    key={`grid-${pct}`}
                    x1={padXLeft}
                    y1={getY(pct)}
                    x2={svgWidth - padXRight}
                    y2={getY(pct)}
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="1"
                  />
                )
              })}

              {/* ── Y-axis percentage labels ── */}
              {yTicks.map((pct) => (
                <text
                  key={`ylabel-${pct}`}
                  x={padXLeft - 5}
                  y={getY(pct) + 3.5}
                  textAnchor="end"
                  fill={pct === 80 ? 'rgba(245,158,11,0.95)' : 'rgba(226,232,240,0.85)'}
                  fontWeight={pct === 80 ? 'bold' : '600'}
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {pct}%
                </text>
              ))}

              {/* ── Chart left border ── */}
              <line
                x1={padXLeft}
                y1={getY(100)}
                x2={padXLeft}
                y2={chartBottom - padY}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />

              {/* ── Chart bottom baseline ── */}
              <line
                x1={padXLeft}
                y1={chartBottom - padY}
                x2={svgWidth - padXRight}
                y2={chartBottom - padY}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />

              {/* ── 80% Warranty floor dashed line ── */}
              <line
                x1={padXLeft}
                y1={warrantyY}
                x2={svgWidth - padXRight}
                y2={warrantyY}
                stroke="rgba(245,158,11,0.45)"
                strokeDasharray="4 3"
                strokeWidth="1"
              />

              {/* ── Area fill ── */}
              <path d={areaD} fill="url(#sohGradient)" />

              {/* ── Curve Stroke ── */}
              <path
                d={lineD}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* ── X-axis dual labels (month above, odometer below) ── */}
              {curvePoints.map((_, idx) => {
                const cx = getX(idx)
                const isCurrent = idx === curvePoints.length - 1

                return (
                  <g key={`xaxis-${idx}`}>
                    {/* Tick mark */}
                    <line
                      x1={cx} y1={chartBottom - padY}
                      x2={cx} y2={chartBottom - padY + 4}
                      stroke="rgba(148,163,184,0.4)"
                      strokeWidth="1"
                    />
                    {/* Month label */}
                    <text
                      x={cx}
                      y={chartBottom - padY + 14}
                      textAnchor="middle"
                      fill={isCurrent ? '#34d399' : 'rgba(241,245,249,0.95)'}
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {months[idx]}
                    </text>
                    {/* Odometer label */}
                    <text
                      x={cx}
                      y={chartBottom - padY + 26}
                      textAnchor="middle"
                      fill={isCurrent ? 'rgba(52,211,153,0.85)' : 'rgba(148,163,184,0.85)'}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="500"
                    >
                      {odoLabels[idx]}
                    </text>
                  </g>
                )
              })}

              {/* ── Data circles + hover tooltips ── */}
              {curvePoints.map((pt, idx) => {
                const cx = getX(idx)
                const cy = getY(pt.val)
                const isLast    = idx === curvePoints.length - 1
                const isHovered = hoveredIdx === idx

                // Flip tooltip to left for last 2 points so it stays in-bounds
                const tipW  = 82
                const tipH  = 48
                const tipX  = idx >= 5 ? cx - tipW - 4 : cx + 6
                const isTopArea = cy < 55
                const tipY  = isTopArea ? cy + 10 : cy - tipH - 6

                return (
                  <g
                    key={idx}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    style={{ cursor: 'crosshair' }}
                  >
                    {/* Large transparent hit area */}
                    <circle cx={cx} cy={cy} r={14} fill="transparent" />

                    {/* Visible dot */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 6 : (isLast ? 4.5 : 3)}
                      fill={isHovered || isLast ? strokeColor : '#1e293b'}
                      stroke={strokeColor}
                      strokeWidth={isHovered ? 2.5 : (isLast ? 2 : 1.5)}
                      style={{ transition: 'r 0.12s ease' }}
                    />

                    {/* Animated pulse ring on current/last point */}
                    {isLast && !isHovered && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={7.5}
                        fill="none"
                        stroke={strokeColor}
                        strokeOpacity="0.4"
                        className="animate-ping"
                      />
                    )}

                    {/* Tooltip on hover */}
                    {isHovered && (
                      <g>
                        {/* Connector line */}
                        <line
                          x1={cx}
                          y1={isTopArea ? cy + 5 : cy - 5}
                          x2={idx >= 5 ? tipX + tipW : tipX}
                          y2={isTopArea ? tipY : tipY + tipH}
                          stroke={strokeColor}
                          strokeOpacity="0.35"
                          strokeWidth="1"
                          strokeDasharray="3 2"
                        />
                        {/* Background rect */}
                        <rect
                          x={tipX}
                          y={tipY}
                          width={tipW}
                          height={tipH}
                          rx={6}
                          ry={6}
                          fill="#0f172a"
                          stroke={strokeColor}
                          strokeWidth="1.2"
                          strokeOpacity="0.75"
                        />
                        {/* SoH % — primary value */}
                        <text
                          x={tipX + 8}
                          y={tipY + 15}
                          fill={strokeColor}
                          fontSize="11"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {pt.val.toFixed(1)}% SoH
                        </text>
                        {/* Odometer */}
                        <text
                          x={tipX + 8}
                          y={tipY + 29}
                          fill="rgba(241,245,249,0.95)"
                          fontSize="10"
                          fontWeight="600"
                          fontFamily="monospace"
                        >
                          {odoLabels[idx]} km
                        </text>
                        {/* Month */}
                        <text
                          x={tipX + 8}
                          y={tipY + 42}
                          fill="rgba(148,163,184,0.9)"
                          fontSize="9.5"
                          fontFamily="monospace"
                        >
                          {months[idx]}
                        </text>
                      </g>
                    )}
                  </g>
                )
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
