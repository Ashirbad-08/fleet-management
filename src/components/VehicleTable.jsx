import { useFleet } from '../context/FleetContext'
import { STATUS_META } from '../data/statusMeta'

const battColor = (b) => (b > 50 ? 'bg-green' : b > 20 ? 'bg-amber' : 'bg-red')

export default function VehicleTable({ limit }) {
  const { filteredVehicles, selectedVehicleId, setSelectedVehicleId, settings } = useFleet()

  const visibleVehicles = typeof limit === 'number' ? filteredVehicles.slice(0, limit) : filteredVehicles

  const headers = ['Vehicle', 'Type', 'Model', 'Status', 'Battery', 'Speed', 'Location', 'Last seen']

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full min-w-[840px] border-collapse">
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="sticky top-0 z-10 border-b border-line-soft bg-panel px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-dim"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredVehicles.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-12 text-center text-dim">
                <div className="flex flex-col items-center justify-center gap-3">
                  <svg className="h-12 w-12 text-dim/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677a2.056 2.056 0 00-1.58-.86H9.75" />
                  </svg>
                  <div className="flex flex-col gap-1">
                    <span className="font-display text-[14px] font-semibold text-hi">No vehicles found</span>
                    <span className="text-[11.5px] text-dim">Try adjusting your filter status or search term.</span>
                  </div>
                </div>
              </td>
            </tr>
          )}
          {visibleVehicles.map((v) => {
            const meta = STATUS_META[v.status] || STATUS_META.offline
            const selected = selectedVehicleId === v.id
            const displaySpeed = settings?.speedUnit === 'mph'
              ? `${Math.round(v.speed * 0.621371)} mph`
              : `${v.speed} km/h`

            return (
              <tr
                key={v.id}
                onClick={() => setSelectedVehicleId(v.id)}
                tabIndex={0}
                aria-label={`Vehicle ${v.name}, status ${v.status}`}
                className={`cursor-pointer transition-colors ${selected ? 'bg-accent/15' : 'hover:bg-hover'}`}
              >
                {/* 1. Vehicle */}
                <td className="border-b border-line-soft px-4 py-2.5">
                  <div className="text-[12.5px] font-semibold">{v.name}</div>
                  <div className="mt-0.5 font-mono text-[10.5px] text-dim tabular-nums">{v.plate}</div>
                </td>

                {/* 2. Type */}
                <td className="border-b border-line-soft px-4 py-2.5">
                  <span className="inline-flex items-center rounded-md border border-line bg-panel-2 px-2 py-0.5 font-mono text-[10.5px] font-medium text-hi whitespace-nowrap">
                    {v.type || '4 Wheeler'}
                  </span>
                </td>

                {/* 3. Model */}
                <td className="border-b border-line-soft px-4 py-2.5 text-[12px] text-lo">{v.model}</td>

                {/* 4. Status */}
                <td className="border-b border-line-soft px-4 py-2.5">
                  <span className={`inline-flex items-center gap-1.5 rounded-full py-0.5 pl-1.5 pr-2.5 text-[10.5px] font-semibold capitalize ${meta.pill}`}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                    {meta.label}
                  </span>
                </td>

                {/* 5. Battery */}
                <td className="border-b border-line-soft px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-11 overflow-hidden rounded-full border border-line-soft bg-panel-2">
                      <div className={`h-full rounded-full ${battColor(v.battery)}`} style={{ width: `${v.battery}%` }} />
                    </div>
                    <span className="font-mono text-[11.5px] text-lo tabular-nums">{v.battery}%</span>
                  </div>
                </td>

                {/* 6. Speed */}
                <td className="border-b border-line-soft px-4 py-2.5 font-mono text-[11.5px] text-lo tabular-nums">
                  {displaySpeed}
                </td>

                {/* 7. Location */}
                <td className="border-b border-line-soft px-4 py-2.5 text-[12px] text-lo">{v.location}</td>

                {/* 8. Last seen */}
                <td className="border-b border-line-soft px-4 py-2.5 font-mono text-[11.5px] text-dim tabular-nums">
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
