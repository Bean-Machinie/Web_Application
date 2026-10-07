// How near a right angle the rotation slider pulls to it, in degrees: gently, so
// the angles in between are still easy to reach.
const PULL = 3
// The step of Shift, as for the rotate handles.
export const SHIFT_STEP = 15

const RIGHT_ANGLES = [-180, -90, 0, 90, 180]

// An angle as the slider should take it: held at the next 15 degrees with Shift,
// otherwise drawn to 0, 90, 180 or -90 when it is close.
export function snapAngle(degrees: number, shift: boolean) {
  if (shift) return Math.round(degrees / SHIFT_STEP) * SHIFT_STEP
  return RIGHT_ANGLES.find((angle) => Math.abs(degrees - angle) <= PULL) ?? degrees
}
