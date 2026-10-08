import { Calendar, Plug, ChevronUp, ChevronDown, BatteryCharging } from '../../icons'

export default function ChargingTab({
  selectedVehicle,
  chargingFilter,
  setChargingFilter,
  chargingCustomDate,
  setChargingCustomDate,
  expandedSessionId,
  setExpandedSessionId,
  dateInputRef,
}) {
  const sessionsDataset = {
    today: {
      periodLabel: 'Today (24 Sep 2026)',
      sessions: [
        {
          id: 'CS-20240924-002',
          title: 'Afternoon Fast Charge',
          date: 'Today, 02:45 PM',
          duration: '42m',
          durationMin: 42,
          kwh: 5.8,
          startSoc: 40,
          endSoc: 88,
          station: 'Hub A — Fast Bay 2',
          connector: 'GB/T DC',
          peak: '3.3 kW',
          isRecent: true,
        },
        {
          id: 'CS-20240924-001',
          title: 'Morning Top-Up',
          date: 'Today, 06:12 AM',
          duration: '1h 14m',
          durationMin: 74,
          kwh: 9.4,
          startSoc: 18,
          endSoc: 92,
          station: 'Hub A — Charger 3',
          connector: 'GB/T DC',
          peak: '3.3 kW',
          isRecent: false,
        },
      ],
    },
    yesterday: {
      periodLabel: 'Yesterday (23 Sep 2026)',
      sessions: [
        {
          id: 'CS-20240923-004',
          title: 'Night Shift Recharge',
          date: 'Yesterday, 11:45 PM',
          duration: '58m',
          durationMin: 58,
          kwh: 7.1,
          startSoc: 31,
          endSoc: 86,
          station: 'Hub A — Charger 1',
          connector: 'GB/T DC',
          peak: '3.1 kW',
          isRecent: true,
        },
        {
          id: 'CS-20240923-003',
          title: 'Mid-Day Boost',
          date: 'Yesterday, 01:15 PM',
          duration: '48m',
          durationMin: 48,
          kwh: 6.2,
          startSoc: 25,
          endSoc: 75,
          station: 'Hub B — Charger 2',
          connector: 'Type 2 AC',
          peak: '3.2 kW',
          isRecent: false,
        },
      ],
    },
  }

  // Selected period sessions
  let activePeriodSessions = []
  let activePeriodLabel = 'Today'

  if (chargingFilter === 'today') {
    activePeriodSessions = sessionsDataset.today.sessions
    activePeriodLabel = sessionsDataset.today.periodLabel
  } else if (chargingFilter === 'yesterday') {
    activePeriodSessions = sessionsDataset.yesterday.sessions
    activePeriodLabel = sessionsDataset.yesterday.periodLabel
  } else if (chargingFilter === 'calendar') {
    if (chargingCustomDate) {
      const formattedDate = new Date(chargingCustomDate + 'T00:00:00').toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
      activePeriodLabel = formattedDate
      activePeriodSessions = [
        {
          id: `CS-${chargingCustomDate.replace(/-/g, '')}-001`,
          title: 'Depot Charging Session',
          date: `${formattedDate}, 08:30 AM`,
          duration: '1h 02m',
          durationMin: 62,
          kwh: 8.2,
          startSoc: 22,
          endSoc: 88,
          station: 'Hub B — Charger 2',
          connector: 'Type 2 AC',
          peak: '2.8 kW',
          isRecent: true,
        },
      ]
    } else {
      activePeriodLabel = 'Calendar Date'
      activePeriodSessions = []
    }
  }

  const totalKwh = activePeriodSessions.reduce((s, r) => s + r.kwh, 0).toFixed(1)
  const totalMinutes = activePeriodSessions.reduce((s, r) => s + (r.durationMin || 0), 0)
  const totalDurationStr =
    totalMinutes > 0 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : '0m'
  const peakPowerStr = activePeriodSessions.length > 0 ? activePeriodSessions[0].peak : '—'

  return (
    <div className="p-5 space-y-4">
      {/* 1. LIGHT GREEN & AESTHETIC DATE FILTER BAR */}
      <div className="flex items-center gap-1 rounded-xl border border-line-soft bg-panel-2/40 p-1 shadow-xs">
        <button
          type="button"
          onClick={() => setChargingFilter('today')}
          className={`flex-1 rounded-lg py-1.5 px-3 text-[11px] font-medium transition-all cursor-pointer text-center ${
            chargingFilter === 'today'
              ? 'bg-green/15 text-green border border-green/30 shadow-xs font-semibold'
              : 'text-lo hover:text-hi hover:bg-hover/60 border border-transparent'
          }`}
        >
          Today
        </button>

        <button
          type="button"
          onClick={() => setChargingFilter('yesterday')}
          className={`flex-1 rounded-lg py-1.5 px-3 text-[11px] font-medium transition-all cursor-pointer text-center ${
            chargingFilter === 'yesterday'
              ? 'bg-green/15 text-green border border-green/30 shadow-xs font-semibold'
              : 'text-lo hover:text-hi hover:bg-hover/60 border border-transparent'
          }`}
        >
          Yesterday
        </button>

        {/* Calendar Date Picker Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              if (dateInputRef.current) {
                if (typeof dateInputRef.current.showPicker === 'function') {
                  dateInputRef.current.showPicker()
                } else {
                  dateInputRef.current.focus()
                  dateInputRef.current.click()
                }
              }
            }}
            className={`flex items-center gap-1.5 rounded-lg py-1.5 px-3 text-[11px] font-medium transition-all cursor-pointer ${
              chargingFilter === 'calendar'
                ? 'bg-green/15 text-green border border-green/30 shadow-xs font-semibold'
                : 'text-lo hover:text-hi hover:bg-hover/60 border border-transparent'
            }`}
          >
            <Calendar className={`h-3.5 w-3.5 ${chargingFilter === 'calendar' ? 'text-green' : 'text-lo'}`} />
            <span>
              {chargingFilter === 'calendar' && chargingCustomDate
                ? new Date(chargingCustomDate + 'T00:00:00').toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })
                : 'Calendar'}
            </span>
          </button>

          <input
            ref={dateInputRef}
            type="date"
            value={chargingCustomDate}
            onChange={(e) => {
              if (e.target.value) {
                setChargingCustomDate(e.target.value)
                setChargingFilter('calendar')
              }
            }}
            className="sr-only"
          />
        </div>
      </div>

      {/* 2. TOP METRICS CARDS */}
      <div className="grid grid-cols-3 gap-2">
        {[
          {
            label: 'Energy Delivered',
            value: `${totalKwh} kWh`,
            sub: `${activePeriodSessions.length} session${activePeriodSessions.length === 1 ? '' : 's'}`,
          },
          { label: 'Charge Duration', value: totalDurationStr, sub: 'total plug-in time' },
          { label: 'Peak Power', value: peakPowerStr, sub: 'max DC input rate' },
        ].map(({ label, value, sub }) => (
          <div
            key={label}
            className="rounded-xl border border-line-soft bg-panel-2/50 px-3 py-2.5 text-center shadow-xs"
          >
            <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">{label}</div>
            <div className="mt-1 font-display text-[15px] font-bold text-hi">{value}</div>
            <div className="text-[9px] text-dim">{sub}</div>
          </div>
        ))}
      </div>

      {/* 3. MERGED CHARGING SESSIONS SECTION */}
      <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/15 text-accent">
              <Plug className="h-3 w-3" strokeWidth={2.5} />
            </span>
            <span className="font-display text-[12.5px] font-bold text-hi">Charging Sessions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-accent/15 px-2 py-0.5 font-mono text-[10px] font-bold text-accent">
              {activePeriodSessions.length} Session{activePeriodSessions.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {activePeriodSessions.length === 0 ? (
          <div className="p-8 text-center bg-panel space-y-2">
            <div className="flex justify-center text-dim">
              <Calendar className="h-8 w-8 stroke-1 opacity-50" />
            </div>
            <div className="text-[12.5px] font-semibold text-hi">No Charging Sessions Found</div>
            <div className="text-[11px] text-dim">No charging activity recorded for {activePeriodLabel}.</div>
            <button
              type="button"
              onClick={() => setChargingFilter('today')}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel-2 px-3 py-1.5 text-[11px] font-medium text-accent hover:bg-hover cursor-pointer"
            >
              Return to Today's Sessions
            </button>
          </div>
        ) : (
          <div className="divide-y divide-line-soft/60 bg-panel">
            {activePeriodSessions.map((session) => {
              const isExpanded = expandedSessionId === session.id
              return (
                <div
                  key={session.id}
                  className={`transition-colors ${isExpanded ? 'bg-accent/5' : 'hover:bg-panel-2/40'}`}
                >
                  {/* Clickable Row for Short Information */}
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedSessionId((prev) => (prev === session.id ? null : session.id))
                    }}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer select-none transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {session.isRecent && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green/15 px-2 py-0.2 text-[9.5px] font-bold text-green border border-green/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
                            Recent
                          </span>
                        )}
                        <span className="font-display text-[13px] font-bold text-hi truncate">
                          {session.title}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[10.5px] text-dim font-mono">
                        <span>{session.date}</span>
                        <span>•</span>
                        <span className="truncate">{session.station.split('—')[0].trim()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="font-display text-[15px] font-bold text-accent">
                          {session.kwh} <span className="text-[10px] text-lo font-normal">kWh</span>
                        </div>
                        <div className="text-[10px] text-dim font-mono">
                          {session.duration} • {session.startSoc}%→{session.endSoc}%
                        </div>
                      </div>
                      <div className="flex h-6.5 w-6.5 items-center justify-center rounded-md border border-line bg-panel-2 text-lo hover:text-hi transition-colors">
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Detailed Information (Shown when clicked) */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 space-y-3 border-t border-line-soft/60 animate-in fade-in-50 duration-150">
                      {/* SoC Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-dim">
                          <span>
                            SoC: {session.startSoc}% → {session.endSoc}%
                          </span>
                          <span className="text-accent font-semibold">
                            +{session.endSoc - session.startSoc}% charged
                          </span>
                        </div>
                        <div className="relative h-1.5 w-full rounded-full bg-panel-2 overflow-hidden border border-line-soft">
                          <div
                            className="absolute left-0 top-0 h-full rounded-full bg-line-soft"
                            style={{ width: `${session.startSoc}%` }}
                          />
                          <div
                            className="absolute top-0 h-full rounded-full bg-accent transition-all duration-300"
                            style={{
                              left: `${session.startSoc}%`,
                              width: `${session.endSoc - session.startSoc}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Session Details Hardware Grid */}
                      <div className="grid grid-cols-3 gap-px bg-line-soft rounded-lg overflow-hidden border border-line-soft">
                        {[
                          ['Station', session.station],
                          ['Connector', session.connector],
                          ['Peak Rate', session.peak],
                        ].map(([l, v]) => (
                          <div key={l} className="bg-panel px-2.5 py-2 text-center">
                            <div className="text-[9px] uppercase tracking-wider text-dim font-semibold">{l}</div>
                            <div className="mt-0.5 font-mono text-[11px] font-bold text-hi truncate">{v}</div>
                          </div>
                        ))}
                      </div>

                      {/* Telematics Info */}
                      <div className="flex items-center justify-between text-[10.5px] pt-1 text-dim font-mono">
                        <span>
                          Session ID: <strong className="text-hi">{session.id}</strong>
                        </span>
                        <span className="inline-flex items-center gap-1 text-green font-semibold">
                          <span className="h-1.5 w-1.5 rounded-full bg-green" />
                          Completed
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 4. CHARGER CONFIGURATION */}
      <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
        <div className="flex items-center gap-2 border-b border-line-soft bg-panel px-4 py-2.5">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-amber/15 text-amber">
            <BatteryCharging className="h-3 w-3" strokeWidth={2.5} />
          </span>
          <span className="font-display text-[12.5px] font-bold text-hi">Charger Configuration</span>
        </div>
        <div className="space-y-0 text-[12px] bg-panel">
          {[
            ['Preferred Station', 'Hub A — Bay 3 (Reserved)'],
            ['Charging Schedule', 'Auto — Off-peak (10PM–6AM)'],
            ['Max Charge Rate', selectedVehicle.chargerCapacity || '35 Amps / 3.3 kW'],
            ['Connector Type', selectedVehicle.chargerVariant || 'Off Board DC Charger'],
            ['Smart Charging', 'Enabled — Grid-optimized'],
            ['Charge Limit', '95% (Battery-safe threshold)'],
          ].map(([label, value], i, arr) => (
            <div
              key={label}
              className={`flex justify-between items-center px-3.5 py-2 ${
                i < arr.length - 1 ? 'border-b border-line-soft/60' : ''
              }`}
            >
              <span className="text-dim shrink-0">{label}:</span>
              <span className="font-mono font-medium text-hi text-right max-w-[58%] truncate">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
