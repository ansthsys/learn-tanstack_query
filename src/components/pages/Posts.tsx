import { useState, useEffect } from "react"
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { getPostsPaginated, type Post } from "@/api/posts"
import { Badge } from "@/components/atoms/Badge"
import { Table, type Column } from "@/components/molecules/Table"
import { PageHeader } from "@/components/molecules/PageHeader"
import { Button } from "@/components/atoms/ui/button"

const LIMIT = 3

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
  const queryClient = useQueryClient()

  const {
    data,
    isLoading,
    isPlaceholderData,
    isFetching,
  } = useQuery({
    queryKey: ["posts", "paginated", page],
    queryFn: () => getPostsPaginated({ page, limit: LIMIT }),
    placeholderData: keepPreviousData,
  })

  useEffect(() => {
    if (data?.hasNext) {
      void queryClient.prefetchQuery({
        queryKey: ["posts", "paginated", page + 1],
        queryFn: () => getPostsPaginated({ page: page + 1, limit: LIMIT }),
      })
    }
  }, [page, data, queryClient])

  if (isLoading) return (
    <div className="py-8 text-center text-muted-foreground">Loading...</div>
  )

  return (
    <div className="flex flex-col gap-6 py-8">
      <PageHeader title="Posts" description="Server-side pagination with TanStack Query" />

      {isFetching && !isLoading && (
        <p className="text-sm text-muted-foreground">
          Memuat halaman {page}...
        </p>
      )}

      <Table
        columns={columns}
        data={data?.posts ?? []}
        isLoading={isLoading}
        emptyMessage="No posts found"
        className={isPlaceholderData ? "opacity-50" : ""}
      />

      {data && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Button
            variant="outline"
            disabled={!data.hasPrev || isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Prev
          </Button>

          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          ))}

          <Button
            variant="outline"
            disabled={!data.hasNext || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </Button>

          <span className="text-sm text-muted-foreground">
            Halaman {data.currentPage} dari {data.totalPages} ({data.totalItems} post)
          </span>
        </div>
      )}
    </div>
  )
}

export default Posts
