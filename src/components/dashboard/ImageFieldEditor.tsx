import { useState } from "react"
import { FormAlert } from "@/components/auth/FormAlert"
import { errorMessage } from "@/lib/campaigns"
import {
  deleteWorldImage,
  toWorldImage,
  uploadWorldImage,
} from "@/lib/world-images"
import type { FieldEditorProps } from "./field-types"
import { ImagePicker } from "./ImagePicker"

// Saves at once instead of after typing stops. The old file is deleted only
// once the field points at the new one, and a file the database refused is
// deleted again.
export function ImageFieldEditor({ value, fallback, context, onChange }: FieldEditorProps) {
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const current = toWorldImage(value)

  async function change(file: File | null) {
    setBusy(true)
    setFailure(null)
    try {
      const uploaded = file
        ? await uploadWorldImage(context.campaignId, context.entryId, file)
        : null
      const saved = await onChange(uploaded)
      await deleteWorldImage(saved ? current?.path : uploaded?.path)
    } catch (error) {
      setFailure(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <ImagePicker
        url={current?.url ?? null}
        fallback={fallback}
        disabled={busy}
        onPick={change}
        onRemove={() => change(null)}
      />
      {failure && <FormAlert tone="error">{failure}</FormAlert>}
    </div>
  )
}
