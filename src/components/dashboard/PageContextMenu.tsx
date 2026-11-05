import { useRef } from "react"
import type { ReactNode } from "react"
import type { Editor } from "@tiptap/react"
import {
  Bold,
  ClipboardPaste,
  Copy,
  Italic,
  MousePointer2,
  Redo2,
  RemoveFormatting,
  Scissors,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { KeyChips } from "@/components/ui/key-chips"
import { cn } from "@/lib/utils"

const MOD = /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl"

type Entry = { label: string; icon: LucideIcon; keys?: string[]; disabled?: boolean; active?: boolean; run: () => void }

// Text from the clipboard as it is, one paragraph to a line.
async function pastePlain(editor: Editor) {
  const text = await navigator.clipboard.readText()
  const lines = text.split(/\r?\n/)
  editor
    .chain()
    .focus()
    .insertContent(
      lines.length === 1
        ? { type: "text", text }
        : lines.map((line) => ({ type: "paragraph", content: line ? [{ type: "text", text: line }] : [] }))
    )
    .run()
}

function groupsOf(editor: Editor): Entry[][] {
  const chain = () => editor.chain().focus()
  const hasSelection = !editor.state.selection.empty
  return [
    [
      { label: "Undo", icon: Undo2, keys: [MOD, "Z"], disabled: !editor.can().undo(), run: () => chain().undo().run() },
      { label: "Redo", icon: Redo2, keys: [MOD, "Y"], disabled: !editor.can().redo(), run: () => chain().redo().run() },
    ],
    [
      { label: "Cut", icon: Scissors, keys: [MOD, "X"], disabled: !hasSelection, run: () => document.execCommand("cut") },
      { label: "Copy", icon: Copy, keys: [MOD, "C"], disabled: !hasSelection, run: () => document.execCommand("copy") },
      { label: "Paste", icon: ClipboardPaste, keys: [MOD, "V"], run: () => void pastePlain(editor).catch(() => {}) },
      { label: "Select all", icon: MousePointer2, keys: [MOD, "A"], run: () => editor.commands.selectAll() },
    ],
    [
      { label: "Bold", icon: Bold, keys: [MOD, "B"], active: editor.isActive("bold"), run: () => chain().toggleBold().run() },
      { label: "Italic", icon: Italic, keys: [MOD, "I"], active: editor.isActive("italic"), run: () => chain().toggleItalic().run() },
      { label: "Underline", icon: Underline, keys: [MOD, "U"], active: editor.isActive("underline"), run: () => chain().toggleUnderline().run() },
      { label: "Strikethrough", icon: Strikethrough, keys: [MOD, "Shift", "S"], active: editor.isActive("strike"), run: () => chain().toggleStrike().run() },
      { label: "Clear formatting", icon: RemoveFormatting, disabled: !hasSelection, run: () => chain().unsetAllMarks().run() },
    ],
  ]
}

// Computed when the menu opens, since it is only then that this is drawn.
function Items({ editor, choose }: { editor: Editor; choose: (run: () => void) => void }) {
  return groupsOf(editor).map((group, index) => (
    <div key={index}>
      {index > 0 && <ContextMenuSeparator />}
      {group.map(({ label, icon: Icon, keys, disabled, active, run }) => (
        <ContextMenuItem key={label} disabled={disabled} onSelect={() => choose(run)}>
          <Icon className={cn(active ? "text-foreground" : "text-muted-foreground")} />
          <span className={cn(active && "font-medium")}>{label}</span>
          {keys && <KeyChips keys={keys} className="ml-auto" />}
        </ContextMenuItem>
      ))}
    </div>
  ))
}

// The usual right-click menu of a text box, over the page's text: undo, the clipboard,
// the basic styles. What is chosen runs once the menu has gone and the text has its
// focus back, so the selection it acts on is the one that was there.
export function PageContextMenu({
  editor,
  onOpenChange,
  children,
}: {
  editor: Editor
  // So the format bar can stay over the selection while the menu has the focus.
  onOpenChange: (open: boolean) => void
  children: ReactNode
}) {
  const pending = useRef<(() => void) | null>(null)

  if (!editor.isEditable) return children

  return (
    <ContextMenu onOpenChange={onOpenChange}>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent
        className="w-56"
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          editor.commands.focus()
          pending.current?.()
          pending.current = null
        }}
      >
        <Items editor={editor} choose={(run) => (pending.current = run)} />
      </ContextMenuContent>
    </ContextMenu>
  )
}
