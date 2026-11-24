# Fleet Control — IoT Vehicle Admin Panel

A React + Tailwind CSS admin panel for managing IoT devices installed in
fleet vehicles: live status, telemetry, device commands, alerts, firmware
rollout, and geofencing.

## Stack

- React 19 + Vite
- Tailwind CSS v4 (`@tailwindcss/vite`, no config file needed)
- React Router v7
- lucide-react (icons)

## Getting started

```bash
npm install
cp .env.example .env   # fill in your real API/WS endpoints
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).

## Project structure

```
src/
  assets/       static images/icons
  components/   reusable UI (Sidebar, Topbar, VehicleTable, VehicleDrawer, Gauge, ...)
  context/      FleetContext — global state: vehicles, alerts, filters, selection, toasts
  data/         mock vehicles.js / alerts.js / statusMeta.js — swap for real API calls
  pages/        route-level screens (Dashboard, Vehicles, Devices, Alerts, Geofences, Firmware, Settings)
  App.jsx       route table
  main.jsx      app entry point
```

## Wiring up a real backend

All data currently lives in `src/data/*.js` and is loaded into
`FleetContext`. To connect a real IoT backend:

1. Replace the static imports in `FleetContext.jsx` with `fetch`/React Query
   calls to `import.meta.env.VITE_API_BASE_URL`.
2. Subscribe to `VITE_WS_URL` for live telemetry and push new alerts into
   state as they arrive.
3. Implement `sendDeviceCommand` to POST to your device-command endpoint
   instead of only showing a toast.

## Available scripts

- `npm run dev` — start the dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build locally
- `npm run lint` — run oxlint
