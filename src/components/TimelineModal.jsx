import { useState } from 'react'
import {
  X,
  Search,
  Radio,
  Download,
  RotateCw,
  ChevronRight,
  Filter,
  Check,
  TriangleAlert,
  Info,
} from './icons'

export default function TimelinePanel({ open, onClose, vehicle, events = [], onRefresh, loading = false }) {
  const [search, setSearch] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [selectedEvent, setSelectedEvent] = useState(null)

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      (e.message || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.eventType || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.location || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.metadata || '').toLowerCase().includes(search.toLowerCase())

    const matchesSeverity =
      filterSeverity === 'all' || (e.severity || '').toLowerCase() === filterSeverity.toLowerCase()

    return matchesSearch && matchesSeverity
  })

  const handleExportCSV = () => {
    const csvData = [
      ['Timestamp', 'Event Type', 'Severity', 'Message', 'Location', 'Metadata'],
      ...filteredEvents.map((e) => [
        e.timestamp,
        e.eventType,
        e.severity,
        e.message,
        e.location || '',
        e.metadata || '',
      ]),
    ]
      .map((row) => row.map((v) => `"${v}"`).join(','))
      .join('\n')

    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `timeline_${vehicle?.name || 'device'}_events.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getSeverityBadge = (severity) => {
    switch ((severity || '').toLowerCase()) {
      case 'critical':
        return 'bg-red/15 text-red border-red/30'
      case 'warning':
        return 'bg-amber/15 text-amber border-amber/30'
      case 'success':
        return 'bg-green/15 text-green border-green/30'
      default:
        return 'bg-accent/15 text-accent border-accent/30'
    }
  }

  return (
    <>
      {/* Side-by-side Panel attached to left side of VehicleDrawer */}
      <div
        role="dialog"
        aria-label="Full Device Timeline Panel"
        className={`fixed right-0 sm:right-[462px] top-0 z-40 h-dvh w-full sm:w-[462px] flex flex-col border-l sm:border-r border-line bg-panel shadow-2xl transition-all duration-300 ease-in-out ${
          open
            ? 'translate-x-0 opacity-100 pointer-events-auto'
            : 'translate-x-full sm:translate-x-[calc(100%+462px)] opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line-soft px-5 py-4 bg-panel-2/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/30">
              <Radio className="h-4 w-4 animate-pulse" strokeWidth={2.2} />
            </div>
            <div>
              <div className="font-display text-[14px] font-bold text-hi leading-tight">
                Device Event Timeline
              </div>
              <div className="font-mono text-[10.5px] text-lo tabular-nums">
                {vehicle?.name || 'Vehicle'} • IMEI: {vehicle?.deviceId || vehicle?.id || '—'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                title="Refresh timeline events"
                aria-label="Refresh timeline events"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-panel-2 text-lo hover:bg-hover hover:text-accent transition-colors cursor-pointer disabled:opacity-50"
              >
                <RotateCw className={`h-3 w-3 ${loading ? 'animate-spin text-accent' : ''}`} strokeWidth={2} />
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close timeline"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-panel-2 text-lo hover:bg-hover hover:text-hi transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Toolbar: Search & Export */}
        <div className="flex items-center gap-2 border-b border-line-soft px-4 py-2.5 bg-panel-2/20 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-dim" />
            <input
              type="text"
              placeholder="Search event type, location, message..."
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

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-line-soft/60 bg-panel shrink-0 overflow-x-auto">
          {['all', 'critical', 'warning', 'success', 'info'].map((sev) => {
            const active = filterSeverity === sev
            return (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  active
                    ? 'bg-accent text-black font-bold shadow-xs'
                    : 'bg-panel-2 border border-line-soft text-lo hover:text-hi hover:bg-hover'
                }`}
              >
                {sev}
              </button>
            )
          })}
          <span className="ml-auto font-mono text-[10.5px] text-dim shrink-0">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Events Feed */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Radio className="h-8 w-8 text-dim mb-3" />
              <p className="text-[12px] text-dim">No matching timeline events found.</p>
            </div>
          ) : (
            filteredEvents.map((evt) => {
              const isSelected = selectedEvent?.id === evt.id
              const sevColor =
                evt.severity === 'critical'
                  ? 'var(--color-red)'
                  : evt.severity === 'warning'
                    ? 'var(--color-amber)'
                    : evt.severity === 'success'
                      ? 'var(--color-green)'
                      : 'var(--color-accent)'

              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(isSelected ? null : evt)}
                  className={`group rounded-xl border transition-all duration-150 cursor-pointer overflow-hidden ${
                    isSelected
                      ? 'border-accent/50 bg-accent/8 shadow-sm'
                      : 'border-line-soft bg-panel hover:border-line hover:bg-panel-2/40'
                  }`}
                >
                  <div className="flex items-start gap-2.5 p-3">
                    <span
                      className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full shadow-xs"
                      style={{ background: evt.color || sevColor }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`rounded px-1.5 py-0.25 font-mono text-[9px] font-bold uppercase tracking-wider border ${getSeverityBadge(
                            evt.severity
                          )}`}
                        >
                          {evt.eventType}
                        </span>
                        <span className="font-mono text-[10px] text-dim tabular-nums">{evt.timestamp}</span>
                      </div>

                      <div className="text-[12px] font-medium leading-snug text-hi">{evt.message}</div>

                      {(evt.location || evt.metadata) && (
                        <div className="mt-1.5 font-mono text-[10.5px] text-lo flex items-center justify-between border-t border-line-soft/40 pt-1.5">
                          <span>{evt.metadata}</span>
                          {evt.location && <span className="text-accent font-semibold">{evt.location}</span>}
                        </div>
                      )}
                    </div>
                    <ChevronRight
                      className={`h-3.5 w-3.5 text-dim transition-transform shrink-0 mt-1 ${
                        isSelected ? 'rotate-90 text-accent' : ''
                      }`}
                      strokeWidth={2}
                    />
                  </div>

                  {/* Expanded GraphQL Diagnostic info */}
                  {isSelected && (
                    <div className="border-t border-accent/20 bg-accent/5 px-3.5 py-3 space-y-2">
                      <div className="flex items-center justify-between text-[10.5px] font-mono text-lo">
                        <span>Event ID: {evt.id}</span>
                        <span className="text-accent font-semibold">GraphQL: getTimelineDetailsByIMEI</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[10.5px] font-mono">
                        <div className="rounded-lg border border-line-soft bg-panel px-2.5 py-2">
                          <div className="text-dim uppercase tracking-wide mb-0.5" style={{ fontSize: '9px' }}>
                            Severity Level
                          </div>
                          <div className="text-hi font-bold capitalize">{evt.severity}</div>
                        </div>
                        <div className="rounded-lg border border-line-soft bg-panel px-2.5 py-2">
                          <div className="text-dim uppercase tracking-wide mb-0.5" style={{ fontSize: '9px' }}>
                            Device IMEI
                          </div>
                          <div className="text-green font-bold truncate">
                            {vehicle?.deviceId || vehicle?.id || 'IOT-DEVICE'}
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

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-line-soft px-4 py-2.5 bg-panel-2/40 shrink-0">
          <span className="font-mono text-[10.5px] text-dim">
            Showing {filteredEvents.length} of {events.length} logged events
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
