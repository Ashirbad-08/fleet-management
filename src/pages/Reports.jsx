import { useState, useMemo } from 'react'
import Topbar from '../components/Topbar'
import { useFleet } from '../context/FleetContext'
import { seedTrips } from '../data/tripsData'
import {
  FileText,
  Download,
  Zap,
  Route,
  Clock,
  TrendingUp,
  Truck,
  Filter,
  ChevronDown,
  X,
} from '../components/icons'

// ─── Helpers ────────────────────────────────────────────────────────────────
const parseKm = (s) => parseFloat((s || '0').replace(/[^0-9.]/g, '')) || 0
const parseMin = (s) => {
  if (!s) return 0
  const h = s.match(/(\d+)\s*h/)
  const m = s.match(/(\d+)\s*min/)
  return (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0)
}
const parseKwh = (s) => parseFloat((s || '0').replace(/[^0-9.]/g, '')) || 0
const parseEff = (s) => parseFloat((s || '0').replace(/[^0-9.]/g, '')) || 0

function toCSV(rows, columns) {
  const header = columns.map((c) => c.label).join(',')
  const lines = rows.map((r) =>
    columns.map((c) => `"${(r[c.key] ?? '').toString().replace(/"/g, '""')}"`).join(',')
  )
  return [header, ...lines].join('\n')
}

function downloadCSV(filename, csvStr) {
  const blob = new Blob([csvStr], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Report definitions ──────────────────────────────────────────────────────
const REPORT_TYPES = [
  {
    id: 'trip_summary',
    label: 'Trip Summary Report',
    icon: Route,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    description: 'Detailed log of all individual trips with vehicle name, plate, driver, distance, battery and efficiency.',
    columns: [
      { key: 'tripNumber', label: 'Trip #' },
      { key: 'vehicleName', label: 'Vehicle Name' },
      { key: 'plate', label: 'License Plate' },
      { key: 'driver', label: 'Driver' },
      { key: 'date', label: 'Date' },
      { key: 'time', label: 'Time' },
      { key: 'from', label: 'Origin' },
      { key: 'to', label: 'Destination' },
      { key: 'distance', label: 'Distance' },
      { key: 'duration', label: 'Duration' },
      { key: 'avgSpeed', label: 'Avg Speed' },
      { key: 'batteryUsed', label: 'Battery %' },
      { key: 'batteryUsedKwh', label: 'Energy (kWh)' },
      { key: 'efficiency', label: 'Efficiency' },
      { key: 'idleTime', label: 'Idle Time' },
      { key: 'status', label: 'Status' },
    ],
  },
  {
    id: 'mileage',
    label: 'Mileage Report',
    icon: Route,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    description: 'Total distance driven aggregated by vehicle and driver across the selected period.',
    columns: [
      { key: 'vehicleName', label: 'Vehicle Name' },
      { key: 'plate', label: 'License Plate' },
      { key: 'driver', label: 'Assigned Driver' },
      { key: 'trips', label: 'Completed Trips' },
      { key: 'totalKm', label: 'Total Distance (km)' },
      { key: 'avgKmPerTrip', label: 'Avg km / Trip' },
      { key: 'longestTrip', label: 'Longest Single Trip' },
    ],
  },
  {
    id: 'idle_time',
    label: 'Idle Time Report',
    icon: Clock,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    description: 'Engine idle minutes and idle ratios per trip and vehicle to monitor driver behavior.',
    columns: [
      { key: 'tripNumber', label: 'Trip #' },
      { key: 'vehicleName', label: 'Vehicle Name' },
      { key: 'plate', label: 'License Plate' },
      { key: 'driver', label: 'Driver' },
      { key: 'date', label: 'Date' },
      { key: 'idleTime', label: 'Idle Duration' },
      { key: 'duration', label: 'Total Duration' },
      { key: 'distance', label: 'Distance' },
      { key: 'idlePct', label: 'Idle Ratio %' },
    ],
  },
  {
    id: 'energy',
    label: 'Energy & Battery Report',
    icon: Zap,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    description: 'Electric energy consumption in kWh and discharge rate for each vehicle trip.',
    columns: [
      { key: 'tripNumber', label: 'Trip #' },
      { key: 'vehicleName', label: 'Vehicle Name' },
      { key: 'plate', label: 'License Plate' },
      { key: 'driver', label: 'Driver' },
      { key: 'date', label: 'Date' },
      { key: 'batteryUsedKwh', label: 'Energy Consumed (kWh)' },
      { key: 'efficiency', label: 'Efficiency (kWh/km)' },
      { key: 'distance', label: 'Trip Distance' },
      { key: 'startBattery', label: 'Start SOC %' },
      { key: 'endBattery', label: 'End SOC %' },
    ],
  },
  {
    id: 'vehicle_utilization',
    label: 'Vehicle Utilisation Report',
    icon: Truck,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    description: 'Fleet-wide active operating hours, idle time, and energy per vehicle asset.',
    columns: [
      { key: 'vehicleName', label: 'Vehicle Name' },
      { key: 'plate', label: 'License Plate' },
      { key: 'model', label: 'Vehicle Model' },
      { key: 'driver', label: 'Driver' },
      { key: 'trips', label: 'Trips' },
      { key: 'totalKm', label: 'Total Distance' },
      { key: 'totalMin', label: 'Operating Time' },
      { key: 'totalIdleMin', label: 'Idle Time' },
      { key: 'totalKwh', label: 'Energy (kWh)' },
    ],
  },
]

const DATE_PRESETS = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'all', label: 'All Time' },
]

// ─── KPI strip ───────────────────────────────────────────────────────────────
function KPICard({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-panel p-3.5">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color} bg-opacity-10`}>
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <div className="font-mono text-base sm:text-lg font-bold tabular-nums text-hi leading-none truncate">
          {value}
        </div>
        <div className="mt-1 truncate text-xs text-dim">{label}</div>
      </div>
    </div>
  )
}

// ─── Table preview with Vehicle Highlights ──────────────────────────────────
function ReportTable({ columns, rows }) {
  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-dim">
        <FileText className="h-8 w-8 opacity-30" />
        <p className="text-sm">No records match the selected vehicle and date filter.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max text-xs">
        <thead>
          <tr className="border-b border-line bg-panel-2/50">
            {columns.map((c) => (
              <th
                key={c.key}
                className="whitespace-nowrap px-3.5 py-2.5 text-left font-semibold text-dim uppercase tracking-wider text-[10px]"
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line/40 font-mono">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-hover/50 transition-colors">
              {columns.map((c) => {
                const val = r[c.key] ?? '—'

                // Highlight vehicle name
                if (c.key === 'vehicleName') {
                  return (
                    <td key={c.key} className="whitespace-nowrap px-3.5 py-2.5">
                      <div className="flex items-center gap-1.5 font-sans font-bold text-hi">
                        <Truck className="h-3.5 w-3.5 text-accent shrink-0" />
                        <span>{val}</span>
                      </div>
                    </td>
                  )
                }

                // Highlight license plate
                if (c.key === 'plate') {
                  return (
                    <td key={c.key} className="whitespace-nowrap px-3.5 py-2.5">
                      <span className="rounded bg-panel-2 border border-line-soft px-1.5 py-0.5 text-[10.5px] font-mono text-lo font-semibold">
                        {val}
                      </span>
                    </td>
                  )
                }

                // Status pill
                if (c.key === 'status') {
                  return (
                    <td key={c.key} className="whitespace-nowrap px-3.5 py-2.5">
                      <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-sans font-bold text-emerald-400">
                        {val}
                      </span>
                    </td>
                  )
                }

                return (
                  <td key={c.key} className="whitespace-nowrap px-3.5 py-2.5 text-hi/80">
                    {val}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Build report rows per type ──────────────────────────────────────────────
function buildRows(typeId, filteredTrips, vehicles) {
  if (typeId === 'trip_summary') {
    return filteredTrips.map((t) => ({
      ...t,
      startBattery: t.startBattery + '%',
      endBattery: t.endBattery + '%',
    }))
  }

  if (typeId === 'idle_time') {
    return filteredTrips.map((t) => {
      const idleMin = parseMin(t.idleTime)
      const durMin = parseMin(t.duration)
      const idlePct = durMin > 0 ? ((idleMin / durMin) * 100).toFixed(0) + '%' : '0%'
      return { ...t, idlePct }
    })
  }

  if (typeId === 'energy') {
    return filteredTrips.map((t) => ({
      ...t,
      startBattery: t.startBattery + '%',
      endBattery: t.endBattery + '%',
    }))
  }

  if (typeId === 'mileage') {
    // Group by vehicleId + driver
    const byVehicleDriver = {}
    filteredTrips.forEach((t) => {
      const key = `${t.vehicleId || 'V'}_${t.driver || 'D'}`
      if (!byVehicleDriver[key]) {
        byVehicleDriver[key] = {
          vehicleName: t.vehicleName || 'Vehicle',
          plate: t.plate || '—',
          driver: t.driver || 'Unknown',
          trips: 0,
          totalKm: 0,
          kms: [],
        }
      }
      const km = parseKm(t.distance)
      byVehicleDriver[key].trips++
      byVehicleDriver[key].totalKm += km
      byVehicleDriver[key].kms.push(km)
    })
    return Object.values(byVehicleDriver).map((d) => ({
      vehicleName: d.vehicleName,
      plate: d.plate,
      driver: d.driver,
      trips: d.trips,
      totalKm: d.totalKm.toFixed(1) + ' km',
      avgKmPerTrip: (d.totalKm / d.trips).toFixed(1) + ' km',
      longestTrip: Math.max(...d.kms).toFixed(1) + ' km',
    }))
  }

  if (typeId === 'vehicle_utilization') {
    // Group by vehicle
    const byVeh = {}
    filteredTrips.forEach((t) => {
      const key = t.vehicleId || t.vehicleName || 'V-102'
      if (!byVeh[key]) {
        const vMatch = vehicles.find((v) => v.id === key)
        byVeh[key] = {
          vehicleName: t.vehicleName || vMatch?.name || 'Vehicle',
          plate: t.plate || vMatch?.plate || '—',
          model: vMatch?.model || 'Commercial EV',
          driver: t.driver || vMatch?.driver || 'Unassigned',
          trips: 0,
          totalKm: 0,
          totalMin: 0,
          totalIdleMin: 0,
          totalKwh: 0,
        }
      }
      byVeh[key].trips++
      byVeh[key].totalKm += parseKm(t.distance)
      byVeh[key].totalMin += parseMin(t.duration)
      byVeh[key].totalIdleMin += parseMin(t.idleTime)
      byVeh[key].totalKwh += parseKwh(t.batteryUsedKwh)
    })
    return Object.values(byVeh).map((v) => ({
      ...v,
      totalKm: v.totalKm.toFixed(1) + ' km',
      totalMin: v.totalMin + ' min',
      totalIdleMin: v.totalIdleMin + ' min',
      totalKwh: v.totalKwh.toFixed(1) + ' kWh',
    }))
  }

  return []
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Reports() {
  const { vehicles } = useFleet()

  const [selectedType, setSelectedType] = useState('trip_summary')
  const [datePreset, setDatePreset] = useState('week')
  const [selectedVehicleId, setSelectedVehicleId] = useState('all') // 'all' | vehicle.id

  const reportDef = REPORT_TYPES.find((r) => r.id === selectedType)

  // Enrich trips so every trip always has vehicleName, plate, and vehicleId from fleet
  const enrichedTrips = useMemo(() => {
    return seedTrips.map((t, idx) => {
      const match = vehicles.find((v) => v.id === t.vehicleId) || vehicles[idx % Math.max(1, vehicles.length)]
      return {
        ...t,
        vehicleId: t.vehicleId || match?.id || 'V-102',
        vehicleName: t.vehicleName || match?.name || 'Hauler 07',
        plate: t.plate || match?.plate || 'MH12 AB 1234',
      }
    })
  }, [vehicles])

  // Filter trips by date preset AND selected vehicle
  const filteredTrips = useMemo(() => {
    let list = enrichedTrips

    if (datePreset !== 'all') {
      list = list.filter((t) => t.dateCategory === datePreset)
    }

    if (selectedVehicleId !== 'all') {
      list = list.filter((t) => t.vehicleId === selectedVehicleId)
    }

    return list
  }, [enrichedTrips, datePreset, selectedVehicleId])

  // Build report rows
  const reportRows = useMemo(
    () => buildRows(selectedType, filteredTrips, vehicles),
    [selectedType, filteredTrips, vehicles]
  )

  // Selected vehicle object for UI display
  const currentVehicle = useMemo(() => {
    if (selectedVehicleId === 'all') return null
    return vehicles.find((v) => v.id === selectedVehicleId)
  }, [vehicles, selectedVehicleId])

  // KPIs from filtered trips
  const kpis = useMemo(() => {
    const totalKm = filteredTrips.reduce((s, t) => s + parseKm(t.distance), 0)
    const totalKwh = filteredTrips.reduce((s, t) => s + parseKwh(t.batteryUsedKwh), 0)
    const totalIdleMin = filteredTrips.reduce((s, t) => s + parseMin(t.idleTime), 0)
    const avgEff =
      filteredTrips.length > 0
        ? filteredTrips.reduce((s, t) => s + parseEff(t.efficiency), 0) / filteredTrips.length
        : 0
    return { totalKm, totalKwh, totalIdleMin, avgEff, trips: filteredTrips.length }
  }, [filteredTrips])

  function handleDownloadCSV() {
    const csv = toCSV(reportRows, reportDef.columns)
    const dateLabel = DATE_PRESETS.find((d) => d.key === datePreset)?.label.replace(/\s/g, '_') || datePreset
    const vehLabel = currentVehicle ? currentVehicle.name.replace(/\s/g, '_') : 'All_Vehicles'
    downloadCSV(`${reportDef.id}_${vehLabel}_${dateLabel}.csv`, csv)
  }

  function handleDownloadJSON() {
    const blob = new Blob([JSON.stringify(reportRows, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const dateLabel = DATE_PRESETS.find((d) => d.key === datePreset)?.label.replace(/\s/g, '_') || datePreset
    const vehLabel = currentVehicle ? currentVehicle.name.replace(/\s/g, '_') : 'All_Vehicles'
    a.href = url
    a.download = `${reportDef.id}_${vehLabel}_${dateLabel}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Topbar title="Reports & Exports" />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ── Active Filter Badge (if single vehicle selected) ── */}
        {currentVehicle && (
          <div className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-xs text-accent">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <span>
                Filtered by single vehicle:{' '}
                <b className="text-hi">{currentVehicle.name}</b> ({currentVehicle.plate})
              </span>
            </div>
            <button
              onClick={() => setSelectedVehicleId('all')}
              className="flex items-center gap-1 rounded bg-panel px-2 py-1 text-[11px] font-semibold text-lo hover:text-hi transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
              Show All Vehicles
            </button>
          </div>
        )}

        {/* ── KPI Strip ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <KPICard
            icon={Route}
            label={currentVehicle ? `${currentVehicle.name} Trips` : 'Total Trips'}
            value={kpis.trips}
            color="bg-blue-400 text-blue-400"
          />
          <KPICard
            icon={Route}
            label="Total Distance"
            value={kpis.totalKm.toFixed(1) + ' km'}
            color="bg-green-400 text-green-400"
          />
          <KPICard
            icon={Zap}
            label="Energy Consumed"
            value={kpis.totalKwh.toFixed(1) + ' kWh'}
            color="bg-purple-400 text-purple-400"
          />
          <KPICard
            icon={Clock}
            label="Total Idle Time"
            value={kpis.totalIdleMin + ' min'}
            color="bg-yellow-400 text-yellow-400"
          />
          <KPICard
            icon={TrendingUp}
            label="Avg Efficiency"
            value={kpis.avgEff.toFixed(2) + ' kWh/km'}
            color="bg-cyan-400 text-cyan-400"
          />
        </div>

        {/* ── Controls Row (Vehicle Dropdown + Date Range + Export Buttons) ── */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1. Vehicle Selector Dropdown */}
          <div className="relative flex items-center">
            <div className="flex items-center gap-2 rounded-xl border border-line bg-panel px-3 py-1.5 shadow-2xs">
              <Truck className="h-3.5 w-3.5 text-accent shrink-0" />
              <label htmlFor="vehicle-filter" className="text-xs font-semibold text-dim">
                Vehicle:
              </label>
              <select
                id="vehicle-filter"
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-hi focus:outline-hidden cursor-pointer"
              >
                <option value="all" className="bg-panel text-hi">
                  All Vehicles ({vehicles.length})
                </option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id} className="bg-panel text-hi">
                    {v.name} — {v.plate}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Date preset pills */}
          <div className="flex items-center gap-1 rounded-xl border border-line bg-panel p-1">
            {DATE_PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => setDatePreset(p.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  datePreset === p.key ? 'bg-accent text-black font-bold' : 'text-dim hover:text-hi'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* 3. Export Buttons */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-hi hover:border-accent hover:text-accent transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </button>
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-hi hover:border-accent hover:text-accent transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              JSON
            </button>
          </div>
        </div>

        {/* ── Report Type Cards + Interactive Data Table ── */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[320px_1fr]">
          {/* Left: Report Type Picker */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-dim px-0.5 mb-2 flex items-center justify-between">
              <span>Select Report</span>
              <span className="font-mono text-[10px] text-lo">{REPORT_TYPES.length} formats</span>
            </div>
            {REPORT_TYPES.map((r) => {
              const Icon = r.icon
              const active = r.id === selectedType
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedType(r.id)}
                  className={`w-full text-left rounded-xl border p-3.5 transition-all cursor-pointer ${
                    active
                      ? 'border-accent/40 bg-accent/8 shadow-xs'
                      : 'border-line bg-panel hover:bg-hover'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${r.bg}`}
                    >
                      <Icon className={`h-4 w-4 ${r.color}`} strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`text-xs font-semibold leading-snug ${active ? 'text-accent' : 'text-hi'}`}
                      >
                        {r.label}
                      </div>
                      <div className="mt-0.5 text-xs leading-relaxed text-dim line-clamp-2">
                        {r.description}
                      </div>
                    </div>
                    {active && (
                      <span className="ml-auto mt-0.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Right: Data Table */}
          <div className="rounded-xl border border-line bg-panel overflow-hidden flex flex-col shadow-2xs">
            {/* Table header bar */}
            <div className="flex items-center justify-between border-b border-line px-4 py-3 bg-panel-2/30">
              <div>
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = reportDef.icon
                    return <Icon className={`h-4 w-4 ${reportDef.color}`} strokeWidth={2} />
                  })()}
                  <span className="text-sm font-semibold text-hi">{reportDef.label}</span>
                </div>
                <p className="mt-0.5 text-xs text-dim">
                  {currentVehicle ? (
                    <span>
                      Filtered for <b className="text-hi">{currentVehicle.name}</b> ({currentVehicle.plate})
                    </span>
                  ) : (
                    <span>All Fleet Vehicles</span>
                  )}{' '}
                  · {DATE_PRESETS.find((d) => d.key === datePreset)?.label}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-panel-2 px-2.5 py-0.5 font-mono text-xs text-dim border border-line-soft tabular-nums">
                  {reportRows.length} {reportRows.length === 1 ? 'row' : 'rows'}
                </span>
              </div>
            </div>

            {/* Table rows */}
            <div className="flex-1 overflow-auto max-h-[520px]">
              <ReportTable columns={reportDef.columns} rows={reportRows} />
            </div>

            {/* Export footer bar */}
            <div className="border-t border-line bg-panel-2/70 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-dim">
                Export includes all columns with vehicle names and license plates.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadCSV}
                  className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-black hover:bg-green transition-colors cursor-pointer shadow-2xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export CSV
                </button>
                <button
                  onClick={handleDownloadJSON}
                  className="flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-medium text-hi hover:bg-hover transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
