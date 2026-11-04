import { Extension } from "@tiptap/react"
import { PluginKey } from "@tiptap/pm/state"
import Suggestion from "@tiptap/suggestion"
import type { SuggestionOptions } from "@tiptap/suggestion"
import { normalize } from "@/lib/world-search"
import { SLASH_ITEMS } from "./slash-items"
import type { SlashItem } from "./slash-items"
import { SlashList } from "./SlashList"
import { suggestionRender } from "./suggestion-render"

const SLASH_KEY = new PluginKey("slashCommand")

const slashSuggestion: Omit<SuggestionOptions<SlashItem>, "editor"> = {
  char: "/",
  pluginKey: SLASH_KEY,
  command: ({ editor, range, props }) => props.run(editor, range),
  items: ({ query }) => {
    const words = normalize(query).split(/\s+/).filter(Boolean)
    return SLASH_ITEMS.filter(({ title, keywords }) => {
      const haystack = normalize([title, ...keywords].join(" "))
      return words.every((word) => haystack.includes(word))
    })
  },
  render: suggestionRender(SlashList, SLASH_KEY),
}

// Typing / at the start of a line, or after a space, offers the blocks.
export const SlashCommand = Extension.create({
  name: "slashCommand",
  addProseMirrorPlugins() {
    return [Suggestion({ editor: this.editor, ...slashSuggestion })]
  },
})
