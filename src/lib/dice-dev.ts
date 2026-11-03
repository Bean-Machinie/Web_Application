import type { D20Mode, Roll } from "@/lib/dice"

// Development only: every use of this file sits behind import.meta.env.DEV, so a production build leaves it out.
export type Face = 20 | 1 | null

let forced: Face = null
const listeners = new Set<() => void>()

export const getForced = () => forced
export const subscribeForced = (listener: () => void) => {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}

export function forceFace(face: Face) {
  forced = face
  listeners.forEach((listener) => listener())
}

// The face asked for goes to the next d20 and is then used up. With two dice it goes to the kept one, and
// the other is moved to the side of it that keeps it the kept one.
export function takeForcedFace(dice: number[], kept: number, mode: D20Mode) {
  const face = forced
  if (face === null) return
  dice[kept] = face
  dice.forEach((die, index) => {
    if (index !== kept) dice[index] = mode === "advantage" ? Math.min(die, face) : Math.max(die, face)
  })
  forceFace(null)
}

export function logResult(roll: Roll, face: number | undefined, moment: string | null) {
  console.debug("[dice] result", roll, "| face read:", face, "| moment:", moment)
}

declare global {
  interface Window {
    __dice?: { force: (face: Face) => void; replay: () => void }
  }
}

export function installDiceDev(replay: () => void) {
  window.__dice = { force: forceFace, replay }
  return () => void delete window.__dice
}
