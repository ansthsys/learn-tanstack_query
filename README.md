# Belajar TanStack Query — Silabus Lengkap

> Stack: React + Vite + TanStack Query v5 + JSON Server (dummy backend)

---

## Setup Proyek (Lakukan Sekali)

```bash
# 1. Buat proyek Vite
bun create vite@latest tanstack-learn -- --template react
cd tanstack-learn

# 2. Install dependencies
bun add @tanstack/react-query @tanstack/react-query-devtools
bun add -D json-server

# 3. Buat file db.json (dummy backend)
# → lihat file db.json di silabus ini

# 4. Tambahkan script di package.json
# "server": "json-server --watch ./api/db.json --port 3001"

# 5. Jalankan dua terminal:
bun run dev       # terminal 1 → React di port 5173
bun run server    # terminal 2 → JSON Server di port 3001
```

---

## Struktur Folder yang Dipakai

```
src/
├── api/            ← semua fungsi fetcher
├── hooks/          ← custom hooks useQuery/useMutation
├── components/     ← UI komponen
├── pages/          ← halaman per chapter
└── main.jsx        ← QueryClient setup
```

---

## Silabus

| Chapter | Topik | Konsep Utama |
|---------|-------|--------------|
| 01 | Setup & QueryClient | Provider, DevTools |
| 02 | useQuery Dasar | queryKey, queryFn, states |
| 03 | Query States & UI | isLoading, isError, isFetching |
| 04 | Query Keys Dinamis | key array, re-fetch otomatis |
| 05 | useMutation Dasar | POST, onSuccess, onError |
| 06 | Invalidate Queries | invalidateQueries, refetch |
| 07 | Optimistic Updates | onMutate, rollback |
| 08 | Pagination | keepPreviousData, page param |
| 09 | Infinite Scroll | useInfiniteQuery, fetchNextPage |
| 10 | Dependent Queries | enabled flag, query chaining |
| 11 | Parallel Queries | useQueries, multiple fetches |
| 12 | Prefetching | prefetchQuery, hover prefetch |
| 13 | staleTime & gcTime | cache lifetime, background refetch |
| 14 | Select & Transform | select option, data transform |
| 15 | Global Error Handling | QueryCache callbacks |

---

Tiap chapter punya: **db.json data** · **kode lengkap** · **yang perlu dicoba** · **cheatsheet konsep**
