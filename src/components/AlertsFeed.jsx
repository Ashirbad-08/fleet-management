import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TriangleAlert, Search, ChevronRight } from './icons'
import { useFleet } from '../context/FleetContext'
import { SEV_META } from '../data/statusMeta'

export default function AlertsFeed({ limit, showSearchFilter = true, showSeeAll = false }) {
  const { alerts } = useFleet()
  const [search, setSearch] = useState('')
  const [sevFilter, setSevFilter] = useState('all')

  const filtered = alerts.filter((a) => {
    const q = search.trim().toLowerCase()
    const matchesSearch = !q || a.vehicle.toLowerCase().includes(q) || a.msg.toLowerCase().includes(q)
    const matchesSev = sevFilter === 'all' || a.sev === sevFilter
    return matchesSearch && matchesSev
  })

  const visibleAlerts = typeof limit === 'number' ? filtered.slice(0, limit) : filtered

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Search & Filters (rendered only if showSearchFilter is true) */}
      {showSearchFilter && (
        <div className="border-b border-line-soft px-4 py-3 space-y-2.5 bg-panel/30">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-dim" />
            <input
              type="text"
              aria-label="Search events by vehicle or keyword"
              placeholder="Search by vehicle or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-line bg-panel-2 pl-9 pr-3.5 py-1.5 text-[12px] text-hi focus:border-accent focus:outline-hidden placeholder:text-dim"
            />
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter events by severity">
            {['all', 'critical', 'warning', 'info'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSevFilter(sev)}
                aria-label={`Filter by ${sev} priority`}
                className={`rounded-full px-2.5 py-0.75 text-[10.5px] font-medium capitalize transition-all border cursor-pointer ${
                  sevFilter === sev
                    ? 'bg-accent/15 border-accent text-accent'
                    : 'bg-panel-2 border-line text-lo hover:text-hi hover:border-line-soft'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Events List + Scrolling See All Button */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-dim gap-2">
            <svg className="h-10 w-10 text-dim/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <div className="text-[12.5px] font-semibold text-hi">No alert events match</div>
            <p className="text-[11px] text-dim max-w-xs">All vehicle telemetry metrics are within safe operational thresholds.</p>
          </div>
        ) : (
          visibleAlerts.map((a) => {
            const sev = SEV_META[a.sev]
            return (
              <div
                key={a.id}
                className="group relative flex gap-3 rounded-xl border border-transparent p-2.5 transition-all hover:border-line/60 hover:bg-hover/60"
              >
                <div
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
                    sev?.classes || 'bg-accent/15 text-accent'
                  }`}
                >
                  <TriangleAlert className="h-3 w-3" strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-medium leading-snug text-hi group-hover:text-white transition-colors">
                    {a.msg}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-md border border-line-soft bg-panel-2/80 px-2 py-0.5 text-[10px] font-semibold text-lo">
                      {a.vehicle}
                    </span>
                    <span className="font-mono text-[10px] text-dim tabular-nums">{a.time}</span>
                  </div>
                </div>
              </div>
            )
          })
        )}

        {/* Aesthetic "See all events" button at the very bottom of scrolling list */}
        {showSeeAll && (
          <div className="pt-2 pb-1">
            <Link
              to="/alerts"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-line/80 bg-panel-2 px-3 py-2.5 text-[11.5px] font-medium text-hi transition-all hover:bg-hover hover:border-accent/40 hover:text-accent group shadow-sm"
            >
              <span>See all events</span>
              <ChevronRight className="h-3.5 w-3.5 text-dim transition-transform group-hover:translate-x-0.5 group-hover:text-accent" strokeWidth={2.2} />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
