import { useState, useEffect } from 'react'
import { Truck, Wifi, BatteryMedium, TriangleAlert } from './icons'
import { useFleet } from '../context/FleetContext'
import StatsVehicleModal from './StatsVehicleModal'

export default function StatsRow() {
  const { stats, vehicles, setSelectedVehicleId } = useFleet()
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalStatus, setModalStatus] = useState('all')

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 240)
    return () => clearTimeout(timer)
  }, [])

  const cards = [
    {
      label: 'Total vehicles',
      value: stats.total,
      icon: Truck,
      color: 'text-accent',
      bg: 'bg-accent/15',
      delta: 'Across 4 depots',
      badge: 'Active Fleet',
      filterKey: 'all',
    },
    {
      label: 'Online now',
      value: stats.online,
      icon: Wifi,
      color: 'text-green',
      bg: 'bg-green/15',
      delta: `${Math.round((stats.online / (stats.total || 1)) * 100)}% of fleet`,
      pulse: true,
      filterKey: 'online',
    },
    {
      label: 'Needs attention',
      value: stats.idle,
      icon: BatteryMedium,
      color: 'text-amber',
      bg: 'bg-amber/15',
      delta: 'Idle / low battery',
      filterKey: 'idle',
    },
    {
      label: 'Critical alerts',
      value: stats.critical,
      icon: TriangleAlert,
      color: 'text-red',
      bg: 'bg-red/15',
      delta: 'Requires action',
      filterKey: 'alert',
    },
  ]

  const handleCardClick = (filterKey) => {
    setModalStatus(filterKey)
    setIsModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="mb-4.5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`skel-card-${i}`}
            className="animate-pulse flex flex-col justify-between rounded-xl border border-line bg-panel p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 rounded bg-panel-2" />
              <div className="h-7 w-7 rounded-lg bg-panel-2" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="h-8 w-14 rounded bg-panel-2" />
              <div className="h-4 w-16 rounded-md bg-panel-2/60" />
            </div>
            <div className="h-2.5 w-24 rounded bg-panel-2/50" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="mb-4.5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            onClick={() => handleCardClick(c.filterKey)}
            role="button"
            tabIndex={0}
            title={`Click to view ${c.label} table`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleCardClick(c.filterKey)
              }
            }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-line bg-panel p-4 transition-all duration-200 hover:border-accent/40 hover:bg-panel-2/90 active:scale-[0.98] cursor-pointer select-none shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-display text-[11.5px] font-semibold text-lo group-hover:text-hi transition-colors">
                {c.pulse && (
                  <span className="relative flex h-2 w-2">
                    <span className="h-2 w-2 rounded-full bg-accent/80 animate-pulse" />
                  </span>
                )}
                <span>{c.label}</span>
              </div>
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg border border-line-soft transition-all duration-200 group-hover:scale-105 ${c.bg} ${c.color}`}
              >
                <c.icon className="h-3.5 w-3.5" strokeWidth={2} />
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div className="font-display text-[33px] tracking-tight text-hi tabular-nums">
                {c.value}
              </div>
              {c.badge && (
                <span className="rounded-md border border-accent/25 bg-accent/10 px-1.75 py-0.5 font-mono text-[9.5px] font-medium text-accent/80">
                  {c.badge}
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center justify-between font-mono text-[10.5px] text-accent/80 tabular-nums">
              <span>{c.delta}</span>
              <span className="text-dim text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                View table →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Fleet Status Vehicle Modal Popup */}
      <StatsVehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialStatus={modalStatus}
        vehicles={vehicles}
        onSelectVehicle={(id) => setSelectedVehicleId(id)}
      />
    </>
  )
}
