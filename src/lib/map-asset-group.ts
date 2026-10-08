import { automaticAmount, between, hsv } from "./map-asset-recolour"
import type { Surfaces } from "./map-asset-recolour"
import type { Window } from "./map-assets"

// Art whose mask marks a group of ground parts (the sand, the scrub on it and the
// rocks in it) rather than one surface. Inside the mask each part is told apart by
// its colour and changes on its own: green is "grass", the bright yellow sand is
// "snow", and what is left, rocks and shaded sand, is "rock".

// Bright and saturated yellow: sunlit sand. Shaded sand is darker, so it is rock.
function sandAmount(r: number, g: number, b: number) {
  const { saturation, value } = hsv(r, g, b)
  return between(value, 0.78, 0.88) * between(saturation, 0.38, 0.48)
}

// Without a mask nothing is in the group, so nothing changes.
export function groupSurfaces(pixels: Uint8ClampedArray, mask: Uint8ClampedArray | null, green: Window): Surfaces {
  const count = pixels.length / 4
  const grass = new Float32Array(count)
  const sand = new Float32Array(count)
  const rock = new Float32Array(count)
  if (!mask) return { grass, snow: sand, rock }
  for (let i = 0; i < count; i++) {
    const inside = ((0.299 * mask[i * 4] + 0.587 * mask[i * 4 + 1] + 0.114 * mask[i * 4 + 2]) / 255) * (mask[i * 4 + 3] / 255)
    const [r, g, b] = [pixels[i * 4], pixels[i * 4 + 1], pixels[i * 4 + 2]]
    grass[i] = inside * automaticAmount(r, g, b, green)
    sand[i] = inside * (1 - grass[i]) * sandAmount(r, g, b)
    rock[i] = Math.max(inside - grass[i] - sand[i], 0) * (pixels[i * 4 + 3] / 255)
  }
  return { grass, snow: sand, rock }
}
