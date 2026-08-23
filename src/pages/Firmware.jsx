import Topbar from '../components/Topbar'
import { useFleet } from '../context/FleetContext'

export default function Firmware() {
  const { vehicles, sendDeviceCommand, updatingVehicles } = useFleet()
  const versions = [...new Set(vehicles.map((v) => v.firmware))].sort().reverse()
  const updatingList = vehicles.filter((v) => updatingVehicles[v.id] !== undefined)

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <Topbar title="Firmware" subtitle="Manage and roll out device firmware versions" />

      <div className="flex-1 overflow-y-auto px-4 pb-24 py-5 sm:px-6 md:pb-5">
        <div className="flex flex-col gap-3">
          {updatingList.length > 0 && (
            <div className="rounded-xl border border-line bg-panel p-4.5 space-y-3 mb-1">
              <div className="font-display text-[14px] font-semibold text-hi">Active Updates</div>
              <div className="divide-y divide-line-soft">
                {updatingList.map((v) => (
                  <div key={v.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between text-[12.5px] font-medium text-hi mb-1">
                        <span>{v.name} ({v.deviceId})</span>
                        <span>{updatingVehicles[v.id]}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full border border-line-soft bg-panel-2">
                        <div
                          className="h-full rounded-full bg-accent transition-all duration-300"
                          style={{ width: `${updatingVehicles[v.id]}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {versions.map((version) => {
            const onVersion = vehicles.filter((v) => v.firmware === version)
            const isLatest = version === versions[0]
            return (
              <div key={version} className="rounded-xl border border-line bg-panel p-4.5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-display text-[14.5px] font-semibold">Firmware v{version}</div>
                    <div className="mt-0.5 text-[11.5px] text-dim">{onVersion.length} device(s) on this version</div>
                  </div>
                  {isLatest ? (
                    <span className="rounded-full bg-green/15 px-2.5 py-1 text-[10.5px] font-semibold text-green">
                      Latest
                    </span>
                  ) : (
                    <button
                      onClick={() => onVersion.forEach((v) => sendDeviceCommand(v, 'firmware'))}
                      className="rounded-lg bg-accent/15 px-3 py-1.5 text-[11.5px] font-semibold text-accent hover:bg-accent/25"
                    >
                      Push update to all
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
