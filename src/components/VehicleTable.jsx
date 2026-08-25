import { useFleet } from '../context/FleetContext'
import { STATUS_META } from '../data/statusMeta'

const battColor = (b) => (b > 50 ? 'bg-green' : b > 20 ? 'bg-amber' : 'bg-red')

export default function VehicleTable({ limit }) {
  const { filteredVehicles, selectedVehicleId, setSelectedVehicleId, settings } = useFleet()
  const visibleVehicles = typeof limit === 'number' ? filteredVehicles.slice(0, limit) : filteredVehicles

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full min-w-[1400px] border-collapse">
        <thead>
          <tr>
            {['Vehicle', 'Type', 'Model', 'Driver', 'Status', 'Device ID', 'Firmware', 'Battery', 'Health', 'Signal', 'Speed', 'Range', 'Location', 'Coordinates', 'Last seen'].map(
              (h) => (
                <th
                  key={h}
                  className="sticky top-0 z-10 border-b border-line-soft bg-panel px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-dim"
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {filteredVehicles.length === 0 && (
            <tr>
              <td colSpan={15} className="px-4 py-8 text-center text-dim">
                No vehicles match this view.
              </td>
            </tr>
          )}
          {visibleVehicles.map((v) => {
            const meta = STATUS_META[v.status]
            const selected = selectedVehicleId === v.id
            const displaySpeed = settings?.speedUnit === 'mph'
              ? `${Math.round(v.speed * 0.621371)} mph`
              : `${v.speed} km/h`
            const displayRange = settings?.distanceUnit === 'miles'
              ? `${Math.round(v.rangeKm * 0.621371)} mi`
              : `${v.rangeKm} km`
            return (
              <tr
                key={v.id}
                onClick={() => setSelectedVehicleId(v.id)}
                className={`cursor-pointer transition-colors ${selected ? 'bg-accent/15' : 'hover:bg-hover'}`}
              >
                <td className="border-b border-line-soft px-4 py-2.5">
                  <div className="text-[12.5px] font-semibold">{v.name}</div>
                  <div className="mt-0.5 font-mono text-[10.5px] text-dim">{v.plate}</div>
                </td>
                <td className="border-b border-line-soft px-4 py-2.5">
                  <span className="inline-flex items-center rounded-md border border-line bg-panel-2 px-2 py-0.5 font-mono text-[10.5px] font-medium text-hi whitespace-nowrap">
                    {v.type || '4 Wheeler'}
                  </span>
                </td>
                <td className="border-b border-line-soft px-4 py-2.5 text-[12px] text-lo">{v.model}</td>
                <td className="border-b border-line-soft px-4 py-2.5 text-[12px] text-lo">{v.driver}</td>
                <td className="border-b border-line-soft px-4 py-2.5">
                  <span className={`inline-flex items-center gap-1.5 rounded-full py-0.5 pl-1.5 pr-2.5 text-[10.5px] font-semibold capitalize ${meta.pill}`}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                    {meta.label}
                  </span>
                </td>
                <td className="border-b border-line-soft px-4 py-2.5 font-mono text-[11.5px] text-lo">
                  {v.deviceId}
                </td>
                <td className="border-b border-line-soft px-4 py-2.5 font-mono text-[11.5px] text-lo">
                  {v.firmware}
                </td>
                <td className="border-b border-line-soft px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-11 overflow-hidden rounded-full border border-line-soft bg-panel-2">
                      <div className={`h-full rounded-full ${battColor(v.battery)}`} style={{ width: `${v.battery}%` }} />
                    </div>
                    <span className="font-mono text-[11.5px] text-lo">{v.battery}%</span>
                  </div>
                </td>
                <td className="border-b border-line-soft px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-11 overflow-hidden rounded-full border border-line-soft bg-panel-2">
                      <div className={`h-full rounded-full ${battColor(v.health)}`} style={{ width: `${v.health}%` }} />
                    </div>
                    <span className="font-mono text-[11.5px] text-lo">{v.health}%</span>
                  </div>
                </td>
                <td className="border-b border-line-soft px-4 py-2.5">
                  <div className="flex h-3 items-end gap-0.5">
                    {[1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className={`w-0.75 rounded-[1px] ${i <= v.signal ? 'bg-accent' : 'bg-line'}`}
                        style={{ height: `${i * 3}px` }}
                      />
                    ))}
                  </div>
                </td>
                <td className="border-b border-line-soft px-4 py-2.5 font-mono text-[11.5px] text-lo">
                  {displaySpeed}
                </td>
                <td className="border-b border-line-soft px-4 py-2.5 font-mono text-[11.5px] text-lo">
                  {displayRange}
                </td>
                <td className="border-b border-line-soft px-4 py-2.5 text-[12px] text-lo">{v.location}</td>
                <td className="border-b border-line-soft px-4 py-2.5 font-mono text-[10.5px] text-dim">
                  {v.lat.toFixed(4)}, {v.lon.toFixed(4)}
                </td>
                <td className="border-b border-line-soft px-4 py-2.5 font-mono text-[11.5px] text-dim">
                  {v.lastSeen}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
