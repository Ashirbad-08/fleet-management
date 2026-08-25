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
    },
    {
      label: 'Online now',
      value: stats.online,
      icon: Wifi,
      color: 'text-green',
      bg: 'bg-green/15',
      delta: `${Math.round((stats.online / stats.total) * 100)}% of fleet`,
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
        <div key={c.label} className="rounded-xl border border-line bg-panel p-4 hover:border-accent/40 ease-in-out">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-medium text-lo">{c.label}</div>
            <div className={`flex h-6.5 w-6.5 items-center justify-center rounded-md ${c.bg} ${c.color}`}>
              <c.icon className="h-3.5 w-3.5" strokeWidth={2} />
            </div>
          </div>
          <div className="mt-2 font-display text-[26px] font-bold tracking-tight">{c.value}</div>
          <div className="mt-0.5 font-mono text-[10.5px] text-dim">{c.delta}</div>
        </div>
      ))}
    </div>
  )
}
