// Mock live event feed. Replace with a websocket / polling subscription
// to your alerting service in production.

export const alerts = [
  { id: 1, sev: 'critical', vehicle: 'Hauler 09', msg: 'Battery below 20% — return to depot recommended', time: '10:42:03' },
  { id: 2, sev: 'critical', vehicle: 'Courier 18', msg: 'Unauthorized ignition event detected', time: '10:39:51' },
  { id: 3, sev: 'warning', vehicle: 'Reefer 03', msg: 'Cargo temperature drifted +2.1°C from setpoint', time: '10:31:22' },
  { id: 4, sev: 'info', vehicle: 'Hauler 07', msg: 'Firmware 2.4.1 installed successfully', time: '10:20:07' },
  { id: 5, sev: 'warning', vehicle: 'Reefer 01', msg: 'GPS signal weak for 90 seconds', time: '10:11:45' },
  { id: 6, sev: 'critical', vehicle: 'Hauler 11', msg: 'Device offline — no heartbeat for 3 hours', time: '07:58:12' },
  { id: 7, sev: 'info', vehicle: 'Courier 05', msg: 'Geofence entered: Chennai Central Hub', time: '09:47:30' },
  { id: 8, sev: 'warning', vehicle: 'Courier 12', msg: 'Harsh braking event recorded', time: '09:12:18' },
]
