import type DiceBox from "@3d-dice/dice-box-threejs"

// The tiles hold one die at the centre, so a close key light from the upper left is enough.
export function applyTileLighting(box: DiceBox) {
  box.light.position.set(-250, 300, 700)
  box.light.distance = 4000
  box.light.intensity = 1.1
  box.light_amb.intensity = 0.9
}

// Thrown dice land anywhere on the screen, so the light has to reach all of it alike. It keeps the tiles'
// direction but sits far above the table (the library sizes that height to the box and resets it on resize,
// so the height is read back) and does not fade with distance, so no spot of it shows.
export function applyRollLighting(box: DiceBox) {
  const height = box.light.position.z
  box.light.position.set(-height * 0.36, height * 0.43, height)
  box.light.distance = 0
  box.light.decay = 0
  box.light.intensity = 0.7
  box.light_amb.intensity = 1
}
