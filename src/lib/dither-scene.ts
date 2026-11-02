import { toLinearRgb } from "./dither-color"
import { DITHER } from "./dither-config"

// What changes from one place in the app to the next: the wave colour and the way the waves drift.
export type DitherScene = {
  // Linear RGB, as the shader mixes it.
  color: Float32Array
  // The unit vector the waves drift along, y up.
  direction: [number, number]
}

const HOME_ANGLE = Math.PI / 4

function hash(text: string) {
  let h = 2166136261
  for (let at = 0; at < text.length; at++) h = Math.imul(h ^ text.charCodeAt(at), 16777619)
  return h >>> 0
}

// Turns the hue in OKLab, where a and b can be rotated without touching lightness or chroma:
// the colour changes and the brightness of the background does not.
function rotateHue(linear: Float32Array, turn: number) {
  const [r, g, b] = linear
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const a0 = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const b0 = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const a = a0 * Math.cos(turn) - b0 * Math.sin(turn)
  const bb = a0 * Math.sin(turn) + b0 * Math.cos(turn)
  const l3 = (lightness + 0.3963377774 * a + 0.2158037573 * bb) ** 3
  const m3 = (lightness - 0.1055613458 * a - 0.0638541728 * bb) ** 3
  const s3 = (lightness - 0.0894841775 * a - 1.291485548 * bb) ** 3
  return Float32Array.from(
    [4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3, -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3, -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3],
    (channel) => Math.min(1, Math.max(0, channel)),
  )
}

export function homeScene(): DitherScene {
  return { color: toLinearRgb(DITHER.waveColor), direction: [Math.cos(HOME_ANGLE), Math.sin(HOME_ANGLE)] }
}

// Each campaign keeps its own colour and direction, picked from its id: never close to the
// home ones, so crossing into a campaign is always seen.
export function campaignScene(campaignId: string): DitherScene {
  const h = hash(campaignId)
  const turn = ((70 + (h % 220)) * Math.PI) / 180
  const angle = HOME_ANGLE + ((120 + ((h >>> 9) % 120)) * Math.PI) / 180
  return { color: rotateHue(toLinearRgb(DITHER.waveColor), turn), direction: [Math.cos(angle), Math.sin(angle)] }
}
