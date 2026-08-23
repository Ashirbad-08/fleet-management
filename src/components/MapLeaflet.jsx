import { useEffect, useRef, useState, useMemo } from 'react'
import { STATUS_META } from '../data/statusMeta'
import { useFleet } from '../context/FleetContext'

const DEFAULT_CENTER = [20.5937, 78.9629]

// Dynamically loads Leaflet from CDN — no npm package needed
function useLeaflet() {
  const [ready, setReady] = useState(!!window.L)

  useEffect(() => {
    if (window.L) { setReady(true); return }

    // CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    // JS
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script')
      script.id = 'leaflet-js'
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.async = true
      script.onload = () => setReady(true)
      document.body.appendChild(script)
    } else {
      // Script tag exists but onload may already have fired
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
    <div style="position:relative;display:flex;align-items:center;justify-content:center;width:28px;height:28px;">
      <div style="position:absolute;width:28px;height:28px;border-radius:50%;background:${color};opacity:0.18;animation:leaflet-ping 2s cubic-bezier(0,0,.2,1) infinite;"></div>
      <div style="position:relative;width:14px;height:14px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">
        <div style="width:4px;height:4px;border-radius:50%;background:#fff;opacity:0.9;"></div>
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

  // Init map once Leaflet is loaded
  useEffect(() => {
    if (!leafletReady || !containerRef.current) return
    if (mapRef.current) return // already initialized

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
    L.control.zoom({ position: 'topright' }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [leafletReady]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle tile layer updates when activeMapStyle changes
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

  // Handle geofence drawing
  useEffect(() => {
    if (!leafletReady || !mapRef.current) return
    const L = window.L
    const map = mapRef.current

    // Clear existing geofences
    fencesRef.current.forEach((f) => f.remove())
    fencesRef.current = []

    activeGeofences.forEach((g) => {
      if (!g.lat || !g.lon) return
      const color = g.status === 'Active' ? '#3ddc84' : '#f5a623'
      const circle = L.circle([g.lat, g.lon], {
        color,
        fillColor: color,
        fillOpacity: 0.12,
        weight: 1.5,
        radius: (g.radius || 1) * 1000, // convert km to meters
      })
        .addTo(map)
        .bindTooltip(
          `<div style="font-size:11px;font-weight:600;padding:2px 6px;background:#12151b;color:#e8edf2;border:1px solid #242a33;border-radius:6px;white-space:nowrap;">
            ${g.name} (${g.type})
          </div>`,
          { permanent: false, direction: 'top', opacity: 0.9 }
        )
      fencesRef.current.push(circle)
    })
  }, [leafletReady, activeGeofences])

  useEffect(() => {
    if (!leafletReady || !mapRef.current) return
    mapRef.current.setView(center, zoom)
  }, [center, leafletReady, zoom])

  // Update markers when vehicles change
  useEffect(() => {
    if (!leafletReady || !mapRef.current) return
    const L = window.L
    const map = mapRef.current

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    vehicles.forEach((v) => {
      if (!v.lat || !v.lon) return
      const meta = STATUS_META[v.status] || STATUS_META.offline
      const color = meta.color.startsWith('var')
        ? { online: '#3ddc84', idle: '#f5a623', alert: '#ff5c5c', offline: '#5b6572' }[v.status] || '#5b6572'
        : meta.color

      const icon = L.divIcon({
        html: makeMarkerHtml(color),
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })

      const marker = L.marker([v.lat, v.lon], { icon })
        .addTo(map)
        .bindTooltip(
          `<div style="font-size:12px;font-weight:600;padding:2px 6px;background:#12151b;color:#e8edf2;border:1px solid #242a33;border-radius:6px;white-space:nowrap;">
            ${v.name} · ${v.battery}%
          </div>`,
          { direction: 'top', offset: [0, -8], opacity: 1, className: '' }
        )

      markersRef.current.push(marker)
    })
  }, [leafletReady, vehicles])

  // Enable scroll zoom when user clicks inside
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
        <span className="animate-pulse">Loading map…</span>
      </div>
    )
  }

  return (
    <div ref={overlayRef} style={{ height, position: 'relative' }} onClick={() => setActive(true)}>
      <style>{`
        @keyframes leaflet-ping {
          0%, 100% { transform: scale(1); opacity: 0.18; }
          50% { transform: scale(2.2); opacity: 0; }
        }
        .leaflet-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
        .leaflet-tooltip-top::before { display: none !important; }
      `}</style>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
        className="rounded-xl overflow-hidden"
      />
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
