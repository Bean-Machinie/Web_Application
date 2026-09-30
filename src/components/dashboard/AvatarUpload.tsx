import { useEffect, useMemo } from "react"
import upload from "@/assets/icons/upload.svg"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { FormAlert } from "@/components/auth/FormAlert"
import { Icon } from "@/components/Icon"
import { useAuth } from "@/auth/useAuth"
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload"
import {
  AVATAR_MAX_BYTES,
  AVATAR_TYPES,
  NO_AVATAR_CHANGE,
} from "@/lib/avatar"
import type { AvatarChange } from "@/lib/avatar"
import { getInitials, getProfile } from "@/lib/profile"
import { cn } from "@/lib/utils"

type Props = {
  change: AvatarChange
  onChange: (change: AvatarChange) => void
  disabled: boolean
}

function usePreviewUrl(file: File | null) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url)
  }, [url])

  return url
}

export function AvatarUpload({ change, onChange, disabled }: Props) {
  const user = useAuth().session!.user
  const { avatarUrl } = getProfile(user)

  const [
    { isDragging, errors },
    {
      openFileDialog,
      getInputProps,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      clearFiles,
    },
  ] = useFileUpload({
    accept: AVATAR_TYPES,
    maxSize: AVATAR_MAX_BYTES,
    onFilesAdded: ([added]) => {
      onChange({ file: added.file as File, remove: false })
      // The parent owns the picked file until the form is saved.
      clearFiles()
    },
  })

  const pendingUrl = usePreviewUrl(change.file)
  const shownUrl = pendingUrl ?? (change.remove ? "" : avatarUrl)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-5">
        <button
          type="button"
          aria-label={shownUrl ? "Change profile photo" : "Upload profile photo"}
          disabled={disabled}
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "group/upload ring-offset-background focus-visible:ring-ring relative size-20 shrink-0 cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-default",
            isDragging && "ring-primary ring-2 ring-offset-2"
          )}
        >
          <Avatar className="size-full">
            {shownUrl && <AvatarImage src={shownUrl} alt="" />}
            <AvatarFallback className="text-xl">
              {getInitials(user)}
            </AvatarFallback>
          </Avatar>
          <span
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center gap-0.5 rounded-full bg-black/55 text-white opacity-0 transition-opacity duration-200",
              "group-hover/upload:opacity-100 group-focus-visible/upload:opacity-100",
              isDragging && "opacity-100"
            )}
          >
            <Icon src={upload} className="size-5" />
            <span className="text-[11px] leading-none font-medium">
              {shownUrl ? "Change" : "Upload"}
            </span>
          </span>
        </button>
        <input {...getInputProps()} className="sr-only" tabIndex={-1} />

        <div className="flex flex-col items-start gap-1">
          <p className="text-muted-foreground text-sm">
            Click or drop an image. PNG, JPG, WebP or GIF, up to{" "}
            {formatBytes(AVATAR_MAX_BYTES, 0)}.
          </p>
          {shownUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground -ml-2.5"
              disabled={disabled}
              onClick={() =>
                onChange(
                  avatarUrl ? { file: null, remove: true } : NO_AVATAR_CHANGE
                )
              }
            >
              Remove photo
            </Button>
          )}
        </div>
      </div>
      {errors[0] && <FormAlert tone="error">{errors[0]}</FormAlert>}
    </div>
  )
}
