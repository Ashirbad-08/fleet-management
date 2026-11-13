import { useEffect, useRef, useState, useMemo } from 'react'
import { STATUS_META } from '../data/statusMeta'
import { useFleet } from '../context/FleetContext'

const DEFAULT_CENTER = [20.5937, 78.9629]

// Inline SVG golf cart – top-down view, front faces UP (north at 0 deg heading)
function getCartSvg(bodyColor) {
  // Derive slightly lighter hood/roof tint from body color for depth
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 160" width="100" height="160">
  <!-- soft ground shadow -->
  <ellipse cx="50" cy="86" rx="42" ry="70" fill="#000" opacity="0.15"/>
  <!-- wheels -->
  <g fill="#1f2638" stroke="#0f1422" stroke-width="1.5">
    <rect x="9"  y="26"  width="15" height="26" rx="5"/>
    <rect x="76" y="26"  width="15" height="26" rx="5"/>
    <rect x="9"  y="108" width="15" height="26" rx="5"/>
    <rect x="76" y="108" width="15" height="26" rx="5"/>
  </g>
  <!-- body -->
  <rect x="20" y="10" width="60" height="140" rx="20" fill="${bodyColor}" stroke="#2a3350" stroke-width="3"/>
  <!-- hood highlight -->
  <rect x="27" y="17" width="46" height="30" rx="12" fill="${bodyColor}" opacity="0.75"/>
  <!-- headlights -->
  <circle cx="33" cy="19" r="3.5" fill="#ffe27a" stroke="#2a3350" stroke-width="1"/>
  <circle cx="67" cy="19" r="3.5" fill="#ffe27a" stroke="#2a3350" stroke-width="1"/>
  <!-- windshield -->
  <path d="M28 50 L72 50 L69 63 L31 63 Z" fill="#bcd6ee" stroke="#2a3350" stroke-width="2" stroke-linejoin="round"/>
  <!-- roof canopy -->
  <rect x="22" y="60" width="56" height="76" rx="10" fill="${bodyColor}" stroke="#2a3350" stroke-width="3" opacity="0.85"/>
  <!-- roof grooves -->
  <g stroke="#2a3350" stroke-width="2.5" stroke-linecap="round" opacity="0.5">
    <line x1="40" y1="70" x2="40" y2="126"/>
    <line x1="60" y1="70" x2="60" y2="126"/>
  </g>
  <!-- tail lights -->
  <rect x="27" y="141" width="12" height="4" rx="2" fill="#e5484d"/>
  <rect x="61" y="141" width="12" height="4" rx="2" fill="#e5484d"/>
</svg>`
}

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

function makeCartMarkerHtml({ color, heading = 0, name = '', mapStyle = 'Dark Mode' }) {
  const deg = Math.round(heading)

  // Map mode text coloring:
  // Standard Vector -> black text (#000000) with white halo for contrast against streets & parks
  // Dark Mode & Satellite Mode -> white text (#ffffff) with dark shadow for contrast
  const isStandardVector =
    String(mapStyle).toLowerCase().includes('standard') ||
    String(mapStyle).toLowerCase().includes('vector')

  const textColor = isStandardVector ? '#000000' : '#ffffff'
  const textShadow = isStandardVector
    ? '0 0 2px #ffffff, 0 0 4px #ffffff, 0 1px 2px rgba(255,255,255,0.95)'
    : '0 1px 3px rgba(0,0,0,0.95), 0 0 2px #000'

  // SVG encoded as a data URI so it can be used as an img src (avoids inline SVG z-index quirks)
  const svgString = getCartSvg(color)
  const svgDataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString)

  return `
    <div class="golf-cart-marker" style="position:relative;display:flex;flex-direction:column;align-items:center;width:30px;height:54px;cursor:pointer;">
      <div style="width:25px;height:40px;display:flex;align-items:center;justify-content:center;transform:rotate(${deg}deg);transition:transform 0.28s cubic-bezier(0.25, 1, 0.5, 1);transform-origin:center;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.6));">
        <img src="${svgDataUri}" style="width:25px;height:40px;object-fit:contain;display:block;user-select:none;pointer-events:none;" alt="Golf Cart" />
      </div>
      ${name ? `
        <div style="position:absolute;top:42px;left:50%;transform:translateX(-50%);font-size:9px;font-weight:600;font-family:Inter,sans-serif;color:${textColor};text-shadow:${textShadow};letter-spacing:-0.1px;white-space:nowrap;pointer-events:none;z-index:2;line-height:11px;">
          ${name}
        </div>
      ` : ''}
    </div>
  `
}

function getTileConfig(style) {
  switch (style) {
    case 'Standard Vector':
      return {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        options: {
          maxZoom: 19,
          subdomains: ['a', 'b', 'c'],
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        },
      }
    case 'Satellite Hybrid':
      return {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        options: {
          maxZoom: 19,
          attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        },
      }
    case 'Dark Mode':
    default:
      return {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        options: {
          maxZoom: 20,
          subdomains: 'abcd',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        },
      }
  }
}

export default function MapLeaflet({
  vehicles = [],
  height = '100%',
  zoom = 5,
  center = DEFAULT_CENTER,
  mapStyle,
  geofences,
  hideLegend = false,
  playbackData = null,
}) {
  const { settings, geofences: contextGeofences, setSelectedVehicleId } = useFleet()
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

  // Refs for Route Playback layers
  const playbackLayerGroupRef = useRef(null)
  const lastPlaybackTripIdRef = useRef(null)

  // Register window handlers for popup action buttons
  useEffect(() => {
    window.__selectMapVehicle = (id) => {
      setSelectedVehicleId(id)
    }
    return () => {
      delete window.__selectMapVehicle
    }
  }, [setSelectedVehicleId])

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

    const { url, options } = getTileConfig(activeMapStyle)
    const tileLayer = L.tileLayer(url, options).addTo(map)
    tileLayerRef.current = tileLayer

    // Custom zoom control bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [leafletReady]) // eslint-disable-line react-hooks/exhaustive-deps

  // Automatically handle container resizing (fullscreen toggling, panel opening) without remounting
  useEffect(() => {
    if (!leafletReady || !containerRef.current) return
    const container = containerRef.current
    let resizeTimer = null
    const observer = new ResizeObserver(() => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize({ pan: false })
        }
      }, 60)
    })
    observer.observe(container)
    return () => {
      clearTimeout(resizeTimer)
      observer.disconnect()
    }
  }, [leafletReady])

  // Handle tile layer updates
  useEffect(() => {
    if (!leafletReady || !mapRef.current) return
    const L = window.L
    const map = mapRef.current

    if (tileLayerRef.current) {
      tileLayerRef.current.remove()
    }

    const { url, options } = getTileConfig(activeMapStyle)
    tileLayerRef.current = L.tileLayer(url, options).addTo(map)
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
          `<div style="font-size:12px;font-weight:600;padding:4px 8px;background:#12151b;color:#e8edf2;border:1px solid #242a33;border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.4);white-space:nowrap;">
            ${g.name} (${g.type})
          </div>`,
          { permanent: false, direction: 'top', opacity: 0.95 }
        )
      fencesRef.current.push(circle)
    })
  }, [leafletReady, activeGeofences])

  const centerLat = center?.[0]
  const centerLng = center?.[1]
  useEffect(() => {
    if (!leafletReady || !mapRef.current || centerLat === undefined || centerLng === undefined) return
    // Only set view if not currently in playback mode
    if (!playbackData?.route) {
      mapRef.current.setView([centerLat, centerLng], zoom)
    }
  }, [centerLat, centerLng, leafletReady, zoom, playbackData?.route])

  // Update vehicle markers
  useEffect(() => {
    if (!leafletReady || !mapRef.current) return
    const L = window.L
    const map = mapRef.current

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    // If playback is active, hide static markers so animated route vehicle is the focal point
    if (playbackData?.route) return

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

      const heading = v.heading !== undefined
        ? v.heading
        : ((parseInt(String(v.id || '').replace(/\D/g, '') || '1', 10) * 67 + 35) % 360)

      const icon = L.divIcon({
        html: makeCartMarkerHtml({
          color,
          heading,
          name: v.name,
          mapStyle: activeMapStyle,
        }),
        className: '',
        iconSize: [30, 54],
        iconAnchor: [15, 20],
      })

      const battColorHex = v.battery > 50 ? '#00ff66' : v.battery > 20 ? '#f5a623' : '#ff5c5c'
      const battIconSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${battColorHex}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="10" x="2" y="7" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/></svg>`

      const tooltipContent = `
        <div class="leaflet-custom-tooltip">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;font-weight:700;">
            <span>${v.name}</span>
            <span style="font-size:10px;font-family:JetBrains Mono,monospace;color:${color};background:${color}15;padding:1px 5px;border-radius:4px;border:1px solid ${color}30;text-transform:uppercase;">
              ${v.status}
            </span>
          </div>
          <div style="margin-top:3px;font-size:11px;color:#8b96a3;display:flex;align-items:center;gap:4px;">
            <span>${v.model}</span> · <span style="color:#e8edf2;font-family:JetBrains Mono,monospace;">${v.speed > 0 ? `${v.speed} km/h` : 'Stopped'}</span>
          </div>
          <div style="margin-top:6px;display:flex;align-items:center;gap:6px;">
            <span style="display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:4px;background:${battColorHex}15;border:1px solid ${battColorHex}30;font-size:10.5px;font-weight:700;font-family:JetBrains Mono,monospace;color:${battColorHex};">
              ${battIconSvg}
              ${v.battery}%
            </span>
          </div>
        </div>
      `

      const popupContent = `
        <div class="leaflet-custom-popup">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <span style="font-size:13px;font-weight:700;color:#f0f4f8;">${v.name}</span>
            <span style="font-size:10px;font-family:JetBrains Mono,monospace;color:${color};background:${color}20;padding:2px 6px;border-radius:4px;border:1px solid ${color}40;text-transform:uppercase;font-weight:700;">
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
          <div style="margin-top:6px;display:flex;align-items:center;justify-content:space-between;">
            <span style="color:#8b96a3;font-size:11px;">Battery</span>
            <span style="display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:4px;background:${battColorHex}15;border:1px solid ${battColorHex}30;font-size:10.5px;font-weight:700;font-family:JetBrains Mono,monospace;color:${battColorHex};">
              ${battIconSvg}
              ${v.battery}%
            </span>
          </div>
          <div style="margin-top:10px;padding-top:8px;border-top:1px solid #242a33;">
            <button onclick="window.__selectMapVehicle('${v.id}')" style="width:100%;padding:6px 8px;font-size:11px;font-weight:600;background:#00ff6620;color:#00ff66;border:1px solid #00ff6640;border-radius:6px;cursor:pointer;transition:all 0.2s;text-align:center;">
              View Telemetry Details
            </button>
          </div>
        </div>
      `

      const marker = L.marker([lat, lon], { icon })
        .addTo(map)
        .bindTooltip(tooltipContent, {
          direction: 'top',
          offset: [0, -22],
          opacity: 1,
          className: '',
        })
        .bindPopup(popupContent, {
          offset: [0, -22],
          className: '',
        })

      markersRef.current.push(marker)
    })
  }, [leafletReady, vehicles, playbackData?.route, activeMapStyle])

  // Route Playback on Map Layer Handler
  useEffect(() => {
    if (!leafletReady || !mapRef.current) return
    const L = window.L
    const map = mapRef.current

    // If playback is stopped, clean up playback layers
    if (!playbackData?.route) {
      if (playbackLayerGroupRef.current) {
        playbackLayerGroupRef.current.remove()
        playbackLayerGroupRef.current = null
      }
      lastPlaybackTripIdRef.current = null
      return
    }

    const { route, currentIndex = 0 } = playbackData
    const currentPoint = route.points[currentIndex] || route.points[0]
    const tripId = route.trip.id || route.trip.tripNumber

    // Resolve active vehicle to preserve original status color and name during route play
    const activeVehicle =
      route.vehicle ||
      vehicles.find((v) => v.id === route.trip?.vehicleId) ||
      vehicles[0]

    let vehicleColor = '#00ff66'
    if (activeVehicle) {
      const meta = STATUS_META[activeVehicle.status] || STATUS_META.offline
      vehicleColor = meta.color?.startsWith('var')
        ? { online: '#00ff66', idle: '#f5a623', alert: '#ff5c5c', offline: '#5b6572' }[activeVehicle.status] || '#5b6572'
        : meta.color || '#00ff66'
    }
    const playbackName = activeVehicle?.name || route.trip.tripNumber || ''

    // If new playback route is loaded
    if (!playbackLayerGroupRef.current || lastPlaybackTripIdRef.current !== tripId) {
      if (playbackLayerGroupRef.current) {
        playbackLayerGroupRef.current.remove()
      }

      const layerGroup = L.featureGroup().addTo(map)
      playbackLayerGroupRef.current = layerGroup
      lastPlaybackTripIdRef.current = tripId

      // 1. Path Underglow
      L.polyline(route.waypoints, {
        color: '#00ff66',
        weight: 9,
        opacity: 0.18,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(layerGroup)

      // 2. Base Planned Route Line (dashed sky blue)
      L.polyline(route.waypoints, {
        color: '#38bdf8',
        weight: 4,
        opacity: 0.45,
        dashArray: '6, 8',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(layerGroup)

      // 3. Traveled Line (solid high-contrast neon green)
      const traveledLine = L.polyline(route.waypoints.slice(0, currentIndex + 1), {
        color: '#00ff66',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(layerGroup)
      layerGroup._traveledLine = traveledLine

      // 4. Playback Vehicle Marker (Point A and Point B removed per request)
      const playbackHeading = currentPoint.heading ?? 0
      const vehicleIcon = L.divIcon({
        html: makeCartMarkerHtml({
          color: vehicleColor,
          heading: playbackHeading,
          name: playbackName,
          mapStyle: activeMapStyle,
        }),
        className: '',
        iconSize: [30, 54],
        iconAnchor: [15, 20],
      })
      const vehicleMarker = L.marker([currentPoint.lat, currentPoint.lon], { icon: vehicleIcon })
        .addTo(layerGroup)
        .bindTooltip(`<strong>${playbackName}</strong>: ${currentPoint.speed} km/h · ${currentPoint.battery}%`, {
          permanent: true,
          direction: 'top',
          offset: [0, -22],
          opacity: 0.95,
        })
      layerGroup._vehicleMarker = vehicleMarker

      // Auto-fit bounds to display the entire route in the viewport
      map.fitBounds(L.latLngBounds(route.waypoints), {
        padding: [60, 60],
        maxZoom: 16,
        animate: true,
      })
    } else {
      // Fast incremental updates during playback ticks / scrub
      const layerGroup = playbackLayerGroupRef.current
      if (layerGroup._traveledLine) {
        layerGroup._traveledLine.setLatLngs(route.waypoints.slice(0, currentIndex + 1))
      }
      if (layerGroup._vehicleMarker) {
        layerGroup._vehicleMarker.setLatLng([currentPoint.lat, currentPoint.lon])
        const playbackHeading = currentPoint.heading ?? 0
        layerGroup._vehicleMarker.setIcon(
          L.divIcon({
            html: makeCartMarkerHtml({
              color: vehicleColor,
              heading: playbackHeading,
              name: playbackName,
              mapStyle: activeMapStyle,
            }),
            className: '',
            iconSize: [30, 54],
            iconAnchor: [15, 20],
          })
        )
        layerGroup._vehicleMarker.setTooltipContent(
          `<strong>${playbackName}</strong>: ${currentPoint.speed} km/h · ${currentPoint.battery}%`
        )
      }
    }
  }, [leafletReady, playbackData, activeMapStyle, vehicles])

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
          <span className="font-display text-sm font-semibold text-hi">Initializing Map Engine</span>
          <span className="text-xs text-dim">Fetching live IoT coordinates & geofences…</span>
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

      {/* Floating Bottom Fleet Status Legend Overlay (hidden during active playback to give room for player) */}
      {!hideLegend && !playbackData?.route && (
        <div className="absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-line/80 bg-panel-2/85 px-3.5 py-2 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-1.5 text-xs font-medium text-hi">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span>Online (<strong className="font-mono tabular-nums">{statusCounts.online}</strong>)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-hi">
            <span className="h-2 w-2 rounded-full bg-amber" />
            <span>Idle (<strong className="font-mono tabular-nums">{statusCounts.idle}</strong>)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-hi">
            <span className="h-2 w-2 rounded-full bg-red" />
            <span>Alert (<strong className="font-mono tabular-nums">{statusCounts.alert}</strong>)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-hi">
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
