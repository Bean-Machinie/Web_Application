# CLAUDE.md

## Code style
- Keep files short. Split any file over ~150 lines into smaller modules.
- One component per file. Name files after what they contain.
- Keep functions small and focused on one task.
- Prefer plain, readable code over clever abstractions.
- Do not add libraries, helpers, or config that the task does not need.
- Comment only to explain why, never what.
- Use a predictable folder structure: src/pages/ for routes,
  src/components/ for UI, src/lib/ for Supabase clients and utilities,
  src/auth/ for session handling, supabase/migrations/ for SQL.

## Working rules
- Make the smallest change that solves the task.
- Do not refactor or reformat code outside the task.
- Ask before creating new folders or adding dependencies.
- Read DESIGN.md before any UI work, once it exists.
