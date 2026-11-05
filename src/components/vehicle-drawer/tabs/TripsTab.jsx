import { useState, useMemo, useRef } from 'react'
import {
  Search,
  Clock,
  ArrowRight,
  History,
  Download,
  Calendar,
  ChevronDown,
  ChevronUp,
  Zap,
  Gauge,
  MapPin,
  Play,
  Pause,
} from '../../icons'
import { seedTrips } from '../../../data/tripsData'

export default function TripsTab({
  vehicle,
  trips = [],
  activePlaybackTrip = null,
  onStartPlayback,
  onStopPlayback,
}) {
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('all') // 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom'
  const [customDate, setCustomDate] = useState('')
  const [expandedTripId, setExpandedTripId] = useState(null)
  const dateInputRef = useRef(null)

  // Guarantee trips dataset always has records
  const allTrips = useMemo(() => {
    return trips && trips.length > 0 ? trips : seedTrips
  }, [trips])

  // Filter trips by search query and date period
  const filteredTrips = useMemo(() => {
    return allTrips.filter((t) => {
      // 1. Period filter
      if (dateFilter === 'today' && t.dateCategory !== 'today') return false
      if (dateFilter === 'yesterday' && t.dateCategory !== 'yesterday') return false
      if (dateFilter === 'week' && !['today', 'yesterday', 'week'].includes(t.dateCategory)) return false
      if (dateFilter === 'month' && !['today', 'yesterday', 'week', 'month'].includes(t.dateCategory)) return false
      if (dateFilter === 'custom' && customDate && t.date !== customDate) return false

      // 2. Search query filter
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        t.tripNumber.toLowerCase().includes(q) ||
        (t.from && t.from.toLowerCase().includes(q)) ||
        (t.to && t.to.toLowerCase().includes(q)) ||
        (t.time && t.time.toLowerCase().includes(q))
      )
    })
  }, [allTrips, search, dateFilter, customDate])

  const totalDistanceKm = useMemo(() => {
    return filteredTrips
      .reduce((acc, t) => acc + (parseFloat(t.distance) || 0), 0)
      .toFixed(1)
  }, [filteredTrips])

  const handleExportCSV = () => {
    const csvData = [
      ['Trip', 'Date', 'Time', 'From', 'To', 'Distance', 'Duration', 'Battery Used', 'Energy kWh', 'Avg Speed', 'Status'],
      ...filteredTrips.map((t) => [
        t.tripNumber,
        t.date || '',
        t.time,
        t.from,
        t.to,
        t.distance,
        t.duration,
        t.batteryUsed || '',
        t.batteryUsedKwh || '',
        t.avgSpeed || '',
        t.status || 'Completed',
      ]),
    ]
      .map((row) => row.map((v) => `"${v}"`).join(','))
      .join('\n')

    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trips_${vehicle?.name || 'vehicle'}_history.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleTripDetails = (tripId) => {
    setExpandedTripId((prev) => (prev === tripId ? null : tripId))
  }

  return (
    <div className="flex flex-col h-full">
      {/* 1. Header Title & Stats Strip */}
      <div className="flex items-center justify-between border-b border-line-soft px-4 py-3 bg-panel-2/40">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent border border-accent/25">
            <History className="h-3.5 w-3.5" strokeWidth={2.2} />
          </div>
          <div>
            <div className="font-display text-[13px] font-bold text-hi leading-tight">
              Full Trip History
            </div>
            <div className="font-mono text-[10px] text-lo tabular-nums">
              {allTrips.length} logged trip{allTrips.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          title="Export trips to CSV"
          className="flex items-center gap-1.5 rounded-lg border border-line bg-panel px-2.5 py-1 text-[11px] font-medium text-lo hover:bg-hover hover:text-hi transition-colors cursor-pointer shadow-2xs"
        >
          <Download className="h-3 w-3" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* 2. Date Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-line-soft px-3 py-2 bg-panel-2/20 overflow-x-auto scrollbar-none shrink-0">
        {[
          { id: 'all', label: 'All Trips' },
          { id: 'today', label: 'Today' },
          { id: 'yesterday', label: 'Yesterday' },
          { id: 'week', label: 'Past 7d' },
          { id: 'month', label: 'Past 30d' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setDateFilter(tab.id)
              setCustomDate('')
            }}
            className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
              dateFilter === tab.id
                ? 'bg-accent/15 text-accent font-semibold shadow-xs'
                : 'text-lo hover:text-hi hover:bg-hover'
            }`}
          >
            {tab.label}
          </button>
        ))}

        {/* Calendar Custom Date Picker */}
        <div className="relative shrink-0">
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
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
              dateFilter === 'custom'
                ? 'bg-accent/15 text-accent font-semibold shadow-xs'
                : 'text-lo hover:text-hi hover:bg-hover'
            }`}
          >
            <Calendar className="h-3 w-3" strokeWidth={2} />
            <span>{customDate || 'Date'}</span>
          </button>
          <input
            ref={dateInputRef}
            type="date"
            value={customDate}
            onChange={(e) => {
              if (e.target.value) {
                setCustomDate(e.target.value)
                setDateFilter('custom')
              }
            }}
            className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
            tabIndex={-1}
          />
        </div>
      </div>

      {/* 3. Search & Metric Toolbar */}
      <div className="border-b border-line-soft px-3.5 py-2 bg-panel">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-dim" />
          <input
            type="text"
            placeholder="Search by trip # or route hub..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-line bg-panel-2 pl-8 pr-3 py-1.5 text-[11.5px] text-hi placeholder:text-dim outline-none focus:border-accent/60 transition-colors"
          />
        </div>
      </div>

      {/* 4. KPI Ribbon */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-line-soft/60 bg-panel-2/30 font-mono text-[10px]">
        <span className="text-dim">
          Showing <strong className="text-hi">{filteredTrips.length}</strong> trips
        </span>
        <span className="text-dim">
          Distance: <strong className="text-accent font-semibold">{totalDistanceKm} km</strong>
        </span>
      </div>

      {/* 5. Trip List */}
      <div className="p-3.5 space-y-2.5">
        {filteredTrips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <History className="h-8 w-8 text-dim mb-2 opacity-50" />
            <p className="text-[12.5px] font-medium text-hi">No matching trips found</p>
            <p className="text-[11px] text-dim mt-0.5">Try adjusting the filter period or search query.</p>
          </div>
        ) : (
          filteredTrips.map((t) => {
            const isExpanded = expandedTripId === t.id
            const isThisTripPlaying = Boolean(
              activePlaybackTrip &&
                (activePlaybackTrip.id === t.id || activePlaybackTrip.tripNumber === t.tripNumber)
            )

            return (
              <div
                key={t.id}
                className={`group rounded-xl border bg-panel transition-all duration-200 shadow-2xs overflow-hidden ${
                  isThisTripPlaying
                    ? 'border-accent ring-2 ring-accent/40 shadow-[0_4px_20px_rgba(0,255,102,0.15)]'
                    : isExpanded
                      ? 'border-accent ring-1 ring-accent/30'
                      : 'border-line-soft hover:border-line'
                }`}
              >
                {/* Clickable Header */}
                <div
                  onClick={() => toggleTripDetails(t.id)}
                  className="p-3 cursor-pointer hover:bg-panel-2/30 transition-colors select-none"
                >
                  {/* Top Row: Trip Number, Tag, Time, Play Icon Button & Chevron */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-display text-[12.5px] font-bold text-hi">{t.tripNumber}</span>
                      {t.isLastRide && (
                        <span className="rounded-full bg-accent/20 px-1.5 py-0.25 text-[8.5px] font-mono font-bold text-accent border border-accent/30 uppercase">
                          Latest
                        </span>
                      )}
                      <span className="text-[9.5px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.25 rounded border border-emerald-500/20">
                        {t.status || 'Completed'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-dim tabular-nums">{t.time}</span>

                      {/* Play Icon Button on each trip history card */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (isThisTripPlaying) {
                            onStopPlayback?.()
                          } else {
                            onStartPlayback?.(t)
                          }
                        }}
                        title={isThisTripPlaying ? 'Pause route playback on map' : 'Play route on map'}
                        aria-label="Route Playback on Map"
                        className={`flex h-6 w-6 items-center justify-center rounded-md border transition-all cursor-pointer ${
                          isThisTripPlaying
                            ? 'border-accent bg-accent text-black font-bold shadow-[0_0_10px_rgba(0,255,102,0.6)] animate-pulse'
                            : 'border-line-soft bg-panel-2 text-lo hover:border-accent/40 hover:bg-accent/15 hover:text-accent'
                        }`}
                      >
                        {isThisTripPlaying ? (
                          <Pause className="h-3 w-3 fill-current" />
                        ) : (
                          <Play className="h-3 w-3 fill-current ml-0.5" />
                        )}
                      </button>

                      <div className="flex h-4 w-4 items-center justify-center rounded text-dim group-hover:text-hi">
                        {isExpanded ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Route Origin -> Destination */}
                  <div className="flex items-center gap-1.5 mb-2 text-[11.5px]">
                    <span className="text-lo font-medium min-w-0 flex-1 truncate">{t.from}</span>
                    <ArrowRight className="h-2.5 w-2.5 text-accent shrink-0" strokeWidth={2} />
                    <span className="text-hi font-semibold min-w-0 flex-1 truncate">{t.to}</span>
                  </div>

                  {/* Quick Stats Summary */}
                  <div className="flex items-center justify-between font-mono text-[10.5px] text-dim border-t border-line-soft/40 pt-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-hi">{t.distance}</span>
                      <span className="text-line-soft">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" strokeWidth={1.8} />
                        {t.duration}
                      </span>
                    </div>
                    {t.batteryUsed && (
                      <span className="text-amber-400 font-medium">
                        {t.batteryUsed}
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Details ("when user clicks to view full history then see play option") */}
                {isExpanded && (
                  <div className="border-t border-line-soft bg-panel-2/40 p-3 space-y-2.5 text-[11px] animate-fadeIn">
                    {/* Dedicated Route Playback on Map Action Card */}
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-accent/35 bg-accent/10 p-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-black font-bold shadow-xs shrink-0">
                          {isThisTripPlaying ? (
                            <Pause className="h-4 w-4 fill-current" />
                          ) : (
                            <Play className="h-4 w-4 fill-current ml-0.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[12px] font-bold text-hi">Route Playback on Map</div>
                          <div className="text-[10px] text-lo font-mono truncate">
                            Simulate route, speed & telemetry across {t.distance}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (isThisTripPlaying) {
                            onStopPlayback?.()
                          } else {
                            onStartPlayback?.(t)
                          }
                        }}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0 ${
                          isThisTripPlaying
                            ? 'bg-amber-400 text-black hover:bg-amber-500'
                            : 'bg-accent text-black hover:bg-green'
                        }`}
                      >
                        {isThisTripPlaying ? (
                          <>
                            <Pause className="h-3 w-3 fill-current" />
                            <span>Stop Playback</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 fill-current ml-0.5" />
                            <span>Play on Map</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Key Telemetry Metrics (3-tile grid) */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="rounded-lg border border-line-soft bg-panel p-2">
                        <div className="text-[9px] uppercase font-mono text-dim mb-0.5 flex items-center gap-1">
                          <Gauge className="h-2.5 w-2.5 text-sky-400" />
                          <span>Speed</span>
                        </div>
                        <div className="font-mono text-hi tabular-nums text-[10.5px]">
                          {t.avgSpeed || '28 km/h'}
                        </div>
                      </div>

                      <div className="rounded-lg border border-line-soft bg-panel p-2">
                        <div className="text-[9px] uppercase font-mono text-dim mb-0.5 flex items-center gap-1">
                          <Zap className="h-2.5 w-2.5 text-emerald-400" />
                          <span>Battery</span>
                        </div>
                        <div className="font-mono text-hi tabular-nums text-[10.5px]">
                          <span className="text-emerald-400">{t.startBattery || 90}%</span>
                          <span className="text-dim mx-0.5">→</span>
                          <span className="text-amber-400">{t.endBattery || 72}%</span>
                        </div>
                      </div>

                      <div className="rounded-lg border border-line-soft bg-panel p-2">
                        <div className="text-[9px] uppercase font-mono text-dim mb-0.5 flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5 text-accent" />
                          <span>Duration</span>
                        </div>
                        <div className="font-mono text-hi tabular-nums text-[10.5px]">
                          {t.duration}
                        </div>
                      </div>
                    </div>

                    {/* Route Waypoints Detail */}
                    <div className="rounded-lg border border-line-soft bg-panel p-2.5 space-y-1">
                      <div className="text-[9px] uppercase font-mono text-dim flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5 text-accent" />
                        <span>Route Stops</span>
                      </div>
                      <div className="space-y-1 text-lo text-[10.5px]">
                        <div className="flex items-start gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                          <span className="text-hi font-medium">{t.from}</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                          <span className="text-accent font-medium">{t.to}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
