// Where the letters of a search fall in a name, and how good a match it is.
export type Match = { score: number; indices: number[] }

const range = (from: number, length: number) => Array.from({ length }, (_, step) => from + step)

// A run of the search inside the name beats letters scattered through it; the
// start of the name or of a word beats the middle. Null when it does not match.
export function matchText(query: string, text: string): Match | null {
  const wanted = query.trim().toLowerCase()
  if (!wanted) return { score: 0, indices: [] }

  const name = text.toLowerCase()
  const at = name.indexOf(wanted)
  if (at >= 0) {
    const boundary = at === 0 || /[^\p{L}\p{N}]/u.test(name[at - 1])
    return {
      score: 1000 + (boundary ? 200 : 0) - at - name.length,
      indices: range(at, wanted.length),
    }
  }

  const indices: number[] = []
  let from = 0
  for (const letter of wanted) {
    const found = name.indexOf(letter, from)
    if (found < 0) return null
    indices.push(found)
    from = found + 1
  }
  const gaps = indices[indices.length - 1] - indices[0] + 1 - indices.length
  return { score: 500 - gaps * 5 - name.length, indices }
}
