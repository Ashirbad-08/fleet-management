import { X, Edit2, MapPin, ChevronLeft } from '../icons'

export default function VehicleDrawerHeader({ selectedVehicle, editing, onToggleEdit, onClose }) {
  if (!selectedVehicle) return null

  const locLabel = selectedVehicle.location || selectedVehicle.city || null
  const mapsUrl =
    selectedVehicle.lat && selectedVehicle.lon
      ? `https://www.google.com/maps/search/?api=1&query=${selectedVehicle.lat},${selectedVehicle.lon}`
      : locLabel
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locLabel)}`
        : null

  return (
    <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-3 sm:px-5 sm:py-4">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Mobile-only page Back button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Back to fleet"
          title="Back"
          className="flex sm:hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-panel-2 text-lo hover:bg-hover hover:text-hi active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
        </button>

        <div className="min-w-0">
          <div className="font-display text-[15px] sm:text-[15.5px] font-bold text-hi truncate">
            {selectedVehicle.name}
          </div>
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 flex items-center gap-1 font-mono text-[10.5px] sm:text-[11px] text-dim hover:text-green transition-colors group w-fit"
              title="Open in Google Maps"
            >
              <MapPin className="h-2.5 w-2.5 shrink-0 group-hover:text-green" strokeWidth={2.5} />
              <span className="truncate max-w-[160px] sm:max-w-[200px]">
                {locLabel || `${selectedVehicle.lat.toFixed(4)}, ${selectedVehicle.lon.toFixed(4)}`}
              </span>
            </a>
          )}
          <div className="mt-0.5 font-mono text-[10.5px] sm:text-[11px] text-lo tabular-nums truncate">
            {selectedVehicle.type || '4 Wheeler'} • {selectedVehicle.plate} • {selectedVehicle.model}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        <button
          type="button"
          onClick={onToggleEdit}
          aria-label={editing ? 'Close edit form' : 'Edit vehicle telemetry and specs'}
          title={editing ? 'Cancel editing' : 'Edit vehicle'}
          className={`flex h-7 w-7 items-center justify-center rounded-md border transition-colors cursor-pointer ${
            editing
              ? 'border-accent bg-accent/20 text-accent'
              : 'border-line bg-panel-2 text-lo hover:bg-hover hover:text-accent'
          }`}
        >
          <Edit2 className="h-3 w-3" strokeWidth={2} />
        </button>

        {/* Desktop-only Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close drawer"
          title="Close"
          className="hidden sm:flex h-7 w-7 items-center justify-center rounded-md border border-line bg-panel-2 text-lo hover:bg-hover hover:text-hi transition-colors cursor-pointer"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  )
}
