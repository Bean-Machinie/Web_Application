const smooth = (t: number) => t * t * (3 - 2 * t)
// Where, from the middle of the tile (0) to its edge (1), the tile starts to give
// way to its own copy shifted by half.
const FROM = 0.7

const give = (position: number, size: number) => {
  const away = Math.abs(position / size - 0.5) * 2
  return smooth(Math.min(Math.max((away - FROM) / (1 - FROM), 0), 1))
}

// Makes a tile join its own opposite edges, whatever was painted there: near the
// edges the tile is mixed into a copy of itself shifted by half, whose edges
// are the tile's middle and so already join. The middle is left as painted.
export function mendSeams(data: Uint8ClampedArray, w: number, h: number) {
  const source = data.slice()
  const halfW = w >> 1
  const halfH = h >> 1
  for (let y = 0; y < h; y++) {
    const wy = give(y, h)
    const sy = (y + halfH) % h
    for (let x = 0; x < w; x++) {
      const amount = Math.max(give(x, w), wy)
      if (amount === 0) continue
      const at = (y * w + x) * 4
      const other = (sy * w + ((x + halfW) % w)) * 4
      for (let c = 0; c < 3; c++) data[at + c] = source[at + c] + (source[other + c] - source[at + c]) * amount
    }
  }
}
