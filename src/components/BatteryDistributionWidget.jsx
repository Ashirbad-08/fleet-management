import { useState, useMemo } from 'react'
import { useFleet } from '../context/FleetContext'
import { BatteryCharging, Zap, TriangleAlert, Thermometer, ShieldCheck, ChevronRight } from './icons'
import BatteryVehicleModal from './BatteryVehicleModal'

export default function BatteryDistributionWidget() {
  const { vehicles, setSelectedVehicleId } = useFleet()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTier, setModalTier] = useState('all')

  const handleOpenModal = (tierKey = 'all') => {
    setModalTier(tierKey)
    setIsModalOpen(true)
  }

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

    const avgTemp = Math.round(
      vehicles.reduce((acc, v) => acc + (Number(v.batteryTempC) || 30), 0) / totalVehicles
    )

    const avgHealth = Math.round(
      vehicles.reduce((acc, v) => acc + (Number(v.health) || 85), 0) / totalVehicles
    )

    const totalCapacityKwh = Math.round(
      vehicles.reduce((acc, v) => acc + (Number(v.batteryCapacityKwh) || 35), 0)
    )

    const criticalVehicles = vehicles.filter(
      (v) => (Number(v.battery) || 0) <= 20 || (Number(v.batteryTempC) || 0) >= 42
    )

    const buckets = [
      {
        tierKey: '0-15',
        range: '0–15%',
        count: count0_15,
        pct: pct0_15,
        label: 'Critical',
        badge: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        textColor: 'text-rose-400',
        dot: 'bg-rose-500',
        cardBorder: 'border-rose-500/25 bg-rose-500/5 hover:border-rose-500/50 hover:bg-rose-500/10',
      },
      {
        tierKey: '15-30',
        range: '15–30%',
        count: count15_30,
        pct: pct15_30,
        label: 'Low',
        badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        textColor: count15_30 > 0 ? 'text-amber-400' : 'text-lo',
        dot: 'bg-amber-500',
        cardBorder: 'border-line bg-panel-2/40 hover:border-amber-500/40 hover:bg-panel-2',
      },
      {
        tierKey: '30-50',
        range: '30–50%',
        count: count30_50,
        pct: pct30_50,
        label: 'Mid',
        badge: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
        textColor: 'text-hi',
        dot: 'bg-yellow-500',
        cardBorder: 'border-line bg-panel-2/40 hover:border-yellow-500/40 hover:bg-panel-2',
      },
      {
        tierKey: '50-75',
        range: '50–75%',
        count: count50_75,
        pct: pct50_75,
        label: 'Good',
        badge: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
        textColor: 'text-hi',
        dot: 'bg-sky-500',
        cardBorder: 'border-line bg-panel-2/40 hover:border-sky-500/40 hover:bg-panel-2',
      },
      {
        tierKey: '75-100',
        range: '75–100%',
        count: count75_100,
        pct: pct75_100,
        label: 'Optimal',
        badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        textColor: 'text-emerald-400',
        dot: 'bg-emerald-500',
        cardBorder: 'border-emerald-500/25 bg-emerald-500/5 hover:border-emerald-500/50 hover:bg-emerald-500/10',
      },
    ]

    return {
      totalPacks,
      buckets,
      avgSoC,
      avgTemp,
      avgHealth,
      totalCapacityKwh,
      criticalVehicles,
    }
  }, [vehicles])

  return (
    <>
      <div className="flex flex-col overflow-hidden rounded-xl border border-line bg-panel shadow-xs">
        {/* Minimalist Compact Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line-soft bg-panel/50 px-4 py-2.5">
          <button
            onClick={() => handleOpenModal('all')}
            className="group flex items-center gap-2 text-left cursor-pointer transition-colors"
            title="Click to view all battery packs registry"
          >
            <BatteryCharging className="h-4 w-4 text-accent transition-transform group-hover:scale-110" strokeWidth={2.2} />
            <span className="font-display text-xs font-bold text-hi group-hover:text-accent sm:text-sm transition-colors">
              Battery & Energy Telemetry
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-dim group-hover:text-lo">
              · {metrics.totalPacks} Packs Monitored
              <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
          </button>

          {/* Inline Minimal Telemetry Chips (Clickable) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenModal('all')}
              className="flex items-center gap-1 rounded-md border border-line-soft bg-panel-2 px-2 py-0.5 font-mono text-xs text-hi hover:border-accent/40 hover:bg-hover transition-colors cursor-pointer"
              title="Click to view full battery telemetry table"
            >
              <Zap className="h-3 w-3 text-accent" />
              <span className="font-bold">{metrics.avgSoC}%</span>
              <span className="text-[10.5px] text-dim">Avg SoC</span>
            </button>

            <button
              onClick={() => handleOpenModal('all')}
              className="flex items-center gap-1 rounded-md border border-line-soft bg-panel-2 px-2 py-0.5 font-mono text-xs text-hi hover:border-amber-500/40 hover:bg-hover transition-colors cursor-pointer"
              title="Click to view pack temperatures"
            >
              <Thermometer className="h-3 w-3 text-amber" />
              <span className="font-bold">{metrics.avgTemp}°C</span>
              <span className="text-[10.5px] text-dim">Temp</span>
            </button>

            <button
              onClick={() => handleOpenModal('all')}
              className="hidden sm:flex items-center gap-1 rounded-md border border-line-soft bg-panel-2 px-2 py-0.5 font-mono text-xs text-hi hover:border-emerald-500/40 hover:bg-hover transition-colors cursor-pointer"
              title="Click to view fleet battery health (SoH)"
            >
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span className="font-bold">{metrics.avgHealth}%</span>
              <span className="text-[10.5px] text-dim">SoH</span>
            </button>
          </div>
        </div>

        {/* Minimalist Clickable 5-Column Grid */}
        <div className="p-3.5 sm:p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {metrics.buckets.map((b) => (
              <button
                key={b.range}
                onClick={() => handleOpenModal(b.tierKey)}
                title={`Click to view ${b.label} (${b.range}) vehicles table`}
                className={`group flex items-center justify-between rounded-lg border p-2.5 text-left transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.98] ${b.cardBorder}`}
              >
                <div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-dim group-hover:text-hi transition-colors">
                    <span className={`h-1.5 w-1.5 rounded-full ${b.dot}`} />
                    <span>{b.range}</span>
                  </div>
                  <div className="mt-0.5 flex items-baseline gap-1.5">
                    <span className={`font-display text-xl font-bold font-mono tabular-nums ${b.textColor}`}>
                      {b.count}
                    </span>
                    <span className="font-mono text-[10.5px] text-dim">
                      ({b.pct}%)
                    </span>
                  </div>
                </div>

                <span
                  className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold transition-transform group-hover:scale-105 ${b.badge}`}
                >
                  {b.label}
                </span>
              </button>
            ))}
          </div>

          {/* Minimal Bottom Info / Alert Strip */}
          {metrics.criticalVehicles.length > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-1.5 text-xs">
              <div
                onClick={() => handleOpenModal('0-15')}
                className="flex items-center gap-1.5 text-rose-300 font-medium text-[11.5px] cursor-pointer hover:underline"
              >
                <TriangleAlert className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                <span>Low battery attention required ({metrics.criticalVehicles.length} vehicles) — click to inspect:</span>
              </div>
              <div className="flex items-center gap-1.5">
                {metrics.criticalVehicles.slice(0, 3).map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVehicleId(v.id)}
                    className="rounded border border-rose-500/30 bg-panel px-2 py-0.5 font-mono text-[11px] font-bold text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
                  >
                    {v.name} ({v.battery}%)
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px] font-mono text-dim px-1">
              <button
                onClick={() => handleOpenModal('all')}
                className="flex items-center gap-1.5 text-emerald-400 hover:underline cursor-pointer"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                All fleet battery packs within optimal operating thresholds
              </button>
              <button
                onClick={() => handleOpenModal('all')}
                className="hover:text-hi transition-colors cursor-pointer"
              >
                {metrics.totalCapacityKwh} kWh Total Storage · View Table →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Telemetry Modal Popup */}
      <BatteryVehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTier={modalTier}
        vehicles={vehicles}
        onSelectVehicle={(id) => setSelectedVehicleId(id)}
      />
    </>
  )
}
