// Instrument-cluster style arc gauge, echoing a modern EV vehicle dashboard readout.
// Scaled for comfortable presence and clarity in the vehicle drawer.

const CX = 85
const CY = 80
const R = 60
const START_ANGLE = 210
const SWEEP = 240

function toXY(angleDeg) {
  const rad = (angleDeg * Math.PI) / 180
  return [CX + R * Math.cos(rad), CY - R * Math.sin(rad)]
}

function arcPath(a0, a1) {
  const [x0, y0] = toXY(a0)
  const [x1, y1] = toXY(a1)
  const large = a0 - a1 > 180 ? 1 : 0
  return `M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1}`
}

export default function Gauge({ score = 0, color = 'var(--color-accent)', label = 'STATE OF CHARGE', unit = '%' }) {
  const clampedScore = Math.max(0, Math.min(100, Number(score) || 0))
  const endAngle = START_ANGLE - (clampedScore / 100) * SWEEP

  const ticks = []
  for (let i = 0; i <= 10; i++) {
    const a = START_ANGLE - i * (SWEEP / 10)
    const rad = (a * Math.PI) / 180
    const x1 = CX + (R - 6) * Math.cos(rad)
    const y1 = CY - (R - 6) * Math.sin(rad)
    const x2 = CX + (R + 2) * Math.cos(rad)
    const y2 = CY - (R + 2) * Math.sin(rad)
    ticks.push(<line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-line)" strokeWidth="1.75" />)
  }

  return (
    <svg width="170" height="135" viewBox="0 0 170 135" className="overflow-visible">
      {/* Background Arc */}
      <path d={arcPath(210, -30)} fill="none" stroke="var(--color-line-soft)" strokeWidth="9.5" strokeLinecap="round" />
      {ticks}
      {/* Active Value Arc */}
      {clampedScore > 0 && (
        <path
          d={arcPath(210, endAngle)}
          fill="none"
          stroke={color}
          strokeWidth="9.5"
          strokeLinecap="round"
          className="transition-all duration-500 ease-out shadow-sm"
        />
      )}
      <circle cx={CX} cy={CY} r="3.5" fill={color} />
      {/* Center Numeric Value */}
      <text
        x={CX}
        y={CY - 8}
        textAnchor="middle"
        fontFamily="Space Grotesk, sans-serif"
        fontWeight="700"
        fontSize="28"
        fill="var(--color-hi)"
        className="tabular-nums"
      >
        {clampedScore}
        <tspan fontSize="15" fontWeight="500" fill="var(--color-dim)">{unit}</tspan>
      </text>
      {/* Gauge Label */}
      <text
        x={CX}
        y={CY + 16}
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontSize="9"
        fontWeight="600"
        letterSpacing="0.06em"
        fill="var(--color-dim)"
      >
        {label}
      </text>
    </svg>
  )
}
