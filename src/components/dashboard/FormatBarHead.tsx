import type { Editor } from "@tiptap/react"
import { FONT_FAMILIES, FONT_SIZES } from "./format-options"
import { FormatBlockMenu } from "./FormatBlockMenu"
import { FormatMenu } from "./FormatMenu"
import { FormatMentionMenu } from "./FormatMentionMenu"
import type { MenuControl } from "./format-menu-switch"

const DEFAULT_SIZE_PX = 14

type Props = {
  editor: Editor
  // The entry being edited, which the link menu leaves out as @ does.
  entryId: string
  family: string | null
  size: string | null
  control: (id: string) => MenuControl
  set: (mark: string, attributes: Record<string, string> | null) => void
  onClosed: () => void
}

// The top row of the format bar: the font and its size, then what @ and / offer.
export function FormatBarHead({ editor, entryId, family, size, control, set, onClosed }: Props) {
  const sizeNow = size ? Math.round(parseFloat(size)) : DEFAULT_SIZE_PX
  return (
    <div className="flex items-center gap-1 pb-0.5">
      <FormatMenu
        label="Font"
        current={FONT_FAMILIES.find((font) => font.value === family)?.label ?? "Default"}
        currentStyle={family ? { fontFamily: family } : undefined}
        fill
        control={control("font")}
        onClosed={onClosed}
        options={FONT_FAMILIES.map((font) => ({
          label: font.label,
          active: font.value === family,
          style: font.value ? { fontFamily: font.value } : undefined,
          onPick: () => set("fontFamily", font.value ? { family: font.value } : null),
        }))}
      />
      <FormatMenu
        label="Font size"
        current={String(sizeNow)}
        control={control("size")}
        onClosed={onClosed}
        options={[
          { label: "Default", active: !size, onPick: () => set("fontSize", null) },
          ...FONT_SIZES.map((px) => ({
            label: String(px),
            active: size === `${px}px`,
            onPick: () => set("fontSize", { size: `${px}px` }),
          })),
        ]}
      />
      <span className="bg-border mx-0.5 h-5 w-px" />
      <FormatBlockMenu editor={editor} control={control("blocks")} onClosed={onClosed} />
      <FormatMentionMenu editor={editor} exceptId={entryId} control={control("mention")} onClosed={onClosed} />
    </div>
  )
}
