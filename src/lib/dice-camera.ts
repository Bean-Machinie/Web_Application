import type DiceBox from "@3d-dice/dice-box-threejs"

type Resizable = { setDimensions: (...args: unknown[]) => unknown }

// The library looks at the table through a 20 degree perspective camera, so a die far from the middle of the
// screen is seen from the side, and its top face seems to point outward. Narrowing the angle only shrinks
// that (to 18 degrees the edge of a 16:9 screen is seen at about 16 degrees instead of 17), so the roll
// layer is framed orthographically instead: every die is seen straight down, wherever it lands.
//
// The frame is the table area the library's camera shows at the table's own height, and the camera sits
// where it did, so dice keep their size on screen and the lights and shadows stay as they are. It is the
// library's own camera with an orthographic projection set on it, which is what an OrthographicCamera does,
// without a second copy of three.js. The library makes a new camera on every resize, so this runs after each.
export function frameRollCamera(box: DiceBox) {
  const resizable = box as unknown as Resizable
  const original = resizable.setDimensions.bind(box)
  resizable.setDimensions = (...args) => {
    const result = original(...args)
    const camera = box.camera
    const halfHeight = camera.position.z * Math.tan((camera.fov * Math.PI) / 360)
    const halfWidth = halfHeight * camera.aspect
    camera.updateProjectionMatrix = function (this: typeof camera) {
      this.projectionMatrix.makeOrthographic(-halfWidth, halfWidth, halfHeight, -halfHeight, this.near, this.far)
      this.projectionMatrixInverse.copy(this.projectionMatrix).invert()
    }
    camera.updateProjectionMatrix()
    return result
  }
}
