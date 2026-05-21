# Chapter 08 — Dependent Queries

## Konsep
Query yang bergantung pada hasil query lain. Pakai opsi `enabled` untuk menunda
eksekusi sampai data yang dibutuhkan tersedia.

---

## Skenario: Tampilkan posts dan comments milik user yang sedang login

```
1. Fetch user yang login (dari /users/1)
2. Setelah dapat userId → fetch posts user tersebut
3. Setelah dapat postId → fetch comments untuk post pertama
```

---

## src/pages/UserDashboard.jsx

```jsx
import { useQuery } from '@tanstack/react-query'

// Simulasi "current user" — di app nyata ini dari auth store
const CURRENT_USER_ID = 1

async function fetchUser(id) {
  const res = await fetch(`http://localhost:3001/users/${id}`)
  if (!res.ok) throw new Error('User tidak ditemukan')
  return res.json()
}

async function fetchUserPosts(userId) {
  const res = await fetch(`http://localhost:3001/posts?userId=${userId}`)
  if (!res.ok) throw new Error('Gagal fetch posts')
  return res.json()
}

async function fetchPostComments(postId) {
  const res = await fetch(`http://localhost:3001/comments?postId=${postId}`)
  if (!res.ok) throw new Error('Gagal fetch comments')
  return res.json()
}

export default function UserDashboard() {
  // Query 1: Fetch user — selalu jalan
  const userQuery = useQuery({
    queryKey: ['users', CURRENT_USER_ID],
    queryFn: () => fetchUser(CURRENT_USER_ID),
  })

  // Query 2: Bergantung pada userQuery
  // enabled: false → query TIDAK jalan, status = 'pending' tapi bukan loading
  const userPostsQuery = useQuery({
    queryKey: ['posts', 'byUser', CURRENT_USER_ID],
    queryFn: () => fetchUserPosts(CURRENT_USER_ID),
    enabled: !!userQuery.data,  // ← tunggu sampai user tersedia
  })

  // Ambil ID post pertama
  const firstPostId = userPostsQuery.data?.[0]?.id

  // Query 3: Bergantung pada userPostsQuery
  const commentsQuery = useQuery({
    queryKey: ['comments', 'byPost', firstPostId],
    queryFn: () => fetchPostComments(firstPostId),
    enabled: !!firstPostId,  // ← tunggu sampai ada postId
  })

  return (
    <div>
      {/* User info */}
      <section>
        <h2>Profil</h2>
        {userQuery.isLoading && <p>Memuat user...</p>}
        {userQuery.data && (
          <div>
            <p><strong>{userQuery.data.name}</strong></p>
            <p>{userQuery.data.email} · {userQuery.data.role}</p>
          </div>
        )}
      </section>

      {/* Posts */}
      <section>
        <h2>Posts Saya</h2>
        {/* isLoading false kalau enabled=false, jadi cek pakai isPending && enabled */}
        {userPostsQuery.isPending && !!userQuery.data && <p>Memuat posts...</p>}
        {userPostsQuery.data?.map(post => (
          <div key={post.id}>{post.title}</div>
        ))}
      </section>

      {/* Comments pada post pertama */}
      <section>
        <h2>Komentar pada Post Pertama</h2>
        {commentsQuery.isPending && !!firstPostId && <p>Memuat komentar...</p>}
        {commentsQuery.data?.map(comment => (
          <div key={comment.id}>{comment.body}</div>
        ))}
        {commentsQuery.data?.length === 0 && <p>Belum ada komentar</p>}
      </section>
    </div>
  )
}
```

---

## Tip: isPending vs isLoading untuk Dependent Query

```js
// Kalau enabled = false:
query.isPending  = true   // status masih 'pending' (belum pernah fetch)
query.isLoading  = false  // isLoading = isPending && isFetching
query.isFetching = false  // tidak sedang fetch

// Untuk cek apakah loading karena benar-benar fetch:
const isActuallyLoading = query.isPending && query.isFetching
```

---

---

# Chapter 09 — Parallel Queries dengan useQueries

## Konsep
Fetch beberapa query sekaligus dengan `useQueries`. Lebih fleksibel dari
memanggil `useQuery` berkali-kali karena bisa dinamis (jumlah query ditentukan runtime).

---

## src/pages/MultiUserProfile.jsx

```jsx
import { useQueries } from '@tanstack/react-query'

async function fetchUser(id) {
  const res = await fetch(`http://localhost:3001/users/${id}`)
  if (!res.ok) throw new Error(`User ${id} tidak ditemukan`)
  return res.json()
}

// Fetch beberapa user sekaligus — misal untuk "compare profiles"
const USER_IDS = [1, 2, 3]

export default function MultiUserProfile() {
  // useQueries menerima array queries — semua jalan paralel
  const userQueries = useQueries({
    queries: USER_IDS.map(id => ({
      queryKey: ['users', id],
      queryFn: () => fetchUser(id),
      staleTime: 1000 * 60, // 1 menit
    })),

    // Opsional: combine hasil semua query
    combine: (results) => ({
      data: results.map(r => r.data).filter(Boolean),
      isLoading: results.some(r => r.isLoading),
      isError: results.some(r => r.isError),
      allSuccess: results.every(r => r.isSuccess),
    }),
  })

  if (userQueries.isLoading) return <p>Memuat semua user...</p>

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {userQueries.data.map(user => (
        <div key={user.id} style={{ padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
          <h3>{user.name}</h3>
          <p>{user.role}</p>
          <p style={{ color: user.active ? 'green' : 'red' }}>
            {user.active ? 'Aktif' : 'Nonaktif'}
          </p>
        </div>
      ))}
    </div>
  )
}
```

---

## Tanpa `combine` — akses individual

```jsx
const queries = useQueries({
  queries: [1, 2, 3].map(id => ({
    queryKey: ['users', id],
    queryFn: () => fetchUser(id),
  })),
})

// queries adalah array — akses individual
queries[0].data    // user 1
queries[1].isLoading // apakah user 2 masih loading?
queries[2].isError   // apakah user 3 error?
```

---

---

# Chapter 10 — staleTime, gcTime & Cache Behavior

## Konsep
Ini yang paling sering disalahpahami. Memahami ini membuat kamu bisa fine-tune
performa app dengan benar.

---

## Alur Hidup Data di TanStack Query

```
fetch selesai
    ↓
Data = FRESH (dalam staleTime)
    ↓ staleTime berlalu
Data = STALE (masih di cache, tapi akan refetch saat trigger)
    ↓ semua komponen yang pakai query ini unmount
Data = INACTIVE (masih di cache, tidak ada yang subscribe)
    ↓ gcTime berlalu
Data = DIHAPUS dari cache
```

---

## Trigger Refetch (saat data sudah STALE)

```
1. Komponen baru mount yang pakai queryKey yang sama
2. Window kembali difokus (refetchOnWindowFocus: true)
3. Koneksi internet kembali (refetchOnReconnect: true)
4. Interval waktu (refetchInterval: 5000)
5. Manual: queryClient.invalidateQueries() atau query.refetch()
```

---

## src/pages/CacheDemo.jsx — perbandingan staleTime

```jsx
import { useQuery } from '@tanstack/react-query'

async function fetchUsers() {
  console.log('🔴 FETCHING dari server:', new Date().toLocaleTimeString())
  const res = await fetch('http://localhost:3001/users')
  return res.json()
}

// Komponen A: staleTime pendek
function UserListFresh() {
  const { data, isFetching } = useQuery({
    queryKey: ['users', 'fresh'],
    queryFn: fetchUsers,
    staleTime: 0, // Default — langsung stale setelah fetch
  })
  return (
    <div>
      <h3>staleTime: 0 (default)</h3>
      <p style={{ color: isFetching ? 'orange' : 'green' }}>
        {isFetching ? 'Fetching...' : 'Idle'}
      </p>
      <p>User count: {data?.length}</p>
    </div>
  )
}

// Komponen B: staleTime panjang
function UserListStale() {
  const { data, isFetching } = useQuery({
    queryKey: ['users', 'stale'],
    queryFn: fetchUsers,
    staleTime: 1000 * 30, // 30 detik fresh
  })
  return (
    <div>
      <h3>staleTime: 30 detik</h3>
      <p style={{ color: isFetching ? 'orange' : 'green' }}>
        {isFetching ? 'Fetching...' : 'Idle'}
      </p>
      <p>User count: {data?.length}</p>
    </div>
  )
}

// Komponen C: tidak pernah stale
function UserListNeverStale() {
  const { data, isFetching } = useQuery({
    queryKey: ['users', 'never'],
    queryFn: fetchUsers,
    staleTime: Infinity, // Tidak pernah stale
    // Catatan: tetap bisa diperbarui dengan invalidateQueries()
  })
  return (
    <div>
      <h3>staleTime: Infinity</h3>
      <p style={{ color: isFetching ? 'orange' : 'green' }}>
        {isFetching ? 'Fetching...' : 'Idle'}
      </p>
      <p>User count: {data?.length}</p>
    </div>
  )
}

export default function CacheDemo() {
  return (
    <div>
      <p style={{ fontSize: 12, color: 'gray' }}>
        Coba klik tab lain lalu kembali — lihat mana yang refetch otomatis
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <UserListFresh />
        <UserListStale />
        <UserListNeverStale />
      </div>
    </div>
  )
}
```

---

## Kapan Set staleTime?

| Data | staleTime yang cocok |
|------|---------------------|
| User profile, settings | `Infinity` atau 30 menit |
| Data produk, artikel | 5–10 menit |
| Notifikasi, cart | 30 detik – 1 menit |
| Harga real-time, stock | 0 atau `refetchInterval: 10000` |
| Config/master data | `Infinity` + invalidate manual |

---

## refetchInterval — Polling

```jsx
useQuery({
  queryKey: ['notifications'],
  queryFn: fetchNotifications,
  refetchInterval: 30 * 1000, // Poll setiap 30 detik
  refetchIntervalInBackground: false, // Hentikan saat tab tidak aktif
})
```
