# learn-tanstack_query

## Proyek

TanStack Query v5 + React + Vite + TypeScript + Tailwind v4 + shadcn/ui.  
JSON Server di `api/db.json` (port 3001).

## Commit History

| Hash | Message |
|------|---------|
| `9617b6f` | `feat: setup QueryClient provider and devtools` |
| `cf59f06` | `feat: replace legacy styles with tailwind v4 and shadcn/ui` |
| `7fa1afd` | `feat: restructure to atomic design folders` |
| `12c20a6` | `feat: configure theming and fix eslint config` |
| `HEAD` | `feat: implement useQuery dasar with user list and navbar layout` |

## Struktur Folder

```
src/
├── api/
│   ├── http.ts               axios instance
│   └── users.ts              user CRUD fetcher
├── assets/
│   └── styles/app.css        tailwind + shadcn vars + semantic colors
├── components/
│   ├── atoms/
│   │   ├── ui/               shadcn only (button, sheet, table, pagination, badge, dialog, alert-dialog, input, label, select, checkbox)
│   │   └── Badge.tsx         custom atom — semantic variants wrapper
│   ├── molecules/
│   │   ├── PageHeader.tsx    title + description + action slot
│   │   ├── Table.tsx         generic table, handle loading/empty/data
│   │   ├── Pagination.tsx    page / totalPages / onPageChange
│   │   └── UserFilters.tsx   search name + role select + status select
│   ├── organisms/
│   │   ├── Navbar.tsx        responsive navbar + mobile sheet drawer
│   │   ├── UserTable.tsx     user columns + actions (edit/delete) + pagination
│   │   └── UserForm.tsx      form fields layout (name, email, role, active)
│   ├── templates/
│   │   └── AppLayout.tsx     Navbar + Outlet
│   └── pages/
│       ├── Home.tsx          useQuery(["users", filters]) → UserTable
│       ├── UsersCreate.tsx   create user form page (no mutation yet)
│       ├── UsersEdit.tsx     edit user form page + delete alert dialog (no mutation yet)
│       ├── Posts.tsx         placeholder
│       ├── Comments.tsx      placeholder
│       └── About.tsx         placeholder
├── utils/classname.ts        cn()
├── App.tsx                   layout route pattern
├── main.tsx                  QueryClient + Provider + DevTools
```

## Konvensi

| Aturan | Nilai |
|--------|-------|
| Package manager | `bun` |
| CSS imports | `src/assets/styles/` |
| Images | `src/assets/images/` |
| shadcn `utils` alias | `@/utils/classname` |
| shadcn `ui` alias | `@/components/atoms/ui` |
| Atomic structure | atoms, molecules, organisms, templates, pages |
| Atoms `ui/` folder | Hanya untuk file shadcn — jangan dimodif |
| Custom atoms | Langsung di `atoms/` (bukan `atoms/ui/`) |
| Atom import bentrok | Import atom shadcn sebagai `UiXxx` |
| Komentar di JSX | Tidak ada — nol komentar `{/* ... */}` |
| Commit message | `feat:`, `fix:`, `chore:` — tanpa scope, tanpa emoji |
| Export | Named export (`export function`) bukan `export default` |
| State management | Hooks/state di organism & page — molecule pure props |
| Data fetching | Molecule tidak boleh fetching — hanya Page atau Organism |
| `useState` | Hanya di Page — organism terima props, molecule pure render |

## Color System (dari app.css)

| Variable | Light | Dark | Tailwind class |
|----------|-------|------|----------------|
| `--primary` | Hijau pastel | Hijau lebih terang | `bg-primary`, `text-primary-foreground` |
| `--success` | Hijau | Hijau gelap | `bg-success` |
| `--warning` | Kuning | Kuning gelap | `bg-warning` |
| `--info` | Biru | Biru gelap | `bg-info` |
| `--destructive` | Merah | Merah | `bg-destructive` |

## Status Chapter

| Chapter | Status | Catatan |
|---------|--------|---------|
| 01 — Setup & QueryClient | ✅ Done | QueryClient, Provider, DevTools |
| 02 — useQuery Dasar | ✅ Done | Fetch user list, loading/empty states, pagination, navbar, filtering |
| 03 — Query Keys Dinamis | ⏳ Next | Query key dependency, `enabled`, cache behavior, hierarchical invalidation |
| 04 — useMutation | ⏳ | Create, update, delete user via `useMutation` + `invalidateQueries` |
| 05 — Optimistic Update | ⏳ | Cache update before server response |
| 06-07 — Pagination & Infinite Query | ⏳ | Server-side pagination, `useInfiniteQuery` |
| 08-14 — Advanced | ⏳ | Refetch, retry, stale time, parallel & dependent query |

## Session Resume (22 May 2026)

### What was built

| Komponen | Level | Keterangan |
|----------|-------|------------|
| Navbar | organism | Responsive, hamburger → Sheet (shadcn) |
| AppLayout | template | Navbar + `<Outlet />` + `max-w-6xl` container |
| Badge | atom | Custom — primary/secondary/success/warning/info/error/muted |
| PageHeader | molecule | title + description + action slot |
| Table | molecule | Generic `<T>`, loading skeleton, empty state, data render |
| Pagination | molecule | page / totalPages / onPageChange |
| UserFilters | molecule | search name + role select + status select — pure props |
| UserTable | organism | Columns + Badge render + Actions (Edit/Delete) + Pagination — no fetching |
| UserForm | organism | Form fields layout (name, email, role, active) |
| Home | page | `useQuery(["users", filters], getUsers)` + filter state → `UserTable` |
| UsersCreate | page | Create user form (no mutation yet) |
| UsersEdit | page | Edit user form + delete AlertDialog (no mutation yet) |

### State management pattern

```
Page (query + state) → Organism (logic + props) → Molecule (render only) → Atom (UI only)
```

### Data flow

```
Home.tsx
  ├── useQuery → { data: users, isLoading }
  │   queryKey: ["users", filters]  ← refetch otomatis saat filter berubah
  └── UserTable(data={users ?? []}, isLoading={isLoading})
        ├── Table(columns, data=slice(page))
        ├── Pagination(page, totalPages, onPageChange)
        └── Badge(row.render) — inline via column def
```

### Next up — Chapter 03: Query Keys Dinamis

- Dynamic query key dengan filter dependency (partial — sudah di Home.tsx)
- `enabled` — conditional fetching (belum)
- Cache behavior: beda key = beda cache, instant return saat pilih key yang sudah pernah dipakai
- Hierarchical invalidation: `['posts']` mencakup `['posts', 1]`, `['posts', 'byUser', 2]`, dll
- Praktik dengan posts/byUser, posts detail
