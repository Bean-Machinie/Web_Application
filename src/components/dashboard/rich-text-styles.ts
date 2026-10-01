const placeholder =
  "[&_.is-editor-empty:first-child::before]:pointer-events-none [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:text-muted-foreground [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]"

// Tailwind's reset strips the browser defaults, so the document styles are
// spelled out here and shared by the editor and the read-only view.
export const richTextClass = [
  "text-sm leading-relaxed outline-none",
  "[&_p]:my-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
  "[&_h2]:mt-4 [&_h2]:mb-1 [&_h2]:text-base [&_h2]:font-semibold",
  "[&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold",
  "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
  "[&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
  placeholder,
].join(" ")
