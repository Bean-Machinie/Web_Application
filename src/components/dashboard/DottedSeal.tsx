// A campaign's seal drawn in dots: an outer ring of dots, an inner one, and a four-pointed star of dots
// in the middle, in the foreground colour at a few strengths.
const ring = (count: number, radius: number) =>
  Array.from({ length: count }, (_, i) => [50 + radius * Math.cos((i / count) * 2 * Math.PI), 50 + radius * Math.sin((i / count) * 2 * Math.PI)] as const)

const STAR = [0, 1, 2, 3].flatMap((arm) =>
  [6, 12, 18].map((distance) => [50 + distance * Math.cos((arm * Math.PI) / 2), 50 + distance * Math.sin((arm * Math.PI) / 2)] as const)
)

export function DottedSeal({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 100 100" className={className}>
      {ring(24, 46).map(([x, y], i) => (
        <circle key={`o${i}`} cx={x} cy={y} r={2.4} className="fill-foreground/60" />
      ))}
      {ring(16, 34).map(([x, y], i) => (
        <circle key={`i${i}`} cx={x} cy={y} r={1.6} className="fill-foreground/35" />
      ))}
      <circle cx={50} cy={50} r={3} className="fill-foreground/80" />
      {STAR.map(([x, y], i) => (
        <circle key={`s${i}`} cx={x} cy={y} r={1.8} className="fill-foreground/50" />
      ))}
    </svg>
  )
}
