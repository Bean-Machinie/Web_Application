import { ReactRenderer } from "@tiptap/react"
import type { Editor } from "@tiptap/react"
import type { PluginKey } from "@tiptap/pm/state"
import { exitSuggestion } from "@tiptap/suggestion"
import type { SuggestionProps } from "@tiptap/suggestion"
import type { ForwardRefExoticComponent, RefAttributes } from "react"

const GAP = 4

export type SuggestionListHandle = { onKeyDown: (event: KeyboardEvent) => boolean }
export type SuggestionListProps<Item, Picked> = { items: Item[]; command: (picked: Picked) => void }

// A picker that is not being used closes by itself: when the editor loses focus,
// when the person scrolls (the wheel or a touch, not the page following the caret
// as they type), and when anything outside it is pressed. Left open it would stay
// where it was, over whatever is under that spot. Returns what takes the listeners
// away again.
function closeWhenLeft(editor: Editor, picker: HTMLElement, close: () => void) {
  const away = (event: Event) => !picker.contains(event.target as Node) && close()
  const passive = { capture: true, passive: true }

  editor.on("blur", close)
  editor.on("destroy", close)
  window.addEventListener("wheel", close, passive)
  window.addEventListener("touchmove", close, passive)
  window.addEventListener("pointerdown", away, true)
  return () => {
    editor.off("blur", close)
    editor.off("destroy", close)
    window.removeEventListener("wheel", close, passive)
    window.removeEventListener("touchmove", close, passive)
    window.removeEventListener("pointerdown", away, true)
  }
}

// The picker lives inside the editor's own box, not on the page: a panel that
// is a dialog counts a click outside itself as a reason to close. Shared by
// everything typed after a character in the editor (@ and /). `pluginKey` is the
// suggestion's own, which is how it is told to stop.
export function suggestionRender<Item, Picked>(
  List: ForwardRefExoticComponent<
    SuggestionListProps<Item, Picked> & RefAttributes<SuggestionListHandle>
  >,
  pluginKey: PluginKey
) {
  return () => {
    let component: ReactRenderer<SuggestionListHandle, SuggestionListProps<Item, Picked>> | null = null
    let stopWatching: (() => void) | null = null

    function place(props: SuggestionProps<Item>) {
      const root = props.editor.view.dom.closest<HTMLElement>("[data-mention-root]")
      const caret = props.clientRect?.()
      if (!component || !root || !caret) return

      if (component.element.parentElement !== root) root.appendChild(component.element)
      const box = root.getBoundingClientRect()
      const style = component.element.style
      style.position = "absolute"
      style.zIndex = "60"
      style.left = `${caret.left - box.left}px`
      // Below the caret, or above it when the screen ends first.
      if (caret.bottom + 260 < window.innerHeight) {
        style.top = `${caret.bottom - box.top + GAP}px`
        style.bottom = ""
      } else {
        style.top = ""
        style.bottom = `${box.bottom - caret.top + GAP}px`
      }
    }

    return {
      onStart: (props: SuggestionProps<Item>) => {
        component = new ReactRenderer(List, { props, editor: props.editor })
        place(props)
        const { editor } = props
        stopWatching = closeWhenLeft(editor, component.element, () => {
          if (!editor.isDestroyed) exitSuggestion(editor.view, pluginKey)
        })
      },
      onUpdate: (props: SuggestionProps<Item>) => {
        component?.updateProps(props)
        place(props)
      },
      onKeyDown: ({ event }: { event: KeyboardEvent }) =>
        component?.ref?.onKeyDown(event) ?? false,
      onExit: () => {
        stopWatching?.()
        stopWatching = null
        component?.element.remove()
        component?.destroy()
        component = null
      },
    }
  }
}
