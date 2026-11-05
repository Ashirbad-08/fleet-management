import { useState } from 'react'
import {
  Search,
  Radio,
  Download,
  RotateCw,
} from '../../icons'

export default function TimelineTab({ vehicle, events = [], onRefresh, loading = false, error = null }) {
  const [search, setSearch] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('all')

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
    <div className="flex flex-col h-full">
      {/* 1. Header & Controls */}
      <div className="flex items-center justify-between border-b border-line-soft px-4 py-3 bg-panel-2/40">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent border border-accent/25">
            <Radio className="h-3.5 w-3.5 animate-pulse" strokeWidth={2.2} />
          </div>
          <div>
            <div className="font-display text-[13px] font-bold text-hi leading-tight">
              Device Event Timeline
            </div>
            <div className="font-mono text-[10px] text-lo tabular-nums">
              IMEI: {vehicle?.deviceId || vehicle?.id || '—'}
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
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-panel text-lo hover:bg-hover hover:text-accent transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`h-3 w-3 ${loading ? 'animate-spin text-accent' : ''}`} strokeWidth={2} />
            </button>
          )}
          <button
            onClick={handleExportCSV}
            title="Export CSV"
            className="flex items-center gap-1 rounded-lg border border-line bg-panel px-2.5 py-1 text-[11px] font-medium text-lo hover:bg-hover hover:text-hi transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="h-3 w-3" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Search Toolbar */}
      <div className="border-b border-line-soft px-3.5 py-2 bg-panel">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-dim" />
          <input
            type="text"
            placeholder="Search event type, location, message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-line bg-panel-2 pl-8 pr-3 py-1.5 text-[11.5px] text-hi placeholder:text-dim outline-none focus:border-accent/60 transition-colors"
          />
        </div>
      </div>

      {/* 3. Severity Filters */}
      <div className="flex items-center gap-1 border-b border-line-soft/60 px-3 py-1.5 bg-panel-2/20 overflow-x-auto scrollbar-none shrink-0 font-mono text-[10.5px]">
        {['all', 'critical', 'warning', 'success', 'info'].map((sev) => {
          const active = filterSeverity === sev
          return (
            <button
              key={sev}
              type="button"
              onClick={() => setFilterSeverity(sev)}
              className={`rounded-full px-2 py-0.5 uppercase tracking-wider transition-colors cursor-pointer ${
                active
                  ? 'bg-accent text-black font-bold shadow-xs'
                  : 'bg-panel border border-line-soft text-lo hover:text-hi hover:bg-hover'
              }`}
            >
              {sev}
            </button>
          )
        })}
        <span className="ml-auto text-[10px] text-dim shrink-0">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* 4. Events Feed */}
      <div className="p-3.5 space-y-2">
        {loading && events.length === 0 ? (
          <div className="space-y-2 py-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-2.5 animate-pulse">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-line-soft" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-3/4 rounded bg-line-soft" />
                  <div className="h-2.5 w-1/2 rounded bg-line-soft/60" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red/30 bg-red/10 p-3 text-[11.5px] text-red">
            {error}
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="ml-2 font-semibold underline cursor-pointer"
              >
                Retry
              </button>
            )}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Radio className="h-8 w-8 text-dim mb-2 opacity-50" />
            <p className="text-[12.5px] font-medium text-hi">No matching timeline events</p>
            <p className="text-[11px] text-dim mt-0.5">Try selecting a different severity or clear the search.</p>
          </div>
        ) : (
          filteredEvents.map((evt) => {
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
                className="group rounded-xl border border-line-soft bg-panel p-2.5 transition-all duration-150 hover:border-line hover:bg-panel-2/30 shadow-2xs"
              >
                <div className="flex items-start gap-2">
                  <span
                    className="mt-1 h-2 w-2 shrink-0 rounded-full shadow-xs"
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

                    <div className="text-[11.5px] font-medium leading-snug text-hi">{evt.message}</div>

                    {(evt.location || evt.metadata) && (
                      <div className="mt-1.5 font-mono text-[10px] text-lo flex flex-wrap items-center justify-between gap-1.5 border-t border-line-soft/40 pt-1">
                        <span className="break-words leading-relaxed text-dim">{evt.metadata}</span>
                        {evt.location && <span className="text-accent font-semibold shrink-0">{evt.location}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
