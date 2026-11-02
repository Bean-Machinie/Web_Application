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
import { TemplateInfo } from "./TemplateInfo"

type Props = {
  // Null is a blank campaign.
  template: CampaignTemplate | null
  initialCover: CoverChoice
  onCreate: (name: string, cover: CoverChoice) => Promise<void>
  onBack: () => void
}

// Step 2, as a page that fills the window and does not scroll: the cover, the name, and for
// a starter what comes with it. The page's padding is taken off the window's height.
export function CampaignNameStep({ template, initialCover, onCreate, onBack }: Props) {
  const [name, setName] = useState("")
  const [cover, setCover] = useState(initialCover)
  const [busy, setBusy] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    if (busy) return
    if (name.trim() === "") {
      setAttempts((tries) => tries + 1)
      return
    }
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
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void handleCreate()
      }}
      className="flex h-[calc(100svh-var(--header-height)-2rem)] min-h-0 w-full flex-col gap-4 md:h-[calc(100svh-var(--header-height)-3rem)]"
    >
      <CampaignCover cover={cover} onChange={setCover} />
      <div className="flex items-start gap-2">
        <CampaignTitle value={name} disabled={busy} onChange={setName} attempts={attempts} />
        {template && (
          <div className="pt-3.5">
            <TemplateInfo template={template} />
          </div>
        )}
      </div>
      {template ? <TemplateContents template={template} /> : <div className="flex-1" />}
      {error && <FormAlert tone="error">{error}</FormAlert>}
      <div className="bg-card flex shrink-0 items-center justify-between rounded-lg border p-3 shadow-xs">
        <Button type="button" variant="ghost" onClick={onBack} disabled={busy}>
          Change template
        </Button>
        <Button type="submit" disabled={busy}>
          {busy && <Loader2 className="size-4 animate-spin" />}
          Create campaign
        </Button>
      </div>
    </form>
  )
}
