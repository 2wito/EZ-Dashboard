# (K) NOC (K) OUT — Team Operations Dashboard

A single-file, zero-framework operations command center for NOC teams. One `index.html`, no build step, no runtime dependencies beyond Google Fonts and SheetJS (for Excel export, with a CSV fallback when offline).

## Features

| Area | What it does |
|---|---|
| **Dashboard** | Glowing hero banner, greeting that changes with the time of day and current shift, countdown to the next shift, live KPI cards |
| **World clocks** | 10 clocks (Israel, UK, Germany, US East/West, Brazil, India, China, Japan, Australia) updated every second, each showing its business-hours state and the customers based there |
| **Customer world map** | Bottom of the Dashboard: coastlines decoded from a TopoJSON file by a ~25-line vanilla decoder (no d3), a live day/night terminator, and a pulsing pin per customer region whose colour follows checklist health (green / amber / red) with the local time |
| **Customers** | Summary table (AWS/Azure platform tags, customer domain, Git repo, license key with expiry status, TAM with Slack / phone / email shortcuts, customer Slack channel) with zebra striping, plus a 3-state checklist matrix (None → ✓ → ✕) saved by row/column index, with column "✓ all" controls, Clear all, a live % badge in the sidebar and a copyable handoff report |
| **Support Desk** | A ticket workspace for the same customers. It has 4 KPI cards with inline SVG sparklines (open tickets, first response, CSAT, escalations) and a queue with quick views (All / Mine / Urgent / Unassigned), status filter, search and sort. Each ticket shows a priority bar and a live SLA countdown. The conversation view holds customer messages, agent replies, internal notes and system events, plus quick-reply macros (`{name}`, `{customer}`, `{agent}`) and one saved draft per ticket. The customer panel shows tier, platforms, TAM, shift-checklist health and links. A toast fires when an SLA is breached, the sidebar badge turns red, and tickets are searchable from `Ctrl+K` |
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

customers:    [{ id, name, persona, tier, platforms /* AWS | Azure */, domain, zone /* timezones id */, git, license, licenseExpires, manager /* TAM */, tam: { slack, phone, email }, group /* Slack channel */ }]
customers:    [{ id, name, hero, persona, tier, platforms, vectors, link, git, manager /* TAM */, group }]
gitBase / licenseBase / slackBase       // prefixes that turn git, license, group (Slack channel) and tam.slack into links
worldMapUrl                              // TopoJSON land file for the world map (fetched once)
checklistColumns: [{ id, label }]
versionTables / versionColumns / versions   // version-tracking tables + seed rows
shifts:       [{ id, name, icon, start, end, tasks: [{ time, text }] }]
support: { agent, macros: [{ id, label, body }], kpi, tickets: [{ id, customer /* SITE.customers id */, subject, priority, status, channel, tags, assignee, ageMin, slaInMin, thread }] }
templates:    [{ id, title, tag, body }]   // use {customer} {service} {ticket} {time}
timezones: [{ id, label, tz, lat, lon, pos, primary }]   // primary = HQ clock; lat/lon place the map pin, pos = label side
themes: { id: label }                    // each id maps to a body.theme-<id> CSS block
linkGroups / docs / commands / jokes / gallery
shortcuts: [{ keys: 'Alt+N', label, action, global }]   // actions map to ACTIONS in block 21
```

## Run / Deploy

Open `index.html` in a browser. There is no build step.

- **Vercel:** import the repo at [vercel.com/new](https://vercel.com/new), set **Framework Preset = Other** and leave Build Command and Output Directory empty, then click **Deploy**. `.vercelignore` keeps the deployment to the dashboard only. Alternatively run `vercel --prod` from the repo root.
- **GitHub Pages:** deploy from branch, root. The page uses no absolute paths, so it also works from a sub-path.

## Keyboard shortcuts

`Ctrl/⌘+K` command palette · `Esc` close overlays · `Alt+N` scratchpad · `/` focus the search box on the current page · `Alt+L` light mode · `Alt+R` new reminder · `Alt+B` test beep · arrow keys or `WASD` play 2048 · `←` `→` move through the gallery lightbox · `J` / `K` move through the Support Desk queue and `R` focuses the reply box. All of these are configured in `SITE.shortcuts`.
