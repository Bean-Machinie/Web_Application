import { facing } from "./icosahedron"
import type { Vec3 } from "./icosahedron"

type Pose = { yaw: number; pitch: number }

export type Spin = Pose & {
  // While a throw plays: where it started, where it lands and when it began.
  throw: { from: Pose; to: Pose; start: number } | null
}

const TURN = Math.PI * 2
const THROW_MS = 1600
const IDLE_YAW = 0.35
const IDLE_PITCH = 0.16

export const restingSpin = (): Spin => ({ yaw: 0.4, pitch: -0.35, throw: null })

// The slow turn of a die at rest, dt seconds on.
export function drift(spin: Spin, dt: number) {
  spin.yaw += IDLE_YAW * dt
  spin.pitch += IDLE_PITCH * dt
}

// Starts a throw that ends with the given face toward the viewer, after a few whole turns.
export function throwTo(spin: Spin, face: Vec3, now: number) {
  const target = facing(face)
  const from = { yaw: spin.yaw, pitch: spin.pitch }
  const yaw = target.yaw + TURN * (Math.ceil((from.yaw - target.yaw) / TURN) + 3)
  const pitch = target.pitch + TURN * (Math.round((from.pitch - target.pitch) / TURN) + 1)
  spin.throw = { from, to: { yaw, pitch }, start: now }
}

// A quick start and a long slowing down, like a die let go.
const ease = (p: number) => {
  const s = Math.pow(p, 0.6)
  return s * s * (3 - 2 * s)
}

// Moves a throw on to the given time; true once it has landed.
export function roll(spin: Spin, now: number) {
  if (!spin.throw) return true
  const { from, to, start } = spin.throw
  const p = Math.min(1, (now - start) / THROW_MS)
  const k = ease(p)
  spin.yaw = from.yaw + (to.yaw - from.yaw) * k
  spin.pitch = from.pitch + (to.pitch - from.pitch) * k
  return p >= 1
}

// Lands a throw at once, for reduced motion.
export function land(spin: Spin) {
  if (spin.throw) Object.assign(spin, spin.throw.to)
  spin.throw = null
}
