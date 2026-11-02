import { useState } from "react"
import type { ReactNode } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { CoverChoice } from "@/lib/campaign-covers"
import { CoverGallery } from "./CoverGallery"
import { ImagePicker } from "./ImagePicker"

type Props = {
  cover: CoverChoice
  onChange: (cover: CoverChoice) => void
  // What falls back to when a picture of one's own is removed.
  fallback: CoverChoice
  // What opens it.
  children: ReactNode
}

// The default covers, and the app's usual image upload for a picture of one's own.
export function CoverPicker({ cover, onChange, fallback, children }: Props) {
  const [open, setOpen] = useState(false)

  function release() {
    // The preview is let go once nothing shows it.
    if (cover.kind === "upload") URL.revokeObjectURL(cover.url)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="start" className="w-80 gap-3 p-3">
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium">Default covers</p>
          <CoverGallery
            cover={cover}
            onPick={(next) => {
              release()
              onChange(next)
              setOpen(false)
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium">Your own</p>
          <div className="[--image-size:6rem]">
            <ImagePicker
              url={cover.kind === "upload" ? cover.url : null}
              fallback={null}
              disabled={false}
              onPick={(file) => {
                release()
                onChange({ kind: "upload", file, url: URL.createObjectURL(file) })
                setOpen(false)
              }}
              onRemove={() => {
                release()
                onChange(fallback)
              }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
