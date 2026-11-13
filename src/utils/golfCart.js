import * as THREE from 'three'

/** Golf cart model. 1 unit = 1 metre, faces +X, wheels touch y = 0. */
export function buildGolfCart(bodyColor = 0x1f6b4a) {
  const g = new THREE.Group()
  const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, ...o })

  // Materials
  const body = M(bodyColor, { roughness: 0.35, metalness: 0.25 }) // Painted glossy front cowl & rear fender
  const canopyMat = M(0xf4f5f0, { roughness: 0.65, metalness: 0.05 }) // Classic oyster-white molded plastic canopy roof
  const canopyTrim = M(0xdadcd8, { roughness: 0.55 })
  const dark = M(0x1a1c1a, { roughness: 0.85 }) // Molded rubber floor mat, bumper, and trim
  const seatMat = M(0xe8dcc4, { roughness: 0.72, metalness: 0.05 }) // Contoured beige vinyl golf cart bench seat
  const chrome = M(0xdde4e0, { metalness: 0.85, roughness: 0.2 })
  const strutBlack = M(0x282b29, { metalness: 0.35, roughness: 0.45 })
  const glass = M(0xbfe6f5, { transparent: true, opacity: 0.45, roughness: 0.1 }) // Split folding acrylic windshield
  const hinge = M(0x111111, { roughness: 0.7 })
  const lamp = M(0xffffff, { emissive: 0xffea75, emissiveIntensity: 2.0 }) // Glowing headlights
  const tail = M(0xff2222, { emissive: 0xff1010, emissiveIntensity: 1.2 }) // Red taillights
  const tire = M(0x141414, { roughness: 0.92 }) // Black turf tires
  const hub = M(0xecf0f2, { metalness: 0.8, roughness: 0.25 }) // Silver/chrome wheel rims
  const hubCap = M(0x222222, { metalness: 0.3, roughness: 0.5 })
  const golfBag1 = M(0x24364c, { roughness: 0.7 }) // Navy golf bag
  const golfBag2 = M(0x6e2828, { roughness: 0.7 }) // Maroon golf bag
  const clubMetal = M(0xdbe2e6, { metalness: 0.9, roughness: 0.15 }) // Chrome club shafts & heads

  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d)
  const cyl = (r, l, s = 16) => new THREE.CylinderGeometry(r, r, l, s)
  const add = (geo, mat, x, y, z, fn) => {
    const m = new THREE.Mesh(geo, mat)
    m.position.set(x, y, z)
    if (fn) fn(m)
    g.add(m)
    return m
  }

  // 1. Chassis & Low Step-Through Open Floorboard (no jeep doors or high sills!)
  add(box(2.2, 0.08, 0.96), dark, 0, 0.24, 0)                                   // Chassis base
  add(box(0.68, 0.04, 0.92), dark, 0.1, 0.29, 0)                                 // Ribbed rubber floorboard mat
  add(box(0.32, 0.04, 0.9), dark, 0.56, 0.38, 0, (m) => (m.rotation.z = -0.32))// Foot pedal ramp

  // 2. Streamlined Sloping Front Cowl (wedge golf-cart nose, NOT a boxy Jeep hood!)
  add(box(0.62, 0.24, 0.98), body, 0.78, 0.42, 0)                               // Lower front cowl
  add(box(0.56, 0.1, 0.94), body, 0.82, 0.56, 0, (m) => (m.rotation.z = -0.36))// Sloping front hood
  add(box(0.1, 0.14, 0.98), dark, 1.12, 0.38, 0)                                // Molded rubber front bumper pad
  add(box(0.04, 0.09, 0.44), dark, 1.13, 0.5, 0)                                // Golf cart front badge grille insert

  // Flush integrated front headlights
  ;[-0.32, 0.32].forEach((z) => {
    add(box(0.04, 0.09, 0.18), lamp, 1.11, 0.51, z, (m) => (m.rotation.y = z > 0 ? 0.15 : -0.15))
  })

  // 3. Split Folding Acrylic Windshield (signature golf cart feature)
  add(box(0.03, 0.28, 0.88), glass, 0.52, 0.82, 0, (m) => (m.rotation.z = -0.28)) // Lower windshield
  add(box(0.04, 0.025, 0.9), hinge, 0.48, 0.95, 0, (m) => (m.rotation.z = -0.28)) // Center folding hinge strip
  add(box(0.03, 0.28, 0.88), glass, 0.44, 1.09, 0, (m) => (m.rotation.z = -0.28)) // Upper folding windshield
  ;[-0.45, 0.45].forEach((z) => {
    add(cyl(0.016, 0.75), strutBlack, 0.48, 0.96, z, (m) => (m.rotation.z = -0.28)) // Front canopy struts
  })

  // 4. Open Cab with Contoured Bench Seat, Armrests & Steering Console
  add(box(0.48, 0.22, 0.94), body, -0.15, 0.43, 0)                               // Seat base panel
  add(box(0.46, 0.12, 0.92), seatMat, -0.14, 0.58, 0)                            // Contoured beige seat cushion
  add(box(0.12, 0.32, 0.88), seatMat, -0.42, 0.84, 0, (m) => (m.rotation.z = 0.12)) // Contoured seat backrest
  ;[-0.48, 0.48].forEach((z) => {
    // Golf cart side handrails / armrests on bench seat
    add(box(0.35, 0.045, 0.035), dark, -0.15, 0.72, z)
    add(cyl(0.012, 0.15), dark, 0.0, 0.65, z)
    add(cyl(0.012, 0.15), dark, -0.3, 0.65, z)
  })

  // Steering wheel & dashboard
  add(box(0.24, 0.18, 0.86), dark, 0.32, 0.62, 0, (m) => (m.rotation.z = -0.3)) // Dash console
  add(cyl(0.018, 0.44), dark, 0.22, 0.8, 0.18, (m) => (m.rotation.z = 0.95))     // Steering column
  add(new THREE.TorusGeometry(0.11, 0.016, 8, 20), dark, 0.12, 0.95, 0.18, (m) => (m.rotation.y = Math.PI / 2))
  add(box(0.02, 0.07, 0.05), seatMat, 0.12, 0.95, 0.18)                         // Scorecard clip on wheel

  // 5. Classic Oyster-White Molded Canopy Roof (NOT a colored jeep hardtop!)
  add(box(1.58, 0.05, 1.16), canopyMat, -0.1, 1.74, 0)                           // Molded canopy roof
  add(box(1.62, 0.025, 1.2), canopyTrim, -0.1, 1.72, 0)                          // Drip rail lip
  ;[-0.32, 0, 0.32].forEach((z) => {
    add(box(1.4, 0.018, 0.06), canopyTrim, -0.1, 1.77, z)                        // Roof reinforcement ribs
  })
  ;[-0.42, 0.42].forEach((z) => {
    add(cyl(0.018, 1.08), strutBlack, -0.55, 1.24, z, (m) => (m.rotation.z = 0.12)) // Rear canopy struts
  })

  // 6. Signature Rear Golf Bag Carrier with Dual Bags & Golf Clubs
  add(box(0.24, 0.16, 0.82), strutBlack, -0.58, 0.82, 0)                         // Sweater basket rack
  add(box(0.5, 0.06, 0.94), dark, -1.02, 0.46, 0)                                // Rear golf bag standing deck
  add(box(0.06, 0.05, 0.88), dark, -1.22, 0.52, 0)                               // Bag strap retainer bar

  // Dual golf bags strapped in upright
  add(cyl(0.11, 0.65, 12), golfBag1, -0.98, 0.86, -0.22, (m) => { m.rotation.z = 0.15; m.rotation.x = -0.05 })
  add(cyl(0.11, 0.65, 12), golfBag2, -0.98, 0.86, 0.22, (m) => { m.rotation.z = 0.15; m.rotation.x = 0.05 })

  // Golf clubs (drivers & irons) poking out of the bags
  ;[[-0.22, golfBag1], [0.22, golfBag2]].forEach(([z]) => {
    add(cyl(0.007, 0.26), clubMetal, -0.96, 1.26, z - 0.04, (m) => (m.rotation.z = 0.2))
    add(cyl(0.007, 0.28), clubMetal, -1.02, 1.28, z + 0.03, (m) => (m.rotation.z = 0.1))
    add(box(0.04, 0.03, 0.06), clubMetal, -0.94, 1.36, z - 0.04)                 // Driver head
    add(box(0.03, 0.04, 0.02), clubMetal, -1.0, 1.39, z + 0.03)                  // Iron head
  })

  // 7. Small Wide Golf Cart Turf Tires with Silver Hubcaps
  const wheels = []
  ;[[0.74, 0.52], [0.74, -0.52], [-0.74, 0.52], [-0.74, -0.52]].forEach(([x, z]) => {
    const w = new THREE.Group()
    w.position.set(x, 0.22, z)
    const t = new THREE.Mesh(cyl(0.22, 0.18, 20), tire)
    t.rotation.x = Math.PI / 2
    const h = new THREE.Mesh(cyl(0.11, 0.19, 16), hub)
    h.rotation.x = Math.PI / 2
    const c = new THREE.Mesh(cyl(0.05, 0.2, 12), hubCap)
    c.rotation.x = Math.PI / 2
    w.add(t, h, c)
    g.add(w)
    wheels.push(w)
  })

  // Rear taillights
  ;[-0.38, 0.38].forEach((z) => {
    add(box(0.03, 0.07, 0.12), tail, -1.24, 0.5, z)
  })

  g.userData.wheels = wheels
  return g
}

/**
 * 3D Golf Cart PNG for map markers.
 * Rendered from an elevated 3D perspective facing North (UP) so that
 * CSS transform: rotate(${heading}deg) steers the vehicle accurately into curves,
 * North, South, East, and West, while showing 3D wheels, windshield, headlights, seats, and roof.
 */
export function cartToDataURL(color = 0x1f6b4a, px = 128) {
  try {
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
    r.setSize(px, px)
    r.setPixelRatio(1)
    const s = new THREE.Scene()

    // 3-point lighting to emphasize 3D contours, hood slope, and metallic highlights
    s.add(new THREE.HemisphereLight(0xffffff, 0x445544, 1.25))

    // Main sun light from top-front-right shining on front cowl and canopy
    const sun = new THREE.DirectionalLight(0xffffff, 1.4)
    sun.position.set(4, 7, 3)
    s.add(sun)

    // Fill light from rear-left to illuminate interior cab, seats, and golf bags
    const fill = new THREE.DirectionalLight(0xaad4f5, 0.65)
    fill.position.set(-4, 3, -3)
    s.add(fill)

    // Soft ambient light
    s.add(new THREE.AmbientLight(0xffffff, 0.4))

    // Ground contact shadow under turf wheels
    if (typeof document !== 'undefined') {
      const shadowCanvas = document.createElement('canvas')
      shadowCanvas.width = 128
      shadowCanvas.height = 128
      const ctx = shadowCanvas.getContext('2d')
      if (ctx) {
        const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 58)
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)')
        grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)')
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 128, 128)

        const shadowTex = new THREE.CanvasTexture(shadowCanvas)
        const shadowGeo = new THREE.PlaneGeometry(2.9, 1.6)
        const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.8, depthWrite: false })
        const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat)
        shadowMesh.rotation.x = -Math.PI / 2
        shadowMesh.position.set(0, 0.01, 0)
        s.add(shadowMesh)
      }
    }

    const cart = buildGolfCart(color)
    s.add(cart)

    // Elevated 3D camera looking down onto the FRONT of the cart:
    // Camera is placed in front (+X = 1.8), above (+Y = 3.3), and slightly right (+Z = 0.45)
    // c.up is set to +X (1, 0, 0), so the front (cowl/headlights/windshield) points straight UP (North)!
    const d = 1.65
    const c = new THREE.OrthographicCamera(-d, d, d, -d, 0.1, 50)
    c.position.set(1.8, 3.3, 0.45)
    c.up.set(1, 0, 0)
    c.lookAt(0, 0.55, 0)

    r.render(s, c)
    const url = r.domElement.toDataURL('image/png')

    // Dispose scene meshes and WebGL resources to keep memory lightweight
    s.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose()
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
        else obj.material.dispose()
      }
    })
    r.dispose()
    return url
  } catch (err) {
    console.warn('3D golf cart data URL generation error, using fallback:', err)
    return getCartFallbackSvg(color)
  }
}

const dataUrlCache = new Map()

/**
 * Cached version of cartToDataURL so we don't re-render identical WebGL carts repeatedly.
 */
export function getCartIconUrl(color = 0x1f6b4a, px = 128) {
  const key = `${color}_${px}`
  if (dataUrlCache.has(key)) {
    return dataUrlCache.get(key)
  }
  const url = cartToDataURL(color, px)
  if (url) {
    dataUrlCache.set(key, url)
  }
  return url
}

export function getCartFallbackSvg(color = '#00ff66') {
  const encColor = encodeURIComponent(String(color))
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <!-- Drop shadow -->
    <ellipse cx="32" cy="54" rx="22" ry="6" fill="%23000000" opacity="0.4"/>
    <!-- Turf wheels -->
    <circle cx="18" cy="48" r="8" fill="%23161616" stroke="%23ecf0f2" stroke-width="2.5"/>
    <circle cx="46" cy="48" r="8" fill="%23161616" stroke="%23ecf0f2" stroke-width="2.5"/>
    <!-- Sloping cowl & body -->
    <path d="M12 44 L20 44 L24 36 L44 36 L52 44 L12 44 Z" fill="${encColor}"/>
    <path d="M42 36 L54 42 L52 46 L40 46 Z" fill="${encColor}"/>
    <!-- Beige bench seat -->
    <rect x="22" y="32" width="16" height="6" rx="2" fill="%23e8dcc4"/>
    <rect x="20" y="24" width="5" height="12" rx="1.5" fill="%23e8dcc4"/>
    <!-- Canopy struts -->
    <line x1="22" y1="24" x2="24" y2="14" stroke="%232b2e2c" stroke-width="2"/>
    <line x1="42" y1="36" x2="40" y2="14" stroke="%232b2e2c" stroke-width="2"/>
    <!-- Folding acrylic windshield -->
    <line x1="42" y1="36" x2="39" y2="16" stroke="%23a8e6f7" stroke-width="3" stroke-linecap="round"/>
    <!-- Oyster white molded canopy roof -->
    <path d="M18 14 Q32 10 46 14 L46 17 Q32 13 18 17 Z" fill="%23f4f5f0" stroke="%23dadcd8" stroke-width="1"/>
    <!-- Rear golf bag & clubs -->
    <rect x="13" y="27" width="7" height="15" rx="3" fill="%2324364c"/>
    <line x1="15" y1="27" x2="13" y2="20" stroke="%23dbe2e6" stroke-width="1.5"/>
    <line x1="17" y1="27" x2="16" y2="18" stroke="%23dbe2e6" stroke-width="1.5"/>
    <!-- Headlight -->
    <circle cx="53" cy="42" r="2.5" fill="%23fff3b0"/>
  </svg>`
}

/**
 * Custom 3D layer that draws many golf carts on a Mapbox GL / MapLibre map.
 */
export function createGolfCartLayer({ id = 'golf-carts', scale = 1, mapboxgl } = {}) {
  const carts = new Map()
  let map, scene, camera, renderer
  const mb = mapboxgl || window?.mapboxgl || window?.maplibregl

  function place(c) {
    if (!mb) return
    const mc = mb.MercatorCoordinate.fromLngLat(c.lngLat, 0)
    const s = mc.meterInMercatorCoordinateUnits() * scale
    const m = new THREE.Matrix4()
      .makeTranslation(mc.x, mc.y, mc.z)
      .scale(new THREE.Vector3(s, -s, s))
      .multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2))
      .multiply(new THREE.Matrix4().makeRotationY(Math.PI / 2 - (c.heading * Math.PI) / 180))
    c.obj.matrix.copy(m)
  }

  const layer = {
    id,
    type: 'custom',
    renderingMode: '3d',

    onAdd(m, gl) {
      map = m
      camera = new THREE.Camera()
      scene = new THREE.Scene()
      scene.add(new THREE.HemisphereLight(0xffffff, 0x667766, 1.1))
      const sun = new THREE.DirectionalLight(0xffffff, 1.0)
      sun.position.set(0, -70, 100).normalize()
      scene.add(sun)
      renderer = new THREE.WebGLRenderer({ canvas: map.getCanvas(), context: gl, antialias: true })
      renderer.autoClear = false
      carts.forEach((c) => scene.add(c.obj))
    },

    render(gl, matrix) {
      carts.forEach(place)
      camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix)
      renderer.resetState()
      renderer.render(scene, camera)
      map.triggerRepaint()
    },

    onRemove() {
      renderer?.dispose()
    },

    setCarts(list) {
      const seen = new Set()
      list.forEach(({ id: cid, lngLat, heading = 0, color = 0x1f6b4a }) => {
        seen.add(cid)
        let c = carts.get(cid)
        if (!c || c.color !== color) {
          if (c) scene?.remove(c.obj)
          const obj = buildGolfCart(color)
          obj.matrixAutoUpdate = false
          c = { obj, color }
          carts.set(cid, c)
          scene?.add(obj)
        }
        c.lngLat = lngLat
        c.heading = heading
      })
      ;[...carts.keys()].forEach((k) => {
        if (!seen.has(k)) {
          scene?.remove(carts.get(k).obj)
          carts.delete(k)
        }
      })
      map?.triggerRepaint()
    },
  }
  return layer
}
