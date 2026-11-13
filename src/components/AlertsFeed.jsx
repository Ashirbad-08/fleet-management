import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  TriangleAlert,
  AlertCircle,
  Info,
  Search,
  ChevronRight,
  BatteryMedium,
  ShieldAlert,
  Thermometer,
  Cpu,
  WifiOff,
  MapPin,
  Gauge,
  Calendar,
  X,
} from './icons'
import { useFleet } from '../context/FleetContext'
import { SEV_META } from '../data/statusMeta'

function formatDisplayDate(dateStr) {
  if (!dateStr) return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  }
  return dateStr
}

function getAlertIcon(alert) {
  if (alert.icon) {
    const IconComp = alert.icon
    return <IconComp className="h-3 w-3" strokeWidth={2.2} />
  }
  const msg = (alert.msg || '').toLowerCase()
  if (msg.includes('battery') || msg.includes('charge') || msg.includes('power')) {
    return <BatteryMedium className="h-3 w-3" strokeWidth={2.2} />
  }
  if (msg.includes('ignition') || msg.includes('unauthorized') || msg.includes('security') || msg.includes('tamper')) {
    return <ShieldAlert className="h-3 w-3" strokeWidth={2.2} />
  }
  if (msg.includes('temp') || msg.includes('temperature') || msg.includes('cargo') || msg.includes('reefer')) {
    return <Thermometer className="h-3 w-3" strokeWidth={2.2} />
  }
  if (msg.includes('firmware') || msg.includes('update') || msg.includes('installed')) {
    return <Cpu className="h-3 w-3" strokeWidth={2.2} />
  }
  if (msg.includes('gps') || msg.includes('offline') || msg.includes('signal') || msg.includes('heartbeat') || msg.includes('connection')) {
    return <WifiOff className="h-3 w-3" strokeWidth={2.2} />
  }
  if (msg.includes('geofence') || msg.includes('entered') || msg.includes('exited') || msg.includes('hub') || msg.includes('zone')) {
    return <MapPin className="h-3 w-3" strokeWidth={2.2} />
  }
  if (msg.includes('braking') || msg.includes('speed') || msg.includes('harsh') || msg.includes('acceleration') || msg.includes('overspeed')) {
    return <Gauge className="h-3 w-3" strokeWidth={2.2} />
  }
  if (alert.sev === 'critical') {
    return <AlertCircle className="h-3 w-3" strokeWidth={2.2} />
  }
  if (alert.sev === 'warning') {
    return <TriangleAlert className="h-3 w-3" strokeWidth={2.2} />
  }
  return <Info className="h-3 w-3" strokeWidth={2.2} />
}

export default function AlertsFeed({
  limit,
  showSearchFilter = true,
  showTimeFilter = true,
  showSeeAll = false,
}) {
  const { alerts, vehicles, setSelectedVehicleId } = useFleet()
  const [search, setSearch] = useState('')
  const [sevFilter, setSevFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('today') // Defaults to 'today'
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [dateRangeError, setDateRangeError] = useState('')
  const [isRangePickerOpen, setIsRangePickerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const rangePickerRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 180)
    return () => clearTimeout(timer)
  }, [])

  // Auto-close calendar popover on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (rangePickerRef.current && !rangePickerRef.current.contains(event.target)) {
        setIsRangePickerOpen(false)
      }
    }
    if (isRangePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isRangePickerOpen])

  const handleStartDateChange = (val) => {
    setStartDate(val)
    setDateRangeError('')
    if (val && endDate) {
      if (val > endDate) {
        setEndDate(val)
        return
      }
      const diffMs = new Date(endDate) - new Date(val)
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
      if (diffDays > 30) {
        setDateRangeError('Range capped at maximum 30 days.')
        const maxEnd = new Date(val)
        maxEnd.setDate(maxEnd.getDate() + 30)
        setEndDate(maxEnd.toISOString().split('T')[0])
      }
    }
  }

  const handleEndDateChange = (val) => {
    setDateRangeError('')
    if (startDate && val) {
      if (val < startDate) {
        setDateRangeError('End date cannot be earlier than start date.')
        return
      }
      const diffMs = new Date(val) - new Date(startDate)
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
      if (diffDays > 30) {
        setDateRangeError('Range capped at maximum 30 days.')
        const maxEnd = new Date(startDate)
        maxEnd.setDate(maxEnd.getDate() + 30)
        setEndDate(maxEnd.toISOString().split('T')[0])
        return
      }
    }
    setEndDate(val)
  }

  const clearRange = () => {
    setStartDate('')
    setEndDate('')
    setDateRangeError('')
    setTimeFilter('all')
    setIsRangePickerOpen(false)
  }

  const handleAlertClick = (alertItem) => {
    if (!alertItem.vehicle) return
    const matched = vehicles.find(
      (v) =>
        (v.name && v.name.toLowerCase() === alertItem.vehicle.toLowerCase()) ||
        (v.plate && v.plate.toLowerCase() === alertItem.vehicle.toLowerCase()) ||
        (v.id && v.id.toLowerCase() === alertItem.vehicle.toLowerCase())
    )
    if (matched) {
      setSelectedVehicleId(matched.id)
    } else if (vehicles.length > 0) {
      setSelectedVehicleId(vehicles[0].id)
    }
  }

  const filtered = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    const now = Date.now()
    const ms7Days = 7 * 24 * 60 * 60 * 1000
    const ms30Days = 30 * 24 * 60 * 60 * 1000

    return alerts.filter((a) => {
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q || a.vehicle.toLowerCase().includes(q) || a.msg.toLowerCase().includes(q)
      const matchesSev = sevFilter === 'all' || (a.sev && a.sev.toLowerCase() === sevFilter.toLowerCase())

      // Time range filtering
      let matchesTime = true
      const alertTimestamp = a.timestamp || (a.date ? new Date(a.date).getTime() : now)
      const alertDate = a.date || todayStr

      if (timeFilter === 'today') {
        matchesTime = alertDate === todayStr || (now - alertTimestamp) <= 24 * 60 * 60 * 1000
      } else if (timeFilter === '7days') {
        matchesTime = (now - alertTimestamp) <= ms7Days
      } else if (timeFilter === '30days') {
        matchesTime = (now - alertTimestamp) <= ms30Days
      } else if (timeFilter === 'custom') {
        if (startDate && endDate) {
          matchesTime = alertDate >= startDate && alertDate <= endDate
        } else if (startDate) {
          matchesTime = alertDate >= startDate
        } else if (endDate) {
          matchesTime = alertDate <= endDate
        }
      }

      return matchesSearch && matchesSev && matchesTime
    })
  }, [alerts, search, sevFilter, timeFilter, startDate, endDate])

  const visibleAlerts = typeof limit === 'number' ? filtered.slice(0, limit) : filtered

  return (
    <div data-component="AlertsFeed" data-slot="alerts-feed" className="flex flex-1 flex-col overflow-hidden">
      {/* Search & Filters */}
      {showSearchFilter && (
        <div data-slot="search-filter-toolbar" className="border-b border-line-soft px-4 py-3 space-y-2.5 bg-panel/30">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-dim" />
            <input
              type="text"
              aria-label="Search events by vehicle or keyword"
              placeholder="Search by vehicle or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-line bg-panel-2 pl-9 pr-3.5 py-1.5 text-[12px] text-hi focus:border-line focus:outline-none placeholder:text-dim"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
            {/* Severity Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter events by severity">
              {[
                { id: 'all', label: 'All' },
                { id: 'critical', label: 'Critical' },
                { id: 'warning', label: 'Warning' },
                { id: 'info', label: 'Info' },
              ].map((sev) => (
                <button
                  data-action="filter-severity"
                  key={sev.id}
                  type="button"
                  onClick={() => setSevFilter(sev.id)}
                  aria-label={`Filter by ${sev.label} priority`}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium capitalize transition-all border cursor-pointer ${
                    sevFilter === sev.id
                      ? 'bg-accent/15 border-accent text-accent font-semibold shadow-xs'
                      : 'bg-panel-2 border-line text-lo hover:text-hi hover:border-line-soft'
                  }`}
                >
                  {sev.label}
                </button>
              ))}
            </div>

            {/* Time Period Filter Pills */}
            {showTimeFilter && (
              <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter events by date range">
                {[
                  { id: 'all', label: 'All Time' },
                  { id: 'today', label: 'Today' },
                  { id: '7days', label: '7 Days' },
                  { id: '30days', label: '30 Days' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTimeFilter(t.id)
                      setStartDate('')
                      setEndDate('')
                      setDateRangeError('')
                    }}
                    className={`rounded-full px-2.5 py-0.75 text-[10.5px] font-medium transition-all border cursor-pointer ${
                      timeFilter === t.id
                        ? 'bg-accent/15 border-accent text-accent font-semibold'
                        : 'bg-panel-2 border-line text-lo hover:text-hi hover:border-line-soft'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}

                {/* Custom Date Range Picker Dropdown (Start to End, Max 30 Days) */}
                <div className="relative inline-flex items-center" ref={rangePickerRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setTimeFilter('custom')
                      setIsRangePickerOpen((prev) => !prev)
                    }}
                    title="Select start and end date (max 30 days)"
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.75 text-[10.5px] font-medium transition-all border cursor-pointer ${
                      timeFilter === 'custom'
                        ? 'bg-accent/15 border-accent text-accent font-semibold'
                        : 'bg-panel-2 border-line text-lo hover:text-hi hover:border-line-soft'
                    }`}
                  >
                    <Calendar className="h-3 w-3" strokeWidth={2.2} />
                    <span>
                      {startDate && endDate
                        ? `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
                        : startDate
                        ? `From ${formatDisplayDate(startDate)}`
                        : 'Custom Range'}
                    </span>
                  </button>

                  {(startDate || endDate) && timeFilter === 'custom' && (
                    <button
                      type="button"
                      onClick={clearRange}
                      title="Clear custom range"
                      className="ml-1 text-dim hover:text-hi cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}

                  {/* Range Picker Modal Popover */}
                  {isRangePickerOpen && (
                    <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl border border-line bg-panel p-3.5 shadow-2xl backdrop-blur-md">
                      <div className="flex items-center justify-between pb-2 border-b border-line-soft">
                        <span className="text-[11.5px] font-bold text-hi">Date Range Filter</span>
                        <span className="text-[9.5px] font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                          Max 30 Days
                        </span>
                      </div>

                      <div className="mt-3 space-y-2.5">
                        <div>
                          <label className="block text-[10px] font-semibold text-dim uppercase tracking-wider mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => handleStartDateChange(e.target.value)}
                            className="w-full rounded-lg border border-line bg-panel-2 px-2.5 py-1.5 text-[11.5px] text-hi focus:border-accent focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-dim uppercase tracking-wider mb-1">
                            End Date (Max +30d)
                          </label>
                          <input
                            type="date"
                            min={startDate}
                            value={endDate}
                            onChange={(e) => handleEndDateChange(e.target.value)}
                            className="w-full rounded-lg border border-line bg-panel-2 px-2.5 py-1.5 text-[11.5px] text-hi focus:border-accent focus:outline-none"
                          />
                        </div>

                        {dateRangeError && (
                          <div className="rounded-md bg-amber/10 border border-amber/20 px-2 py-1 text-[10px] text-amber leading-tight">
                            {dateRangeError}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-line-soft">
                          <button
                            type="button"
                            onClick={clearRange}
                            className="text-[11px] text-dim hover:text-hi cursor-pointer"
                          >
                            Reset
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsRangePickerOpen(false)}
                            className="rounded-lg bg-accent px-3 py-1 text-[11px] font-semibold text-white hover:bg-accent/90 cursor-pointer shadow-xs"
                          >
                            Apply Filter
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Events List */}
      <div data-slot="alerts-list" className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        {isLoading ? (
          Array.from({ length: typeof limit === 'number' ? limit : 6 }).map((_, i) => (
            <div
              key={`skel-alert-${i}`}
              className="animate-pulse flex items-start gap-3 rounded-xl p-2.5 bg-panel-2/30"
            >
              <div className="h-6 w-6 rounded-lg bg-panel-2 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-48 rounded bg-panel-2" />
                <div className="flex items-center justify-between">
                  <div className="h-2.5 w-20 rounded bg-panel-2/60" />
                  <div className="h-2.5 w-12 rounded bg-panel-2/40" />
                </div>
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-dim gap-2">
            <svg className="h-10 w-10 text-dim/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <div className="text-[12.5px] font-semibold text-hi">No alert events match</div>
            <p className="text-[11px] text-dim max-w-xs">No alerts found for the selected time range or filter criteria.</p>
          </div>
        ) : (
          visibleAlerts.map((a) => {
            const sev = SEV_META[a.sev]
            return (
              <div
                key={a.id}
                role="button"
                tabIndex={0}
                onClick={() => handleAlertClick(a)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleAlertClick(a)
                  }
                }}
                data-slot="alert-card"
                title={`Click to inspect ${a.vehicle} live telemetry and details`}
                className="group relative flex gap-3 rounded-xl border border-transparent p-2.5 transition-all hover:border-line hover:bg-hover/80 active:scale-[0.99] cursor-pointer"
              >
                <div
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
                    sev?.classes || 'bg-accent/15 text-accent border border-accent/20'
                  }`}
                >
                  {getAlertIcon(a)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[12px] font-medium leading-snug text-hi group-hover:text-white transition-colors">
                      {a.msg}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-dim opacity-0 group-hover:opacity-100 group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" strokeWidth={2.2} />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-md border border-line-soft bg-panel-2/80 px-2 py-0.5 text-[10px] font-semibold text-accent group-hover:border-accent/40 transition-colors">
                      {a.vehicle}
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-dim tabular-nums">
                      <span className="text-lo font-medium">{formatDisplayDate(a.date)}</span>
                      <span>·</span>
                      <span>{a.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}

        {/* Scrolling See All Button */}
        {showSeeAll && (
          <div className="pt-2 pb-1">
            {/* <Link
              data-action="view-all-alerts"
              to="/alerts"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-line/80 bg-panel-2 px-3 py-2.5 text-[11.5px] font-medium text-hi transition-all hover:bg-hover hover:border-accent/40 hover:text-accent group shadow-sm"
            >
              <span>See all events</span>
              <ChevronRight className="h-3.5 w-3.5 text-dim transition-transform group-hover:translate-x-0.5 group-hover:text-accent" strokeWidth={2.2} />
            </Link> */}
          </div>
        )}
      </div>
    </div>
  )
}
