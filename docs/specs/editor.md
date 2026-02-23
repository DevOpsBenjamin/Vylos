# Editor System Spec

## Overview

A browser-based visual editor for Vylos projects, launched via `vylos editor [project-dir]`. Provides a dashboard, location manager, event/action editors, asset management, and a floating live game preview — all without leaving the browser.

## Architecture

The editor runs as a separate Vite app (`editor_src/`) alongside the game engine. It shares Pinia stores with the game for live state inspection.

### Modules

| Module | Purpose |
|--------|---------|
| **Dashboard** | Project stats: location count, event count, action count, translation coverage |
| **Location Manager** | Table of all locations with edit/delete buttons |
| **Location Editor** | Tab-based editor per location: Events, Actions, Images, Sounds, Texts |
| **Asset Manager** | Upload, drag-drop, categorize files (images/sounds/videos/misc) |
| **File Editor** | Monaco-powered code editor for .ts, .vue, .json files |
| **State Popups** | JSON editors for inspecting/modifying engineState and gameState at runtime |
| **Floating Game** | Live game preview — draggable, resizable window running the actual engine |

### State Management

Editor state stored in a dedicated Pinia store (`editorState`):

```ts
interface EditorState {
  activeModule: 'dashboard' | 'locationManager' | 'locationEdit';
  selectedLocation: string | null;
  activeLocationTab: 'events' | 'actions' | 'images' | 'sounds' | 'texts';
  currentFile: string | null;
  previewVisible: boolean;
  showEnginePopup: boolean;
  showGamePopup: boolean;
  showFilePopup: boolean;
}
```

### Monaco Integration

- Shared loader utility initializes Monaco once, reused across all editor popups
- Language auto-detection from file extension (.ts → TypeScript, .vue → HTML, .json → JSON)
- JSON mode for state popups with schema validation

### State Popups

Two popup windows for runtime debugging:

1. **Engine State Popup** — Full JSON editor showing `engineState` (background, dialogue, choices, phase, etc.)
2. **Game State Popup** — Full JSON editor showing `gameState` (locationId, flags, counters, NPCs)

Both use Monaco with JSON language. Save button patches the respective Pinia store via `$patch()`.

### Floating Game Preview

- Renders the actual `<Game>` component in a floating window
- Draggable via header mousedown
- Resizable via corner handle
- Runs the game engine in parallel — changes in editor reflect in preview

### File Operations

Editor communicates with a local dev server for file I/O:

- `GET /api/file?path=...` — Read file content
- `POST /api/file` — Write file content
- `DELETE /api/delete` — Delete file
- `POST /api/rename` — Rename file

## Implementation Notes for Vylos v2

- Use the existing `vylos editor` CLI command entry point
- Reuse `@vylos/core` components and stores directly
- Monaco loaded from CDN (`monaco-editor` via ESM)
- Editor-specific components go in `packages/editor/` (new workspace package)
- State popups should use `inject(ENGINE_INJECT_KEY)` for live engine access
- File API handled by Vite middleware plugin (no separate server)

## Open Questions

- Should the editor support hot-reloading of event files?
- Should event editing be code-only (Monaco) or visual (node graph)?
- Should asset upload support automatic sprite sheet generation?
