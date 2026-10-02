import type { CampaignTemplate, TemplateEntry } from "./campaign-template-types"

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

// A dev server answers a missing file with its index page, so the type has to
// be checked too, not only the status.
async function exists(url: string) {
  try {
    const response = await fetch(url, { method: "HEAD" })
    return response.ok && (response.headers.get("content-type") ?? "").startsWith("image/")
  } catch {
    return false
  }
}

// The template's entries, each given its portrait if the file is there.
export async function entriesWithPortraits(template: CampaignTemplate): Promise<TemplateEntry[]> {
  const base = template.portraits
  if (!base) return template.entries

  return Promise.all(
    template.entries.map(async (entry) => {
      const url = `${base}/${slug(entry.name)}.webp`
      if (!(await exists(url))) return entry
      return {
        ...entry,
        fields: [{ key: "image", type: "image" as const, value: { url } }, ...entry.fields],
      }
    })
  )
}
