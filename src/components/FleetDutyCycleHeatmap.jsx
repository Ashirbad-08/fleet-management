import { useState, useMemo, useRef } from 'react'
import { useFleet } from '../context/FleetContext'
import { Clock, Calendar } from './icons'

export default function FleetDutyCycleHeatmap() {
  const { vehicles } = useFleet()
  const [hoveredHour, setHoveredHour] = useState(null)
  const [timeFilter, setTimeFilter] = useState('today') // 'today' | 'yesterday' | 'calendar'
  const [customDate, setCustomDate] = useState('')
  const dateInputRef = useRef(null)

  const currentHour = new Date().getHours()

  // Generate dynamic 24-hour duty cycle telemetry based on active fleet size and filter
  const { hourlyData, avgUptimePct, peakWindow, offPeakWindow, periodLabel } = useMemo(() => {
    const total = vehicles.length || 40

    // Variations by filter
    const dutyProfileToday = [
      { h: 0, active: 0.08, charge: 0.74, idle: 0.18 },
      { h: 1, active: 0.05, charge: 0.78, idle: 0.17 },
      { h: 2, active: 0.05, charge: 0.82, idle: 0.13 },
      { h: 3, active: 0.06, charge: 0.80, idle: 0.14 },
      { h: 4, active: 0.12, charge: 0.72, idle: 0.16 },
      { h: 5, active: 0.28, charge: 0.52, idle: 0.20 },
      { h: 6, active: 0.58, charge: 0.24, idle: 0.18 },
      { h: 7, active: 0.78, charge: 0.10, idle: 0.12 },
      { h: 8, active: 0.86, charge: 0.04, idle: 0.10 },
      { h: 9, active: 0.92, charge: 0.02, idle: 0.06 },
      { h: 10, active: 0.90, charge: 0.03, idle: 0.07 },
      { h: 11, active: 0.88, charge: 0.04, idle: 0.08 },
      { h: 12, active: 0.74, charge: 0.16, idle: 0.10 },
      { h: 13, active: 0.70, charge: 0.18, idle: 0.12 },
      { h: 14, active: 0.84, charge: 0.08, idle: 0.08 },
      { h: 15, active: 0.89, charge: 0.03, idle: 0.08 },
      { h: 16, active: 0.91, charge: 0.02, idle: 0.07 },
      { h: 17, active: 0.94, charge: 0.02, idle: 0.04 },
      { h: 18, active: 0.88, charge: 0.04, idle: 0.08 },
      { h: 19, active: 0.76, charge: 0.12, idle: 0.12 },
      { h: 20, active: 0.55, charge: 0.30, idle: 0.15 },
      { h: 21, active: 0.38, charge: 0.46, idle: 0.16 },
      { h: 22, active: 0.22, charge: 0.62, idle: 0.16 },
      { h: 23, active: 0.14, charge: 0.70, idle: 0.16 },
    ]

    const dutyProfileYesterday = [
      { h: 0, active: 0.10, charge: 0.72, idle: 0.18 },
      { h: 1, active: 0.06, charge: 0.76, idle: 0.18 },
      { h: 2, active: 0.04, charge: 0.80, idle: 0.16 },
      { h: 3, active: 0.05, charge: 0.82, idle: 0.13 },
      { h: 4, active: 0.10, charge: 0.75, idle: 0.15 },
      { h: 5, active: 0.25, charge: 0.55, idle: 0.20 },
      { h: 6, active: 0.60, charge: 0.22, idle: 0.18 },
      { h: 7, active: 0.82, charge: 0.08, idle: 0.10 },
      { h: 8, active: 0.88, charge: 0.03, idle: 0.09 },
      { h: 9, active: 0.94, charge: 0.01, idle: 0.05 },
      { h: 10, active: 0.92, charge: 0.02, idle: 0.06 },
      { h: 11, active: 0.86, charge: 0.05, idle: 0.09 },
      { h: 12, active: 0.78, charge: 0.12, idle: 0.10 },
      { h: 13, active: 0.72, charge: 0.16, idle: 0.12 },
      { h: 14, active: 0.86, charge: 0.06, idle: 0.08 },
      { h: 15, active: 0.90, charge: 0.02, idle: 0.08 },
      { h: 16, active: 0.93, charge: 0.02, idle: 0.05 },
      { h: 17, active: 0.95, charge: 0.01, idle: 0.04 },
      { h: 18, active: 0.85, charge: 0.06, idle: 0.09 },
      { h: 19, active: 0.72, charge: 0.15, idle: 0.13 },
      { h: 20, active: 0.50, charge: 0.35, idle: 0.15 },
      { h: 21, active: 0.32, charge: 0.50, idle: 0.18 },
      { h: 22, active: 0.20, charge: 0.64, idle: 0.16 },
      { h: 23, active: 0.12, charge: 0.72, idle: 0.16 },
    ]

    const dutyProfile = timeFilter === 'yesterday' ? dutyProfileYesterday : dutyProfileToday

    let totalActiveSum = 0

    const isLive = timeFilter === 'today'

    const hourly = dutyProfile.map((p) => {
      const activeCount = Math.round(total * p.active)
      const chargeCount = Math.round(total * p.charge)
      const idleCount = Math.max(0, total - activeCount - chargeCount)

      const activePct = Math.round((activeCount / total) * 100)
      const chargePct = Math.round((chargeCount / total) * 100)
      const idlePct = Math.max(0, 100 - activePct - chargePct)

      totalActiveSum += activePct

      const label = `${p.h.toString().padStart(2, '0')}:00`
      return {
        hour: p.h,
        label,
        activeCount,
        chargeCount,
        idleCount,
        activePct,
        chargePct,
        idlePct,
        isCurrent: isLive && p.h === currentHour,
      }
    })

    const avgUptime = (totalActiveSum / 24).toFixed(1)
    const labelPeriod =
      timeFilter === 'today'
        ? 'Today'
        : timeFilter === 'yesterday'
          ? 'Yesterday'
          : customDate
            ? new Date(customDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'Custom Date'

    return {
      hourlyData: hourly,
      avgUptimePct: `${avgUptime}%`,
      peakWindow: '08:00 – 18:00',
      offPeakWindow: '22:00 – 05:00',
      periodLabel: labelPeriod,
    }
  }, [vehicles, currentHour, timeFilter, customDate])

  const selectedData = hoveredHour !== null ? hourlyData[hoveredHour] : hourlyData[currentHour]

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-line bg-panel shadow-xs">
      {/* 1. Header Bar (Line 1) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line-soft bg-panel/50 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-accent" strokeWidth={2.2} />
          <span className="font-display text-xs font-bold text-hi sm:text-sm">
            24h Fleet Duty Cycle & Utilization
          </span>
          <span className="hidden sm:inline text-[11px] text-dim">
            · Avg Uptime: <strong className="text-emerald-400 font-semibold">{avgUptimePct}</strong> · Peak: <span className="text-hi font-medium">{peakWindow}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 font-mono text-[10.5px] font-medium text-accent">
            {timeFilter === 'today' && (
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            )}
            <span>{timeFilter === 'today' ? `Live (${currentHour.toString().padStart(2, '0')}:00)` : periodLabel}</span>
          </span>
        </div>
      </div>

      {/* 2. Filter & Telemetry Readout Strip (Next Line) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-line-soft bg-panel-2/30 px-4 py-2 sm:px-5">
        {/* Date Filter Pills */}
        <div className="inline-flex items-center gap-1 rounded-lg border border-line bg-panel p-0.5 text-[11px] font-medium shadow-2xs">
          <button
            type="button"
            onClick={() => setTimeFilter('today')}
            className={`rounded-md px-3 py-1 transition-all cursor-pointer ${
              timeFilter === 'today'
                ? 'bg-accent/15 text-accent font-semibold shadow-xs'
                : 'text-lo hover:text-hi hover:bg-hover'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter('yesterday')}
            className={`rounded-md px-3 py-1 transition-all cursor-pointer ${
              timeFilter === 'yesterday'
                ? 'bg-accent/15 text-accent font-semibold shadow-xs'
                : 'text-lo hover:text-hi hover:bg-hover'
            }`}
          >
            Yesterday
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (dateInputRef.current) {
                  if (typeof dateInputRef.current.showPicker === 'function') {
                    dateInputRef.current.showPicker()
                  } else {
                    dateInputRef.current.focus()
                    dateInputRef.current.click()
                  }
                }
              }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 transition-all cursor-pointer ${
                timeFilter === 'calendar'
                  ? 'bg-accent/15 text-accent font-semibold shadow-xs'
                  : 'text-lo hover:text-hi hover:bg-hover'
              }`}
            >
              <Calendar className="h-3 w-3" strokeWidth={2} />
              <span>{customDate ? periodLabel : 'Calendar'}</span>
            </button>
            <input
              ref={dateInputRef}
              type="date"
              value={customDate}
              onChange={(e) => {
                if (e.target.value) {
                  setCustomDate(e.target.value)
                  setTimeFilter('calendar')
                }
              }}
              className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
              tabIndex={-1}
            />
          </div>
        </div>

        {/* Live / Selected Readout */}
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="text-dim">
            {hoveredHour !== null ? (
              <span className="text-hi font-semibold">{selectedData.label}</span>
            ) : (
              <span className="text-accent font-medium">{selectedData.label} Status</span>
            )}
            :
          </span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="h-2 w-2 rounded-xs bg-emerald-500" />
            {selectedData.activePct}% ({selectedData.activeCount} Active)
          </span>
          <span className="flex items-center gap-1 text-sky-400 font-medium">
            <span className="h-2 w-2 rounded-xs bg-sky-500" />
            {selectedData.chargePct}% ({selectedData.chargeCount} Charging)
          </span>
          <span className="flex items-center gap-1 text-dim">
            <span className="h-2 w-2 rounded-xs bg-zinc-600" />
            {selectedData.idlePct}% ({selectedData.idleCount} Idle)
          </span>
        </div>
      </div>

      {/* 3. Main Chart Canvas */}
      <div className="px-4 py-4 sm:px-5 sm:py-5 bg-panel-2/10">
        <div className="relative">
          {/* Subtle Background Guide Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
            <div className="border-b border-dashed border-line w-full" />
            <div className="border-b border-dashed border-line w-full" />
            <div className="border-b border-dashed border-line w-full" />
            <div className="border-b border-dashed border-line w-full" />
          </div>

          {/* 24 Stacked Bars */}
          <div className="grid grid-cols-[repeat(24,minmax(0,1fr))] gap-1.5 h-36 sm:h-44 items-end relative z-10 pt-2 pb-1">
            {hourlyData.map((d) => {
              const isHovered = hoveredHour === d.hour
              return (
                <div
                  key={d.hour}
                  onMouseEnter={() => setHoveredHour(d.hour)}
                  onMouseLeave={() => setHoveredHour(null)}
                  className={`group relative flex h-full flex-col justify-end rounded-[3px] overflow-hidden cursor-pointer transition-all duration-150 ${
                    d.isCurrent
                      ? 'ring-2 ring-accent ring-offset-1 ring-offset-panel'
                      : isHovered
                        ? 'scale-105 opacity-100 shadow-md'
                        : 'opacity-85 hover:opacity-100'
                  }`}
                  title={`${d.label} — Active: ${d.activePct}%, Charging: ${d.chargePct}%, Idle: ${d.idlePct}%`}
                >
                  {/* Current Hour Indicator Dot */}
                  {d.isCurrent && (
                    <div className="absolute top-1 inset-x-0 flex justify-center z-20">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
                    </div>
                  )}

                  {/* Idle Stack (top) */}
                  <div
                    style={{ height: `${d.idlePct}%` }}
                    className="w-full bg-zinc-700/60 transition-colors group-hover:bg-zinc-600"
                  />
                  {/* Charging Stack (middle) */}
                  <div
                    style={{ height: `${d.chargePct}%` }}
                    className="w-full bg-sky-500/80 transition-colors group-hover:bg-sky-400"
                  />
                  {/* Active Stack (bottom) */}
                  <div
                    style={{ height: `${d.activePct}%` }}
                    className="w-full bg-emerald-500 transition-colors group-hover:bg-emerald-400"
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Timeline Axis Labels */}
        <div className="mt-2.5 flex justify-between text-[10px] sm:text-[10.5px] font-mono text-dim px-1">
          <span>00:00</span>
          <span>03:00</span>
          <span>06:00</span>
          <span>09:00</span>
          <span className="text-accent font-semibold">12:00</span>
          <span>15:00</span>
          <span>18:00</span>
          <span>21:00</span>
          <span>23:00</span>
        </div>
      </div>
    </div>
  )
}
