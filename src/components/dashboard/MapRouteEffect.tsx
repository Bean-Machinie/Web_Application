import { useId } from "react"
import { motion } from "motion/react"
import { useLandRoute } from "@/hooks/use-land-route"
import { smoothRoute } from "@/lib/land-route"

// For a picture whose land cannot be read, or with none: the route the tile always had, in a 100 box.
const FALLBACK = "M14 74 C 30 40, 44 86, 58 56 S 78 34, 84 30"
const FALLBACK_END = [84, 30]

// Map Maker: the map picture whole, and over it a dashed route that draws along its land, from one place
// to another far off, with a pin dropping at its end.
export function MapRouteEffect({ src, active }: { src: string | null; active: boolean }) {
  const mask = useId()
  const found = useLandRoute(src)
  const [width, height] = [100, 100 / (found?.aspect ?? 1)]
  const route = found?.route
  const d = route ? smoothRoute(route, width, height) : FALLBACK
  const last = route?.[route.length - 1]
  const [x, y] = last ? [last[0] * width, last[1] * height] : FALLBACK_END

  return (
    <>
      {src && <img src={src} alt="" className="absolute inset-0 size-full object-contain" />}
      {/* Fitted as the picture is, so the route lies on its land. */}
      <svg aria-hidden viewBox={`0 0 ${width} ${height}`} className="pointer-events-none absolute inset-0 size-full">
        <defs>
          <mask id={mask}>
            <motion.path
              d={d}
              fill="none"
              stroke="white"
              strokeWidth={6}
              initial={false}
              animate={{ pathLength: active ? 1 : 0 }}
              transition={{ duration: active ? 0.4 : 0.15, ease: "easeOut" }}
            />
          </mask>
        </defs>
        <path d={d} fill="none" stroke="white" strokeWidth={1.6} strokeDasharray="3 3" strokeLinecap="round" mask={`url(#${mask})`} />
        <g transform={`translate(${x - 84} ${y - 30})`}>
          <motion.g
            initial={false}
            animate={active ? { y: 0, opacity: 1 } : { y: -14, opacity: 0 }}
            transition={active ? { delay: 0.3, type: "spring", stiffness: 500, damping: 18 } : { duration: 0.1 }}
          >
            <path d="M84 30 c-3 -4 -4.5 -6 -4.5 -8.5 a4.5 4.5 0 1 1 9 0 c0 2.5 -1.5 4.5 -4.5 8.5z" fill="var(--primary)" stroke="white" strokeWidth={1} />
            <circle cx={84} cy={21.5} r={1.6} fill="white" />
          </motion.g>
        </g>
      </svg>
    </>
  )
}
