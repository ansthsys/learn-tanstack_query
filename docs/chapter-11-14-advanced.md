# Chapter 11 — Select & Data Transformation

## Konsep
Opsi `select` memungkinkan transformasi data SEBELUM disimpan ke cache komponen.
Data asli di cache tidak berubah — hanya tampilan yang berbeda.

---

## Kegunaan select

```
1. Ambil sebagian field saja (mengurangi re-render)
2. Sort/filter data
3. Transform struktur data
4. Compute derived value
```

---

## src/pages/SelectDemo.jsx

```jsx
import { useQuery } from '@tanstack/react-query'

async function fetchUsers() {
  const res = await fetch('http://localhost:3001/users')
  if (!res.ok) throw new Error('Gagal fetch')
  return res.json()
}

async function fetchPosts() {
  const res = await fetch('http://localhost:3001/posts')
  if (!res.ok) throw new Error('Gagal fetch')
  return res.json()
}

export default function SelectDemo() {
  // Hanya ambil nama user aktif saja
  const { data: activeUserNames } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    select: (users) => users
      .filter(u => u.active)
      .map(u => u.name),
    // Re-render hanya terjadi kalau hasil select berubah
    // Bukan setiap kali data mentah berubah
  })

  // Jumlah total likes semua post
  const { data: totalLikes } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    select: (posts) => posts.reduce((sum, p) => sum + p.likes, 0),
  })

  // Posts yang sudah published, diurutkan by likes
  const { data: topPosts } = useQuery({
    queryKey: ['posts'],           // ← queryKey SAMA dengan query di atas
    queryFn: fetchPosts,           // ← fetch TIDAK duplikat! Pakai cache yang sama
    select: (posts) => posts
      .filter(p => p.published)
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 3),                // Top 3 posts
  })

  // Posts diubah jadi object map { id: post }
  const { data: postsMap } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    select: (posts) => Object.fromEntries(posts.map(p => [p.id, p])),
  })

  return (
    <div>
      <section>
        <h3>User Aktif ({activeUserNames?.length})</h3>
        {activeUserNames?.map((name, i) => <span key={i}>{name}, </span>)}
      </section>

      <section>
        <h3>Total Likes Semua Post</h3>
        <p style={{ fontSize: 32, fontWeight: 'bold' }}>{totalLikes}</p>
      </section>

      <section>
        <h3>Top 3 Posts</h3>
        {topPosts?.map(post => (
          <div key={post.id}>
            {post.title} — {post.likes} likes
          </div>
        ))}
      </section>

      <section>
        <h3>Lookup Post by ID (dari postsMap)</h3>
        {postsMap && (
          <div>
            <p>Post ID 2: {postsMap[2]?.title}</p>
            <p>Post ID 5: {postsMap[5]?.title}</p>
          </div>
        )}
      </section>
    </div>
  )
}
```

---

---

# Chapter 12 — Prefetching

## Konsep
Fetch data sebelum user membutuhkannya — sehingga saat komponen render, data sudah ada.

---

## Kapan Prefetch?

```
1. Hover pada link/tombol → prefetch detail halaman tujuan
2. Pagination → prefetch halaman berikutnya
3. App init → prefetch data yang hampir pasti dibutuhkan
4. Sidebar/modal yang mungkin dibuka user
```

---

## src/pages/PostListWithPrefetch.jsx

```jsx
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

async function fetchPosts() {
  const res = await fetch('http://localhost:3001/posts')
  return res.json()
}

async function fetchPostDetail(id) {
  const res = await fetch(`http://localhost:3001/posts/${id}`)
  return res.json()
}

export default function PostListWithPrefetch() {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState(null)

  const { data: posts } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  })

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['posts', selectedId],
    queryFn: () => fetchPostDetail(selectedId),
    enabled: !!selectedId,
  })

  // Prefetch saat hover — data sudah ada sebelum klik!
  const handleMouseEnter = (postId) => {
    queryClient.prefetchQuery({
      queryKey: ['posts', postId],
      queryFn: () => fetchPostDetail(postId),
      staleTime: 10 * 1000, // Jangan prefetch ulang kalau baru 10 detik lalu
    })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div>
        {posts?.map(post => (
          <div
            key={post.id}
            onMouseEnter={() => handleMouseEnter(post.id)}  // ← Prefetch on hover
            onClick={() => setSelectedId(post.id)}
            style={{
              padding: 8,
              cursor: 'pointer',
              background: selectedId === post.id ? '#e8f4fd' : 'white',
              border: '1px solid #ddd',
              marginBottom: 4,
              borderRadius: 4,
            }}
          >
            {post.title}
          </div>
        ))}
      </div>

      <div>
        {!selectedId && <p style={{ color: 'gray' }}>Hover lalu klik post</p>}
        {/* Perhatikan: detailLoading mungkin false langsung karena prefetch */}
        {detailLoading && <p>Loading detail...</p>}
        {detail && (
          <div>
            <h3>{detail.title}</h3>
            <p>{detail.body}</p>
            <p>❤️ {detail.likes} likes</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

---

---

# Chapter 13 — Custom Hooks Pattern

## Konsep
Praktik terbaik: bungkus `useQuery` dan `useMutation` ke dalam custom hooks.
Ini membuat komponen bersih dan logic mudah di-reuse.

---

## src/hooks/useUsers.js — custom hook lengkap

```js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const BASE = 'http://localhost:3001'

// ── FETCHERS ──────────────────────────────────────────
const api = {
  getAll: async () => {
    const res = await fetch(`${BASE}/users`)
    if (!res.ok) throw new Error('Gagal fetch users')
    return res.json()
  },
  getById: async (id) => {
    const res = await fetch(`${BASE}/users/${id}`)
    if (!res.ok) throw new Error('User tidak ditemukan')
    return res.json()
  },
  create: async (data) => {
    const res = await fetch(`${BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Gagal buat user')
    return res.json()
  },
  update: async ({ id, ...data }) => {
    const res = await fetch(`${BASE}/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Gagal update user')
    return res.json()
  },
  delete: async (id) => {
    const res = await fetch(`${BASE}/users/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Gagal hapus user')
    return res.json()
  },
}

// ── QUERY KEYS — definisikan di satu tempat ────────────
export const userKeys = {
  all: ['users'],
  lists: () => [...userKeys.all, 'list'],
  list: (filters) => [...userKeys.lists(), { filters }],
  details: () => [...userKeys.all, 'detail'],
  detail: (id) => [...userKeys.details(), id],
}

// ── CUSTOM HOOKS ──────────────────────────────────────
export function useUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: api.getAll,
  })
}

export function useUser(id) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => api.getById(id),
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      queryClient.setQueryData(userKeys.detail(data.id), data)
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.delete,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      queryClient.removeQueries({ queryKey: userKeys.detail(deletedId) })
    },
  })
}
```

---

## Komponen Jadi Sangat Bersih

```jsx
import { useUsers, useCreateUser, useDeleteUser } from '../hooks/useUsers'

export default function UserList() {
  const { data: users, isLoading } = useUsers()
  const createUser = useCreateUser()
  const deleteUser = useDeleteUser()

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          {user.name}
          <button onClick={() => deleteUser.mutate(user.id)}>Hapus</button>
        </div>
      ))}
      <button onClick={() => createUser.mutate({ name: 'User Baru', role: 'viewer' })}>
        Tambah
      </button>
    </div>
  )
}
```

**Komponen tidak tahu apapun tentang fetch, cache, atau invalidation. Semua ada di hook.**

---

---

# Chapter 14 — Global Error Handling

## Konsep
Tangkap semua error dari semua query/mutation di satu tempat.

---

## src/main.jsx — dengan global error handler

```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from 'react-hot-toast' // atau library toast lainnya

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Jangan retry kalau 404 (not found)
        if (error?.status === 404) return false
        // Retry maksimal 2 kali
        return failureCount < 2
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Hanya tampilkan toast kalau ada data sebelumnya (background refetch gagal)
      // Kalau initial fetch gagal, biar komponen yang handle tampilan error
      if (query.state.data !== undefined) {
        toast.error(`Gagal memperbarui data: ${error.message}`)
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error(`Operasi gagal: ${error.message}`)
    },
  }),
})
```

---

## Error Boundary untuk Query

```jsx
// src/components/QueryErrorBoundary.jsx
import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

export default function QueryErrorBoundary({ children }) {
  const { reset } = useQueryErrorResetBoundary()

  return (
    <ErrorBoundary
      onReset={reset}
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div style={{ padding: 16, background: '#fee', borderRadius: 8 }}>
          <p>Terjadi kesalahan: {error.message}</p>
          <button onClick={resetErrorBoundary}>Coba Lagi</button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}

// Penggunaan dengan throwOnError
function PostDetail({ id }) {
  const { data } = useQuery({
    queryKey: ['posts', id],
    queryFn: () => fetchPost(id),
    throwOnError: true, // ← lempar error ke ErrorBoundary
  })
  return <div>{data.title}</div>
}

// Di App.jsx
<QueryErrorBoundary>
  <PostDetail id={selectedId} />
</QueryErrorBoundary>
```
