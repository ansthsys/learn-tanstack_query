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
| `4c761a0` | `feat: implement useQuery dasar with user list and navbar layout` |
| `61ed7e0` | `feat: setup UI untuk create, edit, delete user` |
| `b194b2a` | `feat: add user filtering (search name, role, status)` |
| `a11edb5` | `chore: fix agents chapter numbering and update structure` |
| `afb808a` | `feat: implement chapter 03 - query keys dinamis` |
| `0a5a37e` | `feat: implement create, edit, delete user mutation` |
| `e03e359` | `chore: align id types in posts and comments` |

## Struktur Folder

```
src/
├── api/
│   ├── http.ts               axios instance
│   ├── users.ts              user CRUD fetcher
│   ├── posts.ts              post CRUD fetcher + getPostsByUser
│   └── comments.ts           comment CRUD fetcher + getCommentsByPost
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
│       ├── UsersCreate.tsx   create user form page + useMutation(createUser)
│       ├── UsersEdit.tsx     edit/delete user page — inner/outer + dirtyFields
│       ├── Posts.tsx         3 query key demos + hierarchical invalidation
│       ├── Comments.tsx      dependent query — post → comments
│       ├── NotFound.tsx      404 page (user not found + catch-all route)
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
| 03 — Query Keys Dinamis | ✅ Done | Query key dependency, `enabled`, cache behavior, hierarchical invalidation |
| 04 — useMutation | ✅ Done | Controlled form + useMutation, invalidateQueries, navigate, delete user |
| 05 — Optimistic Update | ⏳ | Comment create/delete — cache update before server response |
| 06 — Server Pagination | ⏳ | Posts list — `_page`/`_limit` + pagination button |
| 07 — Infinite Query | ⏳ | Comments — `useInfiniteQuery` + load more |
| 08-14 — Advanced | ⏳ | Refetch, retry, stale time, parallel & dependent query |

## Session Resume (29 May 2026)

### Chapter 04 — useMutation ✅ Done

| File | Perubahan |
|------|-----------|
| `UsersCreate.tsx` | `useMutation(createUser)`, `onSuccess` → invalidate + navigate, validasi form |
| `UsersEdit.tsx` | inner/outer pattern, dirtyFields, `useQuery` load user, `updateMutation`, `deleteMutation` |
| `UserTable.tsx` | delete AlertDialog wired ke `deleteMutation` |
| `NotFound.tsx` | 404 halaman untuk user tidak ditemukan + catch-all route |
| `UserForm.tsx` | fix import path, `void` wrapper di submit |
| `vite.config.ts` | `server.watch.ignored` untuk cegah HMR reload saat json-server nulis |

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

### Strategy Chapters 05-07

| Chapter | Konsep | Implementasi |
|---------|--------|--------------|
| 05 | Optimistic Update | Comment create/delete — `onMutate` insert cache, `onError` rollback, `onSettled` refetch |
| 06 | Server Pagination | Posts list — ganti `_page`/`_limit` + `Link` header `totalCount` + pagination button |
| 07 | Infinite Query | Comments — `useInfiniteQuery` + load more button |

### Files terkait 05-07

| File | Peran |
|------|-------|
| `src/api/posts.ts` | CRUD + `getPosts` (akan pake `_page`/`_limit` di chapter 06) |
| `src/api/comments.ts` | CRUD + `getCommentsByPost` (akan pake `useInfiniteQuery` di chapter 07) |
| `src/components/pages/Posts.tsx` | Query demo (saat ini). Di chapter 06: tambah pagination server |
| `src/components/pages/Comments.tsx` | Dependent query (saat ini). Di chapter 05 + 07: tambah form create, delete, infinite |
| `src/components/molecules/Table.tsx` | Generic table (bisa dipakai ulang untuk posts) |
