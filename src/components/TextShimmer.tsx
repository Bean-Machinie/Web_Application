import { motion } from "motion/react"

type Props = { children: string; highlight: string; duration: number; delay: number; className?: string }

// One band of light that sweeps across the text, left to right, once. It is laid over text drawn
// elsewhere, so only the band shows.
export function TextShimmer({ children, highlight, duration, delay, className }: Props) {
  return (
    <motion.span
      aria-hidden
      initial={{ backgroundPosition: "100% center" }}
      animate={{ backgroundPosition: "0% center" }}
      transition={{ duration, delay, ease: "linear" }}
      className={`bg-clip-text text-transparent ${className ?? ""}`}
      style={{
        backgroundImage: `linear-gradient(90deg, transparent 42%, ${highlight} 50%, transparent 58%)`,
        backgroundSize: "250% 100%",
        backgroundRepeat: "no-repeat",
      }}
    >
      {children}
    </motion.span>
  )
}
