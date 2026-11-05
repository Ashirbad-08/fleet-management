import { X, MapPin, ChevronLeft, Map } from '../icons'

export default function VehicleDrawerHeader({
  selectedVehicle,
  editing,
  onToggleEdit,
  onClose,
  showMap,
  onToggleMap,
}) {
  if (!selectedVehicle) return null

  const locLabel = selectedVehicle.location || selectedVehicle.city || null
  const mapsUrl =
    selectedVehicle.lat && selectedVehicle.lon
      ? `https://www.google.com/maps/search/?api=1&query=${selectedVehicle.lat},${selectedVehicle.lon}`
      : locLabel
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locLabel)}`
        : null

  return (
    <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-3 sm:px-5 sm:py-3.5">
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
        {/* Toggle Left Map View button */}
        {onToggleMap && (
          <button
            type="button"
            onClick={onToggleMap}
            aria-label={showMap ? 'Close map pane' : 'Open map pane'}
            title={showMap ? 'Close map (view drawer only)' : 'Show map on left side'}
            className={`flex h-7 items-center gap-1.5 px-2.5 rounded-md border text-[11px] font-semibold transition-all cursor-pointer ${
              showMap
                ? 'border-accent/40 bg-accent/15 text-accent shadow-xs'
                : 'border-line bg-panel-2 text-lo hover:border-line hover:bg-hover hover:text-hi'
            }`}
          >
            <Map className="h-3 w-3" strokeWidth={2.2} />
            <span className="hidden xs:inline">{showMap ? 'Close Map' : 'Open Map'}</span>
          </button>
        )}

        {/* Desktop-only Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close vehicle drawer"
          title="Close all"
          className="hidden sm:flex h-7 w-7 items-center justify-center rounded-md border border-line bg-panel-2 text-lo hover:bg-hover hover:text-hi transition-colors cursor-pointer"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  )
}
