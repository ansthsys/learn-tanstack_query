# Chapter 01 — Setup & QueryClient

## Konsep
QueryClient adalah "otak" TanStack Query. Dia yang menyimpan semua cache, mengatur
konfigurasi global, dan perlu di-wrap ke seluruh app lewat QueryClientProvider.

---

## package.json — tambahkan script ini

```json
{
  "scripts": {
    "dev": "vite",
    "server": "json-server --watch db.json --port 3001 --delay 500"
  }
}
```

> `--delay 500` → simulasi network latency 500ms, berguna saat belajar loading states

---

## src/main.jsx

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App'

// 1. Buat instance QueryClient dengan konfigurasi global
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,      // data dianggap fresh selama 1 menit
      gcTime: 1000 * 60 * 5,     // cache dibuang setelah 5 menit tidak dipakai
      retry: 2,                   // retry 2x kalau gagal
      refetchOnWindowFocus: true, // refetch saat user balik ke tab
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Wrap seluruh app dengan Provider */}
    <QueryClientProvider client={queryClient}>
      <App />

      {/* 3. DevTools — hanya muncul di development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
)
```

---

## Yang Perlu Dipahami

| Opsi | Default | Artinya |
|------|---------|---------|
| `staleTime` | 0 | Berapa lama data dianggap "fresh". 0 = langsung stale |
| `gcTime` | 5 menit | Berapa lama cache disimpan setelah komponen unmount |
| `retry` | 3 | Berapa kali retry kalau fetch gagal |
| `refetchOnWindowFocus` | true | Refetch saat user kembali ke tab browser |

---

## Coba Sekarang

1. Jalankan `npm run server` → pastikan http://localhost:3001/users tampil data
2. Jalankan `npm run dev`
3. Buka browser, klik icon TanStack Query DevTools (pojok bawah)
4. Belum ada query — normal, kita mulai di chapter 02

---

## Cheatsheet

```jsx
// Ambil queryClient dari dalam komponen
import { useQueryClient } from '@tanstack/react-query'
const queryClient = useQueryClient()

// Konfigurasi bisa di-override per query
useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: Infinity, // override global, tidak pernah stale
})
```
