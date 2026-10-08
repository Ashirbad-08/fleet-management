import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, Search, Truck, Wifi, BatteryMedium, TriangleAlert, ChevronRight, ExternalLink } from './icons'
import { STATUS_META } from '../data/statusMeta'
import { useFleet } from '../context/FleetContext'

const STATUS_TABS = [
  { key: 'all', label: 'All Vehicles', icon: Truck, color: 'text-accent' },
  { key: 'online', label: 'Online Now', icon: Wifi, color: 'text-green' },
  { key: 'idle', label: 'Needs Attention (Idle)', icon: BatteryMedium, color: 'text-amber' },
  { key: 'alert', label: 'Critical Alerts', icon: TriangleAlert, color: 'text-red' },
  { key: 'offline', label: 'Offline', icon: Truck, color: 'text-gray' },
]

const getBattStyle = (b) => {
  if (b > 50) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
  if (b > 20) return 'text-amber-400 bg-amber-500/10 border-amber-500/25'
  return 'text-rose-400 bg-rose-500/10 border-rose-500/25'
}

export default function StatsVehicleModal({
  isOpen,
  onClose,
  initialStatus = 'all',
  vehicles = [],
  onSelectVehicle,
}) {
  const { selectedVehicleId } = useFleet()
  const [selectedStatus, setSelectedStatus] = useState(initialStatus)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(initialStatus || 'all')
      setSearch('')
    }
  }, [isOpen, initialStatus])

  // Close on Escape key (only if vehicle drawer is not open)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !selectedVehicleId) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, selectedVehicleId])

  // Count vehicles by status
  const counts = useMemo(() => {
    return {
      all: vehicles.length,
      online: vehicles.filter((v) => (v.status || '').toLowerCase() === 'online').length,
      idle: vehicles.filter((v) => (v.status || '').toLowerCase() === 'idle').length,
      alert: vehicles.filter((v) => (v.status || '').toLowerCase() === 'alert').length,
      offline: vehicles.filter((v) => (v.status || '').toLowerCase() === 'offline').length,
    }
  }, [vehicles])

  // Filter vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const st = (v.status || '').toLowerCase()
      let matchesStatus = true
      if (selectedStatus !== 'all') {
        matchesStatus = st === selectedStatus
      }

      if (!matchesStatus) return false

      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        (v.name && v.name.toLowerCase().includes(q)) ||
        (v.plate && v.plate.toLowerCase().includes(q)) ||
        (v.model && v.model.toLowerCase().includes(q)) ||
        (v.driver && v.driver.toLowerCase().includes(q)) ||
        (v.location && v.location.toLowerCase().includes(q)) ||
        (v.type && v.type.toLowerCase().includes(q))
      )
    })
  }, [vehicles, selectedStatus, search])

  const currentTab = STATUS_TABS.find((t) => t.key === selectedStatus) || STATUS_TABS[0]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 sm:p-5 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line-soft bg-panel-2/60 px-5 py-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl border border-line-soft bg-panel shadow-xs ${currentTab.color}`}>
              <currentTab.icon className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base font-bold text-hi">
                  Fleet Roster: {currentTab.label}
                </h2>
                <span className="rounded-full border border-line bg-panel-2 px-2.5 py-0.5 font-mono text-xs text-dim">
                  {filteredVehicles.length} of {vehicles.length} Vehicles
                </span>
              </div>
              <p className="text-xs text-dim">
                Real-time operational status, speed, telemetry & driver assignments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/vehicles"
              onClick={onClose}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel-2 px-3 py-1.5 text-xs font-semibold text-lo hover:border-accent/40 hover:bg-hover hover:text-hi transition-colors cursor-pointer"
            >
              <span>Full Vehicles Page</span>
              <ExternalLink className="h-3.5 w-3.5 text-dim" />
            </Link>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-panel-2 text-lo hover:bg-hover hover:text-hi transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Filter Toolbar: Status Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line-soft bg-panel px-5 py-3 shrink-0">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {STATUS_TABS.map((t) => {
              const active = selectedStatus === t.key
              const count = counts[t.key] ?? 0
              return (
                <button
                  key={t.key}
                  onClick={() => setSelectedStatus(t.key)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                    active
                      ? 'border-accent bg-accent/15 text-accent font-semibold shadow-xs'
                      : 'border-line bg-panel-2/70 text-lo hover:border-line-soft hover:bg-hover hover:text-hi'
                  }`}
                >
                  <t.icon className={`h-3.5 w-3.5 ${active ? 'text-accent' : t.color}`} />
                  <span>{t.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 font-mono text-[10.5px] tabular-nums ${
                      active ? 'bg-accent/25 text-accent' : 'bg-panel text-dim'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dim" />
            <input
              type="text"
              placeholder="Search vehicle, driver, plate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-line bg-panel-2 pl-8.5 pr-3 py-1.5 text-xs text-hi placeholder:text-dim outline-none focus:border-accent/60 transition-colors"
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line-soft bg-panel-2/50 text-[10.5px] font-bold uppercase tracking-wider text-dim">
                <th className="sticky top-0 z-10 bg-panel-2 px-4 py-2.5">Vehicle</th>
                <th className="sticky top-0 z-10 bg-panel-2 px-3 py-2.5">Type & Model</th>
                <th className="sticky top-0 z-10 bg-panel-2 px-3 py-2.5">Status</th>
                <th className="sticky top-0 z-10 bg-panel-2 px-4 py-2.5">Battery</th>
                <th className="sticky top-0 z-10 bg-panel-2 px-3 py-2.5">Speed</th>
                <th className="sticky top-0 z-10 bg-panel-2 px-3 py-2.5">Assigned Driver</th>
                <th className="sticky top-0 z-10 bg-panel-2 px-3 py-2.5">Location</th>
                <th className="sticky top-0 z-10 bg-panel-2 px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft/60">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-dim">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Truck className="h-10 w-10 text-dim/50" strokeWidth={1.5} />
                      <div className="font-display text-sm font-semibold text-hi">
                        No vehicles found
                      </div>
                      <div className="text-xs text-dim">
                        No vehicles match the selected status filter or search term.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((v) => {
                  const batt = Number(v.battery) || 0
                  const statusKey = (v.status || '').toLowerCase()
                  const meta =
                    STATUS_META[statusKey] ||
                    STATUS_META.offline || {
                      color: 'var(--color-gray)',
                      pill: 'bg-gray/15 text-gray',
                      label: v.status || 'Offline',
                    }
                  const isSelected = selectedVehicleId === v.id

                  return (
                    <tr
                      key={v.id}
                      onClick={() => {
                        if (onSelectVehicle) onSelectVehicle(v.id)
                      }}
                      className={`group transition-colors hover:bg-hover cursor-pointer ${
                        isSelected ? 'bg-accent/15' : ''
                      }`}
                    >
                      {/* 1. Vehicle & Plate */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-xs text-hi group-hover:text-accent transition-colors">
                          {v.name}
                        </div>
                        <div className="font-mono text-[11px] text-dim">{v.plate}</div>
                      </td>

                      {/* 2. Type & Model */}
                      <td className="px-3 py-3">
                        <div className="text-xs text-hi">{v.model || '—'}</div>
                        <div className="font-mono text-[10.5px] text-dim">{v.type || '4 Wheeler'}</div>
                      </td>

                      {/* 3. Status */}
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full py-0.5 pl-1.5 pr-2.5 text-[10.5px] font-semibold capitalize ${meta.pill}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                          {meta.label}
                        </span>
                      </td>

                      {/* 4. Battery */}
                      <td className="px-4 py-3">
                        <div
                          className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums shadow-xs ${getBattStyle(
                            batt
                          )}`}
                        >
                          <BatteryMedium className="h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />
                          <span>{batt}%</span>
                        </div>
                      </td>

                      {/* 5. Speed */}
                      <td className="px-3 py-3 font-mono text-xs text-lo tabular-nums">
                        {v.speed ? `${v.speed} km/h` : '0 km/h'}
                      </td>

                      {/* 6. Driver */}
                      <td className="px-3 py-3">
                        <div className="text-xs text-hi truncate max-w-[130px]">
                          {v.driver || 'Unassigned'}
                        </div>
                        <div className="font-mono text-[10.5px] text-dim truncate max-w-[130px]">
                          {v.driverPhone || '—'}
                        </div>
                      </td>

                      {/* 7. Location */}
                      <td className="px-3 py-3">
                        <div className="text-xs text-lo truncate max-w-[140px]">
                          {v.location || '—'}
                        </div>
                        <div className="font-mono text-[10px] text-dim">{v.lastSeen || 'Recently'}</div>
                      </td>

                      {/* 8. Action */}
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (onSelectVehicle) onSelectVehicle(v.id)
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-line bg-panel-2 px-2.5 py-1 text-[11px] font-medium text-lo hover:border-accent/40 hover:bg-hover hover:text-hi transition-colors cursor-pointer"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-line-soft bg-panel-2/50 px-5 py-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-dim font-mono text-[11px]">
            <span>Showing {filteredVehicles.length} vehicles</span>
            <span>•</span>
            <span className="text-emerald-400">Click any row to open vehicle details drawer</span>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-line bg-panel px-4 py-1.5 text-xs font-semibold text-hi hover:bg-hover transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
