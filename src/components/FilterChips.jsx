import { useFleet } from '../context/FleetContext'

const OPTIONS = [
  { key: 'all', label: 'All', color: null },
  { key: 'online', label: 'Online', color: 'bg-green' },
  { key: 'idle', label: 'Idle', color: 'bg-amber' },
  { key: 'alert', label: 'Alert', color: 'bg-red' },
  { key: 'offline', label: 'Offline', color: 'bg-gray' },
]

export default function FilterChips() {
  const { statusFilter, setStatusFilter } = useFleet()

  return (
    <div className="flex max-w-full gap-1.5 overflow-x-auto pb-0.5">
      {OPTIONS.map((o) => {
        const active = statusFilter === o.key
        return (
          <button
            key={o.key}
            onClick={() => setStatusFilter(o.key)}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-medium transition-colors ${
              active
                ? 'border-transparent bg-accent/15 text-accent'
                : 'border-line text-lo hover:border-[#333B47] hover:text-hi'
            }`}
          >
            {o.color && <span className={`h-1.5 w-1.5 rounded-full ${o.color}`} />}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
