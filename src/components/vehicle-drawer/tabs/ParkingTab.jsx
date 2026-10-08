import { useState, useMemo } from 'react'
import {
  MapPin,
  Clock,
  Zap,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  Lock,
  ExternalLink,
} from '../../icons'

export default function ParkingTab({ selectedVehicle }) {
  const [search, setSearch] = useState('')
  const [filterPeriod, setFilterPeriod] = useState('all') // 'all' | 'today' | 'yesterday' | 'week'
  const [expandedSessionId, setExpandedSessionId] = useState(null)

  const defaultLocation = selectedVehicle?.location || 'Main Central Hub Depot'
  const vehicleLat = selectedVehicle?.lat || 52.5200
  const vehicleLon = selectedVehicle?.lon || 13.4050

  // Realistic parking session dwell logs dataset with Google Maps queries and visit counts
  const parkingSessions = useMemo(() => [
    {
      id: 'park-001',
      location: `${defaultLocation} — Bay #B-14`,
      depotName: defaultLocation,
      address: `${defaultLocation}, Fleet Industrial Zone`,
      lat: vehicleLat,
      lon: vehicleLon,
      visitCount: 18,
      checkIn: 'Today, 14:20',
      checkOut: 'Present',
      duration: '2h 58m',
      period: 'today',
      status: 'Active',
      isCurrent: true,
      startSoc: selectedVehicle?.battery ?? 74,
      endSoc: selectedVehicle?.battery ?? 74,
      drainPercent: '0.0%',
      drainRate: '0.0% / hr',
      securityState: 'Locked & Armed',
      geofenceStatus: 'Inside Authorized Depot',
      bayType: 'Stabling Bay (Standard)',
    },
    {
      id: 'park-002',
      location: 'Prenzlauer Berg Depot — Slot 3',
      depotName: 'Prenzlauer Berg Depot',
      address: 'Prenzlauer Berg Depot, Berlin',
      lat: 52.5385,
      lon: 13.4244,
      visitCount: 9,
      checkIn: 'Today, 09:15',
      checkOut: 'Today, 13:30',
      duration: '4h 15m',
      period: 'today',
      status: 'Completed',
      isCurrent: false,
      startSoc: 82,
      endSoc: 81,
      drainPercent: '-1.0%',
      drainRate: '0.24% / hr',
      securityState: 'Locked',
      geofenceStatus: 'Inside Authorized Depot',
      bayType: 'Loading / Unloading Bay',
    },
    {
      id: 'park-003',
      location: 'Friedrichshain Hub — Charging Bay 2',
      depotName: 'Friedrichshain Hub',
      address: 'Friedrichshain Logistics Hub, Berlin',
      lat: 52.5150,
      lon: 13.4540,
      visitCount: 12,
      checkIn: 'Yesterday, 19:10',
      checkOut: 'Yesterday, 23:45',
      duration: '4h 35m',
      period: 'yesterday',
      status: 'Completed',
      isCurrent: false,
      startSoc: 45,
      endSoc: 88,
      drainPercent: '+43% (Charged)',
      drainRate: 'Plugged into AC Charger',
      securityState: 'Locked',
      geofenceStatus: 'Inside Authorized Depot',
      bayType: 'AC 22kW Charging Bay',
    },
    {
      id: 'park-004',
      location: 'West Logistics Yard — Staging Bay 6',
      depotName: 'West Logistics Yard',
      address: 'West Logistics Yard, Spandauer Damm',
      lat: 52.5280,
      lon: 13.2950,
      visitCount: 6,
      checkIn: 'Yesterday, 10:20',
      checkOut: 'Yesterday, 16:50',
      duration: '6h 30m',
      period: 'yesterday',
      status: 'Completed',
      isCurrent: false,
      startSoc: 94,
      endSoc: 93,
      drainPercent: '-1.0%',
      drainRate: '0.15% / hr',
      securityState: 'Locked',
      geofenceStatus: 'Inside Authorized Depot',
      bayType: 'Staging Bay (Ready)',
    },
    {
      id: 'park-005',
      location: 'Charlottenburg Distribution Center',
      depotName: 'Charlottenburg Distribution Center',
      address: 'Charlottenburg Hub, Bismarckstraße',
      lat: 52.5110,
      lon: 13.3050,
      visitCount: 4,
      checkIn: '03 Oct, 13:10',
      checkOut: '03 Oct, 15:45',
      duration: '2h 35m',
      period: 'week',
      status: 'Completed',
      isCurrent: false,
      startSoc: 68,
      endSoc: 67,
      drainPercent: '-1.0%',
      drainRate: '0.38% / hr',
      securityState: 'Locked',
      geofenceStatus: 'Customer Warehouse Hub',
      bayType: 'Customer Docking Bay',
    },
    {
      id: 'park-006',
      location: 'Spandau North Depot — Stabling Bay 12',
      depotName: 'Spandau North Depot',
      address: 'Spandau North Freight Depot, Berlin',
      lat: 52.5450,
      lon: 13.2000,
      visitCount: 7,
      checkIn: '01 Oct, 18:30',
      checkOut: '02 Oct, 07:00',
      duration: '12h 30m (Overnight)',
      period: 'week',
      status: 'Completed',
      isCurrent: false,
      startSoc: 62,
      endSoc: 60,
      drainPercent: '-2.0%',
      drainRate: '0.16% / hr',
      securityState: 'Locked & Guarded',
      geofenceStatus: 'Inside Authorized Depot',
      bayType: 'Overnight Stabling Bay',
    },
  ], [defaultLocation, selectedVehicle?.battery, vehicleLat, vehicleLon])

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return parkingSessions.filter((s) => {
      if (filterPeriod === 'today' && s.period !== 'today') return false
      if (filterPeriod === 'yesterday' && s.period !== 'yesterday') return false
      if (filterPeriod === 'week' && !['today', 'yesterday', 'week'].includes(s.period)) return false

      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        s.location.toLowerCase().includes(q) ||
        s.depotName.toLowerCase().includes(q) ||
        s.checkIn.toLowerCase().includes(q) ||
        s.bayType.toLowerCase().includes(q)
      )
    })
  }, [parkingSessions, filterPeriod, search])

  const handleExportCSV = () => {
    const csvData = [
      ['Session ID', 'Location / Bay', 'Depot Name', 'Total Visits Here', 'Check In', 'Check Out', 'Dwell Duration', 'Battery Delta', 'Status', 'Security'],
      ...filteredSessions.map((s) => [
        s.id,
        s.location,
        s.depotName,
        s.visitCount,
        s.checkIn,
        s.checkOut,
        s.duration,
        s.drainPercent,
        s.status,
        s.securityState,
      ]),
    ]
      .map((row) => row.map((v) => `"${v}"`).join(','))
      .join('\n')

    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `parking_logs_${selectedVehicle?.name || 'vehicle'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleSession = (id) => {
    setExpandedSessionId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* 1. Header Summary KPI Strip */}
      <div className="flex items-center justify-between border-b border-line-soft bg-panel px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-md border border-accent/30 bg-accent/10 text-accent">
            <MapPin className="h-3 w-3" strokeWidth={2.5} />
          </span>
          <div>
            <div className="font-display text-[13px] font-bold text-hi">
              Parking Session History
            </div>
            <div className="font-mono text-[10px] text-dim">
              Recent Dwell Logs & Location Frequency
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10.5px]">
          <span className="rounded-md border border-line-soft bg-panel-2 px-2 py-0.5 text-dim">
            <strong className="text-hi font-semibold">{filteredSessions.length}</strong> Sessions
          </span>
        </div>
      </div>

      {/* 2. Filter Tabs & Search Bar */}
      <div className="border-b border-line-soft bg-panel-2/30 px-4 py-2.5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          {/* Period Filter Tabs */}
          <div className="inline-flex items-center gap-0.5 rounded-lg border border-line bg-panel p-0.5 text-[11px] font-medium shadow-2xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'week', label: 'Past 7 Days' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterPeriod(tab.id)}
                className={`rounded-md px-2.5 py-1 transition-colors cursor-pointer ${
                  filterPeriod === tab.id
                    ? 'bg-accent/15 text-accent font-semibold shadow-xs'
                    : 'text-lo hover:text-hi hover:bg-hover'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* CSV Export Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            title="Export Parking CSV"
            className="flex items-center gap-1 rounded-lg border border-line bg-panel px-2.5 py-1 text-[11px] font-medium text-lo hover:text-hi hover:bg-hover transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            <Download className="h-3 w-3" />
            <span>CSV</span>
          </button>
        </div>

        {/* Search Toolbar */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-dim" />
          <input
            type="text"
            placeholder="Search by depot, bay number, or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-line bg-panel pl-8 pr-3 py-1.5 text-[11.5px] text-hi placeholder:text-dim outline-none focus:border-accent/60 transition-colors"
          />
        </div>
      </div>

      {/* 3. Dwell Logs List with Google Maps Links & Visit Frequency */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 bg-panel-2/15">
        {filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MapPin className="h-8 w-8 text-dim mb-2 opacity-50" />
            <p className="text-[12.5px] font-medium text-hi">No parking records found</p>
            <p className="text-[11px] text-dim mt-0.5">Try selecting another filter or clear your search.</p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isExpanded = expandedSessionId === session.id
            const mapsUrl = session.lat && session.lon
              ? `https://www.google.com/maps/search/?api=1&query=${session.lat},${session.lon}`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(session.address || session.location)}`

            return (
              <div
                key={session.id}
                className={`rounded-xl border bg-panel transition-all duration-150 shadow-xs overflow-hidden ${
                  session.isCurrent
                    ? 'border-accent/60 ring-1 ring-accent/20'
                    : isExpanded
                      ? 'border-line hover:border-line'
                      : 'border-line-soft hover:border-line'
                }`}
              >
                {/* Session Card Header (Clickable) */}
                <div
                  onClick={() => toggleSession(session.id)}
                  className="p-3.5 cursor-pointer hover:bg-panel-2/40 transition-colors select-none"
                >
                  {/* Row 1: Bay / Location & Status Badge */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin className="h-3.5 w-3.5 text-accent shrink-0" strokeWidth={2.2} />
                      <span className="font-display text-[13px] font-bold text-hi truncate">
                        {session.location}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {session.isCurrent ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[9.5px] font-bold text-accent border border-accent/30 font-mono">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                          Currently Parked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-dim">
                          <Check className="h-3 w-3 text-green" />
                          Completed
                        </span>
                      )}

                      <div className="flex h-5 w-5 items-center justify-center rounded text-dim">
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Check-in / Out Time & Dwell Duration */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-lo mb-2">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-dim" />
                      <span>{session.checkIn} → {session.checkOut}</span>
                    </div>
                    <span className="font-semibold text-hi tabular-nums">
                      {session.duration}
                    </span>
                  </div>

                  {/* Row 3: Parking Frequency & Google Maps Link */}
                  <div className="flex items-center justify-between border-t border-line-soft/40 pt-2 text-[10.5px] font-mono">
                    {/* Visit Count Badge */}
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded bg-accent/10 border border-accent/25 px-1.5 py-0.25 text-[10px] font-semibold text-accent">
                        <span>📍 Parked {session.visitCount} times here</span>
                      </span>
                    </div>

                    {/* Google Maps External Link */}
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-dim hover:text-green transition-colors cursor-pointer group"
                      title="Open in Google Maps"
                    >
                      <span className="group-hover:underline">Google Maps</span>
                      <ExternalLink className="h-3 w-3 group-hover:text-green" />
                    </a>
                  </div>
                </div>

                {/* Expandable Session Details */}
                {isExpanded && (
                  <div className="border-t border-line-soft bg-panel-2/40 p-3.5 space-y-2.5 text-[11px] animate-fadeIn">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-line-soft bg-panel p-2.5">
                        <div className="text-[9.5px] font-mono uppercase text-dim mb-0.5">
                          Vampire Drain Rate
                        </div>
                        <div className="font-mono text-hi font-semibold">
                          {session.drainRate} ({session.drainPercent})
                        </div>
                      </div>

                      <div className="rounded-lg border border-line-soft bg-panel p-2.5">
                        <div className="text-[9.5px] font-mono uppercase text-dim mb-0.5">
                          Security State
                        </div>
                        <div className="font-mono text-emerald-400 font-semibold flex items-center gap-1">
                          <Lock className="h-2.5 w-2.5" />
                          {session.securityState}
                        </div>
                      </div>

                      <div className="rounded-lg border border-line-soft bg-panel p-2.5 col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9.5px] font-mono uppercase text-dim">
                            Depot & Address
                          </span>
                          <span className="font-mono text-[10px] text-accent font-semibold">
                            Total Visits: {session.visitCount}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-hi font-medium truncate">
                            {session.address}
                          </div>
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-accent hover:text-green shrink-0 transition-colors"
                          >
                            <span>View Map</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
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

      {/* 4. Footer */}
      <div className="flex items-center justify-between border-t border-line-soft px-4 py-2.5 bg-panel-2/40 shrink-0 font-mono text-[10.5px] text-dim">
        <span>{filteredSessions.length} logs displayed</span>
        <span>Avg Dwell: ~4.2h</span>
      </div>
    </div>
  )
}
