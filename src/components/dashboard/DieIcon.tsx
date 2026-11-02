import type { Sides } from "@/lib/dice"

// A small version of the charcoal 3D dice: the real silhouette in a few facets, light on top and
// darker down the sides, with the number on the front face. The same in either theme.
const TONES = { top: "#70707a", side: "#2f2f35", front: "#47474f", low: "#38383e" }
type Tone = keyof typeof TONES

type Facet = [points: string, tone: Tone]
type Shape = { facets: Facet[]; label: [x: number, y: number] }

const KITE: Shape = {
  facets: [
    ["16,2 3,12 16,16", "top"],
    ["16,2 29,12 16,16", "front"],
    ["3,12 16,16 29,12 16,30", "side"],
  ],
  label: [16, 21],
}

const SHAPES: Record<Sides, Shape> = {
  4: {
    facets: [
      ["16,3 3,27 16,20", "side"],
      ["16,3 29,27 16,20", "top"],
      ["3,27 29,27 16,20", "front"],
    ],
    label: [16, 25],
  },
  6: {
    facets: [
      ["16,3 28,9 16,15 4,9", "top"],
      ["4,9 16,15 16,29 4,23", "side"],
      ["16,15 28,9 28,23 16,29", "front"],
    ],
    label: [22, 20],
  },
  8: {
    facets: [
      ["16,2 3,16 16,16", "top"],
      ["16,2 29,16 16,16", "front"],
      ["3,16 29,16 16,30", "side"],
    ],
    label: [16,22],
  },
  10: KITE,
  12: {
    facets: [
      ["16,2 29,11 23,15 16,10 9,15 3,11", "top"],
      ["3,11 9,15 11.5,23 8,28", "side"],
      ["29,11 23,15 20.5,23 24,28", "low"],
      ["8,28 11.5,23 20.5,23 24,28", "side"],
      ["16,10 23,15 20.5,23 11.5,23 9,15", "front"],
    ],
    label: [16, 19],
  },
  20: {
    facets: [
      ["4,9 16,2 16,8", "top"],
      ["16,2 28,9 16,8", "front"],
      ["4,9 16,8 9,21 4,23", "side"],
      ["28,9 16,8 23,21 28,23", "low"],
      ["4,23 9,21 23,21 28,23 16,30", "side"],
      ["16,8 23,21 9,21", "front"],
    ],
    label: [16, 18],
  },
  100: KITE,
}

type Props = { sides: Sides; className?: string; showNumber?: boolean }

export function DieIcon({ sides, className, showNumber = true }: Props) {
  const { facets, label } = SHAPES[sides]
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className}>
      {facets.map(([points, tone]) => (
        <polygon key={points} points={points} fill={TONES[tone]} stroke="#1c1c20" strokeWidth={0.8} strokeLinejoin="round" />
      ))}
      {showNumber && (
        <text x={label[0]} y={label[1]} textAnchor="middle" fill="#fff" fontSize={sides === 100 ? 6 : 7} fontWeight={700} fontFamily="inherit">
          {sides === 100 ? "00" : sides}
        </text>
      )}
    </svg>
  )
}
