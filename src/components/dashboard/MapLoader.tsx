type Props = {
  // Covers the whole window, instead of the area it is placed in.
  fullScreen?: boolean
  // How much of the left side a docked panel lies over, so the wheel is centred in what can be seen.
  inset?: number
  // The words under the wheel; none leaves the wheel alone.
  label?: string | null
}

// A soft track with a short arc running round it, in the foreground colour.
export function MapLoader({ fullScreen = false, inset = 0, label = "Loading map…" }: Props) {
  return (
    <div
      role="status"
      style={{ paddingLeft: inset }}
      className={`flex flex-col items-center justify-center gap-4 ${
        fullScreen ? "bg-background fixed inset-0 z-50" : "absolute inset-0"
      }`}
    >
      <svg viewBox="0 0 48 48" fill="none" className="size-12" aria-hidden="true">
        <circle cx="24" cy="24" r="20" className="stroke-foreground/10" strokeWidth="4" />
        <circle
          cx="24"
          cy="24"
          r="20"
          className="stroke-foreground origin-center animate-[spin_0.9s_linear_infinite] motion-reduce:animate-[spin_3s_linear_infinite]"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="31 95"
        />
      </svg>
      {label && <p className="text-muted-foreground text-sm font-medium">{label}</p>}
    </div>
  )
}
