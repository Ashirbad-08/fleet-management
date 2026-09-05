import { useState } from 'react'
import { X, Search, Clock, ArrowRight, Check, History, Download, MapPin, ChevronRight } from './icons'

export default function TripHistoryPanel({ open, onClose, vehicle, trips = [] }) {
  const [search, setSearch] = useState('')
  const [selectedTrip, setSelectedTrip] = useState(null)

  const filteredTrips = trips.filter(
    (t) =>
      t.tripNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.from.toLowerCase().includes(search.toLowerCase()) ||
      t.to.toLowerCase().includes(search.toLowerCase()) ||
      t.time.toLowerCase().includes(search.toLowerCase())
  )

  const handleExportCSV = () => {
    const csvData = [
      ['Trip', 'Time', 'From', 'To', 'Distance', 'Duration', 'Battery Used', 'Status'],
      ...filteredTrips.map((t) => [
        t.tripNumber, t.time, t.from, t.to,
        t.distance, t.duration, t.batteryUsed, t.status,
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

  return (
    <>
      {/* Side-by-side Panel attached to left side of VehicleDrawer */}
      <div
        role="dialog"
        aria-label="Full Trip History Panel"
        className={`fixed right-0 sm:right-[462px] top-0 z-40 h-dvh w-full sm:w-[462px] flex flex-col border-l sm:border-r border-line bg-panel shadow-2xl transition-all duration-300 ease-in-out ${
          open ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-full sm:translate-x-[calc(100%+462px)] opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line-soft px-5 py-4 bg-panel-2/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/30">
              <History className="h-4 w-4" strokeWidth={2.2} />
            </div>
            <div>
              <div className="font-display text-[14px] font-bold text-hi leading-tight">
                Full Trip History
              </div>
              <div className="font-mono text-[10.5px] text-lo tabular-nums">
                {vehicle?.name || 'Vehicle'} • {trips.length} trips
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

        {/* Toolbar */}
        <div className="flex items-center gap-2 border-b border-line-soft px-4 py-2.5 bg-panel-2/20 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-dim" />
            <input
              type="text"
              placeholder="Search trips, routes..."
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
            CSV
          </button>
        </div>

        {/* Summary strip */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-line-soft/50 bg-panel shrink-0">
          <span className="font-mono text-[10.5px] text-dim">
            IMEI: <strong className="text-hi">{vehicle?.deviceId || '—'}</strong>
          </span>
          <span className="font-mono text-[10.5px] text-dim">
            {filteredTrips.length} result{filteredTrips.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Trip Cards */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {filteredTrips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="h-8 w-8 text-dim mb-3" />
              <p className="text-[12px] text-dim">No matching trips found.</p>
            </div>
          ) : (
            filteredTrips.map((t) => {
              const isSelected = selectedTrip?.id === t.id
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTrip(isSelected ? null : t)}
                  className={`group rounded-xl border transition-all duration-150 cursor-pointer overflow-hidden ${
                    isSelected
                      ? 'border-accent/50 bg-accent/8 shadow-sm'
                      : 'border-line-soft bg-panel hover:border-line hover:bg-panel-2/40'
                  }`}
                >
                  {/* Card top */}
                  <div className="flex items-start justify-between px-3.5 pt-3 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-[13px] font-bold text-hi">{t.tripNumber}</span>
                      {t.isLastRide && (
                        <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[9px] font-mono font-bold text-accent border border-accent/30 uppercase tracking-wide">
                          Latest
                        </span>
                      )}
                    </div>
                    <ChevronRight
                      className={`h-3.5 w-3.5 text-dim transition-transform shrink-0 mt-0.5 ${isSelected ? 'rotate-90 text-accent' : ''}`}
                      strokeWidth={2}
                    />
                  </div>

                  {/* Route */}
                  <div className="flex items-center gap-1.5 px-3.5 pb-2 text-[12px]">
                    <span className="text-lo font-medium truncate max-w-[140px]">{t.from}</span>
                    <ArrowRight className="h-3 w-3 text-accent shrink-0" strokeWidth={2} />
                    <span className="text-hi font-semibold truncate max-w-[140px]">{t.to}</span>
                  </div>

                  {/* Stats strip */}
                  <div className="flex items-center gap-3 px-3.5 pb-3 font-mono text-[10.5px] text-dim border-t border-line-soft/40 pt-2">
                    <span className="font-semibold text-hi">{t.distance}</span>
                    <span className="text-line-soft">·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" strokeWidth={1.8} />
                      {t.duration}
                    </span>
                    <span className="text-line-soft">·</span>
                    <span className="text-amber">{t.batteryUsed}</span>
                    <span className="text-line-soft ml-auto">·</span>
                    <span className="inline-flex items-center gap-1 text-green">
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                      {t.status}
                    </span>
                  </div>

                  {/* Expanded detail */}
                  {isSelected && (
                    <div className="border-t border-accent/20 bg-accent/5 px-3.5 py-3 space-y-2">
                      <div className="flex items-center justify-between text-[10.5px] font-mono text-lo">
                        <span>{t.time}</span>
                        <span className="text-accent font-semibold">GraphQL: Locations</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[10.5px] font-mono">
                        <div className="rounded-lg border border-line-soft bg-panel px-2.5 py-2">
                          <div className="text-dim uppercase tracking-wide mb-0.5" style={{ fontSize: '9px' }}>Endpoint</div>
                          <div className="text-hi font-bold">POST /fleet-tracking</div>
                        </div>
                        <div className="rounded-lg border border-line-soft bg-panel px-2.5 py-2">
                          <div className="text-dim uppercase tracking-wide mb-0.5" style={{ fontSize: '9px' }}>Waypoints</div>
                          <div className="text-green font-bold">25 Recorded</div>
                        </div>
                        <div className="rounded-lg border border-line-soft bg-panel px-2.5 py-2">
                          <div className="text-dim uppercase tracking-wide mb-0.5" style={{ fontSize: '9px' }}>From</div>
                          <div className="text-hi font-semibold">{t.from}</div>
                        </div>
                        <div className="rounded-lg border border-line-soft bg-panel px-2.5 py-2">
                          <div className="text-dim uppercase tracking-wide mb-0.5" style={{ fontSize: '9px' }}>Battery Used</div>
                          <div className="text-amber font-bold">{t.batteryUsed}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-line-soft px-4 py-2.5 bg-panel-2/40 shrink-0">
          <span className="font-mono text-[10.5px] text-dim">
            {filteredTrips.length} of {trips.length} trips shown
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
