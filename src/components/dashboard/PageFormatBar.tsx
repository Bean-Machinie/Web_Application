import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { isTextSelection, useEditorState } from "@tiptap/react"
import type { Editor } from "@tiptap/react"
import {
  Baseline,
  Bold,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  RemoveFormatting,
  Strikethrough,
  Underline,
} from "lucide-react"
import { useSelectionAnchor } from "@/hooks/use-selection-anchor"
import type { Point } from "@/hooks/use-selection-anchor"
import { FONT_FAMILIES, FONT_SIZES, HIGHLIGHTS, TEXT_COLORS } from "./format-options"
import { FormatMenu } from "./FormatMenu"
import { FormatSwatches } from "./FormatSwatches"
import { FormatToggle } from "./FormatToggle"

const DEFAULT_SIZE_PX = 14

// A small bar that floats above the end of the selected text, or right above the
// right-click menu while that is open, in two rows as in Word: font and size over the
// styles, highlight, colour and lists. It stays while one of its menus has the focus,
// and goes when the selection or the editor's focus does.
export function PageFormatBar({ editor, menuAt }: { editor: Editor; menuAt: Point | null }) {
  const [engaged, setEngaged] = useState(false)
  const bar = useRef<HTMLDivElement>(null)
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      selected: isTextSelection(e.state.selection) && !e.state.selection.empty,
      focused: e.isFocused,
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      bullets: e.isActive("bulletList"),
      numbers: e.isActive("orderedList"),
      size: (e.getAttributes("fontSize").size as string | undefined) ?? null,
      family: (e.getAttributes("fontFamily").family as string | undefined) ?? null,
      color: (e.getAttributes("textColor").color as string | undefined) ?? null,
      highlight: (e.getAttributes("highlight").color as string | undefined) ?? null,
    }),
  })

  // The bar waits until the mouse is let go, so it does not chase a selection being dragged.
  const [pressing, setPressing] = useState(false)
  useEffect(() => {
    const down = (event: MouseEvent) => event.button === 0 && setPressing(true)
    const up = () => setPressing(false)
    editor.view.dom.addEventListener("mousedown", down)
    window.addEventListener("mouseup", up)
    return () => {
      editor.view.dom.removeEventListener("mousedown", down)
      window.removeEventListener("mouseup", up)
    }
  }, [editor])

  // The right-click menu brings the bar with it, over the caret when nothing is selected.
  const shown =
    editor.isEditable && !pressing && (!!menuAt || (state.selected && (state.focused || engaged)))
  const place = useSelectionAnchor(editor, shown, bar, menuAt)

  if (!shown) return null

  const chain = () => editor.chain().focus()
  const back = () => editor.commands.focus()
  const set = (mark: string, attributes: Record<string, string> | null) =>
    attributes ? chain().setMark(mark, attributes).run() : chain().unsetMark(mark).run()
  const sizeNow = state.size ? Math.round(parseFloat(state.size)) : DEFAULT_SIZE_PX

  return createPortal(
    <div
      ref={bar}
      role="toolbar"
      aria-label="Format text"
      // Appears the way the context menu does, and only once it has its place. No
      // duration class: it would also make `left` and `top` transition, so the bar
      // would slide in from the corner it is drawn at before it is measured.
      className={`bg-popover text-popover-foreground ring-foreground/10 fixed z-40 flex origin-bottom-left flex-col gap-0.5 rounded-lg p-1 shadow-lg ring-1 transition-none ${place ? "animate-in fade-in-0 zoom-in-95" : ""}`}
      style={{ left: place?.left ?? 0, top: place?.top ?? 0, visibility: place?.visible ? "visible" : "hidden" }}
      // Pressing the bar's own gaps must not take the selection from the text.
      onMouseDown={(event) => event.preventDefault()}
    >
      <div className="flex items-center gap-0.5">
        <FormatMenu
          label="Font"
          current={FONT_FAMILIES.find((font) => font.value === state.family)?.label ?? "Default"}
          width="w-40"
          fill
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
      </div>
      <div className="flex items-center gap-0.5">
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
        <FormatToggle label="Bulleted list" icon={List} active={state.bullets} onClick={() => chain().toggleBulletList().run()} />
        <FormatToggle label="Numbered list" icon={ListOrdered} active={state.numbers} onClick={() => chain().toggleOrderedList().run()} />
        <span className="bg-border mx-1 h-5 w-px" />
        <FormatToggle label="Clear formatting" icon={RemoveFormatting} active={false} onClick={() => chain().unsetAllMarks().run()} />
      </div>
    </div>,
    document.body
  )
}
