import { useState } from "react"
import { FormAlert } from "@/components/auth/FormAlert"
import { NO_AVATAR_CHANGE, hasAvatarChange } from "@/lib/avatar"
import { saveCampaignImage } from "@/lib/campaign-image"
import { errorMessage } from "@/lib/campaigns"
import type { Campaign } from "@/lib/campaigns"
import { initialsOf } from "@/lib/profile"
import { AvatarUpload } from "./AvatarUpload"
import { FormFooter } from "./FormFooter"
import { SettingsSection } from "./SettingsSection"
import { useCampaign } from "./useCampaign"

type Notice = { tone: "error" | "success"; text: string }

// Like the profile photo, the image is only saved with the button.
export function CampaignImageForm({ campaign }: { campaign: Campaign }) {
  const { refresh } = useCampaign()
  const [change, setChange] = useState(NO_AVATAR_CHANGE)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setNotice(null)
    try {
      await saveCampaignImage(campaign, change)
      await refresh()
      setChange(NO_AVATAR_CHANGE)
      setNotice({ tone: "success", text: "The campaign image has been saved." })
    } catch (failure) {
      setNotice({ tone: "error", text: errorMessage(failure) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <SettingsSection
        title="Campaign image"
        description="Shown beside the campaign name in the sidebar and your campaign lists."
      >
        <AvatarUpload
          change={change}
          onChange={setChange}
          disabled={busy}
          currentUrl={campaign.imageUrl ?? ""}
          initials={initialsOf(campaign.name) || "?"}
          noun="image"
          className="size-32 text-4xl"
          fallbackClassName="bg-primary text-primary-foreground"
        />
      </SettingsSection>
      {notice && <FormAlert tone={notice.tone}>{notice.text}</FormAlert>}
      <FormFooter
        submitLabel="Save changes"
        busy={busy}
        canSubmit={hasAvatarChange(change)}
        onCancel={() => {
          setChange(NO_AVATAR_CHANGE)
          setNotice(null)
        }}
      />
    </form>
  )
}
