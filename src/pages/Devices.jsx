import { useState, useEffect } from 'react'
import Topbar from '../components/Topbar'
import { useFleet } from '../context/FleetContext'
import { STATUS_META } from '../data/statusMeta'

export default function Devices() {
  const { vehicles, setSelectedVehicleId } = useFleet()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 240)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex min-h-0 flex-1 flex-col md:overflow-hidden">
      <Topbar title="Devices" subtitle="IoT hardware installed across the fleet" />

      <div className="flex-1 overflow-y-auto px-4 pb-24 py-5 sm:px-6 md:pb-5">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`skel-dev-${i}`}
                className="animate-pulse rounded-xl border border-line bg-panel p-4 space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <div className="h-3 w-20 rounded bg-panel-2" />
                  <div className="h-4.5 w-16 rounded-full bg-panel-2" />
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="h-4.5 w-32 rounded bg-panel-2" />
                  <div className="h-3 w-24 rounded bg-panel-2/60" />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-line-soft/60">
                  <div className="h-3 w-18 rounded bg-panel-2" />
                  <div className="h-3 w-16 rounded bg-panel-2" />
                </div>
              </div>
            ))
          ) : (
            vehicles.map((v) => {
            const meta = STATUS_META[v.status]
            return (
              <button
                key={v.deviceId}
                onClick={() => setSelectedVehicleId(v.id)}
                className="rounded-xl border border-line bg-panel p-4 text-left hover:border-[#333B47] hover:bg-hover"
              >
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[12px] text-lo">{v.deviceId}</div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full py-0.5 pl-1.5 pr-2.5 text-[10px] font-semibold ${meta.pill}`}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                    {meta.label}
                  </span>
                </div>
                <div className="mt-2.5 font-display text-[14.5px] font-semibold">{v.name}</div>
                <div className="mt-0.5 text-[11.5px] text-dim">Firmware v{v.firmware}</div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-lo">
                  <span>Battery {v.battery}%</span>
                  <span>{v.signal}/4 signal</span>
                </div>
              </button>
            )
          }))}
        </div>
      </div>
    </div>
  )
}
