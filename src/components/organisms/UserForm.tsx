import type { User } from "@/api/users"
import { Input } from "@/components/atoms/ui/input"
import { Label } from "@/components/atoms/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/ui/select"
import { Checkbox } from "@/components/atoms/ui/checkbox"

type UserFormProps = {
  user?: User | null
}

function UserForm({ user }: UserFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" defaultValue={user?.name ?? ""} placeholder="John Doe" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" defaultValue={user?.email ?? ""} placeholder="john@mail.com" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="role">Role</Label>
        <Select defaultValue={user?.role ?? "viewer"}>
          <SelectTrigger id="role">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Checkbox id="active" defaultChecked={user?.active ?? true} />
        <Label htmlFor="active">Active</Label>
      </div>
    </div>
  )
}

export { UserForm }
