import { useState, useMemo, useEffect } from 'react'
import { X, Search, BatteryCharging, BatteryMedium, Zap, Thermometer, ShieldCheck, ChevronRight, TriangleAlert } from './icons'
import { STATUS_META } from '../data/statusMeta'
import { useFleet } from '../context/FleetContext'

const TIER_OPTIONS = [
  { key: 'all', label: 'All Packs', range: null },
  { key: '0-15', label: '0–15% (Critical)', range: [0, 15], color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
  { key: '15-30', label: '15–30% (Low)', range: [16, 30], color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
  { key: '30-50', label: '30–50% (Mid)', range: [31, 50], color: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10' },
  { key: '50-75', label: '50–75% (Good)', range: [51, 75], color: 'text-sky-400 border-sky-500/40 bg-sky-500/10' },
  { key: '75-100', label: '75–100% (Optimal)', range: [76, 100], color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
]

const getBattStyle = (b) => {
  if (b > 50) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
  if (b > 20) return 'text-amber-400 bg-amber-500/10 border-amber-500/25'
  return 'text-rose-400 bg-rose-500/10 border-rose-500/25'
}

export default function BatteryVehicleModal({
  isOpen,
  onClose,
  initialTier = 'all',
  vehicles = [],
  onSelectVehicle,
}) {
  const { selectedVehicleId } = useFleet()
  const [selectedTier, setSelectedTier] = useState(initialTier)
  const [search, setSearch] = useState('')

  // Sync initial tier when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTier(initialTier || 'all')
      setSearch('')
    }
  }, [isOpen, initialTier])

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

  // Filter vehicles by tier and search query
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const batt = Number(v.battery) || 0

      // Tier check
      let matchesTier = true
      if (selectedTier === '0-15') matchesTier = batt <= 15
      else if (selectedTier === '15-30') matchesTier = batt > 15 && batt <= 30
      else if (selectedTier === '30-50') matchesTier = batt > 30 && batt <= 50
      else if (selectedTier === '50-75') matchesTier = batt > 50 && batt <= 75
      else if (selectedTier === '75-100') matchesTier = batt > 75

      if (!matchesTier) return false

      // Search check
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        (v.name && v.name.toLowerCase().includes(q)) ||
        (v.plate && v.plate.toLowerCase().includes(q)) ||
        (v.model && v.model.toLowerCase().includes(q)) ||
        (v.driver && v.driver.toLowerCase().includes(q)) ||
        (v.location && v.location.toLowerCase().includes(q)) ||
        (v.batteryChemistry && v.batteryChemistry.toLowerCase().includes(q))
      )
    })
  }, [vehicles, selectedTier, search])

  // Counts for each tier
  const tierCounts = useMemo(() => {
    const counts = {
      all: vehicles.length,
      '0-15': 0,
      '15-30': 0,
      '30-50': 0,
      '50-75': 0,
      '75-100': 0,
    }

    vehicles.forEach((v) => {
      const b = Number(v.battery) || 0
      if (b <= 15) counts['0-15']++
      else if (b <= 30) counts['15-30']++
      else if (b <= 50) counts['30-50']++
      else if (b <= 75) counts['50-75']++
      else counts['75-100']++
    })

    return counts
  }, [vehicles])

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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-line-soft bg-panel text-accent shadow-xs">
              <BatteryCharging className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base font-bold text-hi">
                  Battery Telemetry & Fleet Registry
                </h2>
                <span className="rounded-full border border-line bg-panel-2 px-2.5 py-0.5 font-mono text-xs text-dim">
                  {filteredVehicles.length} of {vehicles.length} Vehicles
                </span>
              </div>
              <p className="text-xs text-dim">
                Real-time pack state of charge (SoC), health (SoH), temperature & capacity diagnostics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-panel-2 text-lo hover:bg-hover hover:text-hi transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Filter Toolbar: Tier Chips + Search Input */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line-soft bg-panel px-5 py-3 shrink-0">
          {/* Tier Pills */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {TIER_OPTIONS.map((t) => {
              const active = selectedTier === t.key
              const count = tierCounts[t.key] ?? 0
              return (
                <button
                  key={t.key}
                  onClick={() => setSelectedTier(t.key)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                    active
                      ? 'border-accent bg-accent/15 text-accent font-semibold shadow-xs'
                      : 'border-line bg-panel-2/70 text-lo hover:border-line-soft hover:bg-hover hover:text-hi'
                  }`}
                >
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
              placeholder="Search vehicle, plate, driver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-line bg-panel-2 pl-8.5 pr-3 py-1.5 text-xs text-hi placeholder:text-dim outline-none focus:border-accent/60 transition-colors"
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-[780px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line-soft bg-panel-2/50 text-[10.5px] font-bold uppercase tracking-wider text-dim">
                <th className="sticky top-0 z-10 bg-panel-2 px-4 py-2.5">Vehicle</th>
                <th className="sticky top-0 z-10 bg-panel-2 px-3 py-2.5">Status</th>
                <th className="sticky top-0 z-10 bg-panel-2 px-4 py-2.5">Battery SoC</th>
                <th className="sticky top-0 z-10 bg-panel-2 px-3 py-2.5">Pack Temp</th>
                <th className="sticky top-0 z-10 bg-panel-2 px-3 py-2.5">Health (SoH)</th>
                <th className="sticky top-0 z-10 bg-panel-2 px-3 py-2.5">Capacity / Chemistry</th>
                <th className="sticky top-0 z-10 bg-panel-2 px-3 py-2.5">Current Driver</th>
                <th className="sticky top-0 z-10 bg-panel-2 px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft/60">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-dim">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <BatteryCharging className="h-10 w-10 text-dim/50" strokeWidth={1.5} />
                      <div className="font-display text-sm font-semibold text-hi">
                        No vehicles found
                      </div>
                      <div className="text-xs text-dim">
                        No vehicles match the selected battery range or search query.
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

                  const isCritical = batt <= 20 || (Number(v.batteryTempC) || 0) >= 42
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
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-semibold text-xs text-hi group-hover:text-accent transition-colors">
                              {v.name}
                            </div>
                            <div className="font-mono text-[11px] text-dim">{v.plate}</div>
                          </div>
                          {isCritical && (
                            <span title="Action recommended" className="flex items-center text-rose-400">
                              <TriangleAlert className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. Status */}
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full py-0.5 pl-1.5 pr-2.5 text-[10.5px] font-semibold capitalize ${meta.pill}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                          {meta.label}
                        </span>
                      </td>

                      {/* 3. Battery SoC */}
                      <td className="px-4 py-3">
                        <div
                          className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums shadow-xs ${getBattStyle(
                            batt
                          )}`}
                        >
                          <BatteryMedium className="h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />
                          <span>{batt}%</span>
                        </div>
                        <div className="mt-0.5 font-mono text-[10px] text-dim">
                          {v.voltageV || '—'}V · {v.currentA || '0'}A
                        </div>
                      </td>

                      {/* 4. Pack Temp */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1 font-mono text-xs">
                          <Thermometer
                            className={`h-3.5 w-3.5 ${
                              (v.batteryTempC || 0) >= 42
                                ? 'text-rose-400'
                                : (v.batteryTempC || 0) >= 36
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          />
                          <span
                            className={
                              (v.batteryTempC || 0) >= 42
                                ? 'font-bold text-rose-400'
                                : 'text-hi'
                            }
                          >
                            {v.batteryTempC || 30}°C
                          </span>
                        </div>
                      </td>

                      {/* 5. Health (SoH) */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1 font-mono text-xs text-hi">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                          <span>{v.health || 85}%</span>
                        </div>
                      </td>

                      {/* 6. Capacity / Chemistry */}
                      <td className="px-3 py-3">
                        <div className="font-mono text-xs text-hi">
                          {v.batteryCapacityKwh || 40} kWh
                        </div>
                        <div className="font-mono text-[10.5px] text-dim">
                          {v.batteryChemistry || 'LFP'} · {v.batteryType || 'Fixed'}
                        </div>
                      </td>

                      {/* 7. Current Driver */}
                      <td className="px-3 py-3">
                        <div className="text-xs text-hi truncate max-w-[120px]">
                          {v.driver || 'Unassigned'}
                        </div>
                        <div className="text-[10.5px] text-dim truncate max-w-[120px]">
                          {v.location || '—'}
                        </div>
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
