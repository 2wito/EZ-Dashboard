# Support Center

A support-team command center built with **Next.js 15 (App Router)**, **Tailwind CSS v4** and **TypeScript**. It has a live ticket queue, a conversation workspace, and KPI cards with small trend charts. It opens in dark mode, uses glass effects sparingly, and works by keyboard.

## Features

- **Command palette:** press `Ctrl/⌘ K` or `/` to search tickets, customers and actions (theme, views, agent status) and move through results with the arrow keys.
- **Quick filters:** All, Assigned to me, Urgent and Unassigned, each with a live count.
- **Agent status:** Online, Away or Offline, saved in `localStorage`.
- **Notification center:** alerts for SLA risk, escalations, @mentions and CSAT ratings, each linking to its ticket.
- **KPI grid:** Open tickets, Avg. first response, CSAT and Escalations, each with a Recharts area, line or bar sparkline and a delta. The delta is colored by whether the change is good or bad, not just whether it went up or down.
- **Ticket queue:** filter by status, search, and sort by priority or recency. A colored bar plus an icon and label show urgency, so it doesn't rely on color alone. Rows also show avatars, tags, an unread marker and a live SLA countdown. `J` / `K` move through the queue.
- **Active ticket:** a thread of customer messages, agent replies, internal notes and system events. Includes a status select, Resolve/Reopen, four quick-reply macros (with `{{first_name}}` filled in), and a Reply / Internal note composer (`Ctrl/⌘ Enter` sends).
- **Customer history:** a slide-over drawer, which becomes a fixed third column at ≥1920px for multi-monitor setups. Shows plan, CSAT, MRR, other active tickets and a ticket history timeline.

## Design system

| Token | Dark (default) | Light |
| --- | --- | --- |
| Canvas | `#0F172A` | `#F1F5F9` |
| Surface | `#1E293B` | `#FFFFFF` |
| Accent | `#3B82F6` | `#3B82F6` |
| Button fill | `#2563EB` (white text 5.2:1) | `#2563EB` |
| Muted text | `#94A3B8` (5.7:1 on surface) | `#475569` |

Status colors: emerald means resolved, amber means in progress, and rose means urgent or escalated. All text tokens meet WCAG AA. The type is **Inter** for the interface and **JetBrains Mono** for ticket IDs and data, both loaded with `next/font`. Icons are Lucide only, with no emoji.

Components use semantic Tailwind classes (`bg-surface`, `text-muted`, `bg-danger-soft`). These map to CSS variables in `app/globals.css`, so switching between light and dark only swaps the variables and needs no `dark:` variants.

## Architecture

```
app/
  layout.tsx            fonts, metadata, script that applies the saved theme before first paint
  page.tsx              renders <SupportDashboard />
  globals.css           Tailwind v4 theme tokens, glass and no-scrollbar utilities, reduced-motion handling
components/
  support-dashboard.tsx state, derived views, actions, global shortcuts
  header.tsx            search trigger, quick filters, agent status, notifications, theme
  command-palette.tsx   combobox / listbox dialog
  kpi-grid.tsx          KPI cards (sparklines loaded client-side with fixed-size slots, so nothing shifts)
  sparkline.tsx         Recharts mini area/line/bar
  ticket-queue.tsx      filters and memoized ticket rows
  ticket-view.tsx       thread, macros, composer
  customer-panel.tsx    profile, plus the drawer for smaller screens
  ui.tsx                Avatar, StatusBadge, PriorityTag, Tag, SlaChip, Kbd
lib/
  data.ts               seed customers, tickets, notifications, macros, KPI series
  meta.ts               status/priority/channel lookup tables
  hooks.ts              demo clock, persisted state, theme, dismiss-on-outside-click
  types.ts, utils.ts
```

Seed timestamps are offsets from a fixed `DEMO_EPOCH`. The demo clock starts there and then runs in real time, so the server render and the first client render match exactly. To connect a real backend, replace `lib/data.ts` and the `setTickets` actions with your API.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build + type check
```
