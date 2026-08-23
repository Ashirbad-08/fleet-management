import { Check } from './icons'
import { useFleet } from '../context/FleetContext'

export default function Toast() {
  const { toast } = useFleet()

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-line bg-panel-2 px-4.5 py-2.75 text-[12.5px] font-medium text-hi shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all duration-250 ${
        toast ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-5 opacity-0'
      }`}
    >
      <Check className="h-3.5 w-3.5 text-green" strokeWidth={2.4} />
      {toast}
    </div>
  )
}
