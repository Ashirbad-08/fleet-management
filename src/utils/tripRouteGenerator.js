function stringSeed(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function generateTripRoute(vehicle, trip, numPoints = 50) {
  if (!trip) return null

  const baseLat = Number(vehicle?.lat) || 20.5937
  const baseLon = Number(vehicle?.lon) || 78.9629

  const seed = stringSeed(String(trip.id || trip.tripNumber || 'trip_seed'))
  const angle = (seed % 360) * (Math.PI / 180)

  // Trip distance in km
  const tripDistKm = parseFloat(trip.distance) || 12.0
  // Convert distance roughly to coordinate delta (1 deg ~ 111 km)
  const degSpan = Math.min(0.12, Math.max(0.03, (tripDistKm / 111) * 0.9))

  const startLat = baseLat - Math.sin(angle) * (degSpan * 0.5)
  const startLon = baseLon - Math.cos(angle) * (degSpan * 0.5)
  const endLat = baseLat + Math.sin(angle) * (degSpan * 0.5)
  const endLon = baseLon + Math.cos(angle) * (degSpan * 0.5)

  const startBatt = Number(trip.startBattery) || 90
  const endBatt = Number(trip.endBattery) || 75
  const avgSpd = parseFloat(trip.avgSpeed) || 30
  const maxSpd = parseFloat(trip.maxSpeed) || Math.round(avgSpd * 1.45)

  const points = []
  const waypoints = []

  // Create smooth bezier-like path with realistic road turn perturbations
  const midPerturbX = Math.sin(seed * 0.17) * (degSpan * 0.35)
  const midPerturbY = Math.cos(seed * 0.23) * (degSpan * 0.35)

  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1)

    // Quadratic bezier curve interpolation
    const oneMinusT = 1 - t
    const cLat = (startLat + endLat) / 2 + midPerturbX
    const cLon = (startLon + endLon) / 2 + midPerturbY

    let lat = oneMinusT * oneMinusT * startLat + 2 * oneMinusT * t * cLat + t * t * endLat
    let lon = oneMinusT * oneMinusT * startLon + 2 * oneMinusT * t * cLon + t * t * endLon

    // Small road turn variations (except at endpoints)
    if (i > 0 && i < numPoints - 1) {
      const roadJitter = Math.sin(i * 1.3 + seed) * (degSpan * 0.04)
      lat += roadJitter * Math.cos(angle)
      lon -= roadJitter * Math.sin(angle)
    }

    // Realistic speed profile: slow at start/stop, faster in mid sections
    const speedCurve = Math.sin(t * Math.PI)
    const currentSpeed = Math.round(15 + speedCurve * (avgSpd - 10) + Math.sin(i * 2.1) * 4)
    const clampedSpeed = Math.max(8, Math.min(Math.round(maxSpd), currentSpeed))

    // Battery linear-ish discharge
    const currentBatt = Math.round(startBatt - t * (startBatt - endBatt))
    const currentDist = (t * tripDistKm).toFixed(1)

    points.push({
      index: i,
      lat: Number(lat.toFixed(6)),
      lon: Number(lon.toFixed(6)),
      speed: clampedSpeed,
      battery: currentBatt,
      distanceKm: currentDist,
      percent: Math.round(t * 100),
    })

    waypoints.push([Number(lat.toFixed(6)), Number(lon.toFixed(6))])
  }

  return {
    trip,
    waypoints,
    points,
    startPoint: points[0],
    endPoint: points[points.length - 1],
    totalDistanceKm: tripDistKm,
    duration: trip.duration,
  }
}
