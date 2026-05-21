# Chapter 04 — useMutation & Invalidate Queries

## Konsep
`useMutation` untuk operasi yang **mengubah data** (POST, PUT, PATCH, DELETE).
Setelah mutasi berhasil, kita perlu memberitahu TanStack Query bahwa cache sudah
usang → pakai `invalidateQueries`.

---

## src/api/users.js — tambahkan fungsi mutasi

```js
const BASE = 'http://localhost:3001'

export const getUsers = async () => {
  const res = await fetch(`${BASE}/users`)
  if (!res.ok) throw new Error('Gagal fetch users')
  return res.json()
}

// CREATE
export const createUser = async (userData) => {
  const res = await fetch(`${BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  })
  if (!res.ok) throw new Error('Gagal membuat user')
  return res.json() // JSON Server return data + id yang baru dibuat
}

// UPDATE
export const updateUser = async ({ id, ...data }) => {
  const res = await fetch(`${BASE}/users/${id}`, {
    method: 'PATCH', // PATCH untuk partial update, PUT untuk full replace
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Gagal update user')
  return res.json()
}

// DELETE
export const deleteUser = async (id) => {
  const res = await fetch(`${BASE}/users/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Gagal hapus user')
  return res.json()
}
```

---

## src/pages/UserCRUD.jsx

```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { getUsers, createUser, updateUser, deleteUser } from '../api/users'

export default function UserCRUD() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ name: '', email: '', role: 'viewer' })
  const [editingId, setEditingId] = useState(null)

  // ── READ ──────────────────────────────────────────────
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })

  // ── CREATE ────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: createUser,

    onSuccess: (newUser) => {
      // Cara 1: Invalidate → TanStack akan refetch /api/users otomatis
      queryClient.invalidateQueries({ queryKey: ['users'] })

      // Cara 2 (alternatif): Update cache langsung tanpa refetch
      // queryClient.setQueryData(['users'], (old) => [...old, newUser])

      setForm({ name: '', email: '', role: 'viewer' }) // reset form
    },

    onError: (error) => {
      alert('Error: ' + error.message)
    },
  })

  // ── UPDATE ────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      // Invalidate list DAN detail cache untuk user yang diedit
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', editingId] })
      setEditingId(null)
    },
  })

  // ── DELETE ────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: (_, deletedId) => {
      // _ = return value dari server (biasanya {})
      // deletedId = argument yang kita pass ke mutate()
      queryClient.invalidateQueries({ queryKey: ['users'] })

      // Hapus juga cache detail untuk user ini
      queryClient.removeQueries({ queryKey: ['users', deletedId] })
    },
  })

  if (isLoading) return <div>Loading...</div>

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...form })
    } else {
      createMutation.mutate({ ...form, active: true })
    }
  }

  return (
    <div>
      {/* Form */}
      <form onSubmit={handleSubmit}>
        <input
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Nama"
          required
        />
        <input
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="Email"
          required
        />
        <select
          value={form.role}
          onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
        >
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>

        <button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {createMutation.isPending || updateMutation.isPending
            ? 'Menyimpan...'
            : editingId ? 'Update' : 'Tambah User'}
        </button>

        {editingId && (
          <button type="button" onClick={() => setEditingId(null)}>
            Batal
          </button>
        )}
      </form>

      {/* Tampilkan error mutation */}
      {createMutation.isError && (
        <p style={{ color: 'red' }}>{createMutation.error.message}</p>
      )}

      {/* List */}
      <table>
        <thead>
          <tr>
            <th>Nama</th><th>Email</th><th>Role</th><th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => {
                  setEditingId(user.id)
                  setForm({ name: user.name, email: user.email, role: user.role })
                }}>
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Hapus ${user.name}?`)) {
                      deleteMutation.mutate(user.id)
                    }
                  }}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? '...' : 'Hapus'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## Lifecycle Callback useMutation

```
mutate(data) dipanggil
    ↓
onMutate(data)     ← dipanggil SEBELUM fetch (untuk optimistic update)
    ↓
[request ke server]
    ↓
onSuccess(result, variables, context)   ← kalau berhasil
onError(error, variables, context)      ← kalau gagal
    ↓
onSettled(data, error, variables, context)  ← selalu dipanggil (success atau error)
```

---

## State useMutation

```js
const mutation = useMutation({ mutationFn: createUser })

mutation.isPending   // sedang request
mutation.isSuccess   // berhasil
mutation.isError     // gagal
mutation.isIdle      // belum pernah dipanggil
mutation.data        // data dari server (kalau sukses)
mutation.error       // error object (kalau gagal)
mutation.reset()     // reset state ke idle
```

---

## Yang Perlu Dicoba

1. Tambah user baru → buka http://localhost:3001/users → data beneran tersimpan!
2. Edit user → perhatikan form terisi otomatis
3. Hapus user → konfirmasi → hilang dari list DAN dari db.json
4. Coba matikan JSON Server saat submit → lihat `isError` dan pesan error
5. Di DevTools, lihat query `['users']` menjadi `invalidated` lalu `fetching` lagi setelah mutasi

---

## Perbedaan invalidateQueries vs setQueryData

```js
// invalidateQueries → refetch dari server (fresh data)
// Pakai ini kalau: server bisa mengubah data lain juga (trigger side effect)
queryClient.invalidateQueries({ queryKey: ['users'] })

// setQueryData → update cache langsung tanpa request
// Pakai ini kalau: kamu yakin tahu persis data yang berubah (lebih cepat, optimistic)
queryClient.setQueryData(['users'], (oldData) => [...oldData, newUser])
```
