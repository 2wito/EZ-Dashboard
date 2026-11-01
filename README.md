# (K) NOC (K) OUT — Team Operations Dashboard

A single-file, zero-framework operations command center for NOC teams. One `index.html`, no build step, no runtime dependencies beyond Google Fonts and SheetJS (for Excel export, with a CSV fallback when offline).

## Features

| Area | What it does |
|---|---|
| **Dashboard** | Glowing hero banner, greeting that changes with the time of day and current shift, countdown to the next shift, live KPI cards |
| **World clocks** | Clocks for each configured time zone, updated every second, with a business-hours indicator |
| **Customers** | Summary table (platform tags, vector chips, license/Git/chat links, account manager) with zebra striping, plus a 3-state checklist matrix (None → ✓ → ✕) saved by row/column index, with column "✓ all" controls, Clear all, a live % badge in the sidebar and a copyable handoff report |
| **Shift tasks** | Four shift columns side by side; checked tasks show the time they were done and get struck through; a handoff generator combines tasks, the matrix and your notes |
| **Templates** | Message cards you click to copy, with `{customer}`, `{service}`, `{ticket}` and `{time}` variable substitution and usage counters |
| **Versions** | Android and iOS release tables with editable (`contenteditable`) cells; SheetJS loads only on the first export and produces a 3-sheet `.xlsx` (CSV if it can't load) |
| **Knowledge** | Link wall grouped by `SITE.linkGroups` (links open in a new tab); bookshelf of docs styled as book spines, where search dims the docs that don't match; terminal cheatsheet (logs, Docker, Kubernetes…) with a prompt, a copy button on every command and live filtering. The terminal stays dark in light mode |
| **Utilities** | `Ctrl+K` command palette that searches sections, links, docs, commands, templates and shortcuts (arrow keys, Enter, Esc); a scratchpad you can drag, resize and that autosaves; one-off or repeating timers with a WebAudio triple beep, toasts with a snooze button, and live countdowns in the sidebar |
| **Break room** | 2048 (keyboard and swipe) and Memory Match, both with saved best scores |
| **Morale** | Joke generator and a lightbox gallery whose images are generated as SVG, so no image files are needed |
| **Design** | iOS/macOS "Liquid Glass" look: frosted panels (`backdrop-filter: blur(20px) saturate(180%)`) over slowly drifting coloured light, pill buttons, 20px glass cards, a floating sidebar, a single glass clock bar and hover lift. 4 accent themes (`body.theme-*`) plus a frosted-white light mode (`body.light-mode`). Browsers without `backdrop-filter` get solid panels instead |

## Architecture

- **Config-driven:** everything you see is rendered from the `SITE` object at the top of the script. The HTML holds only empty section shells.
- **Numbered modules:** the script is split into `// --- N. Name ---` blocks (config, helpers, toasts, theme engine, routing, state, and one block per feature).
- **State:** every user action is saved to `localStorage` under `SITE.storagePrefix` (`noc_glass_` by default).
- **Security:** all dynamic strings go through `esc()` before they reach `innerHTML`.
- **Theme engine:** each theme is a `body.theme-*` CSS class that redefines the colour tokens. Light mode overrides only the surface and text tokens on `body`.

## Customization

Edit `SITE` in `index.html`:

```js
customers:    [{ id, name, hero, persona, tier, platforms, vectors, link, git, manager /* TAM */, group }]
gitBase / chatBase                       // prefixes that turn git: 'git/apex' and group: '#ops-apex' into links
checklistColumns: [{ id, label }]
versionTables / versionColumns / versions   // version-tracking tables + seed rows
shifts:       [{ id, name, icon, start, end, tasks: [{ time, text }] }]
templates:    [{ id, title, tag, body }]   // use {customer} {service} {ticket} {time}
timezones: [{ label, tz, primary }]      // primary = highlighted HQ clock
themes: { id: label }                    // each id maps to a body.theme-<id> CSS block
linkGroups / docs / commands / jokes / gallery
shortcuts: [{ keys: 'Alt+N', label, action, global }]   // actions map to ACTIONS in block 21
```

## Run / Deploy

Open `index.html` in a browser. To publish it, push to GitHub and turn on **Pages** (deploy from branch, root). It uses no absolute paths, so it also works from a sub-path.

## Keyboard shortcuts

`Ctrl/⌘+K` command palette · `Esc` close overlays · `Alt+N` scratchpad · `/` focus the search box on the current page · `Alt+L` light mode · `Alt+R` new reminder · `Alt+B` test beep · arrow keys or `WASD` play 2048 · `←` `→` move through the gallery lightbox. All of these are configured in `SITE.shortcuts`.
