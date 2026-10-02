import { useState } from "react"
import { ArrowLeft, Loader2, Plus } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { summarize, templateKinds } from "@/lib/campaign-templates"
import type { CampaignTemplate } from "@/lib/campaign-template-types"
import { errorMessage } from "@/lib/campaigns"
import { TemplateCover } from "./TemplateCover"

type Props = {
  // Null is a blank campaign.
  template: CampaignTemplate | null
  onCreate: (name: string) => Promise<void>
  onBack: () => void
}

// Step 2: name it. The chosen start sits small beside the form.
export function CampaignNameStep({ template, onCreate, onBack }: Props) {
  const [name, setName] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await onCreate(name)
    } catch (failure) {
      setError(errorMessage(failure))
      setBusy(false)
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-4 pt-6 sm:flex-row sm:items-start">
      <div className="bg-card flex flex-col gap-3 rounded-lg border p-4 sm:w-52 sm:shrink-0">
        {template ? (
          <TemplateCover kinds={templateKinds(template)} small />
        ) : (
          <span className="text-muted-foreground flex size-8 items-center justify-center rounded-full border border-dashed">
            <Plus className="size-4" />
          </span>
        )}
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{template?.name ?? "Blank campaign"}</span>
          <span className="text-muted-foreground text-xs">
            {template ? summarize(template) : "No starter entries"}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-2 w-fit"
          onClick={onBack}
          disabled={busy}
        >
          <ArrowLeft className="size-3.5" />
          Change
        </Button>
      </div>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-xl">Name your campaign</CardTitle>
          <CardDescription>You can change this later in the campaign settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="campaign-name">Campaign name</Label>
              <Input
                id="campaign-name"
                required
                autoFocus
                maxLength={60}
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={busy}
              />
            </div>
            {error && <FormAlert tone="error">{error}</FormAlert>}
            <Button type="submit" disabled={busy || name.trim() === ""}>
              {busy && <Loader2 className="size-4 animate-spin" />}
              Create campaign
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
