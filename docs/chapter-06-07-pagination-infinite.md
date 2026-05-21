# Chapter 06 — Pagination

## Konsep
Pagination klasik: ada nomor halaman, data per halaman. TanStack Query punya opsi
`placeholderData` untuk membuat transisi antar halaman mulus (data lama tetap tampil
saat loading halaman baru — menghindari layout shift).

---

## JSON Server — endpoint pagination

JSON Server sudah support pagination secara built-in:
```
GET /posts?_page=1&_per_page=3
```

Response JSON Server v1:
```json
{
  "first": 1,
  "prev": null,
  "next": 2,
  "last": 3,
  "pages": 3,
  "items": 8,
  "data": [ ...array of posts... ]
}
```

---

## src/api/posts.js — tambahkan fungsi paginasi

```js
export const getPostsPaginated = async ({ page = 1, limit = 3 }) => {
  const res = await fetch(
    `http://localhost:3001/posts?_page=${page}&_per_page=${limit}`
  )
  if (!res.ok) throw new Error('Gagal fetch posts')
  const json = await res.json()

  // Normalize response JSON Server
  return {
    posts: json.data,
    totalPages: json.last,
    totalItems: json.items,
    currentPage: page,
    hasNext: json.next !== null,
    hasPrev: json.prev !== null,
  }
}
```

---

## src/pages/PostPagination.jsx

```jsx
import { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getPostsPaginated } from '../api/posts'

export default function PostPagination() {
  const [page, setPage] = useState(1)

  const {
    data,
    isLoading,
    isPlaceholderData, // true saat menampilkan data lama sambil fetch halaman baru
    isFetching,
  } = useQuery({
    queryKey: ['posts', 'paginated', page],
    queryFn: () => getPostsPaginated({ page, limit: 3 }),

    // Kunci pagination yang bagus!
    // Saat page berubah, data halaman lama tetap tampil sampai data baru datang
    // Menghindari "blank screen" saat ganti halaman
    placeholderData: keepPreviousData,
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      {/* Indikator background fetch */}
      {isFetching && !isLoading && (
        <div style={{ color: 'gray', fontSize: 12 }}>Memuat halaman {page}...</div>
      )}

      {/* List posts — opacity dikurangi saat placeholder */}
      <div style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>
        {data.posts.map(post => (
          <div key={post.id} style={{ padding: 12, marginBottom: 8, border: '1px solid #ddd' }}>
            <h4>{post.title}</h4>
            <p style={{ fontSize: 12, color: 'gray' }}>
              Likes: {post.likes} · {post.published ? 'Published' : 'Draft'}
            </p>
          </div>
        ))}
      </div>

      {/* Kontrol pagination */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 16 }}>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1 || isFetching}
        >
          ← Prev
        </button>

        {/* Nomor halaman */}
        {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            onClick={() => setPage(p)}
            style={{ fontWeight: p === page ? 'bold' : 'normal' }}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => setPage(p => p + 1)}
          disabled={!data.hasNext || isFetching}
        >
          Next →
        </button>

        <span style={{ fontSize: 12, color: 'gray' }}>
          Halaman {data.currentPage} dari {data.totalPages} ({data.totalItems} post)
        </span>
      </div>
    </div>
  )
}
```

---

## Prefetch Halaman Berikutnya (Bonus UX)

Fetch halaman berikutnya di background supaya transisi instan:

```jsx
import { useEffect } from 'react'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'

export default function PostPaginationWithPrefetch() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['posts', 'paginated', page],
    queryFn: () => getPostsPaginated({ page }),
    placeholderData: keepPreviousData,
  })

  // Prefetch halaman berikutnya setiap kali page berubah
  useEffect(() => {
    if (data?.hasNext) {
      queryClient.prefetchQuery({
        queryKey: ['posts', 'paginated', page + 1],
        queryFn: () => getPostsPaginated({ page: page + 1 }),
      })
    }
  }, [page, data, queryClient])

  // ... sisa JSX sama
}
```

---

# Chapter 07 — useInfiniteQuery (Infinite Scroll)

## Konsep
Berbeda dengan pagination biasa, infinite scroll **menambah** data ke list yang ada
(tidak mengganti). Cocok untuk feed, timeline, atau list yang di-scroll.

---

## src/api/posts.js — tambahkan fungsi untuk infinite query

```js
// Untuk infinite query, response harus include info "halaman selanjutnya"
export const getPostsInfinite = async ({ pageParam = 1 }) => {
  const res = await fetch(
    `http://localhost:3001/posts?_page=${pageParam}&_per_page=3`
  )
  if (!res.ok) throw new Error('Gagal fetch posts')
  const json = await res.json()
  return {
    posts: json.data,
    nextPage: json.next,  // null kalau sudah halaman terakhir
    prevPage: json.prev,
  }
}
```

---

## src/pages/InfinitePostList.jsx

```jsx
import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { getPostsInfinite } from '../api/posts'

export default function InfinitePostList() {
  const loadMoreRef = useRef(null)

  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['posts', 'infinite'],
    queryFn: getPostsInfinite,

    // Dari mana mulai?
    initialPageParam: 1,

    // Fungsi yang menentukan pageParam untuk fetch berikutnya
    // Return undefined → tidak ada halaman berikutnya
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,

    // Untuk "load previous" (jarang dipakai, tapi ada)
    getPreviousPageParam: (firstPage) => firstPage.prevPage ?? undefined,
  })

  // Auto-load saat scroll ke bawah dengan IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error: {error.message}</div>

  return (
    <div>
      {/* data.pages = array dari semua halaman yang sudah di-fetch */}
      {data.pages.map((page, pageIndex) => (
        <div key={pageIndex}>
          {page.posts.map(post => (
            <div key={post.id} style={{ padding: 12, marginBottom: 8, border: '1px solid #ddd' }}>
              <h4>{post.title}</h4>
              <p style={{ fontSize: 12 }}>❤️ {post.likes}</p>
            </div>
          ))}
        </div>
      ))}

      {/* Sentinel element — saat ini masuk viewport, load halaman berikutnya */}
      <div ref={loadMoreRef} style={{ height: 20 }} />

      {isFetchingNextPage && <div>Loading lebih banyak...</div>}

      {!hasNextPage && <div style={{ textAlign: 'center', color: 'gray' }}>
        Semua post sudah dimuat ✓
      </div>}

      {/* Alternatif: tombol manual */}
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  )
}
```

---

## Struktur data.pages

```js
// data.pages adalah array of halaman
data.pages = [
  { posts: [post1, post2, post3], nextPage: 2 },  // page 1
  { posts: [post4, post5, post6], nextPage: 3 },  // page 2
  { posts: [post7, post8], nextPage: null },        // page 3 (terakhir)
]

// Kalau mau flat jadi satu array:
const allPosts = data.pages.flatMap(page => page.posts)
```

---

## Yang Perlu Dicoba

**Pagination:**
1. Navigasi antar halaman → perhatikan `isPlaceholderData` (data lama masih tampil)
2. Buka DevTools → lihat cache tersimpan per halaman
3. Tambahkan prefetch → ganti halaman jadi instan

**Infinite Scroll:**
1. Scroll ke bawah → load otomatis terpicu
2. Cek DevTools → `['posts', 'infinite']` punya `pages` array
3. Refresh halaman → hanya halaman 1 yang di-fetch ulang (cache lama dihapus)
