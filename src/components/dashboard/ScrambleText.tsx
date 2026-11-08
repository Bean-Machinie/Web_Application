import { useEffect, useState } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+"
const DURATION_MS = 400

const scrambled = (text: string, revealed: number) =>
  [...text].map((char, index) => (index < revealed || char === " " ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join("")

// Text that, each time it is set going, shows random letters which settle into the real ones from left
// to right. Screen readers get the real text only.
export function ScrambleText({ text, active }: { text: string; active: boolean }) {
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(text)

  useEffect(() => {
    if (!active || reduced) return
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION_MS)
      setShown(scrambled(text, Math.floor(p * text.length)))
      if (p < 1) raf = requestAnimationFrame(tick)
      else setShown(text)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, reduced, text])

  return (
    <>
      <span aria-hidden>{active && !reduced ? shown : text}</span>
      <span className="sr-only">{text}</span>
    </>
  )
}
