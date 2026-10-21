type Node = { type?: string; text?: string; content?: Node[] }

// A space and then punctuation that belongs to the word before it.
const SPACE_BEFORE_PUNCTUATION = /^ [.,;:!?)\]}…]/

// Picking a mention used to add a space after the chip, so a comma or full stop
// typed next sat one space away ("Goblin ." and not "Goblin."). Mentions picked now
// have no such space, but text saved before still does. This takes that one space
// out, only where a mention is followed by a space and punctuation, and changes
// nothing else. Pure: it returns a new document.
export function tidyMentionSpacing<T>(doc: T): T {
  return walk(doc as Node) as T
}

function walk(node: Node): Node {
  if (!node || typeof node !== "object" || !Array.isArray(node.content)) return node

  const content = node.content.map(walk)
  const tidy = content.map((child, index) =>
    content[index - 1]?.type === "mention" &&
    child.type === "text" &&
    typeof child.text === "string" &&
    SPACE_BEFORE_PUNCTUATION.test(child.text)
      ? { ...child, text: child.text.slice(1) }
      : child
  )
  return { ...node, content: tidy }
}
