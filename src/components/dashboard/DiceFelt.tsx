import type { CSSProperties } from "react"

// Fine grain drawn by the browser: noise turned into specks of one colour, stronger where the noise peaks.
// Light and dark specks together show on a dark panel and on a light one.
const grain = (shade: 0 | 1, seed: number) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2' seed='${seed}' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 ${shade} 0 0 0 0 ${shade} 0 0 0 0 ${shade} 0 0 0 1.4 -0.5'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`
  )}")`

// Every edge fades to nothing, so the grain has no outline.
const FEATHER = "linear-gradient(to right, transparent, black 16%, black 84%, transparent), linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)"

const STYLE: CSSProperties = {
  backgroundImage: `${grain(1, 3)}, ${grain(0, 9)}`,
  maskImage: FEATHER,
  maskComposite: "intersect",
  WebkitMaskImage: FEATHER,
  WebkitMaskComposite: "source-in",
}

// The textured patch behind the dice, like felt: grain that thins out towards its edges.
export function DiceFelt() {
  return <div aria-hidden style={STYLE} className="pointer-events-none absolute -inset-x-3 -inset-y-3 opacity-20" />
}
