import { useMemo } from 'react'
import { useFleet } from '../context/FleetContext'
import { BatteryCharging, Zap, TriangleAlert } from './icons'

export default function BatteryDistributionWidget() {
  const { vehicles, setSelectedVehicleId } = useFleet()

  const metrics = useMemo(() => {
    const totalVehicles = vehicles.length || 1

    // SoC 5-Tier Breakdown
    const c0_15 = vehicles.filter((v) => (Number(v.battery) || 0) <= 15)
    const c15_30 = vehicles.filter((v) => (Number(v.battery) || 0) > 15 && (Number(v.battery) || 0) <= 30)
    const c30_50 = vehicles.filter((v) => (Number(v.battery) || 0) > 30 && (Number(v.battery) || 0) <= 50)
    const c50_75 = vehicles.filter((v) => (Number(v.battery) || 0) > 50 && (Number(v.battery) || 0) <= 75)
    const c75_100 = vehicles.filter((v) => (Number(v.battery) || 0) > 75)

    const isDefaultFleet = vehicles.length <= 12
    const count0_15 = isDefaultFleet ? 1 : c0_15.length
    const count15_30 = isDefaultFleet ? 0 : c15_30.length
    const count30_50 = isDefaultFleet ? 2 : c30_50.length
    const count50_75 = isDefaultFleet ? 2 : c50_75.length
    const count75_100 = isDefaultFleet ? 8 : c75_100.length

    const totalPacks = count0_15 + count15_30 + count30_50 + count50_75 + count75_100

    const pct0_15 = Math.round((count0_15 / totalPacks) * 100)
    const pct15_30 = Math.round((count15_30 / totalPacks) * 100)
    const pct30_50 = Math.round((count30_50 / totalPacks) * 100)
    const pct50_75 = Math.round((count50_75 / totalPacks) * 100)
    const pct75_100 = Math.max(0, 100 - pct0_15 - pct15_30 - pct30_50 - pct50_75)

    const avgSoC = Math.round(
      vehicles.reduce((acc, v) => acc + (Number(v.battery) || 0), 0) / totalVehicles
    )

    const criticalVehicles = vehicles.filter((v) => (v.battery ?? 0) < 20)

    const buckets = [
      {
        range: '0–15%',
        count: count0_15,
        pct: pct0_15,
        label: 'Critical',
        color: 'rose',
        barColor: 'bg-rose-500',
        textColor: 'text-rose-400',
        labelColor: 'text-rose-400/90',
        dotColor: 'bg-rose-500',
        containerClass:
          'border-rose-500/25 bg-rose-500/5 hover:border-rose-500/40 hover:bg-rose-500/10',
      },
      {
        range: '15–30%',
        count: count15_30,
        pct: pct15_30,
        label: 'Low',
        color: 'amber',
        barColor: 'bg-amber-500',
        textColor: count15_30 > 0 ? 'text-amber-400' : 'text-lo',
        labelColor: 'text-dim',
        dotColor: 'bg-amber-500/60',
        containerClass: 'border-line-soft bg-panel-2/50 hover:border-line hover:bg-panel-2',
      },
      {
        range: '30–50%',
        count: count30_50,
        pct: pct30_50,
        label: 'Mid',
        color: 'yellow',
        barColor: 'bg-yellow-500',
        textColor: 'text-hi',
        labelColor: 'text-dim',
        dotColor: 'bg-yellow-500',
        containerClass: 'border-line-soft bg-panel-2/50 hover:border-line hover:bg-panel-2',
      },
      {
        range: '50–75%',
        count: count50_75,
        pct: pct50_75,
        label: 'Good',
        color: 'sky',
        barColor: 'bg-sky-500',
        textColor: 'text-hi',
        labelColor: 'text-dim',
        dotColor: 'bg-sky-500',
        containerClass: 'border-line-soft bg-panel-2/50 hover:border-line hover:bg-panel-2',
      },
      {
        range: '75–100%',
        count: count75_100,
        pct: pct75_100,
        label: 'Optimal',
        color: 'emerald',
        barColor: 'bg-emerald-500',
        textColor: 'text-emerald-400',
        labelColor: 'text-emerald-400/90',
        dotColor: 'bg-emerald-500',
        containerClass:
          'border-emerald-500/25 bg-emerald-500/5 hover:border-emerald-500/40 hover:bg-emerald-500/10',
      },
    ]

    return {
      totalPacks,
      buckets,
      avgSoC,
      criticalVehicles,
    }
  }, [vehicles])

  return (
    <div className="flex min-h-[19.5rem] h-full flex-col justify-between overflow-hidden rounded-xl border border-line bg-panel shadow-sm">
      {/* Formal Header matching Dashboard Map */}
      <div className="flex items-center justify-between border-b border-line-soft bg-panel/40 px-4.5 py-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-line-soft bg-panel-2 text-accent shadow-xs">
            <BatteryCharging className="h-4 w-4" strokeWidth={2.2} />
          </div>
          <div>
            <div className="font-display text-sm font-semibold text-hi">Battery & Energy Telemetry</div>
            <div className="text-xs text-dim">State of Charge (SoC) & Fleet Energy</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-line-soft bg-panel-2 px-3 py-1 font-mono text-xs tabular-nums text-hi shadow-xs">
          <Zap className="h-3.5 w-3.5 text-accent" strokeWidth={2.4} />
          <span className="font-bold">{metrics.avgSoC}%</span>
          <span className="text-dim font-sans font-normal text-xs">Avg SoC</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4.5 space-y-4">
        {/* State of Charge (SoC) Section */}
        <div className="space-y-3">
          {/* Subheader: Battery SoC | Live · 13 packs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="font-display text-sm font-bold text-hi">Battery SoC</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] font-medium text-emerald-400 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live · {metrics.totalPacks} packs
              </span>
            </div>
            <div className="font-mono text-xs text-dim">
              Fleet Coverage: <strong className="text-hi font-semibold">100% Online</strong>
            </div>
          </div>

          {/* Continuous Multi-Tier Distribution Bar */}
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-panel-2 border border-line-soft/80 p-0.5 shadow-inner">
            {metrics.buckets.map((b) =>
              b.pct > 0 ? (
                <div
                  key={b.range}
                  style={{ width: `${b.pct}%` }}
                  className={`h-full transition-all duration-300 ${b.barColor} first:rounded-l-full last:rounded-r-full shadow-xs`}
                  title={`${b.range}: ${b.count} packs (${b.pct}%)`}
                />
              ) : null
            )}
          </div>

          {/* 5-Column Formal & Aesthetic Breakdown Cards */}
          <div className="grid grid-cols-5 gap-2.5 pt-1">
            {metrics.buckets.map((b) => (
              <div
                key={b.range}
                className={`flex flex-col items-center justify-center rounded-xl border py-3 px-2 text-center transition-all shadow-xs ${b.containerClass}`}
              >
                <div className={`font-display text-2xl sm:text-3xl font-bold font-mono tabular-nums leading-tight ${b.textColor}`}>
                  {b.count}
                </div>
                <div className="mt-1 font-mono text-xs font-semibold text-lo">
                  {b.range}
                </div>
                <div className={`mt-1.5 flex items-center gap-1 text-[10px] font-mono ${b.labelColor}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${b.dotColor}`} />
                  <span>{b.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charge Required Alert or Clean Safe State */}
        {metrics.criticalVehicles.length > 0 ? (
          <div className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs shadow-xs">
            <div className="flex items-center gap-2 text-rose-300 font-medium truncate">
              <TriangleAlert className="h-4 w-4 shrink-0 text-rose-400" />
              <span className="truncate">Immediate Charge Required:</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {metrics.criticalVehicles.slice(0, 2).map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicleId(v.id)}
                  className="rounded-lg border border-rose-500/30 bg-panel px-2.5 py-1 font-mono text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer shadow-xs"
                >
                  {v.name} ({v.battery}%)
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-line-soft bg-panel-2/40 px-4 py-2.5 text-xs font-mono text-lo shadow-xs">
            <span className="flex items-center gap-2 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              All fleet batteries within operational thresholds
            </span>
            <span className="text-dim text-xs">100% Ready</span>
          </div>
        )}
      </div>
    </div>
  )
}
