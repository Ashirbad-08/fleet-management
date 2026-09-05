import { useEffect, useRef, useState, useMemo } from 'react'
import { STATUS_META } from '../data/statusMeta'
import { useFleet } from '../context/FleetContext'

const DEFAULT_CENTER = [20.5937, 78.9629]

// Dynamically loads Leaflet from CDN
function useLeaflet() {
  const [ready, setReady] = useState(!!window.L)

  useEffect(() => {
    if (window.L) { setReady(true); return }

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script')
      script.id = 'leaflet-js'
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.async = true
      script.onload = () => setReady(true)
      document.body.appendChild(script)
    } else {
      const checkInterval = setInterval(() => {
        if (window.L) { setReady(true); clearInterval(checkInterval) }
      }, 100)
      return () => clearInterval(checkInterval)
    }
  }, [])

  return ready
}

function makeMarkerHtml(color) {
  return `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;width:32px;height:32px;cursor:pointer;">
      <div style="position:absolute;width:32px;height:32px;border-radius:50%;background:${color};opacity:0.22;animation:leaflet-ping 2s cubic-bezier(0,0,.2,1) infinite;"></div>
      <div style="position:relative;width:16px;height:16px;border-radius:50%;background:${color};border:2px solid #0a0c0f;box-shadow:0 0 10px ${color}70, 0 2px 8px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;">
        <div style="width:4px;height:4px;border-radius:50%;background:#ffffff;opacity:0.95;"></div>
      </div>
    </div>
  `
}

function getTileUrl(style) {
  switch (style) {
    case 'Standard Vector':
      return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    case 'Satellite Hybrid':
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    case 'Dark Mode':
    default:
      return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  }
}

export default function MapLeaflet({ vehicles = [], height = '100%', zoom = 5, center = DEFAULT_CENTER, mapStyle, geofences, hideLegend = false }) {
  const { settings, geofences: contextGeofences, setSelectedVehicleId, sendDeviceCommand } = useFleet()
  const activeMapStyle = mapStyle || settings?.mapStyle || 'Dark Mode'
  const activeGeofences = useMemo(() => geofences || contextGeofences || [], [geofences, contextGeofences])

  const leafletReady = useLeaflet()
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const fencesRef = useRef([])
  const tileLayerRef = useRef(null)
  const [active, setActive] = useState(false)
  const overlayRef = useRef(null)

  // Register window handlers for popup action buttons
  useEffect(() => {
    window.__selectMapVehicle = (id) => {
      setSelectedVehicleId(id)
    }
    window.__pingMapVehicle = (id) => {
      const v = vehicles.find((veh) => veh.id === id)
      if (v) {
        sendDeviceCommand(v, 'restart')
      }
    }
    return () => {
      delete window.__selectMapVehicle
      delete window.__pingMapVehicle
    }
  }, [setSelectedVehicleId, sendDeviceCommand, vehicles])

  // Status counts for bottom legend overlay
  const statusCounts = useMemo(() => {
    const counts = { online: 0, idle: 0, alert: 0, offline: 0 }
    vehicles.forEach((v) => {
      if (counts[v.status] !== undefined) counts[v.status]++
    })
    return counts
  }, [vehicles])

  // Init map once Leaflet is loaded
  useEffect(() => {
    if (!leafletReady || !containerRef.current) return
    if (mapRef.current) return

    const L = window.L
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
    }).setView(center, zoom)

    const tileUrl = getTileUrl(activeMapStyle)
    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 20,
    }).addTo(map)
    tileLayerRef.current = tileLayer

    // Custom zoom control top-right
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [leafletReady]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle tile layer updates
  useEffect(() => {
    if (!leafletReady || !mapRef.current) return
    const L = window.L
    const map = mapRef.current

    if (tileLayerRef.current) {
      tileLayerRef.current.remove()
    }

    const tileUrl = getTileUrl(activeMapStyle)
    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 20,
    }).addTo(map)
  }, [activeMapStyle, leafletReady])

  // Handle geofences
  useEffect(() => {
    if (!leafletReady || !mapRef.current) return
    const L = window.L
    const map = mapRef.current

    fencesRef.current.forEach((f) => f.remove())
    fencesRef.current = []

    activeGeofences.forEach((g) => {
      if (!g.lat || !g.lon) return
      const color = g.status === 'Active' ? '#00ff66' : '#f5a623'
      const circle = L.circle([g.lat, g.lon], {
        color,
        fillColor: color,
        fillOpacity: 0.1,
        weight: 1.5,
        radius: (g.radius || 1) * 1000,
      })
        .addTo(map)
        .bindTooltip(
          `<div style="font-size:11px;font-weight:600;padding:3px 8px;background:#12151b;color:#e8edf2;border:1px solid #242a33;border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.4);white-space:nowrap;">
            ${g.name} (${g.type})
          </div>`,
          { permanent: false, direction: 'top', opacity: 0.95 }
        )
      fencesRef.current.push(circle)
    })
  }, [leafletReady, activeGeofences])

  useEffect(() => {
    if (!leafletReady || !mapRef.current) return
    mapRef.current.setView(center, zoom)
  }, [center, leafletReady, zoom])

  // Update vehicle markers
  useEffect(() => {
    if (!leafletReady || !mapRef.current) return
    const L = window.L
    const map = mapRef.current

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    // Track coordinates to apply slight offset jitter for overlapping markers in depot yards
    const coordCounts = {}

    vehicles.forEach((v) => {
      if (!v.lat || !v.lon) return

      const key = `${v.lat.toFixed(3)},${v.lon.toFixed(3)}`
      const count = coordCounts[key] || 0
      coordCounts[key] = count + 1

      let lat = v.lat
      let lon = v.lon
      if (count > 0) {
        const angle = count * (Math.PI / 3)
        const radius = 0.0008 * Math.ceil(count / 6)
        lat += Math.sin(angle) * radius
        lon += Math.cos(angle) * radius
      }

      const meta = STATUS_META[v.status] || STATUS_META.offline
      const color = meta.color.startsWith('var')
        ? { online: '#00ff66', idle: '#f5a623', alert: '#ff5c5c', offline: '#5b6572' }[v.status] || '#5b6572'
        : meta.color

      const icon = L.divIcon({
        html: makeMarkerHtml(color),
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      const tooltipContent = `
        <div style="padding:6px 10px;background:#12151b;color:#e8edf2;border:1px solid #242a33;border-radius:8px;box-shadow:0 10px 25px rgba(0,0,0,0.5);font-family:Inter,sans-serif;min-width:140px;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;font-weight:700;">
            <span>${v.name}</span>
            <span style="font-size:9.5px;font-family:JetBrains Mono,monospace;color:${color};background:${color}15;padding:1px 5px;border-radius:4px;border:1px solid ${color}30;text-transform:uppercase;">
              ${v.status}
            </span>
          </div>
          <div style="margin-top:3px;font-size:10.5px;color:#8b96a3;display:flex;align-items:center;gap:4px;">
            <span>${v.model}</span> · <span style="color:#e8edf2;font-family:JetBrains Mono,monospace;">${v.speed > 0 ? `${v.speed} km/h` : 'Stopped'}</span>
          </div>
          <div style="margin-top:5px;display:flex;align-items:center;gap:6px;">
            <div style="flex:1;height:4px;background:#181c23;border-radius:2px;overflow:hidden;border:1px solid #242a33;">
              <div style="height:100%;width:${v.battery}%;background:${v.battery > 50 ? '#00ff66' : v.battery > 20 ? '#f5a623' : '#ff5c5c'};"></div>
            </div>
            <span style="font-size:10px;font-family:JetBrains Mono,monospace;color:#8b96a3;">${v.battery}%</span>
          </div>
        </div>
      `

      const popupContent = `
        <div style="padding:10px 12px;background:#12151b;color:#e8edf2;border:1px solid #242a33;border-radius:10px;box-shadow:0 12px 30px rgba(0,0,0,0.7);font-family:Inter,sans-serif;min-width:190px;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <span style="font-size:13px;font-weight:700;color:#f0f4f8;">${v.name}</span>
            <span style="font-size:9.5px;font-family:JetBrains Mono,monospace;color:${color};background:${color}20;padding:2px 6px;border-radius:4px;border:1px solid ${color}40;text-transform:uppercase;font-weight:700;">
              ${v.status}
            </span>
          </div>
          <div style="margin-top:3px;font-size:11px;color:#8b96a3;font-family:JetBrains Mono,monospace;">
            ${v.plate} · ${v.model}
          </div>
          <div style="margin-top:8px;display:flex;align-items:center;justify-content:space-between;font-size:11px;">
            <span style="color:#8b96a3;">Speed</span>
            <span style="font-weight:600;color:#f0f4f8;font-family:JetBrains Mono,monospace;">${v.speed > 0 ? `${v.speed} km/h` : 'Stopped'}</span>
          </div>
          <div style="margin-top:6px;display:flex;align-items:center;gap:6px;">
            <div style="flex:1;height:5px;background:#181c23;border-radius:3px;overflow:hidden;border:1px solid #242a33;">
              <div style="height:100%;width:${v.battery}%;background:${v.battery > 50 ? '#00ff66' : v.battery > 20 ? '#f5a623' : '#ff5c5c'};"></div>
            </div>
            <span style="font-size:10px;font-family:JetBrains Mono,monospace;color:#8b96a3;">${v.battery}%</span>
          </div>
          <div style="margin-top:10px;display:flex;gap:6px;padding-top:8px;border-top:1px solid #242a33;">
            <button onclick="window.__selectMapVehicle('${v.id}')" style="flex:1;padding:5px 8px;font-size:11px;font-weight:600;background:#00ff6620;color:#00ff66;border:1px solid #00ff6640;border-radius:6px;cursor:pointer;transition:all 0.2s;">
              View Telemetry
            </button>
            <button onclick="window.__pingMapVehicle('${v.id}')" style="flex:1;padding:5px 8px;font-size:11px;font-weight:600;background:#1e242d;color:#8b96a3;border:1px solid #242a33;border-radius:6px;cursor:pointer;transition:all 0.2s;">
              Ping Device
            </button>
          </div>
        </div>
      `

      const marker = L.marker([lat, lon], { icon })
        .addTo(map)
        .bindTooltip(tooltipContent, {
          direction: 'top',
          offset: [0, -10],
          opacity: 1,
          className: '',
        })
        .bindPopup(popupContent, {
          offset: [0, -10],
          className: '',
        })

      markersRef.current.push(marker)
    })
  }, [leafletReady, vehicles])

  useEffect(() => {
    const handler = (e) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target)) {
        setActive(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    if (active) mapRef.current.scrollWheelZoom.enable()
    else mapRef.current.scrollWheelZoom.disable()
  }, [active])

  if (!leafletReady) {
    return (
      <div style={{ height }} className="flex flex-col items-center justify-center gap-3 rounded-xl border border-line bg-panel-2 p-6 animate-pulse">
        <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <div className="flex flex-col items-center gap-1">
          <span className="font-display text-[13px] font-semibold text-hi">Initializing Map Engine</span>
          <span className="text-[11px] text-dim">Fetching live IoT coordinates & geofences…</span>
        </div>
      </div>
    )
  }

  return (
    <div ref={overlayRef} style={{ height, position: 'relative' }} className="w-full" onClick={() => setActive(true)}>
      <style>{`
        @keyframes leaflet-ping {
          0%, 100% { transform: scale(1); opacity: 0.22; }
          50% { transform: scale(2.2); opacity: 0; }
        }
        .leaflet-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
        .leaflet-tooltip-top::before { display: none !important; }
        .leaflet-popup-content-wrapper { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
        .leaflet-popup-tip { background: #12151b !important; border: 1px solid #242a33 !important; }
        .leaflet-popup-content { margin: 0 !important; }
        .leaflet-container { background: #080a0d !important; font-family: Inter, sans-serif !important; }
        .leaflet-bar { border: 1px solid #242a33 !important; border-radius: 8px !important; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important; }
        .leaflet-bar a { background: #0f1217 !important; color: #f0f4f8 !important; border-bottom: 1px solid #242a33 !important; }
        .leaflet-bar a:hover { background: #1f2530 !important; color: #00ff66 !important; }
      `}</style>
      
      <div
        ref={containerRef}
        role="region"
        aria-label="Interactive Fleet Tracking Map"
        style={{ width: '100%', height: '100%', zIndex: 1 }}
        className="rounded-xl overflow-hidden"
      />

      {/* Floating Bottom Fleet Status Legend Overlay */}
      {!hideLegend && (
        <div className="absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-line/80 bg-panel-2/85 px-3.5 py-2 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-hi">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span>Online (<strong className="font-mono tabular-nums">{statusCounts.online}</strong>)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-hi">
            <span className="h-2 w-2 rounded-full bg-amber" />
            <span>Idle (<strong className="font-mono tabular-nums">{statusCounts.idle}</strong>)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-hi">
            <span className="h-2 w-2 rounded-full bg-red" />
            <span>Alert (<strong className="font-mono tabular-nums">{statusCounts.alert}</strong>)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-hi">
            <span className="h-2 w-2 rounded-full bg-gray" />
            <span>Offline (<strong className="font-mono tabular-nums">{statusCounts.offline}</strong>)</span>
          </div>
        </div>
      )}

      {!active && (
        <div
          aria-label="Activate map scroll zoom"
          style={{
            position: 'absolute', inset: 0, zIndex: 5,
            background: 'transparent', cursor: 'pointer',
          }}
        />
      )}
    </div>
  )
}
