import { Truck, Wifi, BatteryMedium, TriangleAlert } from './icons'
import { useFleet } from '../context/FleetContext'

export default function StatsRow() {
  const { stats } = useFleet()

  const cards = [
    {
      label: 'Total vehicles',
      value: stats.total,
      icon: Truck,
      color: 'text-accent',
      bg: 'bg-accent/15',
      delta: 'Across 4 depots',
      badge: 'Active Fleet',
    },
    {
      label: 'Online now',
      value: stats.online,
      icon: Wifi,
      color: 'text-green',
      bg: 'bg-green/15',
      delta: `${Math.round((stats.online / (stats.total || 1)) * 100)}% of fleet`,
      pulse: true,
    },
    {
      label: 'Needs attention',
      value: stats.idle,
      icon: BatteryMedium,
      color: 'text-amber',
      bg: 'bg-amber/15',
      delta: 'Idle / low battery',
    },
    {
      label: 'Critical alerts',
      value: stats.critical,
      icon: TriangleAlert,
      color: 'text-red',
      bg: 'bg-red/15',
      delta: 'Requires action',
    },
  ]

  return (
    <div className="mb-4.5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-line bg-panel p-4 transition-all duration-200 hover:border-line-soft hover:bg-panel-2/90"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-display text-[11.5px] font-semibold text-lo group-hover:text-hi transition-colors">
              {c.pulse && (
                <span className="relative flex h-2 w-2">
                  <span className="h-2 w-2 rounded-full bg-accent/80" />
                </span>
              )}
              <span>{c.label}</span>
            </div>
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-lg border border-line-soft transition-all duration-200 ${c.bg} ${c.color}`}
            >
              <c.icon className="h-3.5 w-3.5" strokeWidth={2} />
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="font-display text-[33px]  tracking-tight text-hi tabular-nums">
              {c.value}
            </div>
            {c.badge && (
              <span className="rounded-md border border-accent/25 bg-accent/10 px-1.75 py-0.5 font-mono text-[9.5px] font-medium text-accent/80">
                {c.badge}
              </span>
            )}
          </div>

          <div className="mt-1 font-mono text-[10.5px] text-accent/80 tabular-nums">
            {c.delta}
          </div>
        </div>
      ))}
    </div>
  )
}
