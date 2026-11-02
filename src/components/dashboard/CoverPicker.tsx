import { useState } from "react"
import { ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CoverChoice } from "@/lib/campaign-covers"
import { CoverGallery } from "./CoverGallery"
import { CoverUpload } from "./CoverUpload"

type Props = { cover: CoverChoice; onChange: (cover: CoverChoice) => void }

// "Change cover": the default covers, or a picture of one's own.
export function CoverPicker({ cover, onChange }: Props) {
  const [open, setOpen] = useState(false)

  function pickFile(file: File) {
    // The old preview is let go once nothing shows it.
    if (cover.kind === "upload") URL.revokeObjectURL(cover.url)
    onChange({ kind: "upload", file, url: URL.createObjectURL(file) })
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="secondary" size="sm" className="shadow-xs">
          <ImageIcon className="size-3.5" />
          Change cover
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <Tabs defaultValue="gallery">
          <TabsList>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>
          <TabsContent value="gallery">
            <CoverGallery
              cover={cover}
              onPick={(next) => {
                onChange(next)
                setOpen(false)
              }}
            />
          </TabsContent>
          <TabsContent value="upload">
            <CoverUpload onPick={pickFile} />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
