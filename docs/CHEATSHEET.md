# TanStack Query — Cheatsheet Lengkap

---

## Setup

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install -D json-server
```

```jsx
// main.jsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 2 }
  }
})

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

---

## useQuery — Baca Data

```jsx
const {
  data,           // hasil fetch
  isLoading,      // true = PERTAMA kali fetch, belum ada data
  isFetching,     // true = SEDANG fetch (termasuk background)
  isError,        // true = gagal
  error,          // object Error
  isSuccess,      // true = berhasil
  isStale,        // true = melewati staleTime
  isPlaceholderData, // true = masih tampil data lama (keepPreviousData)
  refetch,        // fungsi untuk refetch manual
  dataUpdatedAt,  // timestamp data terakhir diupdate
} = useQuery({
  queryKey: ['users'],         // wajib — identifier cache
  queryFn: fetchUsers,         // wajib — async function yang return data
  enabled: true,               // opsional — false = tidak jalan
  staleTime: 60_000,           // opsional — berapa lama data fresh
  gcTime: 5 * 60_000,          // opsional — berapa lama cache disimpan
  select: (data) => data,      // opsional — transform data
  placeholderData: keepPreviousData, // opsional — pagination
  refetchInterval: 30_000,     // opsional — polling
  retry: 2,                    // opsional — retry saat error
  throwOnError: false,         // opsional — lempar ke ErrorBoundary
})
```

---

## useMutation — Ubah Data

```jsx
const mutation = useMutation({
  mutationFn: createUser,      // wajib — async function
  onMutate: async (vars) => {  // SEBELUM fetch — untuk optimistic update
    await queryClient.cancelQueries({ queryKey: ['users'] })
    const snapshot = queryClient.getQueryData(['users'])
    queryClient.setQueryData(['users'], old => [...old, { ...vars, id: Date.now() }])
    return { snapshot }
  },
  onSuccess: (data, vars, ctx) => { /* berhasil */ },
  onError: (err, vars, ctx) => {   /* gagal — rollback */
    queryClient.setQueryData(['users'], ctx.snapshot)
  },
  onSettled: () => {               /* selalu dipanggil */
    queryClient.invalidateQueries({ queryKey: ['users'] })
  },
})

// Panggil mutasi
mutation.mutate(data)
mutation.mutateAsync(data)  // versi Promise — bisa di-await

// State mutasi
mutation.isPending   // sedang request
mutation.isSuccess
mutation.isError
mutation.isIdle      // belum pernah dipanggil
mutation.reset()     // reset ke idle
```

---

## QueryClient Methods

```jsx
const queryClient = useQueryClient()

// Invalidate — mark stale + refetch
queryClient.invalidateQueries({ queryKey: ['users'] })
queryClient.invalidateQueries({ queryKey: ['users', 1], exact: true })

// Set data cache langsung
queryClient.setQueryData(['users'], newData)
queryClient.setQueryData(['users'], old => [...old, newItem])

// Baca data dari cache
const data = queryClient.getQueryData(['users'])

// Prefetch
await queryClient.prefetchQuery({ queryKey: [...], queryFn: ... })

// Hapus dari cache
queryClient.removeQueries({ queryKey: ['users', deletedId] })

// Cancel queries
await queryClient.cancelQueries({ queryKey: ['users'] })
```

---

## Query Keys — Panduan

```js
// Sederhana
['users']
['posts']

// Dengan ID
['users', 1]
['posts', postId]

// Dengan filter
['posts', { published: true }]
['posts', { userId: 1, page: 2 }]

// Relasi
['users', userId, 'posts']
['posts', postId, 'comments']

// Factory pattern (recommended)
const userKeys = {
  all: ['users'],
  detail: (id) => ['users', id],
}

// Invalidasi hierarkis
queryClient.invalidateQueries({ queryKey: ['users'] })
// Kena: ['users'], ['users', 1], ['users', { active: true }], dst
```

---

## useInfiniteQuery

```jsx
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ['posts', 'infinite'],
  queryFn: ({ pageParam }) => fetchPage(pageParam),
  initialPageParam: 1,
  getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
})

// data.pages = array of halaman
data.pages.flatMap(page => page.items) // flatten jadi satu array
```

---

## useQueries — Parallel

```jsx
const results = useQueries({
  queries: ids.map(id => ({
    queryKey: ['users', id],
    queryFn: () => fetchUser(id),
  })),
  combine: (results) => ({
    data: results.map(r => r.data).filter(Boolean),
    isLoading: results.some(r => r.isLoading),
  }),
})
```

---

## staleTime vs gcTime

```
staleTime = 0 (default)
→ data langsung stale setelah fetch
→ akan refetch saat trigger (focus, mount, dll)

staleTime = 60_000
→ data fresh 1 menit
→ tidak akan refetch selama 1 menit

staleTime = Infinity
→ tidak pernah stale
→ hanya update lewat invalidateQueries()

gcTime = 5 * 60_000 (default)
→ cache dihapus 5 menit setelah tidak ada subscriber
```

---

## JSON Server Quick Reference

```bash
# Install
npm install -D json-server

# Jalankan dengan delay simulasi network
npx json-server ./api/db.json --port 3001 --delay 500

# Endpoints otomatis dari db.json:
GET    /users          → semua users
GET    /users/1        → user by id
POST   /users          → buat user baru
PUT    /users/1        → replace user
PATCH  /users/1        → partial update
DELETE /users/1        → hapus user

# Filter
GET /posts?userId=1
GET /posts?published=true

# Pagination
GET /posts?_page=1&_per_page=5

# Sort
GET /posts?_sort=likes&_order=desc

# Search
GET /posts?title_like=react
```

---

## Urutan Belajar yang Disarankan

```
Chapter 01 → Setup QueryClient & DevTools
Chapter 02 → useQuery basic (states, fetcher)
Chapter 03 → Query Keys dinamis
Chapter 04 → useMutation + invalidateQueries
Chapter 05 → Optimistic Updates
Chapter 06 → Pagination (keepPreviousData)
Chapter 07 → Infinite Scroll (useInfiniteQuery)
Chapter 08 → Dependent Queries (enabled)
Chapter 09 → Parallel Queries (useQueries)
Chapter 10 → staleTime, gcTime, refetchInterval
Chapter 11 → select & data transformation
Chapter 12 → Prefetching
Chapter 13 → Custom Hooks pattern
Chapter 14 → Global Error Handling
```
