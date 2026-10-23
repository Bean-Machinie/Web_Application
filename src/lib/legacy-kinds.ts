// "character" is what the kind now called "npc" used to be named. Links and browser
// storage from before the rename may still say so; anything that reads a kind (or a
// library section named after one) from there passes it through this. Delete it once
// nobody can have an old link or an old saved list any more.
const RENAMED: Record<string, string> = {
  character: "npc",
  "world:character": "world:npc",
}

export const currentKindName = (text: string | null) => (text && RENAMED[text]) || text
