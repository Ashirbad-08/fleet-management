import { useState, useMemo } from 'react'
import { BarChart3, Clock, Zap } from './icons'

export default function FleetHourlyTripsCard() {
  const [timeFilter, setTimeFilter] = useState('today') // 'today' | 'yesterday' | 'week'
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null)

  // Hourly trips profiles
  const barChartData = useMemo(() => {
    const profiles = {
      today: [
        { time: '06:00', trips: 14, efficiency: '0.29 kWh/km', peak: false },
        { time: '08:00', trips: 28, efficiency: '0.28 kWh/km', peak: false },
        { time: '10:00', trips: 36, efficiency: '0.31 kWh/km', peak: false },
        { time: '12:00', trips: 32, efficiency: '0.30 kWh/km', peak: false },
        { time: '14:00', trips: 42, efficiency: '0.27 kWh/km', peak: true },
        { time: '16:00', trips: 39, efficiency: '0.28 kWh/km', peak: false },
        { time: '18:00', trips: 35, efficiency: '0.32 kWh/km', peak: false },
        { time: '20:00', trips: 26, efficiency: '0.30 kWh/km', peak: false },
        { time: '22:00', trips: 18, efficiency: '0.26 kWh/km', peak: false },
      ],
      yesterday: [
        { time: '06:00', trips: 12, efficiency: '0.30 kWh/km', peak: false },
        { time: '08:00', trips: 25, efficiency: '0.29 kWh/km', peak: false },
        { time: '10:00', trips: 38, efficiency: '0.30 kWh/km', peak: false },
        { time: '12:00', trips: 34, efficiency: '0.28 kWh/km', peak: false },
        { time: '14:00', trips: 40, efficiency: '0.28 kWh/km', peak: true },
        { time: '16:00', trips: 37, efficiency: '0.29 kWh/km', peak: false },
        { time: '18:00', trips: 31, efficiency: '0.31 kWh/km', peak: false },
        { time: '20:00', trips: 24, efficiency: '0.27 kWh/km', peak: false },
        { time: '22:00', trips: 15, efficiency: '0.25 kWh/km', peak: false },
      ],
      week: [
        { time: 'Mon', trips: 245, efficiency: '0.29 kWh/km', peak: false },
        { time: 'Tue', trips: 268, efficiency: '0.28 kWh/km', peak: false },
        { time: 'Wed', trips: 284, efficiency: '0.27 kWh/km', peak: true },
        { time: 'Thu', trips: 272, efficiency: '0.30 kWh/km', peak: false },
        { time: 'Fri', trips: 290, efficiency: '0.28 kWh/km', peak: false },
        { time: 'Sat', trips: 195, efficiency: '0.26 kWh/km', peak: false },
        { time: 'Sun', trips: 142, efficiency: '0.25 kWh/km', peak: false },
      ],
    }

    const currentList = profiles[timeFilter] || profiles.today
    const maxVal = Math.max(...currentList.map((d) => d.trips))
    const totalTrips = currentList.reduce((acc, d) => acc + d.trips, 0)
    const peakItem = currentList.find((d) => d.peak) || currentList[4]

    return { list: currentList, maxVal, totalTrips, peakItem }
  }, [timeFilter])

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-line bg-panel shadow-xs">
      {/* ── 1. Header Bar ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line-soft bg-panel/60 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-accent/30 bg-accent/15 text-accent shadow-2xs">
            <BarChart3 className="h-3.5 w-3.5" strokeWidth={2.2} />
          </div>
          <span className="font-display text-sm font-bold text-hi">
            Hourly Trips Completed
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Filter Pills */}
          <div className="inline-flex items-center gap-1 rounded-lg border border-line bg-panel-2 p-0.5 text-[11px] font-medium shadow-2xs">
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'week', label: '7 Days' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTimeFilter(tab.id)}
                className={`rounded-md px-2.5 py-0.75 transition-all cursor-pointer ${
                  timeFilter === tab.id
                    ? 'bg-accent/15 text-accent font-semibold shadow-xs'
                    : 'text-lo hover:text-hi hover:bg-hover'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="inline-flex items-center gap-1 rounded-md border border-accent/25 bg-accent/10 px-2 py-0.5 font-mono text-[10px] font-medium text-accent">
            ⚡ Peak: {barChartData.peakItem?.trips} Trips ({barChartData.peakItem?.time})
          </span>
        </div>
      </div>

      {/* ── 2. Bar Chart Canvas ──────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div className="my-auto pt-2">
          <div className="relative">
            {/* Floating Tooltip */}
            {hoveredBarIndex !== null && (
              <div
                className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 rounded-md border border-line bg-panel-2 px-2.5 py-1 text-center shadow-lg pointer-events-none animate-fadeIn"
              >
                <div className="font-mono text-[11px] font-bold text-hi">
                  {barChartData.list[hoveredBarIndex].trips} Trips Completed
                </div>
                <div className="text-[9.5px] font-mono text-accent">
                  {barChartData.list[hoveredBarIndex].time} • {barChartData.list[hoveredBarIndex].efficiency}
                </div>
              </div>
            )}

            {/* Grid Bar Columns */}
            <div className="grid grid-cols-9 gap-2 sm:gap-3 h-36 items-end pb-1 relative z-10 border-b border-line-soft">
              {barChartData.list.map((item, idx) => {
                const heightPct = Math.round((item.trips / barChartData.maxVal) * 100)
                const isHovered = hoveredBarIndex === idx
                const isPeak = item.peak

                return (
                  <div
                    key={item.time}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    className="group relative flex h-full flex-col justify-end items-center cursor-pointer"
                  >
                    {/* Bar Fill */}
                    <div
                      style={{ height: `${Math.max(8, heightPct)}%` }}
                      className={`w-full rounded-t-md transition-all duration-200 ${
                        isHovered
                          ? 'bg-gradient-to-t from-accent to-emerald-400 shadow-md shadow-accent/20'
                          : isPeak
                            ? 'bg-gradient-to-t from-accent/90 to-accent'
                            : 'bg-gradient-to-t from-panel-2 to-accent/60 hover:from-accent/70 hover:to-accent'
                      }`}
                    />
                  </div>
                )
              })}
            </div>

            {/* Time X-Axis */}
            <div className="mt-2.5 grid grid-cols-9 gap-2 sm:gap-3 text-center text-[10.5px] font-mono text-dim">
              {barChartData.list.map((item, idx) => (
                <span
                  key={item.time}
                  className={hoveredBarIndex === idx ? 'font-bold text-accent' : ''}
                >
                  {item.time}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. Footer Summary Strip ────────────────────────────────────────── */}
        <div className="mt-4 flex items-center justify-between border-t border-line-soft/50 pt-2.5 font-mono text-[11px]">
          <span className="text-dim">
            Total Completed: <strong className="text-hi">{barChartData.totalTrips} Trips</strong>
          </span>
          <span className="text-dim">
            Avg Rate: <strong className="text-accent">{(barChartData.totalTrips / barChartData.list.length).toFixed(1)} trips/hr</strong>
          </span>
        </div>
      </div>
    </div>
  )
}
