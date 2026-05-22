import { Search } from "lucide-react"
import { Input } from "@/components/atoms/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/ui/select"
import { cn } from "@/utils/classname"

type UserFiltersValue = {
  name: string
  role: string
  active: string
}

type UserFiltersProps = {
  filters: UserFiltersValue
  onChange: (filters: UserFiltersValue) => void
  className?: string
}

function UserFilters({ filters, onChange, className }: UserFiltersProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center",
        className,
      )}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search name..."
          value={filters.name}
          onChange={(e) =>
            onChange({ ...filters, name: e.target.value })
          }
          className="pl-8"
        />
      </div>

      <Select
        value={filters.role}
        onValueChange={(role) => onChange({ ...filters, role })}
      >
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue placeholder="All roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All roles</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="editor">Editor</SelectItem>
          <SelectItem value="viewer">Viewer</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.active}
        onValueChange={(active) => onChange({ ...filters, active })}
      >
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue placeholder="All status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All status</SelectItem>
          <SelectItem value="true">Active</SelectItem>
          <SelectItem value="false">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export { UserFilters, type UserFiltersValue }
