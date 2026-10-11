// The sizes the brush's presets offer: friendly numbers of the usual 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8
// times a power of ten, whole ones only.
const FRIENDLY = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8]

export const PRESET_COUNT = 12

function candidates(min: number, max: number) {
  const found = new Set<number>([min, max])
  for (let power = 0.1; power <= max; power *= 10) {
    for (const factor of FRIENDLY) {
      const value = Math.round(factor * power * 10) / 10
      if (Number.isInteger(value) && value > min && value < max) found.add(value)
    }
  }
  return [...found].sort((a, b) => a - b)
}

// A dozen sizes across a range, even on a curve (each step the same share larger, as
// sizes are seen). The ends are the range's own; the rest are the friendly numbers, in
// order and none twice, whose steps are altogether the nearest to that even share.
export function sizePresets(min: number, max: number): number[] {
  const options = candidates(min, max)
  if (options.length <= PRESET_COUNT) return options
  const last = PRESET_COUNT - 1
  const even = Math.log(max / min) / last
  const off = (from: number, to: number) => (Math.log(options[to] / options[from]) - even) ** 2

  // cost[step][option]: the least total of the steps' misses up to this step, on this option.
  const cost: number[][] = [options.map((_, option) => (option === 0 ? 0 : Infinity))]
  const from: number[][] = [[]]
  for (let step = 1; step <= last; step++) {
    const row: number[] = []
    const back: number[] = []
    options.forEach((_, option) => {
      let best = Infinity
      let at = -1
      for (let before = 0; before < option; before++) {
        const total = cost[step - 1][before] + off(before, option)
        if (total < best) {
          best = total
          at = before
        }
      }
      // The last step is the range's own top.
      row.push(step === last && option !== options.length - 1 ? Infinity : best)
      back.push(at)
    })
    cost.push(row)
    from.push(back)
  }

  const picked: number[] = []
  let option = options.length - 1
  for (let step = last; step >= 0; step--) {
    picked.unshift(options[option])
    option = from[step][option]
  }
  return picked
}

// How wide a preset's dot is, from 0 to 1 of the room it has: the largest preset fills
// it. The size is taken on the same curve as the presets and bent a little, so that the
// smallest stays a visible dot and each is plainly larger than the one before.
export function dotShare(size: number, min: number, max: number, smallest = 0.14) {
  const along = Math.log(size / min) / Math.log(max / min)
  return smallest + (1 - smallest) * along ** 0.85
}
