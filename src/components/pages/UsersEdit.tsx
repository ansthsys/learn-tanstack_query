import { useState } from "react"
import { Link, useParams } from "react-router"
import { ArrowLeft, Trash2 } from "lucide-react"
import { Button } from "@/components/atoms/ui/button"
import { PageHeader } from "@/components/molecules/PageHeader"
import { UserForm } from "@/components/organisms/UserForm"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/atoms/ui/alert-dialog"
import type { User } from "@/api/users"

const dummyUsers: Record<number, User> = {
  1: { id: 1, name: "Budi Santoso", email: "budi@mail.com", role: "admin", active: true },
  2: { id: 2, name: "Sari Dewi", email: "sari@mail.com", role: "editor", active: true },
  3: { id: 3, name: "Andi Pratama", email: "andi@mail.com", role: "viewer", active: false },
  4: { id: 4, name: "Rina Kusuma", email: "rina@mail.com", role: "editor", active: true },
  5: { id: 5, name: "Doni Herlambang", email: "doni@mail.com", role: "viewer", active: true },
}

function UsersEdit() {
  const { id } = useParams()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const user = dummyUsers[Number(id)] ?? dummyUsers[1]

  return (
    <div className="flex flex-col gap-6 py-8">
      <PageHeader
        title="Edit User"
        description={`Editing user #${user.id}`}
        action={
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </Button>
        }
      />

      <div className="max-w-md">
        <UserForm user={user} />
      </div>

      <div className="flex gap-2">
        <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
          <Trash2 />
          <span className="hidden sm:inline">Delete</span>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/">Cancel</Link>
        </Button>
        <Button disabled>Save</Button>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {user.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default UsersEdit
