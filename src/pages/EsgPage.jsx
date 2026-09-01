import { useState, useMemo } from 'react'
import Topbar from '../components/Topbar'
import { Leaf, Trees, Zap, DollarSign, TrendingUp, BarChart3, RotateCw, ChevronDown } from '../components/icons'
import { useFleet } from '../context/FleetContext'

const PERIOD_DATA = {
  '7d': {
    co2: '1,240',
    diesel: '462',
    trees: '57.0',
    savings: '₹42,350',
    distance: '18,420.5 km',
    energy: '372.1 kWh',
    chart: [
      { month: 'Mon', co2: 180, diesel: 67 },
      { month: 'Tue', co2: 210, diesel: 78 },
      { month: 'Wed', co2: 195, diesel: 72 },
      { month: 'Thu', co2: 230, diesel: 86 },
      { month: 'Fri', co2: 215, diesel: 80 },
      { month: 'Sat', co2: 120, diesel: 45 },
      { month: 'Sun', co2: 90, diesel: 34 },
    ]
  },
  '30d': {
    co2: '5,120',
    diesel: '1,910',
    trees: '235.2',
    savings: '₹1,74,800',
    distance: '76,340.2 km',
    energy: '1,540.8 kWh',
    chart: [
      { month: 'Week 1', co2: 1200, diesel: 448 },
      { month: 'Week 2', co2: 1350, diesel: 504 },
      { month: 'Week 3', co2: 1280, diesel: 478 },
      { month: 'Week 4', co2: 1290, diesel: 480 },
    ]
  },
  '1y': {
    co2: '14,932',
    diesel: '5,572',
    trees: '685.9',
    savings: '$6,148 (₹5,10,284)',
    distance: '222,286.47 km',
    energy: '4,482.55 kWh',
    chart: [
      { month: 'Nov', co2: 850, diesel: 317 },
      { month: 'Dec', co2: 920, diesel: 343 },
      { month: 'Jan', co2: 1100, diesel: 410 },
      { month: 'Feb', co2: 1250, diesel: 466 },
      { month: 'Mar', co2: 1380, diesel: 515 },
      { month: 'Apr', co2: 15200, diesel: 5670 },
      { month: 'May', co2: 1420, diesel: 530 },
      { month: 'Jun', co2: 1650, diesel: 615 },
      { month: 'Jul', co2: 1580, diesel: 590 },
      { month: 'Aug', co2: 1720, diesel: 642 },
    ]
  }
}

export default function EsgPage() {
  const { showToast } = useFleet()
  const [period, setPeriod] = useState('1y')
  const [depot, setDepot] = useState('all')
  const [isCalculating, setIsCalculating] = useState(false)

  const activeData = PERIOD_DATA[period] || PERIOD_DATA['1y']

  const handleCalculate = () => {
    setIsCalculating(true)
    if (showToast) showToast('Recalculating ESG environmental impact telemetry...')
    setTimeout(() => setIsCalculating(false), 600)
  }

  const maxCo2 = useMemo(() => Math.max(...activeData.chart.map(c => c.co2)), [activeData])

  return (
    <div className="flex min-h-0 flex-1 flex-col md:overflow-hidden">
      <Topbar title="ESG Savings Calculator" subtitle="Calculate & track environmental impact of your EV fleet" />

      <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-24 pt-5 sm:px-6 md:pb-5 space-y-4.5">
        
        {/* Controls Bar */}
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-panel p-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-dim">Period (Days)</label>
              <div className="relative">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="rounded-lg border border-line bg-panel-2 px-3 py-1.5 pr-8 text-[12px] font-medium text-hi outline-none focus:border-line focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="1y">Last 1 Year (reporting period)</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-dim" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-dim">Depot / Region</label>
              <div className="relative">
                <select
                  value={depot}
                  onChange={(e) => setDepot(e.target.value)}
                  className="rounded-lg border border-line bg-panel-2 px-3 py-1.5 pr-8 text-[12px] font-medium text-hi outline-none focus:border-line focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="all">All Depots</option>
                  <option value="pune">Pune Depot</option>
                  <option value="okhla">Okhla Yard</option>
                  <option value="blr">Bengaluru Ring</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-dim" />
              </div>
            </div>
          </div>

          <button
            onClick={handleCalculate}
            className="flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-[12px] font-bold text-black transition-all hover:bg-accent/90 cursor-pointer shadow-md shadow-accent/20 active:scale-98"
          >
            <RotateCw className={`h-4 w-4 ${isCalculating ? 'animate-spin' : ''}`} strokeWidth={2.5} />
            <span>Calculate Impact</span>
          </button>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          
          {/* Card 1: CO2 Avoided */}
          <div className="group rounded-xl border border-line bg-panel p-4.5 transition-all hover:border-accent/40 hover:bg-panel-2/50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-dim">CO₂ Avoided</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent border border-accent/20">
                <Leaf className="h-4 w-4" strokeWidth={2.2} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-[28px] font-extrabold text-accent">{activeData.co2}</span>
              <span className="text-[12px] font-medium text-lo">kilograms</span>
            </div>
            <div className="mt-1 font-mono text-[10.5px] text-accent/80">
              14.93 Metric Tons reduced
            </div>
          </div>

          {/* Card 2: Diesel Saved */}
          <div className="group rounded-xl border border-line bg-panel p-4.5 transition-all hover:border-accent/40 hover:bg-panel-2/50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-dim">Diesel Saved</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent border border-accent/20">
                <Zap className="h-4 w-4" strokeWidth={2.2} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-[28px] font-extrabold text-hi">{activeData.diesel}</span>
              <span className="text-[12px] font-medium text-lo">Liters</span>
            </div>
            <div className="mt-1 font-mono text-[10.5px] text-dim">
              Based on ICE 9.5 km/L avg
            </div>
          </div>

          {/* Card 3: Trees Equivalent */}
          <div className="group rounded-xl border border-line bg-panel p-4.5 transition-all hover:border-accent/40 hover:bg-panel-2/50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-dim">Trees Equivalent</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent border border-accent/20">
                <Trees className="h-4 w-4" strokeWidth={2.2} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-[28px] font-extrabold text-accent">{activeData.trees}</span>
              <span className="text-[12px] font-medium text-lo">trees planted</span>
            </div>
            <div className="mt-1 font-mono text-[10.5px] text-accent/80">
              10-year carbon offset equivalent
            </div>
          </div>

          {/* Card 4: Cost Savings */}
          <div className="group rounded-xl border border-line bg-panel p-4.5 transition-all hover:border-accent/40 hover:bg-panel-2/50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-dim">Cost Savings</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent border border-accent/20">
                <DollarSign className="h-4 w-4" strokeWidth={2.2} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-[24px] font-extrabold text-hi sm:text-[26px]">{activeData.savings}</span>
            </div>
            <div className="mt-1 font-mono text-[10.5px] text-dim">
              Fuel + maintenance savings
            </div>
          </div>

        </div>

        {/* Chart & Report Summary Grid */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
          
          {/* Monthly Trends Bar Chart */}
          <div className="flex flex-col rounded-xl border border-line bg-panel p-5">
            <div className="flex items-center justify-between border-b border-line-soft pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-accent" strokeWidth={2} />
                <span className="font-display text-[14px] font-bold">Monthly Trends</span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-xs bg-accent" />
                  <span className="text-lo">CO₂ Avoided</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-xs bg-blue-500" />
                  <span className="text-lo">Diesel Saved</span>
                </div>
              </div>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="relative flex-1 min-h-[220px] flex items-end gap-3 pt-6 pb-2 px-2">
              {activeData.chart.map((item, idx) => {
                const co2Height = Math.max(12, Math.round((item.co2 / maxCo2) * 160))
                const dieselHeight = Math.max(8, Math.round((item.diesel / maxCo2) * 160))
                return (
                  <div key={idx} className="group relative flex flex-1 flex-col items-center justify-end h-full">
                    
                    {/* Tooltip on hover */}
                    <div className="pointer-events-none absolute -top-10 z-20 hidden rounded-lg border border-line bg-panel-2 px-2.5 py-1 text-center font-mono text-[10px] shadow-lg group-hover:block whitespace-nowrap">
                      <div className="text-accent font-bold">{item.co2} kg CO₂</div>
                      <div className="text-blue-400">{item.diesel} L Diesel</div>
                    </div>

                    {/* Bars Container */}
                    <div className="flex items-end gap-1 w-full justify-center">
                      <div
                        style={{ height: `${co2Height}px` }}
                        className="w-full max-w-[20px] rounded-t-md bg-accent transition-all duration-300 group-hover:brightness-110"
                      />
                      <div
                        style={{ height: `${dieselHeight}px` }}
                        className="w-full max-w-[20px] rounded-t-md bg-blue-500/80 transition-all duration-300 group-hover:brightness-110"
                      />
                    </div>

                    <span className="mt-2 font-mono text-[10.5px] text-dim">{item.month}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Report Summary Side Panel */}
          <div className="flex flex-col justify-between rounded-xl border border-line bg-panel p-5">
            <div>
              <div className="font-display text-[14px] font-bold border-b border-line-soft pb-3.5 mb-4">
                Report Summary
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-panel-2 border border-line-soft text-lo">
                    <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-dim">Reporting Period</div>
                    <div className="text-[12.5px] font-medium text-hi mt-0.5">8/24/2025 – 8/24/2026</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-panel-2 border border-line-soft text-accent">
                    <Zap className="h-3.5 w-3.5" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-dim">Total Distance</div>
                    <div className="text-[12.5px] font-medium text-hi mt-0.5">{activeData.distance}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-panel-2 border border-line-soft text-amber">
                    <Leaf className="h-3.5 w-3.5" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-dim">Energy Consumed</div>
                    <div className="text-[12.5px] font-medium text-hi mt-0.5">{activeData.energy}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-line-soft bg-panel-2/60 p-3">
              <div className="text-[11px] font-semibold text-lo">Efficiency Index</div>
              <div className="mt-1 font-mono text-[12px] font-bold text-accent">49.5 km / kWh average</div>
            </div>
          </div>

        </div>

        {/* Environmental Impact Statement (Bottom Banner) */}
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4.5 backdrop-blur">
          <div className="flex items-center gap-2 font-display text-[13.5px] font-bold text-accent mb-2">
            <Leaf className="h-4 w-4" strokeWidth={2.2} />
            <span>Environmental Impact Statement</span>
          </div>
          <p className="text-[12px] leading-relaxed text-hi">
            By operating an electric vehicle fleet, your organization has avoided{' '}
            <strong className="text-accent font-bold">{activeData.co2} kg</strong> of CO₂ emissions over the reporting period. This is equivalent to planting{' '}
            <strong className="text-accent font-bold">{activeData.trees} trees</strong> or saving{' '}
            <strong className="text-accent font-bold">{activeData.diesel} liters</strong> of diesel fuel. Your transition to electric mobility has resulted in cost savings of{' '}
            <strong className="text-accent font-bold">{activeData.savings}</strong> while contributing to a sustainable future.
          </p>
        </div>

      </div>
    </div>
  )
}
