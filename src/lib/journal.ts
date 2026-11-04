import { supabase } from "@/lib/supabase"

// A page as the tree knows it: no content, so the whole tree is one small read.
export type JournalNode = {
  id: string
  parentId: string | null
  position: number
  title: string
  revealed: boolean
}

type NodeRow = {
  id: string
  parent_id: string | null
  position: number
  title: string
  revealed: boolean
}

const toNode = (row: NodeRow): JournalNode => ({
  id: row.id,
  parentId: row.parent_id,
  position: row.position,
  title: row.title,
  revealed: row.revealed,
})

// Functions, not the table: a player is sent only the revealed pages, and a page
// without its GM-only blocks.
export async function fetchJournalTree(campaignId: string) {
  const { data, error } = await supabase.rpc("get_journal_tree", { target_campaign: campaignId })
  if (error) throw error
  return (data as NodeRow[]).map(toNode)
}

// Null when there is no such page, or it is not for this person.
export async function fetchJournalContent(pageId: string) {
  const { data, error } = await supabase.rpc("get_journal_page", { target_page: pageId })
  if (error) throw error
  const page = (data as { content: unknown }[])[0]
  return page ? { content: page.content } : null
}

export async function createJournalPage(campaignId: string, parentId: string | null) {
  const { data, error } = await supabase.rpc("create_journal_page", {
    target_campaign: campaignId,
    parent: parentId,
    page_title: "",
  })
  if (error) throw error
  return toNode(data as NodeRow)
}

export async function setJournalTitle(pageId: string, title: string) {
  const { error } = await supabase.rpc("set_journal_page_title", {
    target_page: pageId,
    new_title: title,
  })
  if (error) throw error
}

export async function setJournalContent(pageId: string, content: unknown) {
  const { error } = await supabase.rpc("set_journal_page_content", {
    target_page: pageId,
    new_content: content,
  })
  if (error) throw error
}

export async function moveJournalPage(pageId: string, parentId: string | null, position: number) {
  const { error } = await supabase.rpc("move_journal_page", {
    target_page: pageId,
    new_parent: parentId,
    new_position: position,
  })
  if (error) throw error
}

export async function setJournalRevealed(pageId: string, revealed: boolean) {
  const { error } = await supabase.rpc("set_journal_page_revealed", {
    target_page: pageId,
    is_revealed: revealed,
  })
  if (error) throw error
}

export async function deleteJournalPage(pageId: string) {
  const { error } = await supabase.rpc("delete_journal_page", { target_page: pageId })
  if (error) throw error
}
