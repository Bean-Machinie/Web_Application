import { useState } from "react"
import { Lock } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { useAuth } from "@/auth/useAuth"
import { NO_AVATAR_CHANGE, hasAvatarChange } from "@/lib/avatar"
import { errorMessage } from "@/lib/campaigns"
import { getInitials, getProfile } from "@/lib/profile"
import { saveProfile } from "@/lib/save-profile"
import { normalizeUsername } from "@/lib/username"
import { AboutField } from "./AboutField"
import { AvatarUpload } from "./AvatarUpload"
import { SettingsCard } from "./SettingsCard"
import { SettingsHelp, SettingsRow } from "./SettingsRow"
import { UsernameSection } from "./UsernameSection"
import { useSettingsForm } from "./settings-form"

type Notice = { tone: "error" | "success"; text: string }

export function PersonalDetailsForm() {
  const user = useAuth().session!.user
  const { username, description, email, avatarUrl } = getProfile(user)
  // null until the person edits a field, so it shows what is saved meanwhile
  // (and again once a save has come back).
  const [usernameInput, setUsernameInput] = useState<string | null>(null)
  const [descriptionInput, setDescriptionInput] = useState<string | null>(null)
  const [avatar, setAvatar] = useState(NO_AVATAR_CHANGE)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)

  const usernameChanged =
    usernameInput !== null && normalizeUsername(usernameInput) !== username
  const descriptionChanged =
    descriptionInput !== null && descriptionInput.trim() !== description
  const dirty = usernameChanged || descriptionChanged || hasAvatarChange(avatar)

  function reset() {
    setUsernameInput(null)
    setDescriptionInput(null)
    setAvatar(NO_AVATAR_CHANGE)
    setNotice(null)
  }

  async function save() {
    setBusy(true)
    setNotice(null)

    try {
      await saveProfile({
        user,
        description: descriptionInput ?? description,
        username: usernameChanged ? usernameInput : null,
        avatar,
      })
    } catch (error) {
      setBusy(false)
      return setNotice({ tone: "error", text: errorMessage(error) })
    }

    setBusy(false)
    reset()
    setNotice({ tone: "success", text: "Your details have been saved." })
  }

  useSettingsForm({ dirty, busy, save, discard: reset })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (dirty && !busy) void save()
      }}
      className="grid gap-4"
    >
      {notice && <FormAlert tone={notice.tone}>{notice.text}</FormAlert>}
      <SettingsCard>
        <SettingsRow width="field" title="Photo" description="Shown across the workspace.">
          <AvatarUpload
            buttons
            className="size-14 text-base"
            change={avatar}
            onChange={setAvatar}
            disabled={busy}
            currentUrl={avatarUrl}
            fallback={getInitials(user)}
          />
        </SettingsRow>

        <UsernameSection
          value={usernameInput ?? username}
          onChange={setUsernameInput}
          disabled={busy}
        />

        <SettingsRow width="field" title="Email" description="The email you sign in with.">
          <p className="flex min-h-9 items-center gap-2 text-sm">
            <Lock className="text-muted-foreground size-3.5 shrink-0" />
            <span className="truncate">{email}</span>
          </p>
          <SettingsHelp>It can't be changed.</SettingsHelp>
        </SettingsRow>

        <SettingsRow width="field" title="Description" description="A short line about you.">
          <AboutField
            value={descriptionInput ?? description}
            onChange={setDescriptionInput}
            disabled={busy}
          />
        </SettingsRow>
      </SettingsCard>
    </form>
  )
}
