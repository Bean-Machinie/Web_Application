import Mention from "@tiptap/extension-mention"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { MentionNodeView } from "./MentionNodeView"

// The mention node, drawn as a chip. Its attributes are the entry's id and the
// name it had when it was mentioned; the database reads the id.
export const MentionNode = Mention.extend({
  addNodeView() {
    return ReactNodeViewRenderer(MentionNodeView)
  },
})
