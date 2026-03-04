# CLAUDE.md

Vylos — checkpoint-based visual novel engine. Distributable pnpm monorepo. End users install `@vylos/core` and write games in their own project.

## Commands

```bash
pnpm install          # Install all workspace deps
pnpm test             # Vitest (packages/core)
pnpm build            # Build pages + all demos
pnpm dev              # Build demos → pages showcase dev server
pnpm dev:basic        # Dev server: 1-basic
pnpm dev:advanced     # Dev server: 2-advanced
pnpm dev:phone        # Dev server: 3-phone
pnpm dev:pages        # Dev server: GitHub Pages showcase
npx vylos create <n>  # Scaffold a new project
```

Node ≥ 22, pnpm 9.15+.

## Monorepo Layout

```
packages/core/       — engine, types, stores, components, managers
packages/cli/        — Vite dev/build/create + project templates
projects/1-basic/    — minimal demo (3 locations, 1 NPC, custom gameStore)
projects/2-advanced/ — full showcase (5 locations, i18n, plugins, DI, typed helpers)
projects/3-phone/    — phone UI with full component overrides
pages/               — GitHub Pages marketing site
scripts/             — build helpers (build-demos.mjs)
```

## Gotchas

- `vite-plugin-singlefile` overrides Vite `base` to `"./"` — don't rely on absolute base paths in built output. Use `VYLOS_BASE` env var for the CLI, but images resolve via relative paths regardless.
- Never `structuredClone()` a Vue `reactive()` proxy — use `toRaw()` first.
- Each project's `style.css` needs `@source "../../packages/core/src/components"` for Tailwind to scan core components.
- `.claude/` is gitignored — rules files live locally only.
- No formatter/linter config exists. Conventions enforced by `tsconfig` strict mode + code review.

## Architecture (brief)

Engine pauses at each `await engine.say()` / `engine.choice()` via promise-based `WaitManager`. Rollback replays the event, fast-forwarding past seen steps.

Game loop: `Engine.run(events, getState, callbacks)` → onTick → evaluate events → execute → wait for navigation → loop.

Two Pinia stores: **engineState** (UI: phase, dialogue, choices, menus) and **gameState** (game: locationId, gameTime, flags, player).

Action→Event pattern for narration: action sets a flag, event triggers on that flag, runs narration, resets flag.
