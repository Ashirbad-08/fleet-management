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

export default function MapLeaflet({ vehicles = [], height = '100%', zoom = 5, center = DEFAULT_CENTER, mapStyle, geofences }) {
  const { settings, geofences: contextGeofences } = useFleet()
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

    vehicles.forEach((v) => {
      if (!v.lat || !v.lon) return
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
        <div style="padding:6px 10px;background:#12151b;color:#e8edf2;border:1px solid #242a33;border-radius:8px;box-shadow:0 10px 25px rgba(0,0,0,0.5);font-family:Inter,sans-serif;min-w:140px;">
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

      const marker = L.marker([v.lat, v.lon], { icon })
        .addTo(map)
        .bindTooltip(tooltipContent, {
          direction: 'top',
          offset: [0, -10],
          opacity: 1,
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
      <div style={{ height }} className="flex items-center justify-center rounded-xl border border-line bg-panel-2 text-dim text-[12px]">
        <span className="animate-pulse">Loading map telemetry…</span>
      </div>
    )
  }

  return (
    <div ref={overlayRef} style={{ height, position: 'relative' }} onClick={() => setActive(true)}>
      <style>{`
        @keyframes leaflet-ping {
          0%, 100% { transform: scale(1); opacity: 0.22; }
          50% { transform: scale(2.2); opacity: 0; }
        }
        .leaflet-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
        .leaflet-tooltip-top::before { display: none !important; }
        .leaflet-container { background: #0a0c0f !important; font-family: Inter, sans-serif !important; }
        .leaflet-bar { border: 1px solid #242a33 !important; border-radius: 8px !important; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important; }
        .leaflet-bar a { background: #12151b !important; color: #e8edf2 !important; border-bottom: 1px solid #242a33 !important; }
        .leaflet-bar a:hover { background: #1e232b !important; color: #00ff66 !important; }
      `}</style>
      
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
        className="rounded-xl overflow-hidden"
      />

      {/* Floating Bottom Fleet Status Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] flex items-center gap-3 rounded-lg border border-line/80 bg-panel/90 px-3 py-1.5 backdrop-blur-md shadow-md">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-hi">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <span>Online ({statusCounts.online})</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-hi">
          <span className="h-2 w-2 rounded-full bg-amber" />
          <span>Idle ({statusCounts.idle})</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-hi">
          <span className="h-2 w-2 rounded-full bg-red" />
          <span>Alert ({statusCounts.alert})</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-hi">
          <span className="h-2 w-2 rounded-full bg-gray" />
          <span>Offline ({statusCounts.offline})</span>
        </div>
      </div>

      {!active && (
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 999,
            background: 'transparent', cursor: 'pointer',
          }}
        />
      )}
    </div>
  )
}
