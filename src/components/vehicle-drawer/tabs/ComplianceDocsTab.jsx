import { ShieldCheck, FileText, Users } from '../../icons'

export default function ComplianceDocsTab({ selectedVehicle }) {
  return (
    <div className="p-5 space-y-4">
      {/* Insurance Status Card */}
      <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-green/15 text-green">
              <ShieldCheck className="h-3 w-3" strokeWidth={2.5} />
            </span>
            <span className="font-display text-[12.5px] font-bold text-hi">Insurance</span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-green/15 px-2.5 py-0.5 text-[10px] font-bold text-green border border-green/30">
            <span className="h-1.5 w-1.5 rounded-full bg-green" />
            {selectedVehicle.insuranceExpiry ? 'Active' : 'Not Set'}
          </span>
        </div>

        <div className="p-3.5 space-y-2 text-[12px] bg-panel">
          <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
            <span className="text-dim">Insurer:</span>
            <span className="font-mono font-bold text-hi">
              {selectedVehicle.insurerName || selectedVehicle.insurer || '—'}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
            <span className="text-dim">Insurance Expiry Date:</span>
            <span className="font-mono font-bold text-hi">{selectedVehicle.insuranceExpiry || '—'}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-dim">Insurance Attachment:</span>
            <span className="font-mono font-medium text-lo">{selectedVehicle.insuranceAttachment || 'NA'}</span>
          </div>
        </div>
      </div>

      {/* Warranty & AMC Card */}
      <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/15 text-accent">
              <FileText className="h-3 w-3" strokeWidth={2.5} />
            </span>
            <span className="font-display text-[12.5px] font-bold text-hi">Warranty & AMC Coverage</span>
          </div>
          <span className="rounded bg-accent/15 px-2 py-0.5 font-mono text-[10px] font-bold text-accent">
            {selectedVehicle.amcCoverage || 'YES'}
          </span>
        </div>

        <div className="p-3.5 space-y-2 text-[12px] bg-panel">
          <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
            <span className="text-dim">Battery Warranty Start:</span>
            <span className="font-mono font-medium text-hi">
              {selectedVehicle.warrantyStartDate || selectedVehicle.batteryWarrantyStartDate || '—'}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
            <span className="text-dim">Warranty Duration:</span>
            <span className="font-mono font-medium text-hi">{selectedVehicle.warrantyDuration || '3 Years'}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
            <span className="text-dim">Warranty Cycles:</span>
            <span className="font-mono font-medium text-hi">{selectedVehicle.warrantyCycles || '2500'}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
            <span className="text-dim">AMC Period:</span>
            <span className="font-mono font-medium text-hi">
              {selectedVehicle.amcStartDate || '—'} to {selectedVehicle.amcEndDate || '—'}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
            <span className="text-dim">AMC Coverage:</span>
            <span className="font-mono font-medium text-green">{selectedVehicle.amcCoverage || 'YES'}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-dim">Fitness Expiry Date:</span>
            <span className="font-mono font-medium text-hi">{selectedVehicle.fitnessExpiry || '—'}</span>
          </div>
        </div>
      </div>

      {/* Client & Deployment Card */}
      <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-panel-2 text-lo border border-line-soft">
              <Users className="h-3 w-3" strokeWidth={2.5} />
            </span>
            <span className="font-display text-[12.5px] font-bold text-hi">Deployment & Client Context</span>
          </div>
          <span className="rounded bg-panel-2 px-2 py-0.5 font-mono text-[10px] text-lo border border-line-soft">
            {selectedVehicle.vehicleStatus || selectedVehicle.status || 'Active'}
          </span>
        </div>

        <div className="p-3.5 space-y-2 text-[12px] bg-panel">
          <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
            <span className="text-dim">Client / Customer Name:</span>
            <span className="font-mono font-bold text-accent">{selectedVehicle.clientName || '—'}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
            <span className="text-dim">Customer Hub Name:</span>
            <span className="font-mono font-medium text-hi">
              {selectedVehicle.customerHubName || selectedVehicle.location || '—'}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
            <span className="text-dim">Customer Hub Lat/Long:</span>
            <span className="font-mono font-medium text-lo truncate max-w-[200px]">
              {selectedVehicle.customerHubLatLong || '—'}
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-dim">Deployment Location:</span>
            <span className="font-mono font-medium text-hi">
              {selectedVehicle.location || selectedVehicle.deploymentLocation || '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
