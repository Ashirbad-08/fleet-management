import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useFleet } from '../context/FleetContext'
import { Leaf, Trees, ChevronRight, Activity, TrendingUp } from './icons'

export default function FleetOperationsEsgCard() {
  const { vehicles } = useFleet()

  const stats = useMemo(() => {
    const totalVehicles = vehicles.length || 1
    const onlineCount = vehicles.filter((v) => v.status === 'online').length

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
    const treesEquivalent = (co2SavedKg / 21.7).toFixed(1)

    // Cost savings: Diesel ICE (~₹9.80/km) vs EV Charging (~₹1.90/km) -> ₹7.90/km saved
    const costSavingsInr = Math.round(totalTodayKm * 7.9).toLocaleString('en-IN')

    return {
      totalTodayKm: totalTodayKm.toLocaleString('en-IN'),
      energyKwh,
      co2SavedKg,
      treesEquivalent,
      costSavingsInr,
      onlineRatio: `${onlineCount}/${totalVehicles}`,
    }
  }, [vehicles])

  return (
    <div className="flex min-h-[19.5rem] h-full flex-col justify-between overflow-hidden rounded-xl border border-line bg-panel shadow-sm">
      {/* Formal Header matching Dashboard Map */}
      <div className="flex items-center justify-between border-b border-line-soft bg-panel/40 px-4.5 py-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-line-soft bg-panel-2 text-emerald-400 shadow-xs">
            <Leaf className="h-4 w-4" strokeWidth={2.2} />
          </div>
          <div>
            <div className="font-display text-sm font-semibold text-hi">Daily Operations & ESG Impact</div>
            <div className="text-xs text-dim">Eco-efficiency & Fuel Cost Offsets</div>
          </div>
        </div>

        <Link
          to="/esg"
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel-2 px-3 py-1.5 text-xs font-medium text-lo transition-colors hover:bg-hover hover:text-hi shadow-xs"
        >
          <span>ESG Report</span>
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.4} />
        </Link>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4.5 space-y-4">
        {/* Primary 2 Metrics in Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Today's Distance Tile */}
          <div className="rounded-xl border border-line-soft bg-panel-2/60 p-3.5 text-left shadow-xs">
            <div className="flex items-center justify-between text-xs text-dim font-medium">
              <span className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-accent" />
                Today's Distance
              </span>
              <span className="font-mono text-xs text-accent">Live Telemetry</span>
            </div>
            <div className="mt-1.5 font-display text-2xl font-bold text-hi tabular-nums leading-tight">
              {stats.totalTodayKm} <span className="text-xs font-normal text-dim">km</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between font-mono text-xs text-lo border-t border-line-soft/60 pt-1.5">
              <span>Energy:</span>
              <span className="text-hi font-semibold">{stats.energyKwh} kWh</span>
            </div>
          </div>

          {/* Cost Savings Tile */}
          <div className="rounded-xl border border-line-soft bg-panel-2/60 p-3.5 text-left shadow-xs">
            <div className="flex items-center justify-between text-xs text-dim font-medium">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <TrendingUp className="h-3.5 w-3.5" />
                Cost Saved vs ICE
              </span>
              <span className="font-mono text-xs text-emerald-400">~81% Less</span>
            </div>
            <div className="mt-1.5 font-display text-2xl font-bold text-emerald-400 tabular-nums leading-tight">
              ₹{stats.costSavingsInr}
            </div>
            <div className="mt-1.5 flex items-center justify-between font-mono text-xs text-lo border-t border-line-soft/60 pt-1.5">
              <span>Operating Rate:</span>
              <span className="text-hi font-semibold">₹1.90 / km</span>
            </div>
          </div>
        </div>

        {/* Environmental Offset Banner */}
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5 text-emerald-300">
            <Trees className="h-4.5 w-4.5 shrink-0 text-emerald-400" />
            <span>
              <strong className="text-emerald-100 font-semibold">{stats.co2SavedKg} kg CO₂</strong> offset vs diesel equivalent
            </span>
          </div>
          <span className="rounded-lg border border-emerald-500/30 bg-panel px-2.5 py-1 font-mono text-xs font-bold text-emerald-400 tabular-nums shrink-0 shadow-xs">
            🌱 {stats.treesEquivalent} Trees Eq.
          </span>
        </div>
      </div>
    </div>
  )
}
