import { Bold, Heading2, Italic, List, ListOrdered } from "lucide-react"
import type { Editor } from "@tiptap/react"
import { useEditorState } from "@tiptap/react"
import { Button } from "@/components/ui/button"

export function RichTextToolbar({ editor }: { editor: Editor }) {
  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      heading: e.isActive("heading", { level: 2 }),
      bullets: e.isActive("bulletList"),
      numbers: e.isActive("orderedList"),
    }),
  })

  const items = [
    { label: "Bold", icon: Bold, on: active.bold, run: () => editor.chain().focus().toggleBold().run() },
    { label: "Italic", icon: Italic, on: active.italic, run: () => editor.chain().focus().toggleItalic().run() },
    { label: "Heading", icon: Heading2, on: active.heading, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "Bulleted list", icon: List, on: active.bullets, run: () => editor.chain().focus().toggleBulletList().run() },
    { label: "Numbered list", icon: ListOrdered, on: active.numbers, run: () => editor.chain().focus().toggleOrderedList().run() },
  ]

  return (
    <div className="flex items-center gap-0.5 border-b px-1.5 py-1">
      {items.map(({ label, icon: ItemIcon, on, run }) => (
        <Button
          key={label}
          type="button"
          variant={on ? "secondary" : "ghost"}
          size="icon-sm"
          aria-label={label}
          aria-pressed={on}
          // Keep focus in the editor so the selection survives the click.
          onMouseDown={(event) => event.preventDefault()}
          onClick={run}
        >
          <ItemIcon />
        </Button>
      ))}
    </div>
  )
}
