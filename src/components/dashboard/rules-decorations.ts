import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"
import type { Node } from "@tiptap/pm/model"
import { rollExpression } from "@/lib/dice-roll-store"
import { DICE_EXPRESSION, parseExpression, takesMode } from "@/lib/dice-expression"
import { GLOSSARY_TERMS, glossaryIdFor } from "@/lib/glossary-terms"
import { textRunsByBlock } from "./text-runs"

// Not after a word, a path, an address or a mention's @ or #.
export const DICE = new RegExp(`(?<![\\w/.:#@=?&-])${DICE_EXPRESSION}(?![\\w])`, "gi")
const URL_TOKEN = /^(?:[a-z][a-z\d+.-]*:\/\/|www\.)/i

// The same look as a mention chip, so the two read as one family on a page.
export const CHIP_CLASS =
  "dice-chip -my-1 inline-flex cursor-pointer items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-1.5 py-px align-baseline text-[0.9em] leading-snug font-medium text-primary no-underline transition-colors hover:bg-primary/15"

// The token the match sits in, to tell a web address from a dice expression inside it.
function insideUrl(text: string, at: number) {
  const start = text.lastIndexOf(" ", at) + 1
  return URL_TOKEN.test(text.slice(start))
}

export function chipTitle(expression: string) {
  return `Roll ${expression}${takesMode(expression) ? " · Shift: advantage · Alt: disadvantage" : ""}`
}

function decorate(doc: Node, glossary: boolean) {
  const decorations: Decoration[] = []
  for (const runs of textRunsByBlock(doc)) {
    // Each term is underlined once per block, where it first appears.
    const seen = new Set<string>()
    for (const { text, from } of runs) {
      for (const match of text.matchAll(DICE)) {
        if (!parseExpression(match[0]) || insideUrl(text, match.index)) continue
        decorations.push(
          Decoration.inline(from + match.index, from + match.index + match[0].length, {
            class: CHIP_CLASS,
            "data-dice": match[0],
            title: chipTitle(match[0]),
          })
        )
      }
      for (const term of glossary ? text.matchAll(GLOSSARY_TERMS) : []) {
        // Once per entry in a block, whether it is written cantrip or cantrips.
        const id = glossaryIdFor(term[0])
        if (!id || seen.has(id) || insideUrl(text, term.index)) continue
        seen.add(id)
        decorations.push(
          Decoration.inline(from + term.index, from + term.index + term[0].length, {
            class: "decoration-muted-foreground/60 cursor-help underline decoration-dotted underline-offset-4",
            "data-glossary": term[0],
            "data-glossary-id": id,
          })
        )
      }
    }
  }
  return DecorationSet.create(doc, decorations)
}

const key = new PluginKey<DecorationSet>("rulesDecorations")

// Dice expressions become chips that roll on click, and the first mention of an SRD term in a block
// gets a dotted underline. Both are only drawn: the stored document is never changed.
export const RulesDecorations = Extension.create({
  name: "rulesDecorations",
  // The glossary underlines are only for campaigns that play D&D 5e; the dice chips are for all.
  addOptions: () => ({ glossary: false }),
  addProseMirrorPlugins() {
    const { glossary } = this.options
    return [
      new Plugin({
        key,
        state: {
          init: (_, { doc }) => decorate(doc, glossary),
          apply: (tr, set) => (tr.docChanged ? decorate(tr.doc, glossary) : set),
        },
        props: {
          decorations: (state) => key.getState(state),
          handleDOMEvents: {
            // A chip is a button: pressing it must not place the cursor, select a word or a node, or
            // bring up the format bar. The click still arrives.
            mousedown: (_view, event) => {
              const target = event.target as HTMLElement
              // Ctrl or Cmd with a click is ProseMirror's way of selecting the whole block; on a
              // glossary word it is what opens the rules, and selects nothing.
              const rules = (event.ctrlKey || event.metaKey) && target.closest("[data-glossary]")
              if (!rules && !target.closest("[data-dice], [data-mention-button]")) return false
              event.preventDefault()
              return true
            },
            click: (_view, event) => {
              const chip = (event.target as HTMLElement).closest<HTMLElement>("[data-dice]")
              if (!chip) return false
              const mode = event.shiftKey ? "advantage" : event.altKey ? "disadvantage" : "normal"
              rollExpression(chip.dataset.dice!, { mode })
              return true
            },
          },
        },
      }),
    ]
  },
})
