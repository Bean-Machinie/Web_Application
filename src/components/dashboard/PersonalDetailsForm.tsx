import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormAlert } from "@/components/auth/FormAlert"
import { useAuth } from "@/auth/useAuth"
import {
  NO_AVATAR_CHANGE,
  deletePreviousAvatar,
  hasAvatarChange,
  uploadPendingAvatar,
} from "@/lib/avatar"
import { getProfile } from "@/lib/profile"
import { supabase } from "@/lib/supabase"
import { AvatarUpload } from "./AvatarUpload"
import { FormFooter } from "./FormFooter"
import { SettingsSection } from "./SettingsSection"

type Notice = { tone: "error" | "success"; text: string }

export function PersonalDetailsForm() {
  const user = useAuth().session!.user
  const { displayName, description, email } = getProfile(user)
  const saved = { displayName, description }
  const [values, setValues] = useState(saved)
  const [avatar, setAvatar] = useState(NO_AVATAR_CHANGE)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)

  const dirty =
    JSON.stringify(values) !== JSON.stringify(saved) || hasAvatarChange(avatar)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setNotice(null)

    try {
      const photo = await uploadPendingAvatar(user, avatar)
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: values.displayName.trim(),
          description: values.description.trim(),
          // Clears any real name or job title saved by an earlier version.
          first_name: null,
          last_name: null,
          job_title: null,
          ...photo,
        },
      })
      if (error) throw error
      if (hasAvatarChange(avatar)) await deletePreviousAvatar(user)
    } catch (error) {
      setBusy(false)
      const text = error instanceof Error ? error.message : "Could not save."
      return setNotice({ tone: "error", text })
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
        <AvatarUpload change={avatar} onChange={setAvatar} disabled={busy} />
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
            setAvatar(NO_AVATAR_CHANGE)
            setNotice(null)
          }}
        />
      </div>
    </form>
  )
}
