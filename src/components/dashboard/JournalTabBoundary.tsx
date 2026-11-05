import { Component } from "react"
import type { ErrorInfo, ReactNode } from "react"
import { Button } from "@/components/ui/button"

type Props = { onClose: () => void; children: ReactNode }

// A tab that crashes shows this in its own place, so the rest of the journal stays up. The pane
// gives it the tab's key, so each tab starts fresh.
export class JournalTabBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("A journal tab crashed", error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-sm font-medium">This tab couldn’t load</p>
        <Button variant="outline" size="sm" onClick={this.props.onClose}>
          Close tab
        </Button>
      </div>
    )
  }
}
