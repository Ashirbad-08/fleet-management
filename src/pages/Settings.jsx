import { useState, useEffect } from 'react'
import Topbar from '../components/Topbar'
import { useFleet } from '../context/FleetContext'
import { Settings as SettingsIcon, Lock, Bell, Trash2, Plus } from '../components/icons'

export default function Settings() {
  const { settings, updateSettings, showToast } = useFleet()
  const [activeTab, setActiveTab] = useState('general') // 'general', 'alerts', 'security'

  // General Settings State
  const [orgName, setOrgName] = useState(settings?.orgName ?? 'Acme Logistics Pvt. Ltd.')
  const [region, setRegion] = useState(settings?.region ?? 'India - West & South')
  const [mapStyle, setMapStyle] = useState(settings?.mapStyle ?? 'Dark Mode')
  const [speedUnit, setSpeedUnit] = useState(settings?.speedUnit ?? 'km/h')
  const [distanceUnit, setDistanceUnit] = useState(settings?.distanceUnit ?? 'kilometers')
  const [tempUnit, setTempUnit] = useState(settings?.tempUnit ?? 'Celsius')
  const [timezone, setTimezone] = useState(settings?.timezone ?? 'IST (GMT+5:30)')
  const [refreshInterval, setRefreshInterval] = useState(settings?.refreshInterval ?? '10s')

  // Alerts Settings State
  const [channels, setChannels] = useState(settings?.channels ?? {
    email: true,
    sms: true,
    slack: false,
    push: true,
  })
  const [retention, setRetention] = useState(settings?.retention ?? '90 days')
  const [overspeed, setOverspeed] = useState(settings?.overspeed ?? 80)
  const [lowBattery, setLowBattery] = useState(settings?.lowBattery ?? 15)
  const [geofenceEntry, setGeofenceEntry] = useState(settings?.geofenceEntry ?? true)
  const [geofenceExit, setGeofenceExit] = useState(settings?.geofenceExit ?? true)

  // Sync state with global settings context
  useEffect(() => {
    if (settings) {
      setOrgName(settings.orgName)
      setRegion(settings.region)
      setMapStyle(settings.mapStyle)
      setSpeedUnit(settings.speedUnit)
      setDistanceUnit(settings.distanceUnit)
      setTempUnit(settings.tempUnit)
      setTimezone(settings.timezone)
      setRefreshInterval(settings.refreshInterval)
      setChannels(settings.channels)
      setRetention(settings.retention)
      setOverspeed(settings.overspeed)
      setLowBattery(settings.lowBattery)
      setGeofenceEntry(settings.geofenceEntry)
      setGeofenceExit(settings.geofenceExit)
    }
  }, [settings])

  // Security Settings State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [apiKeys, setApiKeys] = useState([
    { id: '1', name: 'Production Webhook', key: 'fc_live_••••••••3a9b', created: '2025-06-12' },
  ])
  const [newKeyName, setNewKeyName] = useState('')

  const handleSaveGeneral = (e) => {
    e.preventDefault()
    updateSettings({
      orgName,
      region,
      mapStyle,
      speedUnit,
      distanceUnit,
      tempUnit,
      timezone,
      refreshInterval,
    })
    showToast('General settings saved successfully')
  }

  const handleSaveAlerts = (e) => {
    e.preventDefault()
    updateSettings({
      channels,
      retention,
      overspeed,
      lowBattery,
      geofenceEntry,
      geofenceExit,
    })
    showToast('Alert policies updated successfully')
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
    showToast('Password updated successfully')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleGenerateKey = (e) => {
    e.preventDefault()
    if (!newKeyName.trim()) {
      showToast('Please enter an API key name')
      return
    }
    const randHex = Math.random().toString(16).substring(2, 6)
    const newKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `fc_live_••••••••${randHex}`,
      created: new Date().toISOString().split('T')[0],
    }
    setApiKeys([...apiKeys, newKey])
    setNewKeyName('')
    showToast('New API key generated successfully')
  }

  const handleRevokeKey = (id) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id))
    showToast('API key revoked')
  }

  const handleToggleChannel = (key) => {
    setChannels((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <Topbar title="Settings" subtitle="Manage organization settings, fleet policies, and security preferences" />

      {/* Tabs Selector */}
      <div className="border-b border-line-soft bg-panel/40 px-4 sm:px-6">
        <div className="flex gap-4">
          {[
            { id: 'general', label: 'General & Localization', icon: SettingsIcon },
            { id: 'alerts', label: 'Alert Policies & Channels', icon: Bell },
            { id: 'security', label: 'Security & API Keys', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-1 py-3 text-[13px] font-medium transition-all ${
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
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="space-y-6">
              {/* Org Card */}
              <div className="overflow-hidden rounded-xl border border-line bg-panel">
                <div className="border-b border-line-soft px-5 py-4">
                  <h2 className="font-display text-[14px] font-semibold text-hi">Organization Profile</h2>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium text-lo">Organization Name</label>
                      <input
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="rounded-lg border border-line bg-panel-2 px-3.5 py-2 text-[12.5px] text-hi focus:border-accent focus:outline-hidden"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium text-lo">Fleet Region</label>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="rounded-lg border border-line bg-panel-2 px-3.5 py-2 text-[12.5px] text-hi focus:border-accent focus:outline-hidden"
                      >
                        <option>India - West & South</option>
                        <option>India - North</option>
                        <option>India - East & North-East</option>
                        <option>Global Operations</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-medium text-lo">Default Map Style</label>
                    <select
                      value={mapStyle}
                      onChange={(e) => setMapStyle(e.target.value)}
                      className="rounded-lg border border-line bg-panel-2 px-3.5 py-2 text-[12.5px] text-hi focus:border-accent focus:outline-hidden"
                    >
                      <option>Dark Mode</option>
                      <option>Satellite Hybrid</option>
                      <option>Standard Vector</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Preferences Card */}
              <div className="overflow-hidden rounded-xl border border-line bg-panel">
                <div className="border-b border-line-soft px-5 py-4">
                  <h2 className="font-display text-[14px] font-semibold text-hi">Localization & Display</h2>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium text-lo">Speed Unit</label>
                      <select
                        value={speedUnit}
                        onChange={(e) => setSpeedUnit(e.target.value)}
                        className="rounded-lg border border-line bg-panel-2 px-3.5 py-2 text-[12.5px] text-hi focus:border-accent focus:outline-hidden"
                      >
                        <option>km/h</option>
                        <option>mph</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium text-lo">Distance Unit</label>
                      <select
                        value={distanceUnit}
                        onChange={(e) => setDistanceUnit(e.target.value)}
                        className="rounded-lg border border-line bg-panel-2 px-3.5 py-2 text-[12.5px] text-hi focus:border-accent focus:outline-hidden"
                      >
                        <option>kilometers</option>
                        <option>miles</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium text-lo">Temperature Unit</label>
                      <select
                        value={tempUnit}
                        onChange={(e) => setTempUnit(e.target.value)}
                        className="rounded-lg border border-line bg-panel-2 px-3.5 py-2 text-[12.5px] text-hi focus:border-accent focus:outline-hidden"
                      >
                        <option>Celsius</option>
                        <option>Fahrenheit</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium text-lo">Preferred Timezone</label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="rounded-lg border border-line bg-panel-2 px-3.5 py-2 text-[12.5px] text-hi focus:border-accent focus:outline-hidden"
                      >
                        <option>UTC</option>
                        <option>IST (GMT+5:30)</option>
                        <option>EST (GMT-5)</option>
                        <option>PST (GMT-8)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium text-lo">Auto-Refresh Interval</label>
                      <select
                        value={refreshInterval}
                        onChange={(e) => setRefreshInterval(e.target.value)}
                        className="rounded-lg border border-line bg-panel-2 px-3.5 py-2 text-[12.5px] text-hi focus:border-accent focus:outline-hidden"
                      >
                        <option>Real-time</option>
                        <option>10s</option>
                        <option>30s</option>
                        <option>1m</option>
                        <option>Manual</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Card */}
              <div className="overflow-hidden rounded-xl border border-line bg-panel">
                <div className="border-b border-line-soft px-5 py-4">
                  <h2 className="font-display text-[14px] font-semibold text-hi">Billing & Subscription</h2>
                </div>
                <div className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-line-soft bg-panel-2 p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-[14px] font-bold text-hi">Enterprise Tier</span>
                        <span className="rounded bg-green/15 px-1.5 py-0.5 text-[10px] font-semibold text-green uppercase">Active</span>
                      </div>
                      <p className="mt-1 text-[11.5px] text-dim">Using 24 of 50 active device tracking slots.</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-[13px] font-semibold text-hi">Next Renewal</div>
                      <p className="text-[11.5px] text-dim">October 15, 2026</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-4 py-2 text-[12.5px] font-medium text-white hover:bg-accent/80 transition-colors"
                >
                  Save General Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === 'alerts' && (
            <form onSubmit={handleSaveAlerts} className="space-y-6">
              {/* Channels Card */}
              <div className="overflow-hidden rounded-xl border border-line bg-panel">
                <div className="border-b border-line-soft px-5 py-4">
                  <h2 className="font-display text-[14px] font-semibold text-hi">Notification Channels</h2>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[
                      { id: 'email', label: 'Email Alerts', desc: 'Send daily digests and critical event alerts to org mail' },
                      { id: 'sms', label: 'SMS Notifications', desc: 'Critical priority notifications direct to mobile numbers' },
                      { id: 'slack', label: 'Slack Webhook', desc: 'Stream active system logs to a workspace channel' },
                      { id: 'push', label: 'Browser Push Notifications', desc: 'Realtime overlay popups inside active dashboard' },
                    ].map((ch) => (
                      <div
                        key={ch.id}
                        onClick={() => handleToggleChannel(ch.id)}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-all ${
                          channels[ch.id]
                            ? 'border-accent bg-accent/5'
                            : 'border-line bg-panel hover:bg-hover'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={channels[ch.id]}
                          readOnly
                          className="mt-0.5 h-3.5 w-3.5 accent-accent"
                        />
                        <div>
                          <div className="text-[12.5px] font-semibold text-hi">{ch.label}</div>
                          <p className="mt-0.5 text-[11px] leading-snug text-dim">{ch.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-1.5 pt-2">
                    <label className="text-[12px] font-medium text-lo">Alert Event Data Retention</label>
                    <select
                      value={retention}
                      onChange={(e) => setRetention(e.target.value)}
                      className="rounded-lg border border-line bg-panel-2 px-3.5 py-2 text-[12.5px] text-hi focus:border-accent focus:outline-hidden"
                    >
                      <option>30 days</option>
                      <option>60 days</option>
                      <option>90 days</option>
                      <option>180 days</option>
                      <option>1 year</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Threshold Policies Card */}
              <div className="overflow-hidden rounded-xl border border-line bg-panel">
                <div className="border-b border-line-soft px-5 py-4">
                  <h2 className="font-display text-[14px] font-semibold text-hi">Alert Policies & Thresholds</h2>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium text-lo">Overspeed Threshold ({speedUnit})</label>
                      <input
                        type="number"
                        value={overspeed}
                        onChange={(e) => setOverspeed(parseInt(e.target.value) || 0)}
                        className="rounded-lg border border-line bg-panel-2 px-3.5 py-2 text-[12.5px] text-hi focus:border-accent focus:outline-hidden"
                      />
                      <p className="text-[10.5px] text-dim">Generate a warning when vehicle speeds exceed this value.</p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium text-lo">Low Battery Warning (%)</label>
                      <input
                        type="number"
                        value={lowBattery}
                        onChange={(e) => setLowBattery(parseInt(e.target.value) || 0)}
                        className="rounded-lg border border-line bg-panel-2 px-3.5 py-2 text-[12.5px] text-hi focus:border-accent focus:outline-hidden"
                      />
                      <p className="text-[10.5px] text-dim">Alert when vehicle tracker backup battery drops below threshold.</p>
                    </div>
                  </div>

                  <div className="border-t border-line-soft pt-4 space-y-3">
                    <div className="text-[12px] font-semibold text-hi">Geofencing Notifications</div>
                    <div className="space-y-2.5">
                      <label className="flex items-center gap-2.5 cursor-pointer text-[12px] text-lo">
                        <input
                          type="checkbox"
                          checked={geofenceEntry}
                          onChange={(e) => setGeofenceEntry(e.target.checked)}
                          className="h-3.5 w-3.5 accent-accent"
                        />
                        Alert when device enters a geofenced area
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer text-[12px] text-lo">
                        <input
                          type="checkbox"
                          checked={geofenceExit}
                          onChange={(e) => setGeofenceExit(e.target.checked)}
                          className="h-3.5 w-3.5 accent-accent"
                        />
                        Alert when device exits a geofenced area
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-4 py-2 text-[12.5px] font-medium text-white hover:bg-accent/80 transition-colors"
                >
                  Save Policy Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* API Access Card */}
              <div className="overflow-hidden rounded-xl border border-line bg-panel">
                <div className="border-b border-line-soft px-5 py-4">
                  <h2 className="font-display text-[14px] font-semibold text-hi">API & Integrations</h2>
                </div>
                <div className="p-5 space-y-4">
                  <div className="text-[11.5px] text-dim">
                    Use API keys to connect outer dashboards, databases, or webhook consumers to Fleet Control telemetry.
                  </div>

                  {/* List of keys */}
                  <div className="divide-y divide-line-soft rounded-lg border border-line bg-panel-2">
                    {apiKeys.length === 0 ? (
                      <div className="p-4 text-center text-[12px] text-dim">No active API keys found.</div>
                    ) : (
                      apiKeys.map((key) => (
                        <div key={key.id} className="flex items-center justify-between p-3.5 gap-4">
                          <div>
                            <div className="text-[12.5px] font-semibold text-hi">{key.name}</div>
                            <div className="mt-1 flex items-center gap-3 text-[11px] text-dim">
                              <span className="font-mono">{key.key}</span>
                              <span>&bull;</span>
                              <span>Created {key.created}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRevokeKey(key.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-dim hover:text-red hover:bg-red/5 transition-colors"
                            title="Revoke Key"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Key Generator */}
                  <form onSubmit={handleGenerateKey} className="flex items-center gap-3 pt-2">
                    <input
                      type="text"
                      placeholder="e.g. Telemetry Exporter"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="flex-1 rounded-lg border border-line bg-panel-2 px-3.5 py-2 text-[12.5px] text-hi focus:border-accent focus:outline-hidden"
                    />
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-[12.5px] font-medium text-white hover:bg-accent/80 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Generate Key
                    </button>
                  </form>
                </div>
              </div>

              {/* Password Change Card */}
              <div className="overflow-hidden rounded-xl border border-line bg-panel">
                <div className="border-b border-line-soft px-5 py-4">
                  <h2 className="font-display text-[14px] font-semibold text-hi">Change Password</h2>
                </div>
                <form onSubmit={handlePasswordChange} className="p-5 space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-medium text-lo">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="rounded-lg border border-line bg-panel-2 px-3.5 py-2 text-[12.5px] text-hi focus:border-accent focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium text-lo">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="rounded-lg border border-line bg-panel-2 px-3.5 py-2 text-[12.5px] text-hi focus:border-accent focus:outline-hidden"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium text-lo">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="rounded-lg border border-line bg-panel-2 px-3.5 py-2 text-[12.5px] text-hi focus:border-accent focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="rounded-lg bg-accent px-4 py-2 text-[12.5px] font-medium text-white hover:bg-accent/80 transition-colors"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
