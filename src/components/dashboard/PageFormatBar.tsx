import { useState } from "react"
import { createPortal } from "react-dom"
import { isTextSelection, useEditorState } from "@tiptap/react"
import type { Editor } from "@tiptap/react"
import { Baseline, Bold, Highlighter, Italic, RemoveFormatting, Strikethrough, Underline } from "lucide-react"
import { FONT_FAMILIES, FONT_SIZES, HIGHLIGHTS, TEXT_COLORS } from "./format-options"
import { FormatMenu } from "./FormatMenu"
import { FormatSwatches } from "./FormatSwatches"
import { FormatToggle } from "./FormatToggle"

const DEFAULT_SIZE_PX = 14

// A bar that rises at the bottom of the screen, in the middle, whenever text is
// selected in a page: font and size, bold, italic, underline, strike, highlight and
// colour, and a button to clear it all. It stays while one of its menus is open, which
// takes the focus from the text, and goes when the selection or the editor's focus does.
export function PageFormatBar({ editor }: { editor: Editor }) {
  const [engaged, setEngaged] = useState(false)
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      selected: isTextSelection(e.state.selection) && !e.state.selection.empty,
      focused: e.isFocused,
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      size: (e.getAttributes("fontSize").size as string | undefined) ?? null,
      family: (e.getAttributes("fontFamily").family as string | undefined) ?? null,
      color: (e.getAttributes("textColor").color as string | undefined) ?? null,
      highlight: (e.getAttributes("highlight").color as string | undefined) ?? null,
    }),
  })

  if (!editor.isEditable || !state.selected || !(state.focused || engaged)) return null

  const chain = () => editor.chain().focus()
  const back = () => editor.commands.focus()
  const set = (mark: string, attributes: Record<string, string> | null) =>
    attributes ? chain().setMark(mark, attributes).run() : chain().unsetMark(mark).run()
  const sizeNow = state.size ? Math.round(parseFloat(state.size)) : DEFAULT_SIZE_PX

  return createPortal(
    <div
      role="toolbar"
      aria-label="Format text"
      className="bg-popover/95 text-popover-foreground ring-foreground/10 animate-in fade-in-0 slide-in-from-bottom-2 fixed bottom-6 left-1/2 z-[65] flex -translate-x-1/2 items-center gap-0.5 rounded-xl p-1 shadow-xl ring-1 backdrop-blur duration-150"
      // Pressing the bar's own gaps must not take the selection from the text.
      onMouseDown={(event) => event.preventDefault()}
    >
      <FormatMenu
        label="Font"
        current={FONT_FAMILIES.find((font) => font.value === state.family)?.label ?? "Default"}
        width="w-40"
        onOpenChange={setEngaged}
        onClosed={back}
        options={FONT_FAMILIES.map((font) => ({
          label: font.label,
          active: font.value === state.family,
          style: font.value ? { fontFamily: font.value } : undefined,
          onPick: () => set("fontFamily", font.value ? { family: font.value } : null),
        }))}
      />
      <FormatMenu
        label="Font size"
        current={String(sizeNow)}
        width="w-24"
        onOpenChange={setEngaged}
        onClosed={back}
        options={[
          { label: "Default", active: !state.size, onPick: () => set("fontSize", null) },
          ...FONT_SIZES.map((size) => ({
            label: String(size),
            active: state.size === `${size}px`,
            onPick: () => set("fontSize", { size: `${size}px` }),
          })),
        ]}
      />
      <span className="bg-border mx-1 h-5 w-px" />
      <FormatToggle label="Bold" icon={Bold} active={state.bold} onClick={() => chain().toggleBold().run()} />
      <FormatToggle label="Italic" icon={Italic} active={state.italic} onClick={() => chain().toggleItalic().run()} />
      <FormatToggle label="Underline" icon={Underline} active={state.underline} onClick={() => chain().toggleUnderline().run()} />
      <FormatToggle label="Strikethrough" icon={Strikethrough} active={state.strike} onClick={() => chain().toggleStrike().run()} />
      <span className="bg-border mx-1 h-5 w-px" />
      <FormatSwatches
        label="Highlight"
        icon={Highlighter}
        colors={HIGHLIGHTS}
        current={state.highlight}
        onOpenChange={setEngaged}
        onClosed={back}
        onPick={(color) => set("highlight", color ? { color } : null)}
      />
      <FormatSwatches
        label="Text colour"
        icon={Baseline}
        colors={TEXT_COLORS}
        current={state.color}
        onOpenChange={setEngaged}
        onClosed={back}
        onPick={(color) => set("textColor", color ? { color } : null)}
      />
      <span className="bg-border mx-1 h-5 w-px" />
      <FormatToggle label="Clear formatting" icon={RemoveFormatting} active={false} onClick={() => chain().unsetAllMarks().run()} />
    </div>,
    document.body
  )
}
