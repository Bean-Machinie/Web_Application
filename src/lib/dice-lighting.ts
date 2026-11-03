import type DiceBox from "@3d-dice/dice-box-threejs"

// One light setup for the tiles and the roll boxes, so a style looks the same in the panel and when thrown.
// The library resets its lights when a box is resized, so this is applied again before each use.
export function applyDiceLighting(box: DiceBox) {
  box.light.position.set(-250, 300, 700)
  box.light.distance = 4000
  box.light.intensity = 1.1
  box.light_amb.intensity = 0.9
}
