import { EditorContent, useEditor } from "@tiptap/react"
import type { JSONContent } from "@tiptap/react"
import { tidyMentionSpacing } from "@/lib/mention-spacing"
import { MentionNode } from "./mention-node"
import { PAGE_BLOCKS } from "./page-extensions"
import { richTextClass } from "./rich-text-styles"
import { RulesDecorations } from "./rules-decorations"
import { RulesHover } from "./RulesHover"

// A page as a player reads it. The database has already left out the GM-only
// blocks and turned the mentions a player may not follow into plain text.
export function JournalPageReader({ value }: { value: unknown }) {
  const editor = useEditor({
    extensions: [...PAGE_BLOCKS, MentionNode, RulesDecorations],
    content: value ? tidyMentionSpacing(value as JSONContent) : undefined,
    editable: false,
    editorProps: { attributes: { class: richTextClass } },
  })

  return (
    <>
      <EditorContent editor={editor} />
      {editor && <RulesHover editor={editor} />}
    </>
  )
}
