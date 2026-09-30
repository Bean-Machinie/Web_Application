import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormAlert } from "@/components/auth/FormAlert"
import { useAuth } from "@/auth/useAuth"
import { useSavedUsername } from "@/hooks/use-saved-username"
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
  const { displayName, description, email, avatarUrl } = getProfile(user)
  const saved = { displayName, description }
  const [values, setValues] = useState(saved)
  const [savedUsername, setSavedUsername] = useSavedUsername(user.id)
  // null until the person edits it, so the loaded username shows meanwhile.
  const [usernameInput, setUsernameInput] = useState<string | null>(null)
  const [avatar, setAvatar] = useState(NO_AVATAR_CHANGE)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)

  const usernameChanged =
    usernameInput !== null &&
    normalizeUsername(usernameInput) !== (savedUsername ?? "")
  const dirty =
    JSON.stringify(values) !== JSON.stringify(saved) ||
    usernameChanged ||
    hasAvatarChange(avatar)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setNotice(null)

    try {
      await saveProfile({
        user,
        details: values,
        username: usernameChanged ? usernameInput : null,
        avatar,
        onUsernameSaved: () => {
          setSavedUsername(normalizeUsername(usernameInput!))
          setUsernameInput(null)
        },
      })
    } catch (error) {
      setBusy(false)
      return setNotice({ tone: "error", text: errorMessage(error) })
    }

    setBusy(false)
    setAvatar(NO_AVATAR_CHANGE)
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
          initials={getInitials(user)}
        />
      </SettingsSection>

      <SettingsSection
        title="Display name"
        description="How your name appears to others."
      >
        <Input
          aria-label="Display name"
          autoComplete="nickname"
          maxLength={50}
          value={values.displayName}
          onChange={(event) =>
            setValues({ ...values, displayName: event.target.value })
          }
          disabled={busy}
        />
      </SettingsSection>

      <UsernameSection
        value={usernameInput ?? savedUsername ?? ""}
        onChange={setUsernameInput}
        disabled={busy || savedUsername === null}
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
          value={values.description}
          onChange={(event) =>
            setValues({ ...values, description: event.target.value })
          }
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
            setValues(saved)
            setUsernameInput(null)
            setAvatar(NO_AVATAR_CHANGE)
            setNotice(null)
          }}
        />
      </div>
    </form>
  )
}
