import { useState } from "react"
import { Link } from "react-router"
import { Pencil, Trash2 } from "lucide-react"
import type { User } from "@/api/users"
import { Button } from "@/components/atoms/ui/button"
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
import { Badge } from "@/components/atoms/Badge"
import { Table, type Column } from "@/components/molecules/Table"
import { Pagination } from "@/components/molecules/Pagination"
import { cn } from "@/utils/classname"

const PAGE_SIZE = 5

const roleVariant: Record<string, "primary" | "secondary" | "warning" | "info" | "error"> = {
  admin: "error",
  editor: "warning",
  viewer: "info",
}

type UserTableProps = {
  data: User[]
  isLoading: boolean
  className?: string
}

function UserTable({ data, isLoading, className }: UserTableProps) {
  const [page, setPage] = useState(1)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  const totalPages = Math.ceil(data.length / PAGE_SIZE)
  const paginated = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns: Column<User>[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    {
      key: "role",
      label: "Role",
      render: (user) => (
        <Badge variant={roleVariant[user.role] ?? "secondary"}>
          {user.role}
        </Badge>
      ),
    },
    {
      key: "active",
      label: "Status",
      render: (user) => (
        <Badge variant={user.active ? "success" : "muted"}>
          {user.active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (user) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link to={`/users/${user.id}/edit`} aria-label="Edit user">
              <Pencil />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setDeletingUser(user)}
            aria-label="Delete user"
          >
            <Trash2 className="text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <Table
        columns={columns}
        data={paginated}
        isLoading={isLoading}
        emptyMessage="No users found"
        emptyDescription="Create a user to get started"
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <AlertDialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingUser?.name}? This action
              cannot be undone.
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

export { UserTable }
