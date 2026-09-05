// Instrument-cluster style arc gauge, echoing a vehicle dashboard readout.
// Used to visualize a device's overall health score.

const CX = 90
const CY = 90
const R = 68
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

export default function Gauge({ score, color }) {
  const endAngle = START_ANGLE - (score / 100) * SWEEP

  const ticks = []
  for (let i = 0; i <= 10; i++) {
    const a = START_ANGLE - i * (SWEEP / 10)
    const rad = (a * Math.PI) / 180
    const x1 = CX + (R - 6) * Math.cos(rad)
    const y1 = CY - (R - 6) * Math.sin(rad)
    const x2 = CX + (R + 2) * Math.cos(rad)
    const y2 = CY - (R + 2) * Math.sin(rad)
    ticks.push(<line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-line)" strokeWidth="2" />)
  }

  return (
    <svg width="180" height="150" viewBox="0 0 180 150">
      <path d={arcPath(210, -30)} fill="none" stroke="var(--color-line-soft)" strokeWidth="10" strokeLinecap="round" />
      {ticks}
      <path d={arcPath(210, endAngle)} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
      <circle cx={CX} cy={CY} r="4" fill={color} />
      <text x={CX} y={CY - 10} textAnchor="middle" fontFamily="Space Grotesk" fontWeight="700" fontSize="28" fill="var(--color-hi)">
        {score}
      </text>
      <text x={CX} y={CY + 15} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill="var(--color-dim)">
        HEALTH SCORE
      </text>
    </svg>
  )
}
