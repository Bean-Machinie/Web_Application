// The address of the library: ?section= is the node of the tree that is open, ?item= the one
// whose panel is open beside it.
export function withItem(search: string, itemId: string | null) {
  const params = new URLSearchParams(search)
  if (itemId) params.set("item", itemId)
  else params.delete("item")
  const text = params.toString()
  return text ? `?${text}` : "?"
}
