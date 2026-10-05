import { Lock, LockOpen } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import type { FieldDef } from "@/lib/world-kinds"
import type { StoredField } from "@/lib/world-fields"
import { FIELD_TYPES } from "./field-types"
import { Undisclosed } from "./Undisclosed"

type Props = {
  def: FieldDef
  context: { campaignId: string; entryId: string }
  stored: StoredField | undefined
  // Null for players: read-only, no private toggle.
  manage: {
    onChange: (value: unknown) => void | Promise<boolean>
    onPrivate: (isPrivate: boolean) => void
  } | null
}

export function WorldFieldRow({ def, context, stored, manage }: Props) {
  const { Editor, View } = FIELD_TYPES[def.type]
  const isPrivate = stored?.private ?? def.privateByDefault ?? false

  return (
    <section className="flex flex-col gap-2 py-5">
      <div className="flex h-7 items-center justify-between gap-3">
        <h3 className="text-sm font-medium">{def.label}</h3>
        {manage && def.canBePrivate && (
          <label className="text-muted-foreground flex cursor-pointer items-center gap-2 text-xs">
            {isPrivate ? <Lock className="size-3.5" /> : <LockOpen className="size-3.5" />}
            Private
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
          options={def.options}
          context={context}
          onChange={manage.onChange}
        />
      ) : (
        // The server sends no value for a private field, only that it exists.
        stored?.private ? (
          <Undisclosed />
        ) : (
          <View value={stored?.value ?? null} options={def.options} />
        )
      )}
    </section>
  )
}
