/**
 * Vehicle CSV & Excel parsing and mapping helpers
 */

export function normalizeHeader(h) {
  return String(h || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

export function parseCSVText(text) {
  const lines = text
    .split(/\r\n|\n|\r/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
  if (lines.length < 2) return { headers: [], rows: [] }

  const parseLine = (line) => {
    const result = []
    let cur = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if ((c === ',' || c === '\t' || c === ';') && !inQuotes) {
        result.push(cur.trim())
        cur = ''
      } else {
        cur += c
      }
    }
    result.push(cur.trim())
    return result
  }

  const rawHeaders = parseLine(lines[0])
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i])
    if (values.some((v) => v !== '')) {
      rows.push(values)
    }
  }
  return { headers: rawHeaders, rows }
}

export function mapRowsToVehicles(headers, rows) {
  const headerMap = {}
  headers.forEach((h, index) => {
    const norm = normalizeHeader(h)
    if (['name', 'vehiclename', 'vehicle', 'title'].includes(norm)) headerMap.name = index
    else if (['plate', 'licenseplate', 'regno', 'registration', 'plateno', 'number', 'platenumber'].includes(norm))
      headerMap.plate = index
    else if (['deviceid', 'imei', 'deviceimei', 'device', 'trackerid', 'trackerimei', 'iotid'].includes(norm))
      headerMap.deviceId = index
    else if (['sim', 'simnumber', 'simno', 'simcard', 'simcardno', 'simcardnumber', 'simphoneno', 'iccid'].includes(norm)) headerMap.simNumber = index
    else if (['model', 'vehiclemodel', 'carmodel', 'evmodel'].includes(norm)) headerMap.model = index
    else if (['type', 'vehicletype', 'category', 'wheels'].includes(norm)) headerMap.type = index
    else if (['driver', 'drivername', 'pilot', 'operator'].includes(norm)) headerMap.driver = index
    else if (['driverphone', 'pilotphone', 'drivermobile', 'phoneno', 'phone', 'drivercontact', 'driverphoneno'].includes(norm))
      headerMap.driverPhone = index
    else if (['status', 'state', 'currentstatus'].includes(norm)) headerMap.status = index
    else if (['battery', 'batterypercentage', 'batterypct', 'soc', 'charge', 'batterylevel'].includes(norm))
      headerMap.battery = index
    else if (['range', 'rangekm', 'estimatedrange', 'totalkm', 'rangeinrange'].includes(norm))
      headerMap.rangeKm = index
    else if (['batteryserial', 'batteryserialno', 'batterysn', 'serialno', 'bsn', 'batteryno'].includes(norm))
      headerMap.batterySerial = index
    else if (['batterycapacitykwh', 'capacitykwh', 'kwh', 'packkwh', 'capacity', 'batterycapacity'].includes(norm))
      headerMap.batteryCapacityKwh = index
    else if (['batterycapacityah', 'capacityah', 'ah', 'packah'].includes(norm))
      headerMap.batteryCapacityAh = index
    else if (['batterychemistry', 'chemistry', 'celltype'].includes(norm))
      headerMap.batteryChemistry = index
    else if (['batterytype', 'mounttype', 'mountingtype'].includes(norm))
      headerMap.batteryType = index
    else if (['chargervariant', 'chargertype', 'charger'].includes(norm))
      headerMap.chargerVariant = index
    else if (['chargercapacity', 'chargerkw', 'chargerrating'].includes(norm))
      headerMap.chargerCapacity = index
    else if (['insuranceexpiry', 'insuranceexpirydate', 'insurancedate', 'insurancevalidity'].includes(norm))
      headerMap.insuranceExpiry = index
    else if (['fitnessexpiry', 'fitnessdate', 'fitnessexpirydate', 'fitnessvalidity'].includes(norm))
      headerMap.fitnessExpiry = index
    else if (['chassisnumber', 'chassisno', 'chassis', 'vin', 'frameno'].includes(norm))
      headerMap.chassisNumber = index
    else if (['hubsupervisorname', 'supervisorname', 'supervisor', 'hubsupervisor', 'hubhead'].includes(norm))
      headerMap.hubSupervisorName = index
    else if (['hubsupervisorphone', 'supervisorphoneno', 'supervisorcontact', 'hubphone', 'supervisormobile'].includes(norm))
      headerMap.hubSupervisorPhone = index
    else if (['clientname', 'client', 'account', 'customer', 'customername'].includes(norm))
      headerMap.clientName = index
    else if (['location', 'city', 'depot', 'address', 'hub', 'currentlocation'].includes(norm))
      headerMap.location = index
    else if (['lat', 'latitude'].includes(norm)) headerMap.lat = index
    else if (['lon', 'lng', 'longitude'].includes(norm)) headerMap.lon = index
  })

  return rows
    .map((row, idx) => {
      const getVal = (field) => {
        const colIdx = headerMap[field]
        return colIdx !== undefined && row[colIdx] !== undefined ? String(row[colIdx]).trim() : ''
      }

      const name = getVal('name')
      const plate = getVal('plate')
      const model = getVal('model')

      if (!name && !plate && !model) return null

      // Normalize vehicle type
      let rawType = getVal('type').toLowerCase()
      let type = '4 Wheeler'
      if (rawType.includes('2') || rawType.includes('two') || rawType.includes('bike') || rawType.includes('scooter')) {
        type = '2 Wheeler'
      } else if (rawType.includes('3') || rawType.includes('three') || rawType.includes('auto') || rawType.includes('trike')) {
        type = '3 Wheeler'
      }

      // Normalize status
      let rawStatus = getVal('status').toLowerCase()
      let status = 'online'
      if (['idle', 'standby', 'parked'].includes(rawStatus)) status = 'idle'
      else if (['alert', 'warning', 'critical', 'danger'].includes(rawStatus)) status = 'alert'
      else if (['offline', 'disconnected', 'disabled'].includes(rawStatus)) status = 'offline'

      const battery = Number(getVal('battery')) || 85
      const rangeKm = Number(getVal('rangeKm')) || 75
      const lat = Number(getVal('lat')) || 12.9716 + (Math.random() - 0.5) * 0.08
      const lon = Number(getVal('lon')) || 77.5946 + (Math.random() - 0.5) * 0.08

      return {
        _tempId: `tmp-${Date.now()}-${idx}`,
        name: name || `Vehicle ${idx + 1}`,
        plate: plate || `IN-${Math.floor(10 + Math.random() * 89)} AB ${Math.floor(1000 + Math.random() * 8999)}`,
        simNumber: getVal('simNumber') || '',
        deviceId: getVal('deviceId') || `IOT-${Math.floor(10000 + Math.random() * 90000)}`,
        model: model || 'Commercial EV',
        type,
        driver: getVal('driver') || 'Unassigned',
        driverPhone: getVal('driverPhone') || '+91 98765 43210',
        status,
        battery: Math.min(100, Math.max(0, battery)),
        rangeKm: Math.max(0, rangeKm),
        batterySerial: getVal('batterySerial') || `BAT-2026-X${idx + 10}`,
        batteryCapacityKwh: Number(getVal('batteryCapacityKwh')) || 12.8,
        batteryCapacityAh: Number(getVal('batteryCapacityAh')) || 80,
        batteryChemistry: getVal('batteryChemistry') || 'LFP',
        batteryType: getVal('batteryType') || 'Fixed',
        chargerVariant: getVal('chargerVariant') || 'On Board',
        chargerCapacity: getVal('chargerCapacity') || '3.3 kW',
        insuranceExpiry: getVal('insuranceExpiry') || '2026-12-31',
        fitnessExpiry: getVal('fitnessExpiry') || '2027-12-31',
        chassisNumber: getVal('chassisNumber') || `ME4GG8700P${100000 + idx}`,
        hubSupervisorName: getVal('hubSupervisorName') || 'Rajesh Kumar',
        hubSupervisorPhone: getVal('hubSupervisorPhone') || '+91 98111 22334',
        clientName: getVal('clientName') || 'Central Fleet',
        location: getVal('location') || 'Fleet Central Hub',
        lat,
        lon,
      }
    })
    .filter(Boolean)
}
