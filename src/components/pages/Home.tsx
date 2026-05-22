import { useQuery } from "@tanstack/react-query"
import { getUsers } from "@/api/users"
import { PageHeader } from "@/components/molecules/PageHeader"
import { UserTable } from "@/components/organisms/UserTable"

function Home() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  })

  return (
    <div className="flex flex-col gap-6 py-8">
      <PageHeader title="Users" description="Manage registered users" />
      <UserTable data={users ?? []} isLoading={isLoading} />
    </div>
  )
}

export default Home
