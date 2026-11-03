import type { D20Mode, Roll } from "@/lib/dice"

// Development only: every use of this file sits behind import.meta.env.DEV, so a production build leaves it out.
export type Force = "max" | "min" | null

let forced: Force = null
const listeners = new Set<() => void>()

export const getForced = () => forced
export const subscribeForced = (listener: () => void) => {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}

export function forceRoll(next: Force) {
  forced = next
  listeners.forEach((listener) => listener())
}

// The face asked for by the armed force, for the next die of any kind, and then the force is used up.
export function takeForced(sides: number) {
  const armed = forced
  if (armed === null) return null
  forceRoll(null)
  return armed === "max" ? sides : 1
}

// With two dice the face goes to the kept one, and the other is moved to the side of it that keeps it the kept one.
export function pinKept(dice: number[], kept: number, mode: D20Mode, face: number) {
  dice[kept] = face
  dice.forEach((die, index) => {
    if (index !== kept) dice[index] = mode === "advantage" ? Math.min(die, face) : Math.max(die, face)
  })
}

export function logResult(roll: Roll, face: number | undefined, moment: string | null) {
  console.debug("[dice] result", roll, "| face read:", face, "| moment:", moment)
}

declare global {
  interface Window {
    __dice?: { force: (next: Force) => void; replay: () => void }
  }
}

export function installDiceDev(replay: () => void) {
  window.__dice = { force: forceRoll, replay }
  return () => void delete window.__dice
}
