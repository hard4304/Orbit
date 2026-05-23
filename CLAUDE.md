@AGENTS.md

# Orbit — Life Tracker

## Quick Start
```bash
npm run dev    # Start dev server (requires MongoDB)
npm run build  # Production build
npm test       # Integration tests (need running server + DB)
```

## Tech Stack
- **Framework**: Next.js 16 (App Router) + TypeScript
- **UI**: Tailwind CSS v4 + shadcn/ui (Base UI primitives) + Lucide icons
- **Auth**: NextAuth v5 (credentials provider, JWT sessions)
- **DB**: MongoDB Atlas + Mongoose
- **Validation**: Zod
- **Fonts**: DM Sans (body, `--font-sans`) + Playfair Display (headings, `--font-heading`)

## Architecture
```
src/
├── app/
│   ├── (auth)/          # Login/Register pages
│   ├── (dashboard)/     # Main app pages (/, /habits, /gym, /body-care, /reports, /admin/reports)
│   │   └── layout.tsx   # Custom sidebar layout (no SidebarProvider)
│   ├── api/             # API routes (controller layer)
│   └── layout.tsx       # Root layout (fonts, providers)
├── components/
│   ├── dashboard/       # progress-ring.tsx, consistency-heatmap.tsx
│   ├── body-care/       # add-body-care-dialog.tsx
│   ├── finance/         # add-expense-dialog.tsx
│   ├── food/            # log-food-dialog.tsx
│   ├── habits/          # add-habit-dialog.tsx
│   ├── learning/        # add-learning-dialog.tsx
│   ├── reports/         # add-report-dialog.tsx
│   ├── layout/          # app-sidebar.tsx, telegram-settings-dialog.tsx, theme-provider.tsx, session-provider.tsx
│   └── ui/              # shadcn primitives (button, card, calendar, date-picker, etc.)
├── lib/
│   ├── db/              # MongoDB connection
│   ├── middleware/       # auth.ts (requireAuth, requireAdmin), error-handler.ts
│   ├── models/          # Mongoose schemas
│   ├── repositories/    # Data access layer
│   ├── services/        # Business logic layer
│   ├── telegram.ts      # Telegram Bot API utilities
│   └── notifications.ts # Notification helpers (habit completion, report status, daily summaries)
├── types/               # Shared TypeScript types
scripts/
├── tunnel.sh            # Start cloudflared/ngrok tunnel + auto-set Telegram webhook
└── set-webhook.sh       # Set Telegram webhook for any URL (local or production)
```

**Backend pattern**: API Route → Service → Repository → MongoDB
**Frontend pattern**: Page → Feature Components → shadcn UI primitives

## Design System (Current)

### Theme: Warm Cream (Light-only)
- **No dark mode** — removed entirely. Theme provider is a no-op shell.
- Background: warm cream OKLCH palette (`globals.css` `:root`)
- Primary: warm coral (`oklch(0.65 0.18 25)`)
- Cards: near-white with subtle warm tint, `rounded-2xl`, `shadow-sm`, `ring-foreground/5`
- Buttons: `rounded-xl`

### Habit Pastel Palette
Six CSS variables used for habit card backgrounds:
```
--habit-pink: #f9b4c2    --habit-green: #b5e4ca
--habit-purple: #c4b5e0   --habit-peach: #f9cdb0
--habit-blue: #a8d4f0     --habit-yellow: #f5e6a3
```
Usage: `bg-habit-pink/40`, `bg-habit-blue/20`, etc.

### Sidebar
- **Custom fixed sidebar** (not shadcn SidebarProvider) — `w-20`, fixed left
- Icon + label stacked vertically per nav tile
- Dashboard layout uses `ml-20` on main content
- Lucide icons: LayoutDashboard, CheckSquare, Dumbbell, Wallet, Utensils, BookOpen, Sparkles, Bug
- Avatar dropdown: Telegram settings, Sign out

### Typography
- Body: DM Sans (`font-sans`)
- Headings: Playfair Display (`font-heading`) — used for dashboard greeting, section titles
- Dashboard greeting pattern: uppercase date + "DAILY HABIT OVERVIEW" subtitle + large serif heading

### Dashboard Components
- **Daily/Weekly toggle** — shadcn Tabs at top of dashboard; fetches `/api/dashboard?view=daily|weekly`
- **ProgressRing** (`components/dashboard/progress-ring.tsx`): SVG circular progress
- **ConsistencyHeatmap** (`components/dashboard/consistency-heatmap.tsx`): GitHub-style grid (7 rows × 12 cols)
- **BarChart** (`components/dashboard/bar-chart.tsx`): Custom SVG bar chart (7 bars, Mon–Sun) — used in weekly view for calories, spending, learning
- Stat cards use pastel backgrounds with no border/ring (`border-none ring-0`)
- Daily view: 3 original cards (progress, streaks, gym) + 4 module cards (calories, spent, learning, body care)
- Weekly view: 4 summary cards (habits, gym, spending, avg calories) + 3 bar charts

### Habits Page
- Card grid layout (not table) — each habit is a colored card
- Circular day indicators (filled = done, outline = not done) for Mon–Sun
- "+" dashed card to add new habit
- Delete button appears on hover

### Finance Page
- Daily/Monthly view toggle — fetches expenses by date range from API
- Summary cards: Total Spent, Transaction Count (with avg per tx in monthly view)
- Single expense list with category + medium badges, delete on hover

### Food Page
- Daily/Weekly view toggle — daily shows today, weekly shows Mon–Sun
- Nutrition summary cards: Calories, Protein, Carbs, Fat (with daily averages in weekly view)
- Single food log list with meal type badge, quantity indicator, delete on hover
- **Quantity field** on food logs — nutrition values multiplied by quantity before saving
- Food search: debounced 300ms, no "no results" flash, negative calorie values rejected

### Body Care Page
- Daily/Weekly/Monthly view toggle — fetches logs by date range from API
- Type filter chips: Skincare (pink), Haircare (blue), Body Care (green), Other (muted)
- Summary cards: Entries, Products Used, Top Type
- Log cards show type badge, title, notes, product pills. Delete on hover
- Products displayed as pill tags (comma-separated input in dialog)

### Reports Page
- Header "BUG & FEATURE REPORTS" / "Feedback" (Playfair)
- Bug badge=red tint, Feature badge=blue tint
- Status badges: Open (yellow), In Progress (blue), Done (green)
- Type + status filter chips
- Admin page at `/admin/reports` (NOT in sidebar) — status selector per card

### Telegram Notifications
- No dashboard page — settings via sidebar avatar dropdown dialog
- Link/unlink via Telegram deep link (`https://t.me/BOT?start=userId`)
- Env vars: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`, `CRON_SECRET`
- **Notification triggers** (fire-and-forget, non-blocking):
  - Habit completed → Telegram message to user
  - Admin changes report status → Telegram message to report author
  - Daily summary cron (`GET /api/cron/daily-summary`, Bearer token auth via `CRON_SECRET`)
- **Tunnel for local dev**: `npm run tunnel` (cloudflared or ngrok → auto-sets webhook)
- **Set webhook for any URL**: `./scripts/set-webhook.sh https://your-domain.com`

## Phase Status
- **Phase 1**: DONE — Auth, Dashboard, Habits, Gym
- **Phase 2**: DONE — Personal Finance, Food Tracker (core features complete)
- **Phase 3**: DONE — Learning Tracker, Body Care, Bug/Feature Reports, Telegram Notifications
- **Phase 4**: FUTURE — PWA, Google OAuth, Data Export

See `docs/DESIGN.md` for full phase details and feature specs.

## Key Conventions
- All DB queries filter by `userId` (data isolation)
- API errors handled via `handleApiError()` wrapper
- Auth via `requireAuth()` in API routes (returns user or throws)
- Admin via `requireAdmin()` — checks `user.name === "hard4304"`, throws "Forbidden" (403)
- Toast notifications via Sonner
- No `dark` class on `<html>` — light theme only
