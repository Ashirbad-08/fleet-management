import { useState, useMemo, useRef } from 'react'
import {
  X,
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
} from './icons'
import { seedTrips } from '../data/tripsData'

export default function TripHistoryPanel({ open, onClose, vehicle, trips }) {
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('all') // 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom'
  const [customDate, setCustomDate] = useState('')
  const [expandedTripId, setExpandedTripId] = useState(null)
  const dateInputRef = useRef(null)

  // Guarantee trips dataset always has records
  const allTrips = useMemo(() => {
    return trips && trips.length > 0 ? trips : seedTrips
  }, [trips])

  // Filter trips by search keyword and date period
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
    <>
      {/* Backdrop — closes only this panel, not the whole drawer */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-[129] bg-black/40 backdrop-blur-[1px] transition-opacity duration-300 xl:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Slide-out Trip History: Full overlay on mobile/tablet, side-by-side on large desktop */}
      <div
        role="dialog"
        aria-label="Full Trip History Panel"
        className={`fixed right-0 top-0 z-[130] h-dvh w-full sm:max-w-[480px] xl:max-w-none xl:w-[480px] xl:right-[462px] xl:z-[125] flex flex-col border-l xl:border-r border-line bg-panel shadow-2xl transition-all duration-300 ease-in-out ${
          open ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-full xl:translate-x-[calc(100%+480px)] opacity-0 pointer-events-none'
        }`}
      >
        {/* 1. Header */}
        <div className="flex items-center justify-between border-b border-line-soft px-5 py-3.5 bg-panel-2/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/30">
              <History className="h-4 w-4" strokeWidth={2.2} />
            </div>
            <div>
              <div className="font-display text-[14px] font-bold text-hi leading-tight">
                Full Trip History
              </div>
              <div className="font-mono text-[10.5px] text-lo tabular-nums">
                {vehicle?.name || 'Vehicle'} • {allTrips.length} Total Trips
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close trip history"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-panel-2 text-lo hover:bg-hover hover:text-hi transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>

        {/* 2. Date Filter Tabs */}
        <div className="flex items-center gap-1 border-b border-line-soft px-3 py-2 bg-panel-2/30 overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: 'all', label: 'All Trips' },
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'week', label: 'Past 7 Days' },
            { id: 'month', label: 'Past 30 Days' },
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

        {/* 3. Search & Export Toolbar */}
        <div className="flex items-center gap-2 border-b border-line-soft px-4 py-2.5 bg-panel shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-dim" />
            <input
              type="text"
              placeholder="Search by trip # or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-line bg-panel-2 pl-8 pr-3 py-1.5 text-[11.5px] text-hi placeholder:text-dim outline-none focus:border-accent/60 transition-colors"
            />
          </div>
          <button
            onClick={handleExportCSV}
            title="Export CSV"
            className="flex items-center gap-1.5 rounded-lg border border-line bg-panel-2 px-2.5 py-1.5 text-[11px] font-medium text-lo hover:bg-hover hover:text-hi transition-colors cursor-pointer shrink-0"
          >
            <Download className="h-3 w-3" />
            <span>CSV</span>
          </button>
        </div>

        {/* 4. Telemetry Summary KPI Strip */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-line-soft/50 bg-panel-2/20 shrink-0 font-mono text-[10.5px]">
          <span className="text-dim">
            Showing: <strong className="text-hi">{filteredTrips.length}</strong> trips
          </span>
          <span className="text-dim">
            Total Dist: <strong className="text-accent font-semibold">{totalDistanceKm} km</strong>
          </span>
        </div>

        {/* 5. Trip Cards List with Expandable Details */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
          {filteredTrips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <History className="h-9 w-9 text-dim mb-3 opacity-60" />
              <p className="text-[13px] font-medium text-hi">No matching trips found</p>
              <p className="text-[11.5px] text-dim mt-1">Try selecting a different date range or search keyword.</p>
            </div>
          ) : (
            filteredTrips.map((t) => {
              const isExpanded = expandedTripId === t.id
              return (
                <div
                  key={t.id}
                  className={`group rounded-xl border bg-panel transition-all duration-200 shadow-xs overflow-hidden ${
                    isExpanded ? 'border-accent ring-1 ring-accent/30 bg-panel' : 'border-line-soft hover:border-line'
                  }`}
                >
                  {/* Clickable Header */}
                  <div
                    onClick={() => toggleTripDetails(t.id)}
                    className="p-3.5 cursor-pointer hover:bg-panel-2/40 transition-colors select-none"
                  >
                    {/* Top Row: Trip Number, Tag, Time */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-[13.5px] font-bold text-hi">{t.tripNumber}</span>
                        {t.isLastRide && (
                          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[9px] font-mono font-bold text-accent border border-accent/30 uppercase tracking-wide">
                            Latest
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          {t.status || 'Completed'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10.5px] text-dim tabular-nums">{t.time}</span>
                        <div className="flex h-5 w-5 items-center justify-center rounded text-dim group-hover:text-hi">
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="flex items-center gap-1.5 mb-2.5 text-[12px]">
                      <span className="text-lo font-medium min-w-0 flex-1 truncate">{t.from}</span>
                      <ArrowRight className="h-3 w-3 text-accent shrink-0" strokeWidth={2} />
                      <span className="text-hi font-semibold min-w-0 flex-1 truncate">{t.to}</span>
                    </div>

                    {/* Quick Stats Summary */}
                    <div className="flex items-center justify-between font-mono text-[11px] text-dim border-t border-line-soft/40 pt-2">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-hi">{t.distance}</span>
                        <span className="text-line-soft">·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" strokeWidth={1.8} />
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

                  {/* Expandable Full Trip Details Section (Driver Removed) */}
                  {isExpanded && (
                    <div className="border-t border-line-soft bg-panel-2/40 p-3.5 space-y-2.5 text-[11.5px] animate-fadeIn">
                      {/* Key Telemetry Metrics (3-tile grid) */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-lg border border-line-soft bg-panel p-2.5">
                          <div className="text-[9.5px] uppercase font-mono text-dim mb-1 flex items-center gap-1">
                            <Gauge className="h-2.5 w-2.5 text-sky-400" />
                            <span>Speed Profile</span>
                          </div>
                          <div className="font-mono text-hi tabular-nums text-[11px]">
                            {t.avgSpeed || '28 km/h'} <span className="text-dim text-[10px]">/ max {t.maxSpeed || '48 km/h'}</span>
                          </div>
                        </div>

                        <div className="rounded-lg border border-line-soft bg-panel p-2.5">
                          <div className="text-[9.5px] uppercase font-mono text-dim mb-1 flex items-center gap-1">
                            <Zap className="h-2.5 w-2.5 text-emerald-400" />
                            <span>Battery Delta</span>
                          </div>
                          <div className="font-mono text-hi tabular-nums text-[11px]">
                            <span className="text-emerald-400">{t.startBattery || 90}%</span>
                            <span className="text-dim mx-0.5">→</span>
                            <span className="text-amber-400">{t.endBattery || 72}%</span>
                            <span className="text-dim text-[9.5px] block mt-0.5">({t.batteryUsedKwh || '3.8 kWh'})</span>
                          </div>
                        </div>

                        <div className="rounded-lg border border-line-soft bg-panel p-2.5">
                          <div className="text-[9.5px] uppercase font-mono text-dim mb-1 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5 text-accent" />
                            <span>Drive Time</span>
                          </div>
                          <div className="font-mono text-hi tabular-nums text-[11px]">
                            {t.duration} <span className="text-dim text-[9.5px] block mt-0.5">({t.idleTime || '4 min'} idle)</span>
                          </div>
                        </div>
                      </div>

                      {/* Route Waypoints Detail */}
                      <div className="rounded-lg border border-line-soft bg-panel p-2.5 space-y-1.5">
                        <div className="text-[9.5px] uppercase font-mono text-dim flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5 text-accent" />
                          <span>Origin & Destination Hubs</span>
                        </div>
                        <div className="space-y-1 text-lo">
                          <div className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                            <span className="text-hi font-medium">{t.from}</span>
                          </div>
                          <div className="flex items-start gap-2">
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

        {/* 6. Footer */}
        <div className="flex items-center justify-between border-t border-line-soft px-4 py-2.5 bg-panel-2/40 shrink-0">
          <span className="font-mono text-[10.5px] text-dim">
            {filteredTrips.length} of {allTrips.length} trips displayed
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-panel-2 border border-line px-3.5 py-1.5 text-[11.5px] font-medium text-hi hover:bg-hover transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </>
  )
}
