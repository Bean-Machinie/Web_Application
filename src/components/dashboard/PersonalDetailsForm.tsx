import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormAlert } from "@/components/auth/FormAlert"
import { useAuth } from "@/auth/useAuth"
import { NO_AVATAR_CHANGE, hasAvatarChange } from "@/lib/avatar"
import { errorMessage } from "@/lib/campaigns"
import { getInitials, getProfile } from "@/lib/profile"
import { saveProfile } from "@/lib/save-profile"
import { normalizeUsername } from "@/lib/username"
import { AvatarUpload } from "./AvatarUpload"
import { FormFooter } from "./FormFooter"
import { SettingsSection } from "./SettingsSection"
import { UsernameSection } from "./UsernameSection"

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
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
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

  return (
    <form onSubmit={handleSubmit} className="divide-y">
      <SettingsSection
        title="Your photo"
        description="This is shown across the workspace."
      >
        <AvatarUpload
          change={avatar}
          onChange={setAvatar}
          disabled={busy}
          currentUrl={avatarUrl}
          fallback={getInitials(user)}
        />
      </SettingsSection>

      <UsernameSection
        value={usernameInput ?? username}
        onChange={setUsernameInput}
        disabled={busy}
      />

      <SettingsSection
        title="Email address"
        description="The email you sign in with. It can't be changed."
      >
        <Input
          type="email"
          aria-label="Email address"
          value={email}
          readOnly
          disabled
        />
      </SettingsSection>

      <SettingsSection
        title="Description"
        description="A short line about you."
      >
        <Textarea
          aria-label="Description"
          maxLength={300}
          rows={4}
          value={descriptionInput ?? description}
          onChange={(event) => setDescriptionInput(event.target.value)}
          disabled={busy}
        />
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
          canSubmit={dirty}
          onCancel={() => {
            reset()
            setNotice(null)
          }}
        />
      </div>
    </form>
  )
}
