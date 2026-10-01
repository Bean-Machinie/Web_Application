import { Lock } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import type { FieldDef } from "@/lib/world-kinds"
import type { StoredField } from "@/lib/world-fields"
import { FIELD_TYPES } from "./field-types"

type Props = {
  def: FieldDef
  stored: StoredField | undefined
  // Null for players: read-only, no private toggle.
  manage: {
    onChange: (value: unknown) => void
    onPrivate: (isPrivate: boolean) => void
  } | null
}

export function WorldFieldRow({ def, stored, manage }: Props) {
  const { Editor, View } = FIELD_TYPES[def.type]
  const isPrivate = stored?.private ?? false

  return (
    <section className="flex flex-col gap-2 py-5">
      <div className="flex h-7 items-center justify-between gap-3">
        <h3 className="text-sm font-medium">{def.label}</h3>
        {manage && def.canBePrivate && (
          <label className="text-muted-foreground flex cursor-pointer items-center gap-2 text-xs">
            <Lock className="size-3.5" />
            {isPrivate ? "Private — only you can see this" : "Private"}
            <Switch
              size="sm"
              checked={isPrivate}
              onCheckedChange={manage.onPrivate}
              aria-label={`Make ${def.label} private`}
            />
          </label>
        )}
      </div>
      {manage ? (
        <Editor
          value={stored?.value ?? null}
          label={def.label}
          placeholder={def.placeholder}
          onChange={manage.onChange}
        />
      ) : (
        <View value={stored?.value ?? null} />
      )}
    </section>
  )
}
