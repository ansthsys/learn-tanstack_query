# Chapter 02 — useQuery Dasar

## Konsep
`useQuery` adalah hook utama untuk **membaca data**. Dia otomatis handle:
loading state, error state, caching, background refetch, dan deduplication request.

---

## src/api/users.js — fungsi fetcher (pisahkan dari hook)

```js
const BASE = 'http://localhost:3001'

// Fetcher adalah fungsi async biasa yang return data
// TanStack Query tidak peduli bagaimana kamu fetch — bisa axios, ky, atau fetch native
export const getUsers = async () => {
  const res = await fetch(`${BASE}/users`)
  if (!res.ok) throw new Error('Gagal mengambil data users') // WAJIB throw error!
  return res.json()
}

export const getUserById = async (id) => {
  const res = await fetch(`${BASE}/users/${id}`)
  if (!res.ok) throw new Error(`User dengan id ${id} tidak ditemukan`)
  return res.json()
}
```

> **Penting:** queryFn HARUS throw error kalau gagal. Kalau tidak, TanStack Query
> tidak tahu kalau request gagal dan isError tidak akan jadi true.

---

## src/pages/UserList.jsx

```jsx
import { useQuery } from '@tanstack/react-query'
import { getUsers } from '../api/users'

export default function UserList() {
  const {
    data,          // data hasil fetch (undefined saat loading)
    isLoading,     // true hanya saat PERTAMA kali fetch (belum ada cache)
    isError,       // true kalau fetch gagal
    error,         // object Error-nya
    isFetching,    // true setiap kali sedang fetch (termasuk background refetch)
    isSuccess,     // true kalau data sudah berhasil di-fetch
    dataUpdatedAt, // timestamp terakhir data diupdate
  } = useQuery({
    queryKey: ['users'],   // identifier cache — HARUS unik
    queryFn: getUsers,     // fungsi yang dijalankan untuk fetch
  })

  // Tampilkan loading hanya saat pertama kali (belum ada data sama sekali)
  if (isLoading) return <div>Loading users...</div>

  // Tampilkan error
  if (isError) return <div>Error: {error.message}</div>

  return (
    <div>
      {/* isFetching bisa true sambil data lama masih tampil (background refetch) */}
      {isFetching && <span>Memperbarui...</span>}

      <ul>
        {data.map(user => (
          <li key={user.id}>
            {user.name} — {user.role}
          </li>
        ))}
      </ul>

      <small>
        Terakhir update: {new Date(dataUpdatedAt).toLocaleTimeString()}
      </small>
    </div>
  )
}
```

---

## Perbedaan isLoading vs isFetching — INI SERING BIKIN BINGUNG

```
Kondisi 1: Komponen baru mount, belum ada cache
  isLoading = true   ← belum ada data SAMA SEKALI
  isFetching = true  ← sedang fetch

Kondisi 2: Data sudah ada di cache, lalu window di-focus ulang
  isLoading = false  ← data lama masih ada, bisa ditampilkan
  isFetching = true  ← sedang background refetch

Kondisi 3: Data fresh, tidak ada refetch
  isLoading = false
  isFetching = false
```

**Rule of thumb:**
- Gunakan `isLoading` untuk skeleton/spinner besar (halaman kosong)
- Gunakan `isFetching` untuk spinner kecil di pojok (data lama masih tampil)

---

## Yang Perlu Dicoba

1. Buat file `src/api/users.js` dan `src/pages/UserList.jsx`
2. Render `<UserList />` di App.jsx
3. Buka DevTools → lihat query `['users']` muncul dengan status `success`
4. Klik "Refetch" di DevTools → lihat `isFetching` jadi true sebentar
5. Matikan JSON Server → refresh halaman → lihat `isError` = true
6. Ubah `--delay 500` ke `--delay 2000` di package.json, restart server → lihat loading state lebih jelas

---

## Cheatsheet Status useQuery

```
fresh     → data baru, tidak perlu refetch
stale     → data mungkin usang, akan refetch saat trigger
fetching  → sedang request ke server
paused    → offline, request ditunda
inactive  → tidak ada komponen yang subscribe
```
