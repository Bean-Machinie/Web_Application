// The digits as 3 by 5 grids of dots, row by row, for numbers drawn in dots.
const DIGITS = [
  "111101101101111", "010110010010111", "111001111100111", "111001111001111", "101101111001001",
  "111100111001111", "111100111101111", "111001001001001", "111101111101111", "111101111001111",
]

// The dots of a number, centred on 0,0, one unit apart, with a blank column between digits.
export function numberDots(value: number): [number, number][] {
  const text = String(value)
  const width = text.length * 4 - 1
  const dots: [number, number][] = []
  ;[...text].forEach((char, index) => {
    const grid = DIGITS[Number(char)]
    for (let cell = 0; cell < 15; cell++) {
      if (grid[cell] !== "1") continue
      dots.push([index * 4 + (cell % 3) - (width - 1) / 2, Math.floor(cell / 3) - 2])
    }
  })
  return dots
}
