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
│   │   ├── ui/               shadcn only (button, sheet, table, pagination, badge)
│   │   └── Badge.tsx         custom atom — semantic variants wrapper
│   ├── molecules/
│   │   ├── PageHeader.tsx    title + description
│   │   ├── Table.tsx         generic table, handle loading/empty/data
│   │   └── Pagination.tsx    page / totalPages / onPageChange
│   ├── organisms/
│   │   ├── Navbar.tsx        responsive navbar + mobile sheet drawer
│   │   └── UserTable.tsx     user columns + pagination
│   ├── templates/
│   │   └── AppLayout.tsx     Navbar + Outlet
│   └── pages/
│       ├── Home.tsx          useQuery → UserTable
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
| 02 — useQuery Dasar | ✅ Done | Fetch user list, loading/empty states, pagination, navbar |
| 03 — useMutation | ⏳ Next | Create, update, delete user |

## Session Resume (22 May 2026)

### What was built

| Komponen | Level | Keterangan |
|----------|-------|------------|
| Navbar | organism | Responsive, hamburger → Sheet (shadcn) |
| AppLayout | template | Navbar + `<Outlet />` + `max-w-6xl` container |
| Badge | atom | Custom — primary/secondary/success/warning/info/error/muted |
| PageHeader | molecule | title + description props |
| Table | molecule | Generic `<T>`, loading skeleton, empty state, data render |
| Pagination | molecule | page / totalPages / onPageChange |
| UserTable | organism | Columns + Badge render + Pagination — no fetching |
| Home | page | `useQuery(["users"], getUsers)` → `UserTable` |

### State management pattern

```
Page (query + state) → Organism (logic + props) → Molecule (render only) → Atom (UI only)
```

### Data flow

```
Home.tsx
  ├── useQuery → { data: users, isLoading }
  └── UserTable(data={users ?? []}, isLoading={isLoading})
        ├── Table(columns, data=slice(page))
        ├── Pagination(page, totalPages, onPageChange)
        └── Badge(row.render) — inline via column def
```

### Next up — Chapter 03: useMutation

- `createUser`, `updateUser`, `deleteUser`
- `useMutation` + `queryClient.invalidateQueries()`
- Optimistic updates
- Form component + dialog/modal
