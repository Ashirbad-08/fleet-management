// Mock live event feed with dates for filtering.
// In production, timestamps will come directly from Battery Flow telematics / backend alerts.

const now = new Date()
const daysAgo = (d, timeStr) => {
  const dt = new Date(now)
  dt.setDate(dt.getDate() - d)
  return {
    date: dt.toISOString().split('T')[0],
    time: timeStr,
    timestamp: new Date(`${dt.toISOString().split('T')[0]}T${timeStr}Z`).getTime(),
  }
}

export const alerts = [
  // --- TODAY'S ALERTS (daysAgo(0)): 2 Critical, 2 Warning, 2 Info ---
  { id: 1, sev: 'critical', vehicle: 'Hauler 09', msg: 'Battery below 20% — return to depot recommended', ...daysAgo(0, '10:42:03'), actionable: true },
  { id: 2, sev: 'critical', vehicle: 'Courier 18', msg: 'Unauthorized ignition event detected', ...daysAgo(0, '10:39:51'), actionable: true },
  { id: 3, sev: 'warning', vehicle: 'Reefer 03', msg: 'Cargo temperature drifted +2.1°C from setpoint', ...daysAgo(0, '10:31:22'), actionable: true },
  { id: 4, sev: 'warning', vehicle: 'Courier 12', msg: 'Harsh braking event recorded on Outer Ring Road', ...daysAgo(0, '09:12:18'), actionable: false },
  { id: 5, sev: 'info', vehicle: 'Hauler 07', msg: 'Geofence entered: Pune Depot Bay 4', ...daysAgo(0, '08:45:10'), actionable: false },
  { id: 6, sev: 'info', vehicle: 'Courier 05', msg: 'Heartbeat ping telemetry synced via 4G LTE', ...daysAgo(0, '08:20:05'), actionable: false },

  // --- LAST 7 DAYS ALERTS (daysAgo 1-7) ---
  { id: 7, sev: 'info', vehicle: 'Hauler 07', msg: 'Firmware 2.4.1 installed successfully (OTA)', ...daysAgo(1, '10:20:07'), actionable: false },
  { id: 8, sev: 'warning', vehicle: 'Reefer 01', msg: 'GPS signal weak for 90 seconds', ...daysAgo(2, '10:11:45'), actionable: false },
  { id: 9, sev: 'critical', vehicle: 'Hauler 11', msg: 'Device offline — no heartbeat for 3 hours', ...daysAgo(3, '07:58:12'), actionable: true },
  { id: 10, sev: 'info', vehicle: 'Courier 05', msg: 'Geofence entered: Chennai Central Hub', ...daysAgo(4, '09:47:30'), actionable: false },
  { id: 11, sev: 'warning', vehicle: 'Hauler 04', msg: 'Battery crossed 30% discharge threshold', ...daysAgo(5, '15:10:22'), actionable: true },
  { id: 12, sev: 'critical', vehicle: 'Courier 18', msg: 'Emergency SOS button triggered by driver', ...daysAgo(6, '18:04:12'), actionable: true },
  { id: 13, sev: 'info', vehicle: 'Reefer 03', msg: 'Pre-trip automated diagnostic check passed (0 DTCs)', ...daysAgo(7, '06:30:00'), actionable: false },

  // --- LAST 30 DAYS ALERTS (daysAgo 8-28) ---
  { id: 14, sev: 'critical', vehicle: 'Hauler 04', msg: 'Battery temperature exceeded threshold (52°C)', ...daysAgo(8, '14:22:10'), actionable: true },
  { id: 15, sev: 'warning', vehicle: 'Courier 05', msg: 'Overspeeding alert: 78 km/h recorded on NH-48', ...daysAgo(12, '11:15:40'), actionable: true },
  { id: 16, sev: 'info', vehicle: 'Hauler 07', msg: 'Geofence exited: Pune Depot Bay 2', ...daysAgo(16, '08:05:12'), actionable: false },
  { id: 17, sev: 'critical', vehicle: 'Hauler 09', msg: 'Cell voltage unbalance detected (>45 mV)', ...daysAgo(22, '16:50:33'), actionable: true },
  { id: 18, sev: 'warning', vehicle: 'Courier 18', msg: 'Fast DC charging stopped unexpectedly at 64% SoC', ...daysAgo(25, '19:12:00'), actionable: true },
  { id: 19, sev: 'info', vehicle: 'Reefer 01', msg: 'Cabin & cargo doors locked remotely by operator', ...daysAgo(28, '21:05:45'), actionable: false },
]
