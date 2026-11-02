import { useState } from "react"
import { Loader2 } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import type { CoverChoice } from "@/lib/campaign-covers"
import type { CampaignTemplate } from "@/lib/campaign-template-types"
import { errorMessage } from "@/lib/campaigns"
import { CampaignCover } from "./CampaignCover"
import { CampaignTitle } from "./CampaignTitle"
import { TemplateContents } from "./TemplateContents"

type Props = {
  // Null is a blank campaign.
  template: CampaignTemplate | null
  initialCover: CoverChoice
  onCreate: (name: string, cover: CoverChoice) => Promise<void>
  onBack: () => void
}

// Step 2, as a page: the cover, the name, and for a starter what comes with it.
export function CampaignNameStep({ template, initialCover, onCreate, onBack }: Props) {
  const [name, setName] = useState("")
  const [cover, setCover] = useState(initialCover)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    setBusy(true)
    setError(null)
    try {
      await onCreate(name, cover)
    } catch (failure) {
      setError(errorMessage(failure))
      setBusy(false)
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (name.trim() !== "" && !busy) void handleCreate()
      }}
      className="mx-auto flex w-full max-w-5xl flex-col gap-6"
    >
      <CampaignCover cover={cover} onChange={setCover} />
      <CampaignTitle value={name} disabled={busy} onChange={setName} />
      {template && <TemplateContents template={template} />}
      {error && <FormAlert tone="error">{error}</FormAlert>}
      <div className="bg-card sticky bottom-4 z-10 flex items-center justify-between rounded-lg border p-3 shadow-xs">
        <Button type="button" variant="ghost" onClick={onBack} disabled={busy}>
          Change template
        </Button>
        <Button type="submit" disabled={busy || name.trim() === ""}>
          {busy && <Loader2 className="size-4 animate-spin" />}
          Create campaign
        </Button>
      </div>
    </form>
  )
}
