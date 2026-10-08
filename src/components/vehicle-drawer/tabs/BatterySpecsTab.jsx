import { Zap, BatteryCharging, Cpu, Edit2 } from '../../icons'

export default function BatterySpecsTab({ selectedVehicle, onStartEdit }) {
  return (
    <div className="p-5 space-y-4">
      {/* Battery Pack Specs Card */}
      <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/15 text-accent">
              <Zap className="h-3 w-3" strokeWidth={2.5} />
            </span>
            <span className="font-display text-[12.5px] font-bold text-hi">Battery Pack Hardware</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-accent/15 px-2 py-0.5 font-mono text-[10px] font-bold text-accent">
              {selectedVehicle.batteryCapacityKwh || '12.8'} kWh
            </span>
            <button
              type="button"
              onClick={onStartEdit}
              title="Edit battery specifications"
              className="flex items-center gap-1 rounded border border-line bg-panel-2 px-2 py-0.5 text-[10px] font-medium text-lo hover:border-accent/40 hover:text-accent transition-colors cursor-pointer"
            >
              <Edit2 className="h-2.5 w-2.5" />
              <span>Edit</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-line-soft p-px">
          <div className="bg-panel px-3.5 py-2.5">
            <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">Battery Serial No.</div>
            <div className="mt-0.5 font-mono text-[12px] font-bold text-hi truncate">
              {selectedVehicle.batterySerial || 'BAT-2026-X01'}
            </div>
          </div>
          <div className="bg-panel px-3.5 py-2.5">
            <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">Chemistry</div>
            <div className="mt-0.5 font-mono text-[12px] font-bold text-hi">
              {selectedVehicle.batteryChemistry || 'LFP'}
            </div>
          </div>
          <div className="bg-panel px-3.5 py-2.5">
            <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">Capacity (Ah)</div>
            <div className="mt-0.5 font-mono text-[12px] font-bold text-hi">
              {selectedVehicle.batteryCapacityAh || '200'} Ah
            </div>
          </div>
          <div className="bg-panel px-3.5 py-2.5">
            <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">Mount Architecture</div>
            <div className="mt-0.5 font-mono text-[12px] font-medium text-hi truncate">
              {selectedVehicle.batteryType || 'Swappable Dual-Pack'}
            </div>
          </div>
          <div className="bg-panel px-3.5 py-2.5">
            <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">Nominal Voltage</div>
            <div className="mt-0.5 font-mono text-[12px] font-medium text-hi">
              {selectedVehicle.voltageV || 48} V
            </div>
          </div>
          <div className="bg-panel px-3.5 py-2.5">
            <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">Operating Temp</div>
            <div className="mt-0.5 font-mono text-[12px] font-medium text-hi">
              {selectedVehicle.batteryTempC || 28}°C (Nominal)
            </div>
          </div>
        </div>
      </div>

      {/* Charger & Inverter Card */}
      <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-amber/15 text-amber">
              <BatteryCharging className="h-3 w-3" strokeWidth={2.5} />
            </span>
            <span className="font-display text-[12.5px] font-bold text-hi">Charger & Power Equipment</span>
          </div>
          <span className="rounded bg-amber/15 px-2 py-0.5 font-mono text-[10px] font-bold text-amber">
            {selectedVehicle.chargerCapacity || '3.3 kW'}
          </span>
        </div>

        <div className="space-y-2 p-3.5 text-[12px] bg-panel">
          <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
            <span className="text-dim">Charger Variant:</span>
            <span className="font-mono font-medium text-hi">{selectedVehicle.chargerVariant || 'Off Board'}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
            <span className="text-dim">Charger Serial No.:</span>
            <span className="font-mono font-medium text-hi">{selectedVehicle.chargerSerialNo || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-dim">Charger Capacity:</span>
            <span className="font-mono font-medium text-hi">{selectedVehicle.chargerCapacity || '35 Amps'}</span>
          </div>
        </div>
      </div>

      {/* Telematics & IoT Unit Card */}
      <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/15 text-accent">
              <Cpu className="h-3 w-3" strokeWidth={2.5} />
            </span>
            <span className="font-display text-[12.5px] font-bold text-hi">IoT Telematics Unit</span>
          </div>
          <span className="rounded bg-panel-2 px-2 py-0.5 font-mono text-[10px] text-lo border border-line-soft">
            v{selectedVehicle.firmware || '1.0'}
          </span>
        </div>

        <div className="space-y-2 p-3.5 text-[12px] bg-panel">
          <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
            <span className="text-dim">Device IMEI / Serial:</span>
            <span className="font-mono font-bold text-accent">{selectedVehicle.deviceId || selectedVehicle.id}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
            <span className="text-dim">Device SIM Card Number:</span>
            <span className="font-mono font-medium text-hi">{selectedVehicle.simCardNumber || '—'}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
            <span className="text-dim">Chassis Number:</span>
            <span className="font-mono font-medium text-hi">{selectedVehicle.chassisNumber || '—'}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
            <span className="text-dim">Make / Model:</span>
            <span className="font-mono font-medium text-hi">
              {selectedVehicle.oem || 'Electrie'} {selectedVehicle.model || 'S-14'}
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-dim">Data Source Platform:</span>
            <span className="font-mono font-medium text-accent">
              {selectedVehicle.dataSourcePlatform || 'Intellicar'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
