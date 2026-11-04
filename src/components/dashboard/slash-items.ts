import {
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Megaphone,
  Minus,
  Quote,
  ScrollText,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { Editor, Range } from "@tiptap/react"

export type SlashItem = {
  title: string
  hint: string
  icon: LucideIcon
  // Words besides the title that find it.
  keywords: string[]
  run: (editor: Editor, range: Range) => void
}

// Each one first removes what was typed after the slash.
const cleared = (editor: Editor, range: Range) => editor.chain().focus().deleteRange(range)

export const SLASH_ITEMS: SlashItem[] = [
  {
    title: "Heading 2",
    hint: "A section",
    icon: Heading2,
    keywords: ["h2", "title", "heading"],
    run: (editor, range) => cleared(editor, range).setNode("heading", { level: 2 }).run(),
  },
  {
    title: "Heading 3",
    hint: "A smaller section",
    icon: Heading3,
    keywords: ["h3", "subtitle", "heading"],
    run: (editor, range) => cleared(editor, range).setNode("heading", { level: 3 }).run(),
  },
  {
    title: "Bulleted list",
    hint: "A plain list",
    icon: List,
    keywords: ["bullets", "ul"],
    run: (editor, range) => cleared(editor, range).toggleBulletList().run(),
  },
  {
    title: "Numbered list",
    hint: "A list in order",
    icon: ListOrdered,
    keywords: ["ordered", "ol"],
    run: (editor, range) => cleared(editor, range).toggleOrderedList().run(),
  },
  {
    title: "Quote",
    hint: "Set a passage apart",
    icon: Quote,
    keywords: ["blockquote"],
    run: (editor, range) => cleared(editor, range).toggleBlockquote().run(),
  },
  {
    title: "Divider",
    hint: "A line across the page",
    icon: Minus,
    keywords: ["line", "rule", "hr"],
    run: (editor, range) => cleared(editor, range).setHorizontalRule().run(),
  },
  {
    title: "Read aloud",
    hint: "Text to read to the table",
    icon: Megaphone,
    keywords: ["boxed", "narration"],
    run: (editor, range) => cleared(editor, range).wrapIn("readAloud").run(),
  },
  {
    title: "GM note",
    hint: "For you alone, never shown to players",
    icon: ScrollText,
    keywords: ["secret", "private", "callout"],
    run: (editor, range) => cleared(editor, range).wrapIn("gmNote").run(),
  },
]
