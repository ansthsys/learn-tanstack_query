import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getPosts, type Post } from "@/api/posts"
import { Badge } from "@/components/atoms/Badge"
import { Table, type Column } from "@/components/molecules/Table"
import { Pagination } from "@/components/molecules/Pagination"
import { PageHeader } from "@/components/molecules/PageHeader"

const LIMIT = 10

const columns: Column<Post>[] = [
  { key: "id", label: "ID" },
  { key: "title", label: "Title" },
  {
    key: "userId",
    label: "User",
    render: (post) => (
      <span className="text-muted-foreground">User #{post.userId}</span>
    ),
  },
  {
    key: "published",
    label: "Status",
    render: (post) => (
      <Badge variant={post.published ? "success" : "muted"}>
        {post.published ? "Published" : "Draft"}
      </Badge>
    ),
  },
  { key: "likes", label: "Likes" },
  {
    key: "createdAt",
    label: "Date",
    render: (post) => (
      <span className="text-sm text-muted-foreground">{post.createdAt}</span>
    ),
  },
]

function Posts() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["posts", { page, limit: LIMIT }],
    queryFn: () => getPosts(page, LIMIT),
  })

  const totalPages = Math.ceil((data?.total ?? 0) / LIMIT)

  return (
    <div className="flex flex-col gap-6 py-8">
      <PageHeader title="Posts" description="Server-side pagination with TanStack Query" />
      <Table
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        emptyMessage="No posts found"
      />
      {totalPages > 0 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  )
}

export default Posts
