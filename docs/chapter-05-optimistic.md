# Chapter 05 — Optimistic Updates

## Konsep
Optimistic update = update UI **sebelum** server merespons, dengan asumsi request
akan berhasil. Kalau ternyata gagal, UI di-rollback ke data sebelumnya.

Hasilnya: UI terasa instan meski ada network latency.

---

## Kapan Pakai?

✅ Cocok untuk:
- Toggle like/bookmark/favorite
- Update status sederhana (read/unread, active/inactive)
- Operasi yang hampir pasti berhasil

❌ Hindari untuk:
- Operasi penting yang sering gagal (payment, critical form submission)
- Operasi yang hasilnya tidak bisa diprediksi dari client

---

## src/api/posts.js — tambahkan toggle like

```js
const BASE = 'http://localhost:3001'

export const getPosts = async () => {
  const res = await fetch(`${BASE}/posts`)
  if (!res.ok) throw new Error('Gagal fetch posts')
  return res.json()
}

export const likePost = async ({ id, currentLikes }) => {
  const res = await fetch(`${BASE}/posts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ likes: currentLikes + 1 }),
  })
  if (!res.ok) throw new Error('Gagal like post')
  return res.json()
}

export const togglePublish = async ({ id, currentStatus }) => {
  const res = await fetch(`${BASE}/posts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ published: !currentStatus }),
  })
  if (!res.ok) throw new Error('Gagal update status')
  return res.json()
}
```

---

## src/pages/PostList.jsx — dengan optimistic update

```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPosts, likePost, togglePublish } from '../api/posts'

export default function PostList() {
  const queryClient = useQueryClient()

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  })

  // ── OPTIMISTIC UPDATE untuk Like ──────────────────────
  const likeMutation = useMutation({
    mutationFn: likePost,

    // onMutate dipanggil SEBELUM mutationFn
    onMutate: async ({ id, currentLikes }) => {
      // Step 1: Batalkan semua refetch yang sedang berjalan
      // Supaya tidak terjadi race condition (server overwrite optimistic update)
      await queryClient.cancelQueries({ queryKey: ['posts'] })

      // Step 2: Simpan snapshot data sekarang (untuk rollback)
      const previousPosts = queryClient.getQueryData(['posts'])

      // Step 3: Update cache langsung (ini yang bikin UI instan)
      queryClient.setQueryData(['posts'], (old) =>
        old.map(post =>
          post.id === id
            ? { ...post, likes: currentLikes + 1 }
            : post
        )
      )

      // Step 4: Return context untuk rollback
      return { previousPosts }
    },

    // Kalau server GAGAL → rollback ke data sebelumnya
    onError: (error, variables, context) => {
      queryClient.setQueryData(['posts'], context.previousPosts)
      console.error('Like gagal, rollback:', error.message)
    },

    // Setelah selesai (sukses atau gagal) → sync dengan server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })

  // ── OPTIMISTIC UPDATE untuk Toggle Publish ────────────
  const toggleMutation = useMutation({
    mutationFn: togglePublish,

    onMutate: async ({ id, currentStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] })
      const previousPosts = queryClient.getQueryData(['posts'])

      queryClient.setQueryData(['posts'], (old) =>
        old.map(post =>
          post.id === id
            ? { ...post, published: !currentStatus }
            : post
        )
      )

      return { previousPosts }
    },

    onError: (error, variables, context) => {
      queryClient.setQueryData(['posts'], context.previousPosts)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id} style={{ marginBottom: 16, padding: 12, border: '1px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>{post.title}</strong>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 4,
                background: post.published ? '#d4edda' : '#f8d7da',
                fontSize: 12,
                cursor: 'pointer',
              }}
              onClick={() => toggleMutation.mutate({
                id: post.id,
                currentStatus: post.published,
              })}
            >
              {post.published ? 'Published' : 'Draft'} (klik toggle)
            </span>
          </div>

          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => likeMutation.mutate({
                id: post.id,
                currentLikes: post.likes,
              })}
            >
              ❤️ {post.likes} likes
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
```

---

## Cara Membuktikan Optimistic Update Bekerja

1. Set `--delay 3000` di json-server script
2. Klik tombol like → angka LANGSUNG naik (sebelum request selesai)
3. Setelah 3 detik, data dari server sync

## Cara Membuktikan Rollback Bekerja

Simulasi error di fetcher:
```js
export const likePost = async ({ id, currentLikes }) => {
  // Simulasi server error
  throw new Error('Server error!')
}
```
1. Klik like → angka naik sebentar (optimistic)
2. Langsung rollback karena error → angka kembali ke semula

---

## Pola Umum Optimistic Update

```js
onMutate: async (variables) => {
  await queryClient.cancelQueries({ queryKey: [...] })    // 1. cancel
  const snapshot = queryClient.getQueryData([...])        // 2. snapshot
  queryClient.setQueryData([...], (old) => transform(old)) // 3. update optimistic
  return { snapshot }                                      // 4. return context
},
onError: (err, vars, context) => {
  queryClient.setQueryData([...], context.snapshot)       // 5. rollback
},
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: [...] })      // 6. sync server
},
```

Hafal pola ini — dipakai terus dalam production.
