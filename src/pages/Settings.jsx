import { useState, useEffect } from 'react'
import Topbar from '../components/Topbar'
import { useFleet, TIMEZONE_OPTIONS, getTimezoneIana } from '../context/FleetContext'
import {
  Settings as SettingsIcon,
  Lock,
  Bell,
  ShieldCheck,
  Eye,
  EyeOff,
} from '../components/icons'

export default function Settings() {
  const { settings, updateSettings, showToast } = useFleet()
  const [activeTab, setActiveTab] = useState('general') // 'general', 'alerts', 'security'
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 200)
    return () => clearTimeout(timer)
  }, [activeTab])

  // General Settings State
  const [orgName, setOrgName] = useState(settings?.orgName ?? 'Acme Logistics Pvt. Ltd.')
  const [region, setRegion] = useState(settings?.region ?? 'India - West & South')
  const [defaultCityHub, setDefaultCityHub] = useState(settings?.defaultCityHub ?? 'Pune Depot')
  const [unitSystem, setUnitSystem] = useState(settings?.unitSystem ?? 'Metric')
  const [speedUnit, setSpeedUnit] = useState(settings?.speedUnit ?? 'km/h')
  const [distanceUnit, setDistanceUnit] = useState(settings?.distanceUnit ?? 'kilometers')
  const [tempUnit, setTempUnit] = useState(settings?.tempUnit ?? 'Celsius')
  const [mapStyle, setMapStyle] = useState(settings?.mapStyle ?? 'Dark Mode')
  const [timezone, setTimezone] = useState(settings?.timezone ?? 'IST (GMT+5:30)')
  const [livePreviewTime, setLivePreviewTime] = useState('')

  // Live preview clock for currently selected timezone
  useEffect(() => {
    const updatePreview = () => {
      try {
        const iana = getTimezoneIana(timezone)
        const formatted = new Intl.DateTimeFormat('en-GB', {
          timeZone: iana,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }).format(new Date())
        setLivePreviewTime(formatted)
      } catch {
        setLivePreviewTime('')
      }
    }
    updatePreview()
    const id = setInterval(updatePreview, 1000)
    return () => clearInterval(id)
  }, [timezone])

  // Alerts Settings State
  const [overspeed, setOverspeed] = useState(settings?.overspeed ?? 80)
  const [lowBattery, setLowBattery] = useState(settings?.lowBattery ?? 15)
  const [highBatteryTemp, setHighBatteryTemp] = useState(settings?.highBatteryTemp ?? 45)
  const [geofenceEntry, setGeofenceEntry] = useState(settings?.geofenceEntry ?? true)
  const [geofenceExit, setGeofenceExit] = useState(settings?.geofenceExit ?? true)
  const [channels, setChannels] = useState(settings?.channels ?? { email: true, sms: false, push: true })

  // Browser Notification Status
  const [pushPermission, setPushPermission] = useState(() => {
    return 'Notification' in window ? Notification.permission : 'unsupported'
  })

  // Security Settings State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)

  // Sync state with global settings context
  useEffect(() => {
    if (settings) {
      setOrgName(settings.orgName ?? 'Acme Logistics Pvt. Ltd.')
      setRegion(settings.region ?? 'India - West & South')
      setDefaultCityHub(settings.defaultCityHub ?? 'Pune Depot')
      setUnitSystem(settings.unitSystem ?? 'Metric')
      setSpeedUnit(settings.speedUnit ?? 'km/h')
      setDistanceUnit(settings.distanceUnit ?? 'kilometers')
      setTempUnit(settings.tempUnit ?? 'Celsius')
      setMapStyle(settings.mapStyle ?? 'Dark Mode')
      setTimezone(settings.timezone ?? 'IST (GMT+5:30)')
      setOverspeed(settings.overspeed ?? 80)
      setLowBattery(settings.lowBattery ?? 15)
      setHighBatteryTemp(settings.highBatteryTemp ?? 45)
      setGeofenceEntry(settings.geofenceEntry ?? true)
      setGeofenceExit(settings.geofenceExit ?? true)
      setChannels(settings.channels ?? { email: true, sms: false, push: true })
    }
  }, [settings])

  const handleUnitSystemChange = (system) => {
    setUnitSystem(system)
    if (system === 'Metric') {
      setSpeedUnit('km/h')
      setDistanceUnit('kilometers')
      setTempUnit('Celsius')
    } else {
      setSpeedUnit('mph')
      setDistanceUnit('miles')
      setTempUnit('Fahrenheit')
    }
  }

  const handleSaveGeneral = (e) => {
    e.preventDefault()
    updateSettings({
      orgName,
      region,
      defaultCityHub,
      unitSystem,
      speedUnit,
      distanceUnit,
      tempUnit,
      mapStyle,
      timezone,
    })
    showToast('General settings saved successfully')
  }

  const handleSaveAlerts = (e) => {
    e.preventDefault()
    updateSettings({
      overspeed,
      lowBattery,
      highBatteryTemp,
      geofenceEntry,
      geofenceExit,
      channels,
    })
    showToast('Alert policies updated successfully')
  }

  const handleTogglePush = async (e) => {
    const checked = e.target.checked
    if (checked) {
      if (!('Notification' in window)) {
        showToast('Browser notifications are not supported on this browser')
        return
      }
      if (pushPermission !== 'granted') {
        try {
          const res = await Notification.requestPermission()
          setPushPermission(res)
          if (res === 'granted') {
            setChannels((prev) => ({ ...prev, push: true }))
            showToast('Browser notifications turned ON')
            new Notification('ElectriE Fleet Control', {
              body: 'Desktop notifications are active for live fleet alerts',
              icon: '/favicon.svg',
            })
          } else {
            setChannels((prev) => ({ ...prev, push: false }))
            showToast('Browser notifications permission denied')
          }
        } catch {
          showToast('Could not request notification permission')
        }
      } else {
        setChannels((prev) => ({ ...prev, push: true }))
        showToast('Browser notifications turned ON')
      }
    } else {
      setChannels((prev) => ({ ...prev, push: false }))
      showToast('Browser notifications turned OFF')
    }
  }

  const handlePasswordChange = (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill in all password fields')
      return
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters')
      return
    }
    showToast('Password updated successfully')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const inputCls =
    'rounded-lg border border-line bg-panel-2 px-3.5 py-2 text-[12.5px] text-hi focus:border-accent focus:outline-hidden transition-colors'

  return (
    <div className="flex min-h-0 flex-1 flex-col md:overflow-hidden">
      <Topbar title="Settings" subtitle="Manage organization settings, fleet policies, and security preferences" />

      {/* Tabs Selector */}
      <div className="border-b border-line-soft bg-panel/40 px-4 sm:px-6">
        <div className="flex gap-4">
          {[
            { id: 'general', label: 'General & Localization', icon: SettingsIcon },
            { id: 'alerts', label: 'Alert Policies & Thresholds', icon: Bell },
            { id: 'security', label: 'Security & Account', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-1 py-3 text-[13px] font-medium transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-lo hover:text-hi'
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Settings Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 py-5 sm:px-6 md:pb-5">
        <div className="mx-auto max-w-3xl space-y-6">

          {/* SKELETON LOADING STATE */}
          {isLoading ? (
            <div className="animate-pulse space-y-6">
              <div className="overflow-hidden rounded-xl border border-line bg-panel p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-line-soft pb-4">
                  <div className="h-4 w-40 rounded-xs bg-panel-2" />
                  <div className="h-3 w-20 rounded-xs bg-panel-2/60" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
                  <div className="space-y-1.5">
                    <div className="h-3 w-28 rounded-xs bg-panel-2" />
                    <div className="h-9 w-full rounded-lg bg-panel-2" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 w-28 rounded-xs bg-panel-2" />
                    <div className="h-9 w-full rounded-lg bg-panel-2" />
                  </div>
                </div>
                <div className="space-y-1.5 pt-2">
                  <div className="h-3 w-44 rounded-xs bg-panel-2" />
                  <div className="h-9 w-full rounded-lg bg-panel-2" />
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-line bg-panel p-5 space-y-4">
                <div className="border-b border-line-soft pb-4">
                  <div className="h-4 w-48 rounded-xs bg-panel-2" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="h-16 rounded-lg bg-panel-2" />
                  <div className="h-16 rounded-lg bg-panel-2" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
                  <div className="space-y-1.5">
                    <div className="h-3 w-28 rounded-xs bg-panel-2" />
                    <div className="h-9 w-full rounded-lg bg-panel-2" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 w-28 rounded-xs bg-panel-2" />
                    <div className="h-9 w-full rounded-lg bg-panel-2" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* ============================================================ */}
              {/* TAB 1: GENERAL & LOCALIZATION                                */}
              {/* ============================================================ */}
              {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="space-y-6">
              {/* Organization Profile Card */}
              <div className="overflow-hidden rounded-xl border border-line bg-panel">
                <div className="border-b border-line-soft px-5 py-4 flex items-center justify-between">
                  <h2 className="font-display text-[14px] font-semibold text-hi">Organization Profile</h2>
                  <span className="text-[10.5px] font-mono text-dim uppercase">Company Master</span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium text-lo">Organization Name</label>
                      <input
                        type="text"
                        required
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium text-lo">Operating Region</label>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className={inputCls + ' cursor-pointer'}
                      >
                        <option>India - West & South</option>
                        <option>India - North & NCR</option>
                        <option>India - East & Central</option>
                        <option>Pan-India Operations</option>
                        <option>Global Fleet</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-medium text-lo">Default City Hub (Primary Depot)</label>
                    <select
                      value={defaultCityHub}
                      onChange={(e) => setDefaultCityHub(e.target.value)}
                      className={inputCls + ' cursor-pointer'}
                    >
                      <option value="Pune Depot">Pune Hub (Maharashtra - West)</option>
                      <option value="Okhla Service Yard">Okhla Service Yard (Delhi NCR)</option>
                      <option value="Bengaluru Ring Route">Bengaluru Central Depot (Karnataka)</option>
                      <option value="Mumbai West Hub">Mumbai West Hub (Andheri/Bandra)</option>
                      <option value="Kolkata Central Hub">Kolkata Central Depot (West Bengal)</option>
                    </select>
                    <p className="text-[10.5px] text-dim">The default focal point when opening the live telemetry map.</p>
                  </div>
                </div>
              </div>

              {/* Display & Measurement Preferences */}
              <div className="overflow-hidden rounded-xl border border-line bg-panel">
                <div className="border-b border-line-soft px-5 py-4">
                  <h2 className="font-display text-[14px] font-semibold text-hi">Display & Measurement Units</h2>
                </div>
                <div className="p-5 space-y-4">
                  {/* Unified Unit System Selector */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium text-lo">Measurement System</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onClick={() => handleUnitSystemChange('Metric')}
                        className={`cursor-pointer rounded-lg border p-3.5 transition-all ${
                          unitSystem === 'Metric'
                            ? 'border-accent bg-accent/5'
                            : 'border-line bg-panel-2 hover:bg-hover'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-[12.5px] font-semibold text-hi">Metric System (Recommended)</div>
                          <input
                            type="radio"
                            name="unitSystem"
                            checked={unitSystem === 'Metric'}
                            readOnly
                            className="accent-accent"
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-dim">Speed: <strong>km/h</strong> • Distance: <strong>km</strong> • Temp: <strong>°C</strong></p>
                      </div>

                      <div
                        onClick={() => handleUnitSystemChange('Imperial')}
                        className={`cursor-pointer rounded-lg border p-3.5 transition-all ${
                          unitSystem === 'Imperial'
                            ? 'border-accent bg-accent/5'
                            : 'border-line bg-panel-2 hover:bg-hover'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-[12.5px] font-semibold text-hi">Imperial System</div>
                          <input
                            type="radio"
                            name="unitSystem"
                            checked={unitSystem === 'Imperial'}
                            readOnly
                            className="accent-accent"
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-dim">Speed: <strong>mph</strong> • Distance: <strong>miles</strong> • Temp: <strong>°F</strong></p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-1">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium text-lo">Default Map Style</label>
                      <select
                        value={mapStyle}
                        onChange={(e) => setMapStyle(e.target.value)}
                        className={inputCls + ' cursor-pointer'}
                      >
                        <option>Dark Mode</option>
                        <option>Satellite Hybrid</option>
                        <option>Standard Vector</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[12px] font-medium text-lo">System Timezone</label>
                        {livePreviewTime && (
                          <span className="font-mono text-[10.5px] text-accent font-medium">
                            Live: {livePreviewTime}
                          </span>
                        )}
                      </div>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className={inputCls + ' cursor-pointer'}
                      >
                        {TIMEZONE_OPTIONS.map((tz) => (
                          <option key={tz.value} value={tz.value}>
                            {tz.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-[10.5px] text-dim">
                        All live dashboards, alert feeds, and telemetry clocks will display time in this zone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-5 py-2 text-[12.5px] font-semibold text-base hover:bg-accent/90 transition-all cursor-pointer shadow-xs"
                >
                  Save General Settings
                </button>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* TAB 2: ALERT POLICIES & THRESHOLDS                           */}
          {/* ============================================================ */}
          {activeTab === 'alerts' && (
            <form onSubmit={handleSaveAlerts} className="space-y-6">
              {/* EV & Telemetry Safety Thresholds */}
              <div className="overflow-hidden rounded-xl border border-line bg-panel">
                <div className="border-b border-line-soft px-5 py-4 flex items-center justify-between">
                  <h2 className="font-display text-[14px] font-semibold text-hi">EV Telemetry Thresholds</h2>
                  <span className="text-[10.5px] font-mono text-dim uppercase">Automated Triggers</span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[12px] font-medium text-lo">Speed Limit</label>
                        <span className="font-mono text-[10px] text-accent font-semibold">{speedUnit}</span>
                      </div>
                      <input
                        type="number"
                        min="20"
                        max="160"
                        value={overspeed}
                        onChange={(e) => setOverspeed(parseInt(e.target.value) || 0)}
                        className={inputCls}
                      />
                      <p className="text-[10.5px] text-dim">Overspeed warning generated above this speed.</p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[12px] font-medium text-lo">Low Battery Warning</label>
                        <span className="font-mono text-[10px] text-amber font-semibold">%</span>
                      </div>
                      <input
                        type="number"
                        min="5"
                        max="40"
                        value={lowBattery}
                        onChange={(e) => setLowBattery(parseInt(e.target.value) || 0)}
                        className={inputCls}
                      />
                      <p className="text-[10.5px] text-dim">Urgent prompt to route vehicle to charging depot.</p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[12px] font-medium text-lo">Max Battery Temp</label>
                        <span className="font-mono text-[10px] text-red font-semibold">{tempUnit === 'Fahrenheit' ? '°F' : '°C'}</span>
                      </div>
                      <input
                        type="number"
                        min="35"
                        max="70"
                        value={highBatteryTemp}
                        onChange={(e) => setHighBatteryTemp(parseInt(e.target.value) || 0)}
                        className={inputCls}
                      />
                      <p className="text-[10.5px] text-dim">Thermal safety alert to prevent battery overheating.</p>
                    </div>
                  </div>

                  {/* Geofencing Toggles */}
                  <div className="border-t border-line-soft pt-4 space-y-2.5">
                    <div className="text-[12px] font-semibold text-hi">Geofencing Notifications</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-center gap-2.5 rounded-lg border border-line bg-panel-2 p-3 cursor-pointer text-[12px] text-lo hover:border-accent/30 transition-colors">
                        <input
                          type="checkbox"
                          checked={geofenceEntry}
                          onChange={(e) => setGeofenceEntry(e.target.checked)}
                          className="h-3.5 w-3.5 accent-accent cursor-pointer"
                        />
                        <span>Alert when vehicle <strong>enters</strong> depot</span>
                      </label>
                      <label className="flex items-center gap-2.5 rounded-lg border border-line bg-panel-2 p-3 cursor-pointer text-[12px] text-lo hover:border-accent/30 transition-colors">
                        <input
                          type="checkbox"
                          checked={geofenceExit}
                          onChange={(e) => setGeofenceExit(e.target.checked)}
                          className="h-3.5 w-3.5 accent-accent cursor-pointer"
                        />
                        <span>Alert when vehicle <strong>exits</strong> depot</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notification Channels */}
              <div className="overflow-hidden rounded-xl border border-line bg-panel">
                <div className="border-b border-line-soft px-5 py-4">
                  <h2 className="font-display text-[14px] font-semibold text-hi">Notification Channels</h2>
                </div>
                <div className="p-5 space-y-3.5">
                  {/* Browser Push Card */}
                  <label className="flex items-center justify-between cursor-pointer rounded-lg border border-line bg-panel-2 p-4 hover:border-accent/30 transition-colors">
                    <div className="pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[12.5px] font-semibold text-hi">Browser Desktop Notifications</span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9.5px] font-mono font-semibold uppercase ${
                            pushPermission === 'denied'
                              ? 'bg-red/15 text-red'
                              : pushPermission === 'granted' && channels.push
                              ? 'bg-green/15 text-green'
                              : 'bg-zinc-500/15 text-dim'
                          }`}
                        >
                          {pushPermission === 'denied'
                            ? 'Blocked'
                            : pushPermission === 'granted' && channels.push
                            ? 'Active (On)'
                            : 'Disabled (Off)'}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-dim">
                        Receive instant OS popups in Windows/macOS for critical safety events even if the tab is minimized.
                      </p>
                      {pushPermission === 'denied' && (
                        <p className="mt-1 text-[10.5px] text-red">
                          Notifications are blocked in your browser settings. Please allow notifications in site permissions to enable.
                        </p>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(channels.push && pushPermission === 'granted')}
                      disabled={pushPermission === 'denied'}
                      onChange={handleTogglePush}
                      className="h-4 w-4 accent-accent cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </label>

                  {/* Email Channel */}
                  <label className="flex items-center justify-between cursor-pointer rounded-lg border border-line bg-panel-2 p-4 hover:border-accent/30 transition-colors">
                    <div>
                      <span className="text-[12.5px] font-semibold text-hi">Email Alert Dispatch</span>
                      <p className="text-[11px] text-dim">Send automated critical issue digests and alerts via email.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={channels.email}
                      onChange={(e) => setChannels((prev) => ({ ...prev, email: e.target.checked }))}
                      className="h-4 w-4 accent-accent cursor-pointer"
                    />
                  </label>

                  {/* SMS Emergency Channel */}
                  <label className="flex items-center justify-between cursor-pointer rounded-lg border border-line bg-panel-2 p-4 hover:border-accent/30 transition-colors">
                    <div>
                      <span className="text-[12.5px] font-semibold text-hi">Emergency SOS SMS</span>
                      <p className="text-[11px] text-dim">Send instant SMS notifications for critical safety alarms.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={channels.sms}
                      onChange={(e) => setChannels((prev) => ({ ...prev, sms: e.target.checked }))}
                      className="h-4 w-4 accent-accent cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-5 py-2 text-[12.5px] font-semibold text-base hover:bg-accent/90 transition-all cursor-pointer shadow-xs"
                >
                  Save Policy Changes
                </button>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* TAB 3: SECURITY & ACCOUNT                                    */}
          {/* ============================================================ */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Current Admin Account Card */}
              <div className="overflow-hidden rounded-xl border border-line bg-panel">
                <div className="border-b border-line-soft px-5 py-4 flex items-center justify-between">
                  <h2 className="font-display text-[14px] font-semibold text-hi">Current Account & Role</h2>
                  <span className="rounded bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent uppercase">
                    Super Admin
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border border-line-soft bg-panel-2 p-4">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 font-display text-[14px] font-bold text-accent border border-accent/30">
                        RD
                      </div>
                      <div>
                        <div className="text-[13.5px] font-semibold text-hi">Rajesh Deshmukh</div>
                        <div className="text-[11.5px] text-dim">admin@electrie.io</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11.5px] text-dim">
                      <ShieldCheck className="h-4 w-4 text-green" />
                      <span>Role-Based Access Control (RBAC) Enforced</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Change Password Card */}
              <div className="overflow-hidden rounded-xl border border-line bg-panel">
                <div className="border-b border-line-soft px-5 py-4">
                  <h2 className="font-display text-[14px] font-semibold text-hi">Change Password</h2>
                </div>
                <form onSubmit={handlePasswordChange} className="p-5 space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-medium text-lo">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={inputCls + ' w-full pr-10'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-dim hover:text-hi cursor-pointer"
                      >
                        {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium text-lo">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={inputCls + ' w-full pr-10'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-dim hover:text-hi cursor-pointer"
                        >
                          {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium text-lo">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="rounded-lg bg-accent px-5 py-2 text-[12.5px] font-semibold text-base hover:bg-accent/90 transition-all cursor-pointer shadow-xs"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          </>
        )}

        </div>
      </div>
    </div>
  )
}
