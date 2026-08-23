import Topbar from '../components/Topbar'
import { useFleet } from '../context/FleetContext'
import { STATUS_META } from '../data/statusMeta'

export default function Devices() {
  const { vehicles, setSelectedVehicleId } = useFleet()

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <Topbar title="Devices" subtitle="IoT hardware installed across the fleet" />

      <div className="flex-1 overflow-y-auto px-4 pb-24 py-5 sm:px-6 md:pb-5">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((v) => {
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
          })}
        </div>
      </div>
    </div>
  )
}
