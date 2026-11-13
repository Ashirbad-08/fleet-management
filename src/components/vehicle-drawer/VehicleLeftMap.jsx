import { useState, useEffect, useMemo } from 'react'
import {
  Navigation,
  RotateCw,
  ExternalLink,
  MapPin,
  X,
  Zap,
  Gauge,
  Play,
  Pause,
  RotateCcw,
  FastForward,
} from '../icons'
import MapLeaflet from '../MapLeaflet'
import { STATUS_META } from '../../data/statusMeta'
import { generateTripRoute } from '../../utils/tripRouteGenerator'

export default function VehicleLeftMap({
  selectedVehicle,
  onClose,
  onRefresh,
  activePlaybackTrip = null,
  onStopPlayback,
}) {
  const [mapCenter, setMapCenter] = useState(() => [
    selectedVehicle?.lat || 20.5937,
    selectedVehicle?.lon || 78.9629,
  ])
  const [mapZoom, setMapZoom] = useState(14)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Generate deterministic route coordinates and telemetry profile for the playback trip
  const route = useMemo(() => {
    if (!activePlaybackTrip) return null
    return generateTripRoute(selectedVehicle, activePlaybackTrip)
  }, [selectedVehicle, activePlaybackTrip])

  // Playback Animation States
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState(1) // 1x, 2x, 4x

  // Reset to trip start whenever a new trip is chosen for playback
  useEffect(() => {
    if (activePlaybackTrip) {
      setCurrentIndex(0)
      setIsPlaying(true)
    }
  }, [activePlaybackTrip?.id, activePlaybackTrip?.tripNumber])

  // Animated Playback Loop
  useEffect(() => {
    if (!isPlaying || !route || !route.points.length) return

    // Base tick interval adjusted by playback speed multiplier
    const intervalMs = Math.max(60, Math.round(280 / playbackSpeed))
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= route.points.length - 1) {
          setIsPlaying(false) // Pause at end of route
          return prev
        }
        return prev + 1
      })
    }, intervalMs)

    return () => clearInterval(timer)
  }, [isPlaying, playbackSpeed, route])

  // Package playback payload for MapLeaflet engine
  const playbackData = useMemo(() => {
    if (!route) return null
    return {
      route,
      currentIndex,
      isPlaying,
    }
  }, [route, currentIndex, isPlaying])

  // Keep center updated when vehicle changes (only when not actively playing a trip)
  useEffect(() => {
    if (!activePlaybackTrip && selectedVehicle?.lat && selectedVehicle?.lon) {
      setMapCenter([selectedVehicle.lat, selectedVehicle.lon])
      setMapZoom(14)
    }
  }, [selectedVehicle?.id, selectedVehicle?.lat, selectedVehicle?.lon, activePlaybackTrip])

  // Fire resize/invalidateSize events when vehicle changes or map becomes visible
  // after being hidden (keep-alive pattern). Without this Leaflet tiles render blank.
  useEffect(() => {
    const fireResize = () => {
      window.dispatchEvent(new Event('resize'))
    }
    fireResize()
    const t1 = setTimeout(fireResize, 80)
    const t2 = setTimeout(fireResize, 250)
    const t3 = setTimeout(fireResize, 600)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [selectedVehicle?.id, activePlaybackTrip?.id])

  if (!selectedVehicle) return null

  const meta = STATUS_META[selectedVehicle.status] || STATUS_META.offline
  const statusColorHex = meta.color.startsWith('var')
    ? { online: '#00ff66', idle: '#f5a623', alert: '#ff5c5c', offline: '#5b6572' }[selectedVehicle.status] || '#5b6572'
    : meta.color

  const handleRecenter = () => {
    if (activePlaybackTrip && route && route.points[currentIndex]) {
      const pt = route.points[currentIndex]
      setMapCenter([pt.lat, pt.lon])
      setMapZoom((prev) => (prev === 15 ? 15.0001 : 15))
      window.dispatchEvent(new Event('resize'))
    } else if (selectedVehicle?.lat && selectedVehicle?.lon) {
      setMapCenter([selectedVehicle.lat, selectedVehicle.lon])
      setMapZoom((prev) => (prev === 14 ? 14.0001 : 14))
      window.dispatchEvent(new Event('resize'))
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh?.()
      window.dispatchEvent(new Event('resize'))
    } finally {
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }

  const handleOpenGoogleMaps = () => {
    const lat = activePlaybackTrip && route?.points[currentIndex]?.lat
      ? route.points[currentIndex].lat
      : selectedVehicle.lat
    const lon = activePlaybackTrip && route?.points[currentIndex]?.lon
      ? route.points[currentIndex].lon
      : selectedVehicle.lon

    const url = lat && lon
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedVehicle.location || selectedVehicle.name)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const signalBars = Number(selectedVehicle.signal) || 4
  const currentPoint = route?.points[currentIndex] || route?.points[0]

  return (
    <div className="relative flex h-full w-full flex-col bg-base overflow-hidden select-none">
      {/* 1. Integrated Header Controls Bar */}
      <div className="z-10 flex flex-wrap items-center justify-between gap-2 border-b border-line bg-panel/95 px-4 py-2.5 backdrop-blur-md shadow-sm shrink-0">
        {/* Left: Close Map button, Vehicle identity & Live status */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            title="Close map (keep vehicle drawer open)"
            aria-label="Close map"
            className="flex h-8 items-center gap-1.5 rounded-lg border border-line bg-panel-2 px-2.5 text-xs font-semibold text-lo hover:border-accent/40 hover:bg-hover hover:text-hi transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.2} />
            <span>Close Map</span>
          </button>

          <div className="h-5 w-px bg-line-soft shrink-0" />

          {/* Vehicle Name, Plate & Status */}
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider shrink-0"
              style={{
                backgroundColor: `${statusColorHex}18`,
                color: statusColorHex,
                border: `1px solid ${statusColorHex}35`,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: statusColorHex }}
              />
              {meta.label}
            </span>

            <span className="font-display text-[13.5px] font-bold text-hi truncate">
              {selectedVehicle.name}
            </span>

            {selectedVehicle.plate && (
              <span className="hidden md:inline-block rounded border border-line-soft bg-panel-2 px-1.5 py-0.25 font-mono text-[10.5px] font-semibold text-lo">
                {selectedVehicle.plate}
              </span>
            )}

            {/* Glowing Active Playback Badge */}
            {activePlaybackTrip && (
              <span className="flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-0.5 border border-accent/40 text-[10.5px] font-mono font-bold text-accent shadow-xs shrink-0">
                <Play className="h-2.5 w-2.5 fill-current animate-pulse" />
                <span className="truncate max-w-[150px]">Replaying {activePlaybackTrip.tripNumber}</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Telemetry chips & Map Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Metrics */}
          <div className="hidden lg:flex items-center gap-2 font-mono text-[11px]">
            <div className="flex items-center gap-1 rounded-md border border-line-soft bg-panel-2/80 px-2 py-1 text-lo">
              <Gauge className="h-3 w-3 text-sky-400" />
              <span className="font-bold text-hi">
                {activePlaybackTrip && currentPoint ? currentPoint.speed : selectedVehicle.speed || 0}
              </span>
              <span className="text-[10px] text-dim">km/h</span>
            </div>

            <div className="flex items-center gap-1 rounded-md border border-line-soft bg-panel-2/80 px-2 py-1 text-lo">
              <Zap className="h-3 w-3 text-emerald-400" />
              <span className="font-bold text-emerald-400">
                {activePlaybackTrip && currentPoint ? currentPoint.battery : selectedVehicle.battery}%
              </span>
              <span className="text-[10px] text-dim">SoC</span>
            </div>
          </div>

          {activePlaybackTrip && (
            <button
              type="button"
              data-action="stop-playback" onClick={onStopPlayback}
              title="Stop route playback and return to live tracking"
              className="flex h-8 items-center gap-1.5 rounded-lg border border-red/40 bg-red/10 px-2.5 text-xs font-bold text-red hover:bg-red/20 transition-all cursor-pointer shadow-xs"
            >
              <X className="h-3 w-3" strokeWidth={2.5} />
              <span>Exit Playback</span>
            </button>
          )}

          <div className="h-5 w-px bg-line-soft hidden lg:block shrink-0" />

          {/* Map Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleRecenter}
              title="Center map on vehicle location"
              aria-label="Center on vehicle"
              className="flex h-8 items-center gap-1 rounded-lg border border-line bg-panel-2 px-2.5 text-xs font-medium text-lo hover:border-accent/40 hover:bg-hover hover:text-accent transition-all cursor-pointer shadow-2xs"
            >
              <Navigation className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
              <span className="hidden sm:inline">Center</span>
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              title="Refresh live location & telemetry"
              aria-label="Refresh telemetry"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-panel-2 text-lo hover:border-accent/40 hover:bg-hover hover:text-accent transition-all cursor-pointer shadow-2xs"
            >
              <RotateCw
                className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-accent' : ''}`}
                strokeWidth={2}
              />
            </button>

            <button
              type="button"
              onClick={handleOpenGoogleMaps}
              title="Open location in Google Maps"
              aria-label="Open in Google Maps"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-panel-2 text-lo hover:border-emerald-500/40 hover:bg-hover hover:text-emerald-400 transition-all cursor-pointer shadow-2xs"
            >
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Full Screen Map Canvas */}
      <div className="relative min-h-0 flex-1 w-full overflow-hidden" style={{ height: 'calc(100% - 53px)' }}>
        <div className="absolute inset-0 w-full h-full">
          <MapLeaflet
            vehicles={selectedVehicle ? [selectedVehicle] : []}
            center={mapCenter}
            zoom={mapZoom}
            height="100%"
            hideLegend={true}
            playbackData={playbackData}
          />
        </div>

        {/* 3A. FLOATING ROUTE PLAYBACK CONTROLLER BAR (Visible when Route Playback is active) */}
        {activePlaybackTrip && route && currentPoint ? (
          <div className="absolute bottom-4 left-3 right-3 sm:left-6 sm:right-6 z-30 flex flex-col gap-2 rounded-2xl border border-line/90 bg-panel/95 p-3.5 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Header: Title, Route Path & Exit */}
            <div className="flex items-center justify-between gap-3 border-b border-line-soft/60 pb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="rounded bg-accent/20 px-2 py-0.5 text-[9.5px] font-mono font-bold uppercase tracking-wider text-accent border border-accent/30 shrink-0">
                  Route Playback
                </span>
                <span className="font-display text-[13px] font-bold text-hi truncate">
                  {route.trip.tripNumber}
                </span>
                <span className="hidden sm:inline text-dim text-xs font-mono truncate">
                  ({route.trip.from} → {route.trip.to})
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-[11px] text-lo tabular-nums">
                  <strong className="text-accent">{currentPoint.distanceKm}</strong> / {route.totalDistanceKm} km
                </span>
                <button
                  type="button"
                  onClick={onStopPlayback}
                  title="Close Playback"
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-line bg-panel-2 text-lo hover:bg-hover hover:text-hi transition-colors cursor-pointer"
                >
                  <X className="h-3 w-3" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Scrubber Timeline Bar */}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="font-mono text-[10px] text-dim shrink-0">0%</span>
              <input
                type="range"
                min="0"
                max={route.points.length - 1}
                value={currentIndex}
                onChange={(e) => {
                  setCurrentIndex(Number(e.target.value))
                }}
                className="w-full h-1.5 bg-panel-2 rounded-lg appearance-none cursor-pointer accent-[#00ff66]"
              />
              <span className="font-mono text-[10px] text-accent font-bold tabular-nums shrink-0">
                {currentPoint.percent}%
              </span>
            </div>

            {/* Playback Controls & Telemetrics Readout */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-line-soft/40">
              <div className="flex items-center gap-2">
                {/* Play / Pause Toggle */}
                <button
                  type="button"
                  data-action="toggle-playback-play" onClick={() => setIsPlaying((p) => !p)}
                  title={isPlaying ? 'Pause playback' : 'Resume playback'}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-black font-bold hover:bg-green active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  {isPlaying ? (
                    <Pause className="h-3.5 w-3.5 fill-current" />
                  ) : (
                    <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                  )}
                </button>

                {/* Restart from beginning */}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentIndex(0)
                    setIsPlaying(true)
                  }}
                  data-action="restart-playback" title="Restart from beginning"
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-line bg-panel-2 text-lo hover:border-line hover:bg-hover hover:text-hi active:scale-95 transition-all cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>

                {/* Speed Multiplier Pills */}
                <div className="flex items-center rounded-lg border border-line bg-panel-2 p-0.5 text-[10px] font-mono font-bold">
                  {[1, 2, 4].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      data-action="set-playback-speed" onClick={() => setPlaybackSpeed(spd)}
                      className={`rounded px-2 py-1 transition-all cursor-pointer ${
                        playbackSpeed === spd
                          ? 'bg-accent text-black shadow-2xs'
                          : 'text-lo hover:text-hi'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Live Telemetry Readout along the route */}
              <div className="flex items-center gap-2 font-mono text-[11px] tabular-nums">
                <div className="flex items-center gap-1 rounded-lg border border-line bg-panel-2 px-2.5 py-1 text-lo">
                  <Gauge className="h-3 w-3 text-sky-400" />
                  <span className="font-bold text-hi">{currentPoint.speed}</span>
                  <span className="text-[10px] text-dim">km/h</span>
                </div>

                <div className="flex items-center gap-1 rounded-lg border border-line bg-panel-2 px-2.5 py-1 text-lo">
                  <Zap className="h-3 w-3 text-emerald-400" />
                  <span className="font-bold text-emerald-400">{currentPoint.battery}%</span>
                </div>

                <div className="hidden xs:flex items-center gap-1 rounded-lg border border-line bg-panel-2 px-2.5 py-1 text-dim text-[10.5px]">
                  <span>Total: {route.duration}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 3B. Standard Floating Bottom-Left Telematics Badge (when not in playback mode) */
          <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-1.5 rounded-xl border border-line/80 bg-panel/90 p-3 backdrop-blur-md shadow-xl max-w-[280px] sm:max-w-[340px]">
            <div className="flex items-center justify-between gap-2 border-b border-line-soft/60 pb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-hi truncate">
                <MapPin className="h-3.5 w-3.5 text-accent shrink-0" strokeWidth={2.2} />
                <span className="truncate">{selectedVehicle.location || 'In Transit'}</span>
              </div>
              <span className="font-mono text-[10px] text-dim shrink-0">
                {selectedVehicle.lastSeen || 'Live'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 text-[11px] font-mono text-dim pt-0.5">
              <span className="tabular-nums truncate text-lo">
                {selectedVehicle.lat && selectedVehicle.lon
                  ? `${selectedVehicle.lat.toFixed(4)}, ${selectedVehicle.lon.toFixed(4)}`
                  : 'No GPS Fix'}
              </span>

              {/* Cellular Signal Bars */}
              <div className="flex items-center gap-1 shrink-0" title={`Signal: ${signalBars}/5`}>
                <div className="flex items-end gap-0.5 h-2.5">
                  {[1, 2, 3, 4, 5].map((bar) => (
                    <div
                      key={bar}
                      style={{ height: `${bar * 20}%` }}
                      className={`w-0.75 rounded-xs ${
                        bar <= signalBars ? 'bg-emerald-400' : 'bg-line-soft'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-hi font-bold">{signalBars}/5</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
