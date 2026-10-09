type Props = { current: number; max: number }

// Green while healthy, amber when hurt, red when close to dropping.
function tone(share: number) {
  if (share > 0.5) return "bg-emerald-500"
  if (share > 0.25) return "bg-amber-500"
  return "bg-red-500"
}

// Runs along the bottom edge of the tile it is placed in.
export function HealthBar({ current, max }: Props) {
  const share = max > 0 ? current / max : 0

  return (
    <div
      role="progressbar"
      aria-label="Health"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={current}
      className="bg-muted absolute inset-x-0 bottom-0 h-1"
    >
      <div
        className={`h-full transition-[width,background-color] duration-300 ease-out motion-reduce:transition-none ${tone(share)}`}
        style={{ width: `${share * 100}%` }}
      />
    </div>
  )
}
