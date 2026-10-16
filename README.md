# Expense Tracker — Mobile App (Expo + React Native)

A mobile expense tracker where a signed-in user can record daily expenses, categorize
them, view spending summaries, and filter/search their transaction history. All data is
persisted through a REST API (Express) with JWT authentication — not local mock data.

Built for the Mobile App Developer practical assignment.

---

## Demo

| Screen | What it shows |
| --- | --- |
| Login / Register | Email + password validation, server error messages |
| Dashboard | Current-month total, expense count, category-wise breakdown |
| Expenses | Newest-first list, search, category filter, date-range filter, pull-to-refresh |
| Add / Edit | Form with validation, native date picker, delete with confirmation |
| Profile | Account info, session storage details, logout confirmation |

> Add your screenshots / screen recording to a `docs/` folder and reference them here.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| App | React Native + **Expo SDK 58**, TypeScript |
| Navigation | **Expo Router** (file-based, `Stack.Protected` route guards) |
| Secure storage | `expo-secure-store` (iOS Keychain / Android Keystore) |
| Date input | `@react-native-community/datetimepicker` |
| State | React Context + hooks (no Redux needed at this scale) |
| Backend | Node + **Express**, `jsonwebtoken`, `bcryptjs` |
| Persistence | File-backed JSON store (isolated behind a single module) |

---

## Project structure

```
mobileapp/
├── src/
│   ├── app/                     # Expo Router routes (file = screen)
│   │   ├── _layout.tsx          # SessionProvider + protected route guards
│   │   ├── login.tsx            # Public
│   │   ├── register.tsx         # Public
│   │   └── (app)/               # Authenticated group (tabs)
│   │       ├── _layout.tsx      # Bottom tabs
│   │       ├── index.tsx        # Dashboard
│   │       ├── expenses.tsx     # List + search + filters
│   │       ├── expense-form.tsx # Add / Edit (modal-less route)
│   │       └── profile.tsx      # Account + logout
│   ├── components/              # Reusable UI (Button, TextField, Card, …)
│   ├── constants/               # theme + categories
│   ├── context/AuthContext.tsx  # Session state + SecureStore persistence
│   ├── hooks/                   # useExpenses (fetch/refresh/retry/focus)
│   ├── services/                # ★ ALL HTTP calls live here
│   │   ├── api.ts               # fetch wrapper, token injection, ApiError
│   │   ├── auth.ts              # login / register / me
│   │   └── expenses.ts          # list / get / create / update / delete
│   ├── types/                   # shared TypeScript types
│   └── utils/                   # formatting + validation helpers
└── server/
    ├── src/
    │   ├── index.ts             # Express app
    │   ├── auth.ts              # JWT sign/verify + requireAuth middleware
    │   ├── validate.ts          # server-side validation
    │   ├── store.ts             # file-backed data store
    │   └── routes/
    │       ├── auth.ts          # /api/auth/*
    │       └── expenses.ts      # /api/expenses/* (scoped to the user)
    └── package.json
```

---

## Prerequisites

- **Node.js 18+** (developed on Node 22)
- **Expo Go** app on your phone, matching **Expo SDK 58**
  (get it from https://expo.dev/go — the store version can lag behind a new SDK)
- Phone and computer on the **same Wi-Fi network**
- No Android Studio / Xcode required for the Expo Go path

---

## Setup & run

### 1. Install dependencies

```bash
# Mobile app (project root)
npm install

# Backend
cd server && npm install && cd ..
```

### 2. Configure the API URL

Copy the example file and set it to your computer's LAN IP:

```bash
cp .env.example .env
```

```dotenv
# .env
EXPO_PUBLIC_API_URL=http://192.168.1.200:4000   # ← your LAN IP
```

Find your LAN IP:

- Windows: `ipconfig` → "IPv4 Address"
- macOS/Linux: `ifconfig` or `ip addr`

| Target | Base URL |
| --- | --- |
| Physical device (Expo Go) | `http://<your-lan-ip>:4000` |
| Android emulator | `http://10.0.2.2:4000` |
| iOS simulator | `http://localhost:4000` |

### 3. Start the backend (terminal 1)

```bash
cd server
npm start
# → Expense Tracker API listening on http://0.0.0.0:4000
```

Optional env vars: `PORT` (default `4000`) and `JWT_SECRET` (defaults to a dev value —
set a real secret in production).

### 4. Start the app (terminal 2)

```bash
npm start
# or: npx expo start
```

Scan the QR code with **Expo Go**. If Windows Firewall prompts, allow Node.js so your
phone can reach the API.

### 5. Typecheck

```bash
npx tsc --noEmit            # app
cd server && npx tsc --noEmit   # backend
```

---

## API reference

Base URL: `http://<host>:4000`. All expense endpoints require
`Authorization: Bearer <token>`.

| Method | Endpoint | Body / Query | Notes |
| --- | --- | --- | --- |
| `GET` | `/api/health` | – | Liveness check |
| `POST` | `/api/auth/register` | `{ name, email, password }` | Returns `{ token, user }` |
| `POST` | `/api/auth/login` | `{ email, password }` | Returns `{ token, user }` |
| `GET` | `/api/auth/me` | – | Current user (auth) |
| `GET` | `/api/expenses` | `?category=&from=&to=&search=` | Newest first, own rows only |
| `GET` | `/api/expenses/:id` | – | Single expense |
| `POST` | `/api/expenses` | `{ title, amount, category, date, note? }` | Server-validated |
| `PUT` | `/api/expenses/:id` | same as POST | Owner only |
| `DELETE` | `/api/expenses/:id` | – | Owner only |

**Validation rules (enforced on client *and* server)**

- `title` — required, non-empty after trim
- `amount` — required, number **> 0**
- `category` — one of `Food, Travel, Shopping, Bills, Health, Other`
- `date` — valid `YYYY-MM-DD`
- `email` — valid format; `password` — min 6 chars; `name` — min 2 chars

**Status codes:** `400` validation · `401` bad credentials / missing token ·
`404` not found / not owned · `409` email already registered · `500` server error.

---

## Data model

```ts
Expense { id, userId, title, amount, category, date, note?, createdAt, updatedAt }
User    { id, name, email, passwordHash }   // passwordHash = bcrypt, never plaintext
```

Users can only ever read/modify expenses where `userId` matches the JWT subject —
enforced in the store queries on the server.

---

## Assumptions & incomplete features

- **Backend, not a mock API.** The assignment allows either; this submission builds a
  real Express API. There is no mock mode. To swap in another API, only
  `src/services/*.ts` needs to change — no screen imports `fetch` directly.
- **File-backed store.** Data is persisted to `server/data/db.json` (gitignored).
  It's isolated in `server/src/store.ts`, so replacing it with SQLite/Postgres is a
  single-module change. Not suitable for concurrent production traffic.
- **Currency** is hard-coded to INR (`₹`) in `src/utils/format.ts`.
- **Monthly summary** is computed on the client from the fetched month's expenses,
  which is why the dashboard updates instantly after add/edit/delete. There is no
  dedicated summary endpoint.
- **JWT expiry** is 7 days; there is no refresh-token flow. An expired/invalid token
  triggers an automatic sign-out back to the login screen.
- **Not yet verified on a physical device** at the time of writing — typecheck passes
  for both projects. Run through the demo script below before submitting.
- The default Expo template `README`/`LICENSE` and `scripts/reset-project.js` remain
  untouched.

---

## Demo script (for screenshots / recording)

1. **Register** a new account → lands on Dashboard.
2. **Dashboard** shows `₹0.00` and "0 expenses".
3. **Add expense** — title "Lunch", amount `250.5`, Food, today's date, note.
4. Dashboard updates: total and Food segment appear.
5. Add a couple more in other categories.
6. **Expenses** tab → search "lunch" → filter by category → set a date range.
7. **Edit** an expense → change the amount → save → totals refresh.
8. **Delete** an expense → confirm → it disappears.
9. **Profile** → Sign out (confirm) → back to Login.
10. Kill the server → pull-to-refresh → **network-error state with Retry**.
# Expense-Tracker-MobileApp
