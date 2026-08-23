import { useState } from 'react'
import { TriangleAlert, Search } from './icons'
import { useFleet } from '../context/FleetContext'
import { SEV_META } from '../data/statusMeta'

export default function AlertsFeed({ limit }) {
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
      {/* Search & Filters */}
      <div className="border-b border-line-soft px-4 py-3 space-y-2.5 bg-panel/30">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-dim" />
          <input
            type="text"
            placeholder="Search by vehicle or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-line bg-panel-2 pl-9 pr-3.5 py-1.5 text-[12px] text-hi focus:border-accent focus:outline-hidden placeholder:text-dim"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['all', 'critical', 'warning', 'info'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSevFilter(sev)}
              className={`rounded-full px-2.5 py-0.75 text-[10.5px] font-medium capitalize transition-all border ${
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

      <div className="flex-1 overflow-y-auto px-2.5 py-1.5">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-[12px] text-dim">No events match.</div>
        ) : (
          visibleAlerts.map((a) => {
            const sev = SEV_META[a.sev]
            return (
              <div key={a.id} className="flex gap-2.5 rounded-lg px-2 py-2.5 hover:bg-hover">
                <div className={`mt-0.5 flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-md ${sev?.classes || ''}`}>
                  <TriangleAlert className="h-2.75 w-2.75" strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] leading-snug text-hi">{a.msg}</div>
                  <div className="mt-0.75 flex items-center gap-1.75">
                    <span className="text-[10.5px] font-medium text-lo">{a.vehicle}</span>
                    <span className="font-mono text-[10px] text-dim">{a.time}</span>
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
