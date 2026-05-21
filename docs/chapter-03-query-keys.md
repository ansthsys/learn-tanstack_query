# Chapter 03 — Query Keys Dinamis

## Konsep
`queryKey` adalah array yang jadi identifier cache. Kalau key berubah, TanStack Query
otomatis fetch ulang. Ini menggantikan pola useEffect + dependency array yang rentan bug.

---

## Aturan queryKey

```js
// ✅ Key sederhana — untuk data global
['users']
['posts']

// ✅ Key dengan parameter — untuk data spesifik
['users', userId]          // user by ID
['posts', { page: 2 }]     // posts halaman 2
['posts', 'published']     // filter

// ✅ Key bersarang — untuk relasi
['users', userId, 'posts'] // posts milik user tertentu

// ❌ JANGAN pakai string template langsung sebagai key
'users-1'   // tidak bisa di-invalidate secara parsial
```

**Aturan penting:** TanStack Query membandingkan key secara **deep equal** dan
**urutan array tidak diabaikan** — `['users', 1]` dan `[1, 'users']` adalah key berbeda!

---

## src/api/posts.js

```js
const BASE = 'http://localhost:3001'

export const getPosts = async () => {
  const res = await fetch(`${BASE}/posts`)
  if (!res.ok) throw new Error('Gagal fetch posts')
  return res.json()
}

export const getPostById = async (id) => {
  const res = await fetch(`${BASE}/posts/${id}`)
  if (!res.ok) throw new Error('Post tidak ditemukan')
  return res.json()
}

// Fetch dengan filter — JSON Server support query string
export const getPostsByUser = async (userId) => {
  const res = await fetch(`${BASE}/posts?userId=${userId}`)
  if (!res.ok) throw new Error('Gagal fetch posts user')
  return res.json()
}

export const getPostsByStatus = async (published) => {
  const res = await fetch(`${BASE}/posts?published=${published}`)
  if (!res.ok) throw new Error('Gagal fetch posts')
  return res.json()
}
```

---

## src/pages/PostFilter.jsx — key berubah saat filter berubah

```jsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPostsByUser, getPostsByStatus } from '../api/posts'

export default function PostFilter() {
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [filterPublished, setFilterPublished] = useState(null)

  // SKENARIO 1: Filter berdasarkan userId
  // Key: ['posts', 'byUser', 1] → berbeda dengan ['posts', 'byUser', 2]
  // Setiap userId punya cache sendiri!
  const userPostsQuery = useQuery({
    queryKey: ['posts', 'byUser', selectedUserId],
    queryFn: () => getPostsByUser(selectedUserId),
    enabled: selectedUserId !== null, // ← jangan fetch kalau belum pilih user
  })

  // SKENARIO 2: Filter berdasarkan status
  const statusPostsQuery = useQuery({
    queryKey: ['posts', 'byStatus', filterPublished],
    queryFn: () => getPostsByStatus(filterPublished),
    enabled: filterPublished !== null,
  })

  return (
    <div>
      <h2>Filter by User ID</h2>
      <div>
        {[1, 2, 3, 4, 5].map(id => (
          <button
            key={id}
            onClick={() => setSelectedUserId(id)}
            style={{ fontWeight: selectedUserId === id ? 'bold' : 'normal' }}
          >
            User {id}
          </button>
        ))}
      </div>

      {/* Perhatikan: saat ganti ke userId yang sudah pernah dipilih,
          data langsung muncul dari cache tanpa loading! */}
      {userPostsQuery.isLoading && <p>Loading...</p>}
      {userPostsQuery.data?.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}

      <hr />

      <h2>Filter by Status</h2>
      <button onClick={() => setFilterPublished(true)}>Published</button>
      <button onClick={() => setFilterPublished(false)}>Draft</button>

      {statusPostsQuery.isLoading && <p>Loading...</p>}
      {statusPostsQuery.data?.map(post => (
        <div key={post.id}>{post.title} — {post.published ? '✅' : '📝'}</div>
      ))}
    </div>
  )
}
```

---

## src/pages/PostDetail.jsx — key dengan ID

```jsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPosts, getPostById } from '../api/posts'

export default function PostDetail() {
  const [selectedId, setSelectedId] = useState(null)

  // List semua posts
  const listQuery = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  })

  // Detail post yang dipilih
  // Key: ['posts', 1], ['posts', 2], dst — cache terpisah per post
  const detailQuery = useQuery({
    queryKey: ['posts', selectedId],
    queryFn: () => getPostById(selectedId),
    enabled: !!selectedId, // hanya fetch kalau selectedId tidak null/undefined/0
  })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div>
        <h3>Semua Posts</h3>
        {listQuery.data?.map(post => (
          <div
            key={post.id}
            onClick={() => setSelectedId(post.id)}
            style={{ cursor: 'pointer', padding: 8, background: selectedId === post.id ? '#eee' : 'white' }}
          >
            {post.title}
          </div>
        ))}
      </div>

      <div>
        <h3>Detail</h3>
        {!selectedId && <p>Pilih post di kiri</p>}
        {detailQuery.isLoading && <p>Loading detail...</p>}
        {detailQuery.data && (
          <div>
            <h4>{detailQuery.data.title}</h4>
            <p>{detailQuery.data.body}</p>
            <p>Likes: {detailQuery.data.likes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## Yang Perlu Dicoba

1. Buka DevTools → pilih user berbeda-beda → lihat cache terbentuk per key
2. Pilih user 1, lalu user 2, lalu balik ke user 1 → data langsung muncul (dari cache)
3. Coba hapus `enabled` → lihat error "tidak boleh undefined" saat belum pilih
4. Eksperimen: ganti key dari `['posts', 'byUser', userId]` ke `['posts', userId]`
   → apa yang terjadi saat invalidate `['posts']`?

---

## Cheatsheet: Hierarchical Invalidation

```js
// Invalidate SEMUA query yang key-nya dimulai dengan 'posts'
queryClient.invalidateQueries({ queryKey: ['posts'] })
// Kena: ['posts'], ['posts', 1], ['posts', 'byUser', 2], dst

// Invalidate HANYA key exact
queryClient.invalidateQueries({ queryKey: ['posts', 1], exact: true })
// Kena: ['posts', 1] saja
```

Ini kenapa struktur key array sangat penting — memudahkan invalidasi massal.
