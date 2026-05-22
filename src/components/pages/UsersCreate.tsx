import { Link } from "react-router"
import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/atoms/ui/button"
import { PageHeader } from "@/components/molecules/PageHeader"
import { UserForm } from "@/components/organisms/UserForm"

function UsersCreate() {
  return (
    <div className="flex flex-col gap-6 py-8">
      <PageHeader
        title="Create User"
        description="Add a new user to the system"
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
        <UserForm />
      </div>

      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link to="/">Cancel</Link>
        </Button>
        <Button disabled>
          <Plus />
          <span>Create</span>
        </Button>
      </div>
    </div>
  )
}

export default UsersCreate
