import { Link } from "react-router"
import { Plus } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getUsers } from "@/api/users"
import { Button } from "@/components/atoms/ui/button"
import { PageHeader } from "@/components/molecules/PageHeader"
import { UserTable } from "@/components/organisms/UserTable"

function Home() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  })

  return (
    <div className="flex flex-col gap-6 py-8">
      <PageHeader
        title="Users"
        description="Manage registered users"
        action={
          <Button asChild>
            <Link to="/users/new">
              <Plus />
              <span className="hidden sm:inline">Add User</span>
            </Link>
          </Button>
        }
      />
      <UserTable data={users ?? []} isLoading={isLoading} />
    </div>
  )
}

export default Home
