import { useRef } from 'react'
import { useFleet } from '../context/FleetContext'
import { ChevronRight, ChevronLeft, BatteryMedium, Zap, Navigation } from './icons'

export default function VehicleQuickRibbon() {
  const { vehicles, selectedVehicleId, setSelectedVehicleId, settings } = useFleet()
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  if (!vehicles || vehicles.length === 0) return null

  return (
    <div className="mb-4 space-y-2">
      {/* Top Header: Live Units title & counter */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-line-soft bg-panel-2 text-accent shadow-xs">
            <Zap className="h-3.5 w-3.5" strokeWidth={2.4} />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-bold tracking-tight text-hi">
              Live Units
            </span>
            <span className="rounded-full border border-line-soft bg-panel-2 px-2 py-0.5 font-mono text-xs text-dim tabular-nums">
              {vehicles.length} Connected
            </span>
          </div>
        </div>

        {/* Header summary text */}
        <div className="text-xs text-dim hidden sm:block">
          Select a vehicle to inspect live telemetry
        </div>
      </div>

      {/* Horizontal Scrollable Ribbon with Edge Scroll Buttons */}
      <div className="relative group">
        {/* Left Scroll Edge Button */}
        <button
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="absolute left-1 top-1/2 -translate-y-1/2 z-20 hidden group-hover:flex h-8 w-8 items-center justify-center rounded-full border border-line bg-panel/95 text-hi shadow-lg hover:bg-hover hover:border-accent/40 hover:text-accent transition-all cursor-pointer backdrop-blur"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.4} />
        </button>

        {/* Scrollable Cards Track */}
        <div
          ref={scrollRef}
          className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 px-0.5 scrollbar-none scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {vehicles.map((v) => {
            const isSelected = selectedVehicleId === v.id
            const isOnline = v.status === 'online'
            const isAlert = v.status === 'alert'
            const isIdle = v.status === 'idle'

            const battColor =
              v.battery <= 20
                ? 'text-red-400 bg-red-500/15 border-red-500/30'
                : v.battery <= 50
                ? 'text-amber-400 bg-amber-500/15 border-amber-500/30'
                : 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'

            const speedDisplay =
              settings?.speedUnit === 'mph'
                ? `${Math.round((v.speed || 0) * 0.621371)} mph`
                : `${v.speed || 0} km/h`

            return (
              <button
                key={v.id}
                onClick={() => setSelectedVehicleId(v.id)}
                className={`flex flex-col gap-2 shrink-0 min-w-[180px] rounded-xl border px-3.5 py-2.5 text-left transition-all duration-200 cursor-pointer shadow-xs ${
                  isSelected
                    ? 'border-accent bg-accent/15 shadow-[0_0_14px_rgba(0,255,102,0.15)] text-hi ring-1 ring-accent/40'
                    : 'border-line bg-panel hover:border-line-soft hover:bg-panel-2 text-lo hover:text-hi'
                }`}
              >
                {/* Row 1: Status dot, Name, Type tag */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative flex h-2 w-2 shrink-0">
                      {isOnline && (
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      )}
                      <span
                        className={`relative inline-flex h-2 w-2 rounded-full ${
                          isOnline
                            ? 'bg-emerald-400'
                            : isAlert
                            ? 'bg-rose-500'
                            : isIdle
                            ? 'bg-amber-400'
                            : 'bg-zinc-500'
                        }`}
                      />
                    </div>
                    <span className="font-display text-xs font-bold text-hi truncate max-w-[95px]">
                      {v.name}
                    </span>
                  </div>

                  <span className="rounded bg-panel-2 px-1.5 py-0.5 font-mono text-[10px] text-dim border border-line-soft shrink-0">
                    {v.type === '2 Wheeler' ? '2W' : v.type === '3 Wheeler' ? '3W' : '4W'}
                  </span>
                </div>

                {/* Row 2: License Plate & Battery SoC / Speed */}
                <div className="flex items-center justify-between gap-2 font-mono text-xs border-t border-line-soft/60 pt-1.5">
                  <span className="text-dim truncate max-w-[80px]">{v.plate}</span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {v.speed > 0 && (
                      <span className="text-accent text-[11px] font-semibold flex items-center gap-0.5">
                        <Navigation className="h-2.5 w-2.5" />
                        {speedDisplay}
                      </span>
                    )}
                    <div
                      className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-bold tabular-nums border ${battColor}`}
                    >
                      <BatteryMedium className="h-3 w-3" strokeWidth={2.4} />
                      <span>{v.battery}%</span>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Right Scroll Edge Button */}
        <button
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="absolute right-1 top-1/2 -translate-y-1/2 z-20 hidden group-hover:flex h-8 w-8 items-center justify-center rounded-full border border-line bg-panel/95 text-hi shadow-lg hover:bg-hover hover:border-accent/40 hover:text-accent transition-all cursor-pointer backdrop-blur"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
        </button>
      </div>
    </div>
  )
}
