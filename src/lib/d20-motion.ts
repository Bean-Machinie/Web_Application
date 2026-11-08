// How a dotted d20 turns, as a globe does: a steady idle turn, a quick twirl that slows back down,
// dragging by hand, and the momentum a drag leaves when let go.
export type D20Motion = {
  yaw: number
  pitch: number
  // Turning speeds, in radians a second.
  spin: number
  tilt: number
  dragging: boolean
}

const IDLE = 0.22
const HOT_IDLE = 0.45
const TWIRL = 13
// How fast a spin settles back to its idle speed, and a tilt back to its rest, per second.
const SETTLE = 2
const REST_PITCH = -0.3
const MAX_PITCH = 1

export const restingMotion = (): D20Motion => ({ yaw: 0.6, pitch: REST_PITCH, spin: IDLE, tilt: 0, dragging: false })

// A sudden push that slows down by itself to the idle turn, about one whole turn later.
export function twirl(motion: D20Motion) {
  motion.spin = TWIRL
}

// Moves it on dt seconds; true while it still moves by more than its idle turn.
export function turn(motion: D20Motion, dt: number, hot: boolean) {
  if (motion.dragging) return true
  const idle = hot ? HOT_IDLE : IDLE
  const k = Math.min(1, dt * SETTLE)
  motion.spin += (idle - motion.spin) * k
  motion.tilt *= 1 - k
  motion.yaw += motion.spin * dt
  motion.pitch += motion.tilt * dt
  motion.pitch += (REST_PITCH - motion.pitch) * k * 0.6
  return Math.abs(motion.spin - idle) > 0.05 || Math.abs(motion.pitch - REST_PITCH) > 0.01
}

// Turns it by a drag of dx, dy pixels over dt seconds, for a die `radius` pixels across; the speed is
// kept, so it flies on when let go.
export function dragBy(motion: D20Motion, dx: number, dy: number, dt: number, radius: number) {
  const [yaw, pitch] = [dx / radius, dy / radius]
  motion.yaw += yaw
  motion.pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, motion.pitch + pitch))
  const seconds = Math.max(dt, 1 / 120)
  // Smoothed, so one jittery move does not fling it.
  motion.spin = motion.spin * 0.5 + (yaw / seconds) * 0.5
  motion.tilt = motion.tilt * 0.5 + (pitch / seconds) * 0.5
}
