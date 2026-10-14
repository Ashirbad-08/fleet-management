import { useState, useRef, useEffect } from 'react'
import readXlsxFile from 'read-excel-file/browser'
import {
  X,
  Plus,
  Save,
  FileSpreadsheet,
  FileUp,
  Download,
  Trash2,
  AlertCircle,
  CheckCheck,
  Truck,
  Cpu,
  Zap,
  Users,
  ShieldCheck,
  Radio,
  Plug,
} from './icons'
import { useFleet } from '../context/FleetContext'

const INITIAL_FORM_DATA = {
  // 1. Identity & Connectivity
  name: '',
  plate: '',
  deviceId: '',
  model: '',
  type: '4 Wheeler',
  status: 'online',

  // 2. Battery & Hardware Profile
  batterySerial: '',
  batteryCapacityKwh: 12.8,
  batteryCapacityAh: 80,
  batteryChemistry: 'LFP',
  batteryType: 'Fixed',
  chargerVariant: 'On Board',
  chargerCapacity: '3.3 kW',
  battery: 100,
  rangeKm: 80,

  // 3. Operations & Assignment
  location: '',
  driver: '',
  driverPhone: '',
  hubSupervisorName: '',
  hubSupervisorPhone: '',
  clientName: '',
  lat: 12.9716,
  lon: 77.5946,

  // 4. Compliance & Expiries
  chassisNumber: '',
  insuranceExpiry: '2026-12-31',
  fitnessExpiry: '2027-12-31',
}

const inputCls =
  'w-full rounded-md border border-line bg-panel-2 px-3 py-2 text-[12.5px] text-hi outline-none focus:border-line focus:outline-none'

function normalizeHeader(h) {
  return String(h || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function parseCSVText(text) {
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

function mapRowsToVehicles(headers, rows) {
  const headerMap = {}
  headers.forEach((h, index) => {
    const norm = normalizeHeader(h)
    if (['name', 'vehiclename', 'vehicle', 'title'].includes(norm)) headerMap.name = index
    else if (['plate', 'licenseplate', 'regno', 'registration', 'plateno', 'number', 'platenumber'].includes(norm))
      headerMap.plate = index
    else if (['deviceid', 'imei', 'deviceimei', 'device', 'trackerid', 'trackerimei', 'iotid'].includes(norm))
      headerMap.deviceId = index
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

export default function AddVehicleModal({ open, onClose }) {
  const { addVehicle, addMultipleVehicles } = useFleet()
  const [tab, setTab] = useState('single') // 'single' | 'bulk'
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)

  // Bulk upload states
  const [dragOver, setDragOver] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [parsedVehicles, setParsedVehicles] = useState([])
  const [fileName, setFileName] = useState('')
  const [parseError, setParseError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (open === 'bulk') {
      setTab('bulk')
    } else if (open) {
      setTab('single')
    }
  }, [open])

  if (!open) return null

  const updateField = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSingleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.plate || !formData.deviceId || !formData.model || !formData.type) return
    addVehicle({
      ...formData,
      deviceId: formData.deviceId || `IOT-${Math.floor(10000 + Math.random() * 90000)}`,
      type: formData.type || '4 Wheeler',
      battery: Number(formData.battery) || 100,
      rangeKm: Number(formData.rangeKm) || 80,
      batteryCapacityKwh: Number(formData.batteryCapacityKwh) || 12.8,
      batteryCapacityAh: Number(formData.batteryCapacityAh) || 80,
      lat: Number(formData.lat) || 12.9716,
      lon: Number(formData.lon) || 77.5946,
    })
    setFormData(INITIAL_FORM_DATA)
    onClose()
  }

  const downloadSampleTemplate = () => {
    const headers = [
      'Name',
      'Plate',
      'Device IMEI',
      'Model',
      'Type',
      'Status',
      'Battery Serial',
      'Capacity kWh',
      'Capacity Ah',
      'Chemistry',
      'Charger Variant',
      'Charger Capacity',
      'Hub Location',
      'Driver',
      'Driver Phone',
      'Hub Supervisor',
      'Supervisor Phone',
      'Client Name',
      'Chassis VIN',
      'Insurance Expiry',
      'Fitness Expiry',
      'Battery %',
      'RangeKm',
      'Latitude',
      'Longitude',
    ]
    const sampleRows = [
      ['Hauler 15', 'MH12 AB 9988', '860123045678901', 'Tata Ace EV', '4 Wheeler', 'online', 'BAT-2026-X10', '14.2', '80', 'LFP', 'On Board', '3.3 kW', 'Pune Depot 1', 'Rajesh K.', '+91 98765 43210', 'Suresh Nair', '+91 98111 22331', 'IKEA', 'ME4GG8700P102931', '2026-12-31', '2027-12-31', '88', '75', '18.5204', '73.8567'],
      ['Courier 09', 'DL3C BB 1022', '860123045678902', 'Mahindra eSupro', '4 Wheeler', 'idle', 'BAT-2026-X11', '12.8', '75', 'LFP', 'Off Board', '35 Amps', 'Okhla Hub, Delhi', 'Amit S.', '+91 98765 43211', 'Manish Gupta', '+91 98111 22332', 'Amazon', 'ME4GG8700P102932', '2026-11-30', '2027-10-31', '65', '50', '28.5355', '77.2588'],
      ['Express 03', 'KA04 MZ 4491', '860123045678903', 'Ather 450X EV', '2 Wheeler', 'online', 'BAT-2026-X12', '3.7', '40', 'NMC', 'Off Board', '15 Amps', 'Indiranagar, Blr', 'Vikas N.', '+91 98765 43212', 'Anand Rao', '+91 98111 22333', 'Zepto', 'ME4GG8700P102933', '2027-01-15', '2028-01-15', '92', '80', '12.9784', '77.6408'],
      ['Cargo 3W 05', 'TN07 CZ 9931', '860123045678904', 'Piaggio Ape E-City', '3 Wheeler', 'online', 'BAT-2026-X13', '8.0', '60', 'LFP', 'On Board', '3.0 kW', 'Guindy, Chennai', 'M. Selvam', '+91 98765 43213', 'R. Krishnan', '+91 98111 22334', 'DHL', 'ME4GG8700P102934', '2026-10-20', '2027-09-20', '95', '72', '13.0067', '80.2025'],
      ['Reefer 04', 'GJ01 KX 4421', '860123045678905', 'Ashok Leyland Dost', '4 Wheeler', 'alert', 'BAT-2026-X14', '15.5', '90', 'LFP', 'On Board', '3.3 kW', 'Vatva GIDC', 'P. Patel', '+91 98765 43214', 'Dipak Mehta', '+91 98111 22335', 'Amul', 'ME4GG8700P102935', '2026-09-30', '2027-08-30', '24', '18', '22.9784', '72.5987'],
    ]

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...sampleRows.map((r) => r.map((val) => `"${val}"`).join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'fleet_vehicles_bulk_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const processFile = async (file) => {
    if (!file) return
    setIsParsing(true)
    setParseError('')
    setFileName(file.name)

    try {
      const ext = file.name.split('.').pop().toLowerCase()
      if (ext === 'xlsx' || ext === 'xls') {
        const rows = await readXlsxFile(file)
        if (!rows || rows.length < 2) {
          throw new Error('Excel file must contain a header row and at least one vehicle record.')
        }
        const headers = rows[0]
        const dataRows = rows.slice(1)
        const vehicles = mapRowsToVehicles(headers, dataRows)
        if (vehicles.length === 0) {
          throw new Error('No valid vehicle records found in the Excel sheet.')
        }
        setParsedVehicles(vehicles)
      } else if (ext === 'csv' || ext === 'txt') {
        const text = await file.text()
        const { headers, rows } = parseCSVText(text)
        if (headers.length === 0 || rows.length === 0) {
          throw new Error('CSV file must contain a header row and at least one vehicle record.')
        }
        const vehicles = mapRowsToVehicles(headers, rows)
        if (vehicles.length === 0) {
          throw new Error('No valid vehicle records found in the CSV file.')
        }
        setParsedVehicles(vehicles)
      } else {
        throw new Error('Unsupported file format. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.')
      }
    } catch (err) {
      setParseError(err.message || 'Failed to read file')
      setParsedVehicles([])
    } finally {
      setIsParsing(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const removeParsedRow = (tempId) => {
    setParsedVehicles((prev) => prev.filter((v) => v._tempId !== tempId))
  }

  const handleBulkImport = () => {
    if (parsedVehicles.length === 0) return
    addMultipleVehicles(parsedVehicles)
    setParsedVehicles([])
    setFileName('')
    onClose()
  }

  const isBulkTab = tab === 'bulk'

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity"
      />
      <div
        className={`fixed left-1/2 top-1/2 z-50 max-h-[92dvh] w-[calc(100vw-2rem)] ${
          isBulkTab ? 'max-w-3xl' : 'max-w-2xl'
        } -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-line bg-panel shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-line-soft px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent">
              {isBulkTab ? (
                <FileSpreadsheet className="h-4 w-4" strokeWidth={2.2} />
              ) : (
                <Plus className="h-4 w-4" strokeWidth={2.5} />
              )}
            </div>
            <div>
              <span className="font-display text-[14.5px] font-bold text-hi">
                {isBulkTab ? 'Bulk Vehicle Import' : 'Add New Vehicle'}
              </span>
              <p className="text-[11px] text-dim">
                {isBulkTab
                  ? 'Import multiple vehicles via Excel or CSV spreadsheet'
                  : 'Register a single EV unit to the fleet'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-panel-2 text-lo hover:bg-hover hover:text-hi cursor-pointer"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.2} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-line-soft bg-panel-2/50 px-5 pt-2">
          <button
            type="button"
            onClick={() => setTab('single')}
            className={`flex items-center gap-1.5 border-b-2 px-3.5 py-2 text-[12px] font-medium transition-all cursor-pointer ${
              tab === 'single'
                ? 'border-accent text-accent'
                : 'border-transparent text-dim hover:text-hi'
            }`}
          >
            <Truck className="h-3.5 w-3.5" />
            <span>Single Vehicle</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('bulk')}
            className={`flex items-center gap-1.5 border-b-2 px-3.5 py-2 text-[12px] font-medium transition-all cursor-pointer ${
              tab === 'bulk'
                ? 'border-accent text-accent'
                : 'border-transparent text-dim hover:text-hi'
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Excel / CSV Bulk Upload</span>
          </button>
        </div>

        {/* Modal Body */}
        {tab === 'single' ? (
          <form onSubmit={handleSingleSubmit} className="max-h-[calc(92dvh-8.5rem)] space-y-4 overflow-y-auto p-5">
            {/* Section 1: Identity & Connectivity */}
            <div className="rounded-xl border border-line-soft bg-panel-2/40 p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-line-soft/60 pb-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/15 text-accent">
                  <Cpu className="h-3 w-3" strokeWidth={2.5} />
                </span>
                <span className="font-display text-[12px] font-bold uppercase tracking-wider text-hi">
                  1. Identity & Connectivity
                </span>
                <span className="ml-auto text-[10px] text-accent font-medium">Core Identifiers (All Required *)</span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">
                    Vehicle Name <span className="text-accent">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Hauler 15"
                    value={formData.name}
                    onChange={updateField('name')}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">
                    License Plate <span className="text-accent">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. MH12 AB 9988"
                    value={formData.plate}
                    onChange={updateField('plate')}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">
                    Device IMEI / ID <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      placeholder="e.g. 860123045678901"
                      value={formData.deviceId}
                      onChange={updateField('deviceId')}
                      className={inputCls}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">
                    Make / Model <span className="text-accent">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Tata Ace EV"
                    value={formData.model}
                    onChange={updateField('model')}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">
                    Vehicle Type <span className="text-accent">*</span>
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={updateField('type')}
                    className={inputCls + ' cursor-pointer'}
                  >
                    <option value="2 Wheeler">2 Wheeler</option>
                    <option value="3 Wheeler">3 Wheeler</option>
                    <option value="4 Wheeler">4 Wheeler</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Battery & Hardware Profile */}
            <div className="rounded-xl border border-line-soft bg-panel-2/40 p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-line-soft/60 pb-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-amber/15 text-amber">
                  <Zap className="h-3 w-3" strokeWidth={2.5} />
                </span>
                <span className="font-display text-[12px] font-bold uppercase tracking-wider text-hi">
                  2. Battery & Hardware Profile
                </span>
                <span className="ml-auto text-[10px] text-amber font-medium">Pack & Power Specs</span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-dim">
                    Battery Serial No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BAT-2026-X10"
                    value={formData.batterySerial}
                    onChange={updateField('batterySerial')}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-dim">
                    Pack Capacity (kWh)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="14.2"
                    value={formData.batteryCapacityKwh}
                    onChange={updateField('batteryCapacityKwh')}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-dim">
                    Pack Capacity (Ah)
                  </label>
                  <input
                    type="number"
                    step="1"
                    placeholder="80"
                    value={formData.batteryCapacityAh}
                    onChange={updateField('batteryCapacityAh')}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-dim">
                    Chemistry
                  </label>
                  <select
                    value={formData.batteryChemistry}
                    onChange={updateField('batteryChemistry')}
                    className={inputCls + ' cursor-pointer'}
                  >
                    <option value="LFP">LFP (Lithium Iron Phosphate)</option>
                    <option value="NMC">NMC (Nickel Manganese Cobalt)</option>
                    <option value="Solid State">Solid State</option>
                    <option value="LTO">LTO (Lithium Titanate)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-dim">
                    Charger Variant
                  </label>
                  <select
                    value={formData.chargerVariant}
                    onChange={updateField('chargerVariant')}
                    className={inputCls + ' cursor-pointer'}
                  >
                    <option value="On Board">On Board Charger</option>
                    <option value="Off Board">Off Board Charger</option>
                    <option value="DC Fast Station">DC Fast Station</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-dim">
                    Charger Capacity / Rating
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3.3 kW or 35 Amps"
                    value={formData.chargerCapacity}
                    onChange={updateField('chargerCapacity')}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1 border-t border-line-soft/40">
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-dim">
                    Initial Battery % (SoC)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.battery}
                    onChange={updateField('battery')}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-dim">
                    Estimated Range (km)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.rangeKm}
                    onChange={updateField('rangeKm')}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Operations & Assignment */}
            <div className="rounded-xl border border-line-soft bg-panel-2/40 p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-line-soft/60 pb-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/15 text-emerald-400">
                  <Users className="h-3 w-3" strokeWidth={2.5} />
                </span>
                <span className="font-display text-[12px] font-bold uppercase tracking-wider text-hi">
                  3. Operations & Assignment
                </span>
                <span className="ml-auto text-[10px] text-emerald-400 font-medium">Depot & People</span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-dim">
                    Hub / Depot Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pune Depot 1"
                    value={formData.location}
                    onChange={updateField('location')}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-dim">
                    Client / Account Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IKEA / Amazon / Zepto"
                    value={formData.clientName}
                    onChange={updateField('clientName')}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-dim">
                    Driver Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh K."
                    value={formData.driver}
                    onChange={updateField('driver')}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-dim">
                    Driver Phone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={formData.driverPhone}
                    onChange={updateField('driverPhone')}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-dim">
                    Hub Supervisor Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Suresh Nair"
                    value={formData.hubSupervisorName}
                    onChange={updateField('hubSupervisorName')}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-dim">
                    Hub Supervisor Phone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98111 22331"
                    value={formData.hubSupervisorPhone}
                    onChange={updateField('hubSupervisorPhone')}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-1 border-t border-line-soft/40">
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-dim">
                    Initial Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={updateField('status')}
                    className={inputCls + ' cursor-pointer'}
                  >
                    <option value="online">Online</option>
                    <option value="idle">Idle</option>
                    <option value="alert">Alert</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-dim">
                    Hub Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 18.5204"
                    value={formData.lat}
                    onChange={updateField('lat')}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-dim">
                    Hub Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 73.8567"
                    value={formData.lon}
                    onChange={updateField('lon')}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Compliance & Expiries */}
            <div className="rounded-xl border border-line-soft bg-panel-2/40 p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-line-soft/60 pb-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-500/15 text-blue-400">
                  <ShieldCheck className="h-3 w-3" strokeWidth={2.5} />
                </span>
                <span className="font-display text-[12px] font-bold uppercase tracking-wider text-hi">
                  4. Compliance & Expiries
                </span>
                <span className="ml-auto text-[10px] text-blue-400 font-medium">Legal & Validity</span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-dim">
                    Chassis / VIN Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ME4GG8700P102931"
                    value={formData.chassisNumber}
                    onChange={updateField('chassisNumber')}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-dim">
                    Insurance Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.insuranceExpiry}
                    onChange={updateField('insuranceExpiry')}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-dim">
                    Fitness Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.fitnessExpiry}
                    onChange={updateField('fitnessExpiry')}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-line-soft pt-3 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-line bg-panel-2 py-2 text-[12.5px] font-medium text-lo hover:bg-hover hover:text-hi cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent/20 py-2 text-[12.5px] font-medium text-accent hover:bg-accent/30 cursor-pointer shadow-sm"
              >
                <Save className="h-4 w-4" strokeWidth={2} />
                Register Vehicle
              </button>
            </div>
          </form>
        ) : (
          <div className="max-h-[calc(92dvh-8.5rem)] space-y-4 overflow-y-auto p-5">
            {/* Download Template Bar */}
            <div className="flex flex-col gap-2 rounded-lg border border-line bg-panel-2/60 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="h-4 w-4 text-accent shrink-0" />
                <div>
                  <div className="text-[12px] font-medium text-hi">Need the spreadsheet template?</div>
                  <div className="text-[10.5px] text-dim">
                    Download our ready-made Excel/CSV template with expected columns and sample rows.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={downloadSampleTemplate}
                className="flex items-center justify-center gap-1.5 rounded-md border border-line bg-panel px-3 py-1.5 text-[11px] font-medium text-hi hover:border-accent/40 hover:text-accent transition-colors cursor-pointer shrink-0"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Template</span>
              </button>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
                dragOver
                  ? 'border-accent bg-accent/10'
                  : 'border-line hover:border-line-soft bg-panel-2/30 hover:bg-panel-2/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent mb-2">
                <FileUp className="h-5 w-5" />
              </div>
              <div className="text-[13px] font-medium text-hi">
                {isParsing ? 'Reading spreadsheet data...' : 'Click to select or drag & drop Excel / CSV file'}
              </div>
              <div className="mt-1 text-[11px] text-dim">
                Supported formats: <span className="text-hi font-mono">.xlsx</span>,{' '}
                <span className="text-hi font-mono">.xls</span>,{' '}
                <span className="text-hi font-mono">.csv</span>
              </div>
            </div>

            {/* Parsing error */}
            {parseError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-[11.5px] text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {/* Parsed vehicles preview */}
            {parsedVehicles.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                      <CheckCheck className="h-3 w-3" />
                      {parsedVehicles.length} vehicles parsed
                    </span>
                    <span className="text-[11px] text-dim font-mono">{fileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setParsedVehicles([])
                      setFileName('')
                    }}
                    className="text-[11px] text-dim hover:text-red-400 transition-colors cursor-pointer"
                  >
                    Clear list
                  </button>
                </div>

                {/* Preview Table */}
                <div className="max-h-60 overflow-auto rounded-lg border border-line bg-panel-2/40">
                  <table className="w-full text-left text-[11.5px]">
                    <thead className="sticky top-0 border-b border-line-soft bg-panel-2 text-[10.5px] font-semibold uppercase text-dim">
                      <tr>
                        <th className="px-3 py-2">Vehicle</th>
                        <th className="px-3 py-2">Plate</th>
                        <th className="px-3 py-2">Model</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Driver</th>
                        <th className="px-3 py-2">Battery</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-2 py-2 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line-soft/60 font-sans">
                      {parsedVehicles.map((v) => (
                        <tr key={v._tempId} className="hover:bg-panel-2/70 transition-colors">
                          <td className="px-3 py-2 font-medium text-hi">{v.name}</td>
                          <td className="px-3 py-2 font-mono text-[11px] text-lo">{v.plate}</td>
                          <td className="px-3 py-2 text-dim">{v.model}</td>
                          <td className="px-3 py-2 text-dim">{v.type}</td>
                          <td className="px-3 py-2 text-dim">{v.driver}</td>
                          <td className="px-3 py-2 text-lo">{v.battery}%</td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium capitalize ${
                                v.status === 'online'
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : v.status === 'alert'
                                  ? 'bg-rose-500/15 text-rose-400'
                                  : v.status === 'idle'
                                  ? 'bg-amber-500/15 text-amber-400'
                                  : 'bg-zinc-500/15 text-zinc-400'
                              }`}
                            >
                              {v.status}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => removeParsedRow(v._tempId)}
                              title="Remove row"
                              className="text-dim hover:text-rose-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bulk Footer Actions */}
            <div className="flex flex-col gap-3 border-t border-line-soft pt-3 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-line bg-panel-2 py-2 text-[12.5px] font-medium text-lo hover:bg-hover hover:text-hi cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={parsedVehicles.length === 0}
                onClick={handleBulkImport}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12.5px] font-medium transition-all ${
                  parsedVehicles.length > 0
                    ? 'bg-accent/20 text-accent hover:bg-accent/30 cursor-pointer shadow-sm'
                    : 'bg-panel-2 text-dim cursor-not-allowed opacity-50'
                }`}
              >
                <Save className="h-4 w-4" strokeWidth={2} />
                <span>
                  {parsedVehicles.length > 0
                    ? `Import ${parsedVehicles.length} Vehicles`
                    : 'Upload file to import'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
