import { useEffect } from 'react'
import { RotateCw, X } from '../icons'
import MapLeaflet from '../MapLeaflet'

export default function VehicleFullscreenMap({
  open,
  selectedVehicle,
  mapKey,
  onRefreshMap,
  onClose,
}) {
  // Handle Escape key to close fullscreen map first
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation()
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [open, onClose])

  if (!open || !selectedVehicle) return null

  return (
    <div className="fixed inset-0 z-[140] flex bg-base/95 p-2 sm:p-4 backdrop-blur-md xl:inset-y-0 xl:left-0 xl:right-[462px] xl:z-[140]">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-line bg-panel shadow-2xl">
        <div className="flex items-center justify-between border-b border-line-soft bg-panel-2/60 px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span className="font-display text-[14px] font-bold text-hi">Live Location Map</span>
            </div>
            <div className="mt-0.5 truncate font-mono text-[10.5px] text-lo">
              {selectedVehicle.name} - {selectedVehicle.deviceId} -{' '}
              {selectedVehicle.lat
                ? `${selectedVehicle.lat.toFixed(4)}, ${selectedVehicle.lon.toFixed(4)}`
                : 'No GPS Fix'}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onRefreshMap}
              title="Refresh map"
              aria-label="Refresh full map"
              className="flex h-7.5 w-7.5 items-center justify-center rounded-md border border-line bg-panel text-lo hover:bg-hover hover:text-accent transition-colors cursor-pointer"
            >
              <RotateCw className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close full map"
              aria-label="Close full screen vehicle map"
              className="flex h-7.5 w-7.5 items-center justify-center rounded-md border border-line bg-panel text-lo hover:bg-hover hover:text-hi transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.2} />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1">
          <MapLeaflet
            key={`full-${mapKey}`}
            vehicles={[selectedVehicle]}
            center={[selectedVehicle.lat || 20.5937, selectedVehicle.lon || 78.9629]}
            zoom={14}
            height="100%"
            hideLegend
          />
        </div>
      </div>
    </div>
  )
}
