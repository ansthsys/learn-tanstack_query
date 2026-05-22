import { useState } from "react"
import { Link } from "react-router"
import { Plus } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getUsers } from "@/api/users"
import { Button } from "@/components/atoms/ui/button"
import { PageHeader } from "@/components/molecules/PageHeader"
import { UserFilters, type UserFiltersValue } from "@/components/molecules/UserFilters"
import { UserTable } from "@/components/organisms/UserTable"

function Home() {
  const [filters, setFilters] = useState<UserFiltersValue>({
    name: "",
    role: "all",
    active: "all",
  })

  const queryParams: Record<string, string> = {}
  if (filters.name) queryParams["name:contains"] = filters.name
  if (filters.role && filters.role !== "all") queryParams.role = filters.role
  if (filters.active && filters.active !== "all") queryParams.active = filters.active

  const { data: users, isLoading } = useQuery({
    queryKey: ["users", filters],
    queryFn: () => getUsers(queryParams),
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
      <UserFilters filters={filters} onChange={setFilters} />
      <UserTable data={users ?? []} isLoading={isLoading} />
    </div>
  )
}

export default Home
