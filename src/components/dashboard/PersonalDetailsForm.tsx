import { useState } from "react"
import { useAuth } from "@/auth/useAuth"
import { NO_AVATAR_CHANGE, hasAvatarChange } from "@/lib/avatar"
import { errorMessage } from "@/lib/campaigns"
import { getInitials, getProfile } from "@/lib/profile"
import { saveProfile } from "@/lib/save-profile"
import { normalizeUsername } from "@/lib/username"
import { AboutField } from "./AboutField"
import { PhotoField } from "./PhotoField"
import { SettingsCard } from "./SettingsCard"
import { SettingsRow } from "./SettingsRow"
import { UsernameSection } from "./UsernameSection"
import { useSettingsForm, useSettingsNotice } from "./settings-form"

export function PersonalDetailsForm() {
  const user = useAuth().session!.user
  const { username, description, email, avatarUrl } = getProfile(user)
  // null until the person edits a field, so it shows what is saved meanwhile
  // (and again once a save has come back).
  const [usernameInput, setUsernameInput] = useState<string | null>(null)
  const [descriptionInput, setDescriptionInput] = useState<string | null>(null)
  const [avatar, setAvatar] = useState(NO_AVATAR_CHANGE)
  const [busy, setBusy] = useState(false)
  const notify = useSettingsNotice()

  const usernameChanged =
    usernameInput !== null && normalizeUsername(usernameInput) !== username
  const descriptionChanged =
    descriptionInput !== null && descriptionInput.trim() !== description
  const dirty = usernameChanged || descriptionChanged || hasAvatarChange(avatar)

  function reset() {
    setUsernameInput(null)
    setDescriptionInput(null)
    setAvatar(NO_AVATAR_CHANGE)
    notify(null)
  }

  async function save() {
    setBusy(true)
    notify(null)

    try {
      await saveProfile({
        user,
        description: descriptionInput ?? description,
        username: usernameChanged ? usernameInput : null,
        avatar,
      })
    } catch (error) {
      setBusy(false)
      return notify({ tone: "error", text: errorMessage(error) })
    }

    setBusy(false)
    reset()
    notify({ tone: "success", text: "Your details have been saved." })
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
      <SettingsCard flush>
        <SettingsRow first width="wide" title="Your photo" description="This will be displayed on your profile.">
          <PhotoField
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
        <SettingsRow center width="wide" title="Email">
          <p className="flex h-8 items-center text-sm">
            <span className="truncate">{email}</span>
          </p>
        </SettingsRow>
        <AboutField
          value={descriptionInput ?? description}
          onChange={setDescriptionInput}
          disabled={busy}
        />
      </SettingsCard>
    </form>
  )
}
