export type EdgeState = 'available' | 'visited' | 'invalid' | 'optimal'

export function RouteEdge({
  x1,
  y1,
  x2,
  y2,
  state,
  showLabel,
  label,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  state: EdgeState
  showLabel?: boolean
  label?: string
}) {
  const stroke =
    state === 'visited'
      ? '#7c3aed'
      : state === 'optimal'
        ? '#16a34a'
        : state === 'invalid'
          ? '#ef4444'
          : '#cbd5e1'
  const width = state === 'visited' || state === 'optimal' ? 0.9 : state === 'invalid' ? 1.1 : 0.4
  const dash = state === 'available' ? '2 2' : state === 'optimal' ? '3 1.5' : undefined

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={stroke}
        strokeWidth={width}
        strokeDasharray={dash}
        strokeLinecap="round"
        opacity={state === 'available' ? 0.5 : 0.95}
      />
      {showLabel && label && (
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2}
          fontSize="2.6"
          textAnchor="middle"
          fill="#475569"
          stroke="white"
          strokeWidth="0.4"
          paintOrder="stroke"
          fontWeight="700"
        >
          {label}
        </text>
      )}
    </g>
  )
}
