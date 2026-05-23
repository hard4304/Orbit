# Orbit — Codebase Guide

> This document explains every folder and file in the project. Read this to understand how the code is organized and what each piece does.

---

## Root Files

| File | Purpose |
|---|---|
| `package.json` | Dependencies and scripts (`npm run dev`, `npm run build`) |
| `tsconfig.json` | TypeScript config. `@/*` maps to `src/*`, `@tests/*` maps to `tests/*` |
| `next.config.ts` | Next.js configuration |
| `components.json` | shadcn/ui configuration (component paths, styling) |
| `.env.local` | Environment variables (MongoDB URI, auth secret, Telegram token). **Never commit this.** |
| `vitest.config.ts` | Vitest config for integration tests |

---

## `src/` — All Source Code

### `src/proxy.ts` — Route Protection Middleware

Runs before every page request. Checks if user has a session cookie:
- **No cookie + private route** → redirect to `/login`
- **Has cookie + public route** (`/`, `/login`, `/register`) → redirect to `/home`
- **API routes** → skip (they have their own auth via `requireAuth()`)

Public routes: `/`, `/login`, `/register`
Private routes: everything else (redirects to `/login` if no session)

---

### `src/app/` — Pages & API Routes

Next.js App Router: folder structure = URL structure.

#### `src/app/layout.tsx` — Root Layout
Wraps the entire app. Sets up fonts, `SessionProvider`, `ThemeProvider` (no-op shell, light only), `TooltipProvider`, `Toaster` (Sonner toasts), global CSS.

#### `src/app/page.tsx` — Public Landing Page (`/`)
Standalone page (no sidebar). Sections: Navbar → Hero → Features (7 module cards) → How It Works (3 steps) → Footer. Uses `OrbitLogo`, warm cream theme. CTAs: "Get Started" → `/register`, "Sign In" → `/login`.

#### `src/app/(auth)/` — Auth Pages
Route group `(auth)` — doesn't affect URL.
- `layout.tsx` — Centered card layout with `OrbitLogo` branding
- `login/page.tsx` — Login form. Redirects to `/home` on success.
- `register/page.tsx` — Register form. POSTs to `/api/auth/register`, then redirects to login.

#### `src/app/(dashboard)/` — Protected Pages
Route group `(dashboard)` — shares a sidebar layout.
- `layout.tsx` — Fixed sidebar + main content (`ml-20`)
- `home/page.tsx` — Dashboard (`/home`). Daily/weekly toggle. Habits, gym, streak, module stat cards.
- `habits/page.tsx` — Habits tracker (`/habits`). Card grid with weekly day indicators.
- `gym/page.tsx` — Gym tracker (`/gym`). Tabs: Workout History | Gym Mode.
- `finance/page.tsx` — Personal Finance (`/finance`). Daily/monthly toggle.
- `food/page.tsx` — Food Tracker (`/food`). Daily/weekly toggle.
- `learning/page.tsx` — Learning Journal (`/learning`). Daily/weekly/monthly toggle.
- `body-care/page.tsx` — Body Care Log (`/body-care`). Daily/weekly/monthly toggle.
- `reports/page.tsx` — Bug & Feature Reports (`/reports`).
- `admin/reports/page.tsx` — Admin report panel (`/admin/reports`). Not in sidebar.

#### `src/app/api/` — Backend API Routes

Each `route.ts` exports HTTP method handlers (`GET`, `POST`, `PATCH`, `DELETE`).

| Route | Methods | Purpose |
|---|---|---|
| `api/auth/[...nextauth]/route.ts` | GET, POST | NextAuth handler |
| `api/auth/register/route.ts` | POST | User registration |
| `api/dashboard/route.ts` | GET | Dashboard stats (single bulk queries, no N+1) |
| `api/habits/route.ts` | GET, POST | List habits / create habit |
| `api/habits/[id]/route.ts` | PATCH, DELETE | Update / delete habit |
| `api/habits/[id]/log/route.ts` | POST | Toggle habit completion for a date |
| `api/expenses/route.ts` | GET, POST | List expenses / create expense |
| `api/expenses/[id]/route.ts` | PATCH, DELETE | Update / delete expense |
| `api/food-logs/route.ts` | GET, POST | List food logs / create log |
| `api/food-logs/[id]/route.ts` | PATCH, DELETE | Update / delete food log |
| `api/food-search/route.ts` | GET | Proxy to OpenFoodFacts search |
| `api/learnings/route.ts` | GET, POST | List learnings / create learning |
| `api/learnings/[id]/route.ts` | PATCH, DELETE | Update / delete learning |
| `api/body-care/route.ts` | GET, POST | List body care logs / create log |
| `api/body-care/[id]/route.ts` | PATCH, DELETE | Update / delete body care log |
| `api/workouts/route.ts` | GET, POST | List workouts / create workout |
| `api/workouts/[id]/route.ts` | DELETE | Delete a workout |
| `api/gym-sessions/route.ts` | GET, POST | Get active session / start session |
| `api/gym-sessions/[id]/route.ts` | PATCH | Actions: `add-exercise`, `add-set`, `remove-set`, `end` |
| `api/reports/route.ts` | GET, POST | User's reports |
| `api/reports/[id]/route.ts` | DELETE | Delete user's report |
| `api/admin/reports/route.ts` | GET | All reports (admin only) |
| `api/admin/reports/[id]/route.ts` | PATCH, DELETE | Admin update/delete report |
| `api/telegram/webhook/route.ts` | POST | Telegram webhook handler |
| `api/telegram/send/route.ts` | POST | Send Telegram message to current user |
| `api/user/me/route.ts` | GET, PATCH | User profile + telegram link/unlink |
| `api/cron/daily-summary/route.ts` | GET | Daily summary cron (Bearer CRON_SECRET) |

**Pattern**: Every API route calls `requireAuth()` → calls service → returns `ApiResponse<T>`.

---

### `src/lib/` — Backend Logic

#### `src/lib/db/mongoose.ts` — Database Connection
Singleton MongoDB Atlas connection. Caches globally to avoid reconnecting on every serverless request.

#### `src/lib/models/` — Mongoose Schemas

| File | Collections | Key Fields |
|---|---|---|
| `user.model.ts` | `users` | username, email, password (hashed), telegramChatId, telegramLinked |
| `habit.model.ts` | `habits`, `habitlogs` | Habit: name, frequency, color, userId. HabitLog: habitId, date, completed |
| `workout.model.ts` | `workouts`, `gymsessions` | Workout: date, exercises[], duration. GymSession: startedAt, exercises[], isActive |
| `expense.model.ts` | `expenses` | amount, category, medium, date, description, userId |
| `food-log.model.ts` | `foodlogs` | date, mealType, foodName, calories, protein, carbs, fat, userId |
| `learning.model.ts` | `learnings` | date, category, title, content, tags[], durationMinutes, userId |
| `body-care.model.ts` | `bodycarelogs` | date, type, title, notes, products[], userId |
| `report.model.ts` | `reports` | type, title, description, status, userId |

**Indexes**: Every model indexes on `userId`. HabitLog has unique compound index on `(habitId, date)`.

#### `src/lib/repositories/` — Database Access Layer

Pure data operations. No business logic.

| File | Key Methods |
|---|---|
| `user.repository.ts` | findByEmail, findByUsername, create, updateTelegram |
| `habit.repository.ts` | findByUserId, create, update, delete, upsertLog, findLogsByDateRange |
| `workout.repository.ts` | CRUD for workouts + gym session lifecycle (create, addExercise, updateExercises, end) |
| `expense.repository.ts` | create, getByDateRange, updateExpense, deleteExpense |
| `food.repository.ts` | create, getByDate, getByDateRange, updateFoodLog, deleteFoodLog |
| `learning.repository.ts` | create, getByDate, getByDateRange, update, delete |
| `body-care.repository.ts` | create, getByDate, getByDateRange, getByType, update, delete |
| `report.repository.ts` | create, findByUserId, findAll, updateStatus, delete |

#### `src/lib/services/` — Business Logic Layer

| File | Key Logic |
|---|---|
| `auth.service.ts` | Registration (check duplicates, hash password), credential validation |
| `habit.service.ts` | CRUD delegation, streak calculation |
| `workout.service.ts` | CRUD delegation, gym session management, set deletion, auto-save on end |
| `expense.service.ts` | CRUD delegation with Zod validation, updateExpense |
| `food.service.ts` | CRUD delegation with Zod validation, updateFoodLog |
| `learning.service.ts` | CRUD delegation with Zod validation, updateLearning |
| `body-care.service.ts` | CRUD delegation with Zod validation, update |
| `report.service.ts` | User and admin CRUD, status updates |

**Gym session set deletion** (`workout.service.removeSetFromExercise`):
1. Fetches active session to verify ownership
2. Splices out the set at `setIndex` from `exercises[exerciseIndex].sets`
3. Re-numbers remaining sets (`setNumber = index + 1`)
4. Writes updated exercises array back via `updateSessionExercises`

#### `src/lib/validators/` — Zod Schemas

| File | Validates |
|---|---|
| `auth.validator.ts` | Registration (username, email, password), login |
| `habit.validator.ts` | Habit creation, log entry (date format, boolean) |
| `workout.validator.ts` | Workout creation, exercise (name, muscle group), set (weight, reps) |
| `expense.validator.ts` | Expense creation (amount, category, medium, date) |
| `food-log.validator.ts` | Food log creation (nutrition values, meal type, date) |
| `learning.validator.ts` | Learning creation (category, title, content, tags, duration) |
| `body-care.validator.ts` | Body care log creation (type, title, notes, products) |
| `report.validator.ts` | Report creation (type, title, description) |

#### `src/lib/middleware/`

| File | Purpose |
|---|---|
| `auth.ts` | `requireAuth()` — reads NextAuth session server-side, throws 401 if not logged in. `requireAdmin()` — additionally checks `user.name === "hard4304"`, throws 403 if not admin. |
| `error-handler.ts` | `handleApiError()` — catches Zod errors, auth errors, and unexpected errors; returns appropriate HTTP status codes |

#### `src/lib/telegram.ts` — Telegram Bot Utilities
`sendTelegramMessage(chatId, text)` — calls Telegram Bot API. Fire-and-forget (non-blocking).

#### `src/lib/notifications.ts` — Notification Helpers
`sendHabitReminder()`, `sendReportStatusUpdate()`, `sendDailySummary()` — compose and send Telegram messages.

---

### `src/components/` — React Components

#### `src/components/ui/` — shadcn/ui Primitives + Custom UI

| File | Purpose |
|---|---|
| `orbit-logo.tsx` | SVG logo — Saturn-like planet with orbital ring, warm coral/brown tones. `size` prop for scaling. |
| `alert-dialog.tsx` | shadcn AlertDialog primitive |
| `delete-confirm-dialog.tsx` | Reusable delete confirmation wrapper. Props: `open`, `onOpenChange`, `onConfirm`, `title`, `description`, `loading` |
| `button.tsx` | shadcn Button (supports `size="icon-xs"`) |
| `card.tsx` | shadcn Card |
| `input.tsx` | shadcn Input |
| `label.tsx` | shadcn Label |
| `select.tsx` | shadcn Select |
| `dialog.tsx` | shadcn Dialog |
| `textarea.tsx` | shadcn Textarea |
| `tabs.tsx` | shadcn Tabs |
| `badge.tsx` | shadcn Badge |
| `separator.tsx` | shadcn Separator |
| `dropdown-menu.tsx` | shadcn DropdownMenu |
| `avatar.tsx` | shadcn Avatar |
| `calendar.tsx` | shadcn Calendar |
| `date-picker.tsx` | DatePicker wrapper (Calendar + Popover). Props: `value: string`, `onChange: (v: string) => void` |
| `popover.tsx` | shadcn Popover |
| `sonner.tsx` | Toaster from Sonner |
| `tooltip.tsx` | shadcn Tooltip |

#### `src/components/layout/` — App Shell

| File | Purpose |
|---|---|
| `app-sidebar.tsx` | Fixed sidebar with navigation links, OrbitLogo, user avatar dropdown, conditional Admin item (Shield icon for `hard4304`), Telegram settings, sign out |
| `telegram-settings-dialog.tsx` | Link/unlink Telegram dialog (shown from avatar dropdown) |
| `session-provider.tsx` | Client-side NextAuth `SessionProvider` wrapper |
| `theme-provider.tsx` | No-op theme provider shell (light-only, dark mode removed) |

#### `src/components/dashboard/`

| File | Purpose |
|---|---|
| `progress-ring.tsx` | SVG circular progress ring. Props: `value` (0–100), `size`, `strokeWidth` |
| `consistency-heatmap.tsx` | GitHub-style 7×12 grid. Color-scaled by completion count. |
| `bar-chart.tsx` | Custom SVG bar chart (7 bars, Mon–Sun). Used for weekly calories, spending, learning. |

#### `src/components/habits/`

| File | Purpose |
|---|---|
| `add-habit-dialog.tsx` | Create habit (name, description, frequency, color picker) |
| `edit-habit-dialog.tsx` | Edit habit — pre-fills from `IHabit`, calls `PATCH /api/habits/:id` |

#### `src/components/gym/`

| File | Purpose |
|---|---|
| `gym-mode.tsx` | Live session UI: session timer, rest stopwatch, add exercise, log set, delete set (hover trash icon per set), end session |
| `workout-history.tsx` | Past workouts with exercises, sets, weights, and delete (confirm dialog) |

#### `src/components/finance/`

| File | Purpose |
|---|---|
| `add-expense-dialog.tsx` | Create expense (amount, description, category, medium, date) |
| `edit-expense-dialog.tsx` | Edit expense — pre-fills from `IExpense`, calls `PATCH /api/expenses/:id` |

#### `src/components/food/`

| File | Purpose |
|---|---|
| `log-food-dialog.tsx` | Log food with OpenFoodFacts search, quantity (grams), and manual entry |
| `edit-food-dialog.tsx` | Edit food log — edits stored totals (calories, protein, carbs, fat, meal, date), calls `PATCH /api/food-logs/:id` |

#### `src/components/learning/`

| File | Purpose |
|---|---|
| `add-learning-dialog.tsx` | Log learning (title, content, category, tags, duration, date) |
| `edit-learning-dialog.tsx` | Edit learning — pre-fills all fields, calls `PATCH /api/learnings/:id` |

#### `src/components/body-care/`

| File | Purpose |
|---|---|
| `add-body-care-dialog.tsx` | Log body care (type, title, notes, products, date) |
| `edit-body-care-dialog.tsx` | Edit body care — pre-fills all fields, calls `PATCH /api/body-care/:id` |

#### `src/components/reports/`

| File | Purpose |
|---|---|
| `add-report-dialog.tsx` | Submit bug/feature report |

---

### `src/types/index.ts` — TypeScript Type Definitions

All shared interfaces and DTOs. Key types:
- `IUser`, `IHabit`, `IHabitLog`, `IWorkout`, `IGymSession` — document shapes
- `IExpense`, `IFoodLog`, `ILearning`, `IBodyCareLog`, `IReport` — document shapes
- `CreateHabitDTO`, `CreateExpenseDTO`, `CreateFoodLogDTO`, etc. — API input shapes
- `ExpenseCategory`, `PaymentMedium`, `MealType`, `LearningCategory`, `BodyCareType`, `MuscleGroup` — union types
- `ApiResponse<T>` — standard `{ success: boolean; data?: T; error?: string }`

---

## Data Flow Example: "User edits an expense"

```
1. User clicks pencil icon on expense row (hover visible)
2. EditExpenseDialog opens, pre-filled with IExpense data (useEffect on prop change)
3. User edits amount/description, clicks Save
4. finance/page.tsx → handleSubmit() → PATCH /api/expenses/{id}
5. API route → requireAuth() → expenseService.updateExpense()
6. Service → expenseRepository.updateExpense() → findOneAndUpdate({_id, userId})
7. Returns updated IExpense → page updates local state via setExpenses(prev.map(...))
8. Toast: "Expense updated"
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `AUTH_SECRET` | Random string for signing JWT tokens |
| `AUTH_URL` | Base URL of the app (`http://localhost:3000`) |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot API token |
| `TELEGRAM_WEBHOOK_SECRET` | Webhook verification secret |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | Bot username (e.g. `mybot`) for deep links |
| `CRON_SECRET` | Bearer token for `/api/cron/daily-summary` |

---

## Tests

Located in `tests/`. Run with `npm test` (requires running dev server + DB).

| File | What it tests |
|---|---|
| `tests/routes/protection.test.ts` | Unauthenticated access: API returns 401, `/` is public (200), `/home` redirects to login, PATCH endpoints return 401 |
| `tests/helpers/api-client.ts` | Test client with `get`, `post`, `patch`, `delete`, `raw`, `login`, `register` helpers |

**Note**: Integration tests hit the live server at `TEST_BASE_URL` (default: `http://localhost:3000`). Start `npm run dev` and have MongoDB running before running tests.
