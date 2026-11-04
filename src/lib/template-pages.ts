import type { TemplatePage } from "./campaign-template-types"

// A page as create_campaign takes it: the pages come in one list with parents first, and
// `parent` is the place of the page's parent in that list.
type FlatPage = {
  parent: number | null
  position: number
  title: string
  revealed: boolean
  content: TemplatePage["content"]
}

export function flattenPages(pages: TemplatePage[]): FlatPage[] {
  const flat: FlatPage[] = []
  const add = (list: TemplatePage[], parent: number | null) => {
    list.forEach((page, position) => {
      const here = flat.push({ parent, position, title: page.title, revealed: page.revealed, content: page.content }) - 1
      add(page.children ?? [], here)
    })
  }
  add(pages, null)
  return flat
}

export const countPages = (pages: TemplatePage[]): number =>
  pages.reduce((total, page) => total + 1 + countPages(page.children ?? []), 0)
