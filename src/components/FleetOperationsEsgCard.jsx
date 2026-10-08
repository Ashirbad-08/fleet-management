import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useFleet } from '../context/FleetContext'
import { Leaf, ChevronRight, Activity, TrendingUp, Zap, Trees } from './icons'

export default function FleetOperationsEsgCard() {
  const { vehicles } = useFleet()

  const stats = useMemo(() => {
    const totalVehicles = vehicles.length || 1
    const onlineCount = vehicles.filter((v) => v.status === 'online').length
    const idleCount = vehicles.filter((v) => v.status === 'idle').length

    // Dynamic daily distance approximation based on active vehicles
    const baseKmPerVehicle = 95.4
    const totalTodayKm = Math.round(
      vehicles.reduce((acc, v) => {
        const factor = v.status === 'online' ? 1.2 : v.status === 'idle' ? 0.6 : 0.2
        return acc + baseKmPerVehicle * factor
      }, 0)
    )

    // Energy consumption: ~0.20 kWh per km for light commercial/urban EVs
    const energyKwh = (totalTodayKm * 0.2).toFixed(1)

    // Diesel equivalent emissions avoided: ~0.244 kg CO2 per km
    const co2SavedKg = (totalTodayKm * 0.244).toFixed(1)
    const dieselSavedLiters = (totalTodayKm / 9.5).toFixed(1)
    const treesEquivalent = (co2SavedKg / 21.7).toFixed(1)

    // Cost savings: Diesel ICE (~₹9.80/km) vs EV Charging (~₹1.90/km) -> ₹7.90/km saved
    const costSavingsInr = Math.round(totalTodayKm * 7.9).toLocaleString('en-IN')

    return {
      totalTodayKm: totalTodayKm.toLocaleString('en-IN'),
      energyKwh,
      co2SavedKg,
      dieselSavedLiters,
      treesEquivalent,
      costSavingsInr,
      onlineCount,
      idleCount,
      totalVehicles,
    }
  }, [vehicles])

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-line bg-panel shadow-xs">
      {/* Minimalist Compact Header */}
      <div className="flex items-center justify-between border-b border-line-soft bg-panel/50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Leaf className="h-4 w-4 text-emerald-400" strokeWidth={2.2} />
          <span className="font-display text-xs font-bold text-hi sm:text-sm">
            Daily Operations & ESG Impact
          </span>
          <span className="hidden sm:inline text-[11px] text-dim">
            · Eco-Efficiency & Fuel Cost Offsets
          </span>
        </div>

        <Link
          to="/esg"
          className="inline-flex items-center gap-1 font-mono text-[11px] font-medium text-lo hover:text-accent transition-colors cursor-pointer"
        >
          <span>View ESG Report</span>
          <ChevronRight className="h-3 w-3" strokeWidth={2.4} />
        </Link>
      </div>

      {/* 4 Minimalist KPI Tiles */}
      <div className="p-3.5 sm:p-4 space-y-2.5">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {/* Metric 1: Distance */}
          <div className="rounded-lg border border-line bg-panel-2/40 p-2.5 transition-colors hover:border-line">
            <div className="flex items-center justify-between text-[11px] text-dim font-medium">
              <span className="flex items-center gap-1 text-accent">
                <Activity className="h-3 w-3" />
                Distance Today
              </span>
              <span className="font-mono text-[10.5px]">{stats.onlineCount} Online</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-display text-xl font-bold text-hi tabular-nums">
                {stats.totalTodayKm}
              </span>
              <span className="text-[11px] text-dim font-mono">km</span>
            </div>
          </div>

          {/* Metric 2: Energy */}
          <div className="rounded-lg border border-line bg-panel-2/40 p-2.5 transition-colors hover:border-line">
            <div className="flex items-center justify-between text-[11px] text-dim font-medium">
              <span className="flex items-center gap-1 text-sky-400">
                <Zap className="h-3 w-3" />
                Energy Used
              </span>
              <span className="font-mono text-[10.5px]">0.20 kWh/km</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-display text-xl font-bold text-hi tabular-nums">
                {stats.energyKwh}
              </span>
              <span className="text-[11px] text-dim font-mono">kWh</span>
            </div>
          </div>

          {/* Metric 3: CO2 Offset */}
          <div className="rounded-lg border border-line bg-panel-2/40 p-2.5 transition-colors hover:border-line">
            <div className="flex items-center justify-between text-[11px] text-dim font-medium">
              <span className="flex items-center gap-1 text-emerald-400">
                <Leaf className="h-3 w-3" />
                CO₂ Offset
              </span>
              <span className="font-mono text-[10.5px] text-emerald-400">{stats.dieselSavedLiters}L saved</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-display text-xl font-bold text-emerald-400 tabular-nums">
                {stats.co2SavedKg}
              </span>
              <span className="text-[11px] text-dim font-mono">kg CO₂</span>
            </div>
          </div>

          {/* Metric 4: Cost Savings */}
          <div className="rounded-lg border border-line bg-panel-2/40 p-2.5 transition-colors hover:border-line">
            <div className="flex items-center justify-between text-[11px] text-dim font-medium">
              <span className="flex items-center gap-1 text-emerald-400">
                <TrendingUp className="h-3 w-3" />
                Fuel Cost Saved
              </span>
              <span className="font-mono text-[10.5px] text-emerald-400">~81% Less</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-display text-xl font-bold text-emerald-400 tabular-nums">
                ₹{stats.costSavingsInr}
              </span>
              <span className="text-[11px] text-dim font-mono">vs Diesel</span>
            </div>
          </div>
        </div>

        {/* Minimalist 1-Line ESG Ribbon */}
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-[11px]">
          <div className="flex items-center gap-1.5 text-emerald-300">
            <Trees className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>
              Zero-emission operations offset <strong className="text-emerald-100 font-semibold">{stats.co2SavedKg} kg CO₂</strong> today vs ICE diesel
            </span>
          </div>
          <span className="font-mono font-medium text-emerald-400 shrink-0">
            🌱 {stats.treesEquivalent} Trees Eq.
          </span>
        </div>
      </div>
    </div>
  )
}
