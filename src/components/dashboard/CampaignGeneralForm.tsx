import { useState } from "react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { NO_AVATAR_CHANGE, hasAvatarChange } from "@/lib/avatar"
import { saveCampaignDetails, saveCampaignStatus } from "@/lib/campaign-details"
import { saveCampaignImage } from "@/lib/campaign-image"
import { STATUS_LABELS, errorMessage } from "@/lib/campaigns"
import type { Campaign, CampaignStatus } from "@/lib/campaigns"
import { AvatarUpload } from "./AvatarUpload"
import { CampaignEmblem } from "./CampaignEmblem"
import { FormFooter } from "./FormFooter"
import { SettingsSection } from "./SettingsSection"
import { useCampaign } from "./useCampaign"

type Notice = { tone: "error" | "success"; text: string }

// Like the profile page, nothing is saved until the button is pressed. Each
// field is null until edited, so it shows what is saved in the meantime.
export function CampaignGeneralForm({ campaign }: { campaign: Campaign }) {
  const { refresh } = useCampaign()
  const [name, setName] = useState<string | null>(null)
  const [description, setDescription] = useState<string | null>(null)
  const [status, setStatus] = useState<CampaignStatus | null>(null)
  const [change, setChange] = useState(NO_AVATAR_CHANGE)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)

  const detailsChanged =
    (name !== null && name.trim() !== campaign.name) ||
    (description !== null && description.trim() !== campaign.description)
  const newStatus = status !== null && status !== campaign.status ? status : null
  const dirty = detailsChanged || newStatus !== null || hasAvatarChange(change)
  const valid = (name ?? campaign.name).trim() !== ""

  function reset() {
    setName(null)
    setDescription(null)
    setStatus(null)
    setChange(NO_AVATAR_CHANGE)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setNotice(null)
    try {
      if (detailsChanged) {
        await saveCampaignDetails(
          campaign.id,
          name ?? campaign.name,
          description ?? campaign.description
        )
      }
      if (newStatus) await saveCampaignStatus(campaign.id, newStatus)
      if (hasAvatarChange(change)) await saveCampaignImage(campaign, change)
      await refresh()
      reset()
      setNotice({ tone: "success", text: "The campaign has been saved." })
    } catch (failure) {
      setNotice({ tone: "error", text: errorMessage(failure) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="divide-y">
      <div className="py-6">
        <AvatarUpload
          change={change}
          onChange={setChange}
          disabled={busy}
          currentUrl={campaign.imageUrl ?? ""}
          fallback={<CampaignEmblem name={campaign.name} />}
          noun="image"
          className="ring-border size-32 shadow-sm ring-1"
          fallbackClassName="bg-transparent"
        />
      </div>

      <SettingsSection title="Campaign name" description="Up to 60 characters.">
        <Input
          aria-label="Campaign name"
          maxLength={60}
          value={name ?? campaign.name}
          onChange={(event) => setName(event.target.value)}
          disabled={busy}
        />
      </SettingsSection>

      <SettingsSection
        title="Description"
        description="A short line about the campaign."
      >
        <Textarea
          aria-label="Description"
          maxLength={300}
          rows={4}
          value={description ?? campaign.description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={busy}
        />
      </SettingsSection>

      <SettingsSection
        title="Status"
        description="Paused and finished campaigns move to the bottom of the campaign menu."
      >
        <Select
          value={status ?? campaign.status}
          onValueChange={(value) => setStatus(value as CampaignStatus)}
          disabled={busy}
        >
          <SelectTrigger aria-label="Status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingsSection>

      <div>
        {notice && (
          <div className="pt-6">
            <FormAlert tone={notice.tone}>{notice.text}</FormAlert>
          </div>
        )}
        <FormFooter
          submitLabel="Save changes"
          busy={busy}
          canSubmit={dirty && valid}
          onCancel={() => {
            reset()
            setNotice(null)
          }}
        />
      </div>
    </form>
  )
}
