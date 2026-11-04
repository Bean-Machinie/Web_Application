import { NodeRange } from "@tiptap/extension-node-range"
import Placeholder from "@tiptap/extension-placeholder"
import StarterKit from "@tiptap/starter-kit"
import type { AnyExtension } from "@tiptap/react"
import { BlockVisibility, GmNote, ReadAloud } from "./journal-nodes"
import { SlashCommand } from "./slash-command"

// What a page of blocks is made of, for editing and for reading alike.
export const PAGE_BLOCKS = [
  StarterKit.configure({ heading: { levels: [2, 3] } }),
  ReadAloud,
  GmNote,
  BlockVisibility,
]

// Alt and drag selects several blocks, and the drag handle then moves them
// together. A plain drag stays a text selection.
export const pageExtensions = (placeholder: string, mention: AnyExtension): AnyExtension[] => [
  ...PAGE_BLOCKS,
  Placeholder.configure({ placeholder }),
  mention,
  NodeRange.configure({ key: "Alt" }),
  SlashCommand,
]
