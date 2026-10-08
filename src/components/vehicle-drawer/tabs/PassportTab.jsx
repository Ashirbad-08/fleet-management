import { CreditCard, ShieldCheck, Users } from '../../icons'

export default function PassportTab({ selectedVehicle }) {
  return (
    <div className="p-5 space-y-4">
      {/* ── Vehicle ── */}
      <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/15 text-accent">
              <CreditCard className="h-3 w-3" strokeWidth={2.5} />
            </span>
            <span className="font-display text-[12.5px] font-bold text-hi">Vehicle</span>
          </div>
          <span className="rounded bg-accent/15 px-2 py-0.5 font-mono text-[10px] font-bold text-accent">
            {selectedVehicle.plate || 'Buggy 51'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-px bg-line-soft p-px">
          {[
            ['OEM', selectedVehicle.oem || selectedVehicle.manufacturer || 'Electrie'],
            ['Model', selectedVehicle.model || 'S-14'],
            ['Variant', selectedVehicle.variant || '—'],
            ['Colour', selectedVehicle.color || selectedVehicle.colour || 'White'],
            ['Perm. Reg Num', selectedVehicle.plate || 'Buggy 51'],
            ['Perm. Reg Date', selectedVehicle.registrationDate || '—'],
            ['Reg Type', selectedVehicle.regType || '—'],
            ['Fit Cert Exp Dt', selectedVehicle.fitnessExpiry || '—'],
            ['Temp Reg Number', selectedVehicle.tempRegNumber || '—'],
            ['Temp Reg Date', selectedVehicle.tempRegDate || '—'],
            ['Temp Reg Expiry', selectedVehicle.tempRegExpiry || '—'],
            ['Asset Type', selectedVehicle.type || selectedVehicle.assetType || 'Golf Cart'],
          ].map(([label, value]) => (
            <div key={label} className="bg-panel px-3.5 py-2.5">
              <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">{label}</div>
              <div className="mt-0.5 font-mono text-[11.5px] font-bold text-hi truncate">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Insurance ── */}
      <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-green/15 text-green">
              <ShieldCheck className="h-3 w-3" strokeWidth={2.5} />
            </span>
            <span className="font-display text-[12.5px] font-bold text-hi">Insurance</span>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
              selectedVehicle.insuranceExpiry
                ? 'bg-green/15 text-green border-green/30'
                : 'bg-panel-2 text-dim border-line-soft'
            }`}
          >
            {selectedVehicle.insuranceExpiry ? 'Active' : 'Not Set'}
          </span>
        </div>
        <div className="space-y-0 text-[12px] bg-panel">
          {[
            ['Insurer Name', selectedVehicle.insurerName || selectedVehicle.insurer || '—'],
            ['Insurance Expiry Date', selectedVehicle.insuranceExpiry || '—'],
            ['Insurance Attachment', selectedVehicle.insuranceAttachment || 'NA'],
          ].map(([label, value], i, arr) => (
            <div
              key={label}
              className={`flex justify-between items-center px-3.5 py-2 ${
                i < arr.length - 1 ? 'border-b border-line-soft/60' : ''
              }`}
            >
              <span className="text-dim shrink-0">{label}:</span>
              <span
                className={`font-mono font-medium text-right max-w-[58%] truncate ${
                  value === '—' ? 'text-dim' : 'text-hi'
                }`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Finance / Lease ── */}
      <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
        <div className="flex items-center gap-2 border-b border-line-soft bg-panel px-4 py-2.5">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-amber/15 text-amber">
            <CreditCard className="h-3 w-3" strokeWidth={2.5} />
          </span>
          <span className="font-display text-[12.5px] font-bold text-hi">Finance / Lease</span>
        </div>
        <div className="space-y-0 text-[12px] bg-panel">
          {[
            ['Financing Type', selectedVehicle.financingType || '—'],
            ['Asset Ownership', selectedVehicle.ownerName || selectedVehicle.ownership || 'GZRRC'],
            ['Hypothecation', selectedVehicle.hypothecation || 'No'],
            ['Hypothecated To', selectedVehicle.hypothecatedTo || '—'],
            ['Sale Tax Invoice No.', selectedVehicle.invoiceNumber || '—'],
            ['Invoice Date', selectedVehicle.invoiceDate || '—'],
            ['Invoice Value / Price', selectedVehicle.invoiceValue ? `₹${selectedVehicle.invoiceValue}` : '—'],
          ].map(([label, value], i, arr) => (
            <div
              key={label}
              className={`flex justify-between items-center px-3.5 py-2 ${
                i < arr.length - 1 ? 'border-b border-line-soft/60' : ''
              }`}
            >
              <span className="text-dim shrink-0">{label}:</span>
              <span
                className={`font-mono font-medium text-right max-w-[58%] truncate ${
                  value === '—' ? 'text-dim' : 'text-hi'
                }`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Parties ── */}
      <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-panel-2 text-lo border border-line-soft">
              <Users className="h-3 w-3" strokeWidth={2.5} />
            </span>
            <span className="font-display text-[12.5px] font-bold text-hi">Parties</span>
          </div>
          <span className="rounded bg-panel-2 px-2 py-0.5 font-mono text-[9.5px] text-dim border border-line-soft">
            Role intervals
          </span>
        </div>
        {/* Header row */}
        <div className="grid grid-cols-[2fr_2fr_1.5fr_1.5fr] gap-px bg-line-soft px-0">
          {['Role', 'Organisation', 'From', 'To'].map((h) => (
            <div
              key={h}
              className="bg-panel-2/80 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-dim"
            >
              {h}
            </div>
          ))}
        </div>
        {/* Party rows — from vehicle data or default onboarding entry */}
        {(
          selectedVehicle.parties || [
            {
              role: 'Owner · Current',
              organisation: selectedVehicle.ownerName || 'GZRRC',
              contact: '—',
              from: selectedVehicle.commissionDate || '2026-09-15',
              to: '—',
            },
          ]
        ).map((party, i, arr) => (
          <div
            key={i}
            className={`grid grid-cols-[2fr_2fr_1.5fr_1.5fr] gap-px bg-line-soft ${
              i < arr.length - 1 ? '' : ''
            }`}
          >
            <div className="bg-panel px-3 py-2.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-1.5 py-0.5 text-[9.5px] font-bold text-accent">
                {party.role}
              </span>
            </div>
            <div className="bg-panel px-3 py-2.5 font-mono text-[10.5px] font-bold text-hi truncate flex items-center">
              {party.organisation}
            </div>
            <div className="bg-panel px-3 py-2.5 font-mono text-[10px] text-lo flex items-center">
              {party.from}
            </div>
            <div className="bg-panel px-3 py-2.5 font-mono text-[10px] text-dim flex items-center">
              {party.to}
            </div>
          </div>
        ))}
        <div className="bg-panel px-3 py-2 text-[9.5px] text-dim italic">
          Roles are intervals — a change of operator is a new row, so "who ran this in June" stays answerable.
        </div>
      </div>
    </div>
  )
}
