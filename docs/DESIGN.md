# Orbit — Product Design Document

## Vision
A personal life management app that automates daily tracking so you can free your brainpower for what matters. Track habits, workouts, finances, food, learning, and body care — all in one place.

## Target Users
- You (Utkarsh) and a small group of friends
- Each user gets their own account with isolated data

---

## Tech Stack

| Layer | Tech | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) + TypeScript | Full-stack in one codebase |
| UI | Tailwind CSS v4 + shadcn/ui (Base UI) + Lucide icons | Fast, clean, customizable components |
| Auth | NextAuth v5 (Auth.js beta) | Session-based, easy Google OAuth later |
| DB | MongoDB Atlas (free 512MB) + Mongoose | Document-per-user model, free hosting |
| Validation | Zod | Runtime + type safety in one |
| Food API | OpenFoodFacts (free, no API key) | Barcode + text search for nutrition data |
| Notifications | Telegram Bot API | Free, instant push to phone |
| Hosting | Vercel (planned) | Free, built for Next.js |

---

## Architecture

### Backend Layers
```
API Route (Controller) → Service → Repository → MongoDB
```
- **API Routes**: Handle HTTP, parse request, return response. No business logic.
- **Services**: Business logic, validation (via Zod), orchestration.
- **Repositories**: Pure database operations. Only place that touches Mongoose models.
- **Models**: Mongoose schemas defining document structure and indexes.

### Frontend Layers
```
Page → Feature Components → UI Components (shadcn)
```
- **Pages**: Route-level components in `app/` directory. Fetch data, manage state.
- **Feature Components**: Domain-specific (e.g., GymMode, AddHabitDialog, EditExpenseDialog).
- **UI Components**: Generic shadcn/ui primitives (Button, Card, Calendar, DatePicker, etc).

### Auth Flow
```
Register → POST /api/auth/register → hash password → store in MongoDB
Login → NextAuth credentials provider → verify password → set JWT cookie
Proxy → check session cookie on every route → redirect if unauthenticated
API Auth → requireAuth() helper reads session server-side
```

### Route Structure
- `/` — Public landing page (no auth required)
- `/login`, `/register` — Public auth pages
- `/home` — Dashboard (requires auth)
- `/habits`, `/gym`, `/food`, `/finance`, `/learning`, `/body-care`, `/reports` — Protected pages
- `/admin/reports` — Admin-only page (not in sidebar, no direct link for regular users)

Proxy redirects:
- Unauthenticated user accessing private route → `/login`
- Authenticated user accessing `/login` or `/register` → `/home`

### Data Isolation
Every MongoDB document has a `userId` field. Repository layer filters by authenticated user's ID on every query. No user can access another user's data.

---

## Phase 1 — COMPLETED

### Features Built
1. **Authentication**
   - Register with username/email/password
   - Login with email/password
   - Session-based auth with JWT cookies
   - Proxy middleware protects all routes
   - Password never returned in API responses

2. **Dashboard**
   - Personalized greeting with Playfair Display heading
   - Uppercase date + "DAILY HABIT OVERVIEW" subtitle
   - Daily/Weekly toggle — different stat cards per view
   - Daily view: Progress ring, Active Streak, Gym This Week, + 4 module stat cards (calories, spending, learning, body care)
   - Weekly view: 4 summary cards + 3 custom SVG bar charts (calories, spending, learning)
   - Consistency Heatmap (GitHub-style, 12 weeks × 7 days, color-scaled)
   - Single bulk DB query for streak (not 365 sequential queries)

3. **Habits Tracker**
   - Create habits with name, description, frequency, color (pastel palette)
   - Edit habits (name, description, frequency, color)
   - Card grid layout with colored backgrounds (not table)
   - Circular day indicators (filled = done, outline = not done) for Mon–Sun
   - "+" dashed card to add new habit
   - Delete with confirmation dialog
   - Toggle completion per day

4. **Gym Tracker**
   - **Workout History**: View past workouts with exercises, sets, weights
   - **Gym Mode** (live session):
     - Session timer (elapsed time)
     - Rest timer (start/stop/reset stopwatch)
     - Add exercises with muscle group
     - Log sets with weight (kg) and reps — rest time auto-recorded
     - Delete individual sets (hover to reveal trash icon)
     - End session → auto-saves as workout to history
   - Delete workouts (with confirmation dialog)

5. **Layout & Design**
   - Public landing page at `/` (hero, features, how-it-works, footer)
   - OrbitLogo SVG component — Saturn-like planet with orbital ring, warm coral tones
   - Light-only warm cream theme (no dark mode)
   - Fonts: DM Sans (body) + Playfair Display (headings)
   - Custom icon sidebar (w-20, fixed left, icon + label stacked)
   - Conditional Admin nav item (Shield icon) visible only for `user.name === "hard4304"`
   - Pastel habit palette: pink, green, purple, peach, blue, yellow
   - Rounded cards (rounded-2xl, shadow-sm), rounded buttons (rounded-xl)
   - User avatar in sidebar footer with Telegram settings + sign out

### Known Decisions
- Hard delete for habits (no soft delete needed for personal app)
- JWT session strategy (not database sessions)
- Light-only warm cream theme (dark mode removed)
- Custom fixed sidebar (dropped shadcn SidebarProvider for simpler control)
- Proxy uses cookie check (not JWT decode) for edge runtime compatibility
- shadcn Calendar + Popover for date pickers (not native HTML input)
- Delete confirmation dialog on all destructive actions (shadcn AlertDialog primitive)
- Edit buttons visible on hover (desktop) / always visible (mobile) using `max-sm:opacity-100 sm:opacity-0 sm:group-hover:opacity-100`

---

## Phase 2 — COMPLETED

### Personal Finance
**Status**: Full CRUD + view modes done.

#### Implemented
- Add and edit expenses (amount, description, category, payment medium, date)
- Categories: food, transport, rent, entertainment, shopping, health, utilities, other
- Payment mediums: UPI, card, cash
- **Daily/Monthly view toggle** — daily shows today's expenses, monthly shows full month
- Summary cards: Total Spent + Transaction Count (with avg per tx in monthly view)
- Delete with confirmation dialog
- Edit via `EditExpenseDialog` (pre-fills all fields)
- Date picker using shadcn Calendar + Popover

#### Data Model (`expense.model.ts`)
```
{
  userId: ObjectId (indexed),
  amount: Number (required),
  category: Enum (required),
  medium: Enum (required),
  date: String YYYY-MM-DD (indexed),
  description: String (required),
}
Indexes: userId+date, userId+category
```

#### API Endpoints
- `GET /api/expenses?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` — Fetch by date range
- `POST /api/expenses` — Create expense (validated by Zod)
- `PATCH /api/expenses/[id]` — Update expense
- `DELETE /api/expenses/[id]` — Delete expense

#### TODO
- [ ] Weekly spending breakdown chart
- [ ] Category-wise pie/bar chart visualization
- [ ] Budget setting per month / per category
- [ ] Recurring expenses (rent, subscriptions)
- [ ] Export to CSV

---

### Food Tracker
**Status**: Search + full CRUD + view modes done.

#### Implemented
- Search food via OpenFoodFacts API (text search, proxied through `/api/food-search`)
- Auto-fill calories, protein, carbs, fat from search results (per 100g)
- Log meals by type: breakfast, lunch, dinner, snack (via dropdown)
- **Daily/Weekly view toggle** — daily shows today, weekly shows Mon–Sun with averages
- Nutrition summary cards: Calories, Protein, Carbs, Fat (with daily averages in weekly view)
- Meal type filter chips
- Delete with confirmation dialog
- Edit via `EditFoodDialog` (edits stored absolute values — calories, protein, carbs, fat, meal, date)
- Date picker using shadcn Calendar + Popover

#### Food Search — OpenFoodFacts Search-a-licious API
- **API**: `https://search.openfoodfacts.org/search` (Elasticsearch-powered, free, no API key)
- **Proxy**: `/api/food-search?q=<query>` — server-side proxy to avoid CORS
- **Debounced live search** (300ms) — auto-searches as you type
- Results filtered to only show products with name AND non-negative calorie data
- No "no results" flash during debounce

#### Data Model (`food-log.model.ts`)
```
{
  userId: ObjectId (indexed),
  date: String YYYY-MM-DD (indexed),
  mealType: Enum (breakfast|lunch|dinner|snack),
  foodName: String (required),
  quantity: Number (required, default: 1),
  servingSize: Number (required, default: 100), // grams
  calories: Number (required),   // total (already scaled)
  protein: Number (optional),    // total (already scaled)
  carbs: Number (optional),      // total (already scaled)
  fat: Number (optional),        // total (already scaled)
}
Index: userId+date
```
**Nutrition scaling**: Values stored in DB are the final totals (per-100g × servingSize/100). The edit dialog works on these totals directly.

#### API Endpoints
- `GET /api/food-logs?date=YYYY-MM-DD` — Fetch by date
- `GET /api/food-logs?startDate=...&endDate=...` — Fetch by range
- `POST /api/food-logs` — Create food log (validated by Zod)
- `PATCH /api/food-logs/[id]` — Update food log
- `DELETE /api/food-logs/[id]` — Delete food log
- `GET /api/food-search?q=<query>` — Search OpenFoodFacts (proxied)

---

## Phase 3 — COMPLETED

### Learning Tracker
**Status**: Full CRUD + views done.

#### Implemented
- Log learnings with title, notes, category, tags, and duration
- Categories: DSA, LLD, HLD, Frontend, Backend, DevOps, General, Work
- **Daily/Weekly/Monthly view toggle** with date-range fetching
- Category filter chips with entry counts
- Summary cards: Entries count, Time Spent, Top Category
- Color-coded category badges (pastel palette)
- Tags support (comma-separated, displayed as chips)
- Duration tracking (minutes, displayed as Xh Ym)
- Edit via `EditLearningDialog` (pre-fills all fields)
- Delete with confirmation dialog
- Date picker using shadcn Calendar + Popover

#### Data Model (`learning.model.ts`)
```
{
  userId: ObjectId (indexed),
  date: String YYYY-MM-DD (indexed),
  category: Enum (dsa|lld|hld|frontend|backend|devops|general|work),
  title: String (required),
  content: String (required, up to 5000 chars),
  tags: [String] (optional, max 10),
  durationMinutes: Number (optional),
}
Indexes: userId+date, userId+category
```

#### API Endpoints
- `GET /api/learnings?date=YYYY-MM-DD` — Fetch by date
- `GET /api/learnings?startDate=...&endDate=...` — Fetch by range
- `GET /api/learnings?category=dsa` — Fetch by category
- `POST /api/learnings` — Create learning (validated by Zod)
- `PATCH /api/learnings/[id]` — Update learning
- `DELETE /api/learnings/[id]` — Delete learning

---

### Body Care Tracker
**Status**: Full CRUD + views done.

#### Implemented
- Log body care routines with type, title, notes, and products
- Types: Skincare, Haircare, Body Care, Other
- **Daily/Weekly/Monthly view toggle** with date-range fetching
- Type filter chips with entry counts
- Summary cards: Entries, Products Used, Top Type
- Color-coded type badges: skincare=pink, haircare=blue, bodycare=green, other=muted
- Products support (comma-separated input, displayed as pill tags)
- Edit via `EditBodyCareDialog` (pre-fills all fields)
- Delete with confirmation dialog

#### Data Model (`body-care.model.ts`)
```
{
  userId: ObjectId (indexed),
  date: String YYYY-MM-DD (indexed),
  type: Enum (skincare|haircare|bodycare|other),
  title: String (required),
  notes: String (optional, up to 2000 chars),
  products: [String] (optional, max 20),
}
Indexes: userId+date, userId+type
```

#### API Endpoints
- `GET /api/body-care?date=YYYY-MM-DD` — Fetch by date
- `GET /api/body-care?startDate=...&endDate=...` — Fetch by range
- `GET /api/body-care?type=skincare` — Fetch by type
- `POST /api/body-care` — Create log (validated by Zod)
- `PATCH /api/body-care/[id]` — Update log
- `DELETE /api/body-care/[id]` — Delete log

---

### Bug/Feature Reporting
**Status**: Full CRUD + admin view done.

#### Implemented
- Submit bug reports and feature requests
- Type selector: Bug, Feature
- Status tracking: Open, In Progress, Done (default: open)
- Optional screenshot URL
- User's reports page at `/reports`
- Admin panel at `/admin/reports` (requires `user.name === "hard4304"`)
  - View all reports from all users
  - Change status per report via dropdown
  - Delete any report
- 403 Forbidden for non-admin access to admin endpoints
- Admin nav item in sidebar (Shield icon) — only visible to admin user

#### Data Model (`report.model.ts`)
```
{
  userId: ObjectId (indexed),
  type: Enum (bug|feature),
  title: String (required),
  description: String (required),
  screenshotUrl: String (optional, URL),
  status: Enum (open|in-progress|done, default: open),
}
Index: userId+status
```

#### API Endpoints
- `GET /api/reports` — Fetch user's reports
- `POST /api/reports` — Create report (validated by Zod)
- `DELETE /api/reports/[id]` — Delete user's report
- `GET /api/admin/reports` — Fetch all reports (admin only)
- `PATCH /api/admin/reports/[id]` — Update report status (admin only)
- `DELETE /api/admin/reports/[id]` — Delete any report (admin only)

---

### Telegram Notifications
**Status**: Webhook-based linking + send utility done.

#### Implemented
- Telegram Bot API integration via webhook
- User links account via deep link (`https://t.me/BOT?start=userId`)
- Webhook captures chatId from `/start userId` command, links to user
- Send messages to linked users via `sendTelegramMessage(chatId, text)`
- Settings dialog in sidebar avatar dropdown (link/unlink/test)
- User profile endpoint (`/api/user/me`) with telegram status

#### Env Vars
- `TELEGRAM_BOT_TOKEN` — Bot API token
- `TELEGRAM_WEBHOOK_SECRET` — Webhook verification secret
- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` — Bot username for deep links
- `CRON_SECRET` — Bearer token for cron endpoint

#### API Endpoints
- `POST /api/telegram/webhook` — Telegram webhook handler (verifies secret)
- `POST /api/telegram/send` — Send message to user's linked Telegram (auth'd)
- `GET /api/user/me` — Get user profile + telegram status
- `PATCH /api/user/me` — Unlink telegram

#### Notification Triggers
- **Habit completion**: When a habit is marked done → Telegram message (fire-and-forget)
- **Report status change**: When admin updates a report status → message to report author
- **Daily summary cron**: `GET /api/cron/daily-summary` (Bearer `CRON_SECRET`) — sends habit + workout summary to all Telegram-linked users

#### Dev Tooling
- `npm run tunnel` — Starts cloudflared/ngrok tunnel and auto-sets Telegram webhook
- `./scripts/set-webhook.sh <url>` — Set Telegram webhook for any URL

---

## Phase 4 — FUTURE

### PWA Support
- Service worker for offline gym mode
- Installable on phone home screen
- Push notifications

### Google OAuth
- Add Google as sign-in option alongside credentials
- Link existing accounts

### Data Export
- CSV/JSON export for any module
- Your data, your ownership

---

## UI/UX Principles
- **Light-only warm cream theme** (no dark mode)
- Fonts: DM Sans (body) + Playfair Display (headings) for warm, editorial feel
- Pastel-colored cards for habits (pink, green, purple, peach, blue, yellow)
- Custom icon sidebar (w-20, icon + label stacked) — not shadcn SidebarProvider
- Dashboard: progress ring, pastel stat cards, GitHub-style consistency heatmap
- Habits: card grid with circular day indicators (not table/checkboxes)
- shadcn Calendar + Popover for all date pickers (not native HTML inputs)
- Mobile-friendly delete/edit buttons (always visible on mobile via `max-sm:opacity-100`)
- Minimal clicks for frequent actions (logging a set, checking a habit)
- Clean typography, no clutter
- Sonner toast notifications for feedback
- Delete confirmation dialog on all destructive actions

## Shared UI Components
| Component | Location | Used In |
|-----------|----------|---------|
| OrbitLogo | `components/ui/orbit-logo.tsx` | Sidebar, auth layout, landing page |
| DatePicker | `components/ui/date-picker.tsx` | All module add/edit dialogs |
| Calendar | `components/ui/calendar.tsx` | DatePicker |
| Popover | `components/ui/popover.tsx` | DatePicker |
| AlertDialog | `components/ui/alert-dialog.tsx` | DeleteConfirmDialog |
| DeleteConfirmDialog | `components/ui/delete-confirm-dialog.tsx` | All 6 module pages |
| ProgressRing | `components/dashboard/progress-ring.tsx` | Dashboard |
| ConsistencyHeatmap | `components/dashboard/consistency-heatmap.tsx` | Dashboard |
| BarChart | `components/dashboard/bar-chart.tsx` | Dashboard (weekly view) |
