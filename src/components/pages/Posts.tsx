import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { RefreshCw } from "lucide-react"
import { getPosts, getPostById, getPostsByUser, type Post } from "@/api/posts"
import { Badge } from "@/components/atoms/Badge"
import { Button } from "@/components/atoms/ui/button"
import { Input } from "@/components/atoms/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/ui/select"
import { Table, type Column } from "@/components/molecules/Table"
import { PageHeader } from "@/components/molecules/PageHeader"

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
  const queryClient = useQueryClient()
  const [userId, setUserId] = useState("all")
  const [postId, setPostId] = useState("")

  const allPosts = useQuery({
    queryKey: ["posts"],
    queryFn: () => getPosts(),
  })

  const byUser = useQuery({
    queryKey: ["posts", "byUser", userId],
    queryFn: () => getPostsByUser(userId),
    enabled: userId !== "all",
  })

  const detail = useQuery({
    queryKey: ["posts", "detail", postId],
    queryFn: () => getPostById(postId),
    enabled: postId.length > 0,
  })

  return (
    <div className="flex flex-col gap-6 py-8">
      <PageHeader
        title="Posts"
        description="Explore query keys, caching, and invalidation"
        action={
          <Button
            variant="outline"
            onClick={() => {
              void queryClient.invalidateQueries({ queryKey: ["posts"] })
            }}
          >
            <RefreshCw />
            <span>Refetch All</span>
          </Button>
        }
      />

      <section>
        <h2 className="mb-3 text-lg font-semibold">All Posts</h2>
        <Table
          columns={columns}
          data={allPosts.data ?? []}
          isLoading={allPosts.isLoading}
        />
      </section>

      <hr className="border-border" />

      <section>
        <h2 className="mb-3 text-lg font-semibold">Filter by User</h2>
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger className="mb-3 w-40">
            <SelectValue placeholder="Select user" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All users</SelectItem>
            {[1, 2, 3, 4, 5].map((id) => (
              <SelectItem key={id} value={String(id)}>
                User #{id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {userId === "all" ? (
          <p className="text-sm text-muted-foreground">
            Select a user to see their posts.
          </p>
        ) : (
          <Table
            columns={columns}
            data={byUser.data ?? []}
            isLoading={byUser.isLoading}
          />
        )}
      </section>

      <hr className="border-border" />

      <section>
        <h2 className="mb-3 text-lg font-semibold">Post Detail</h2>
        <Input
          type="number"
          min={1}
          max={8}
          placeholder="Enter post ID (1-8)"
          value={postId}
          onChange={(e) => setPostId(e.target.value)}
          className="mb-3 max-w-xs"
        />
        {!postId ? (
          <p className="text-sm text-muted-foreground">
            Enter a post ID to fetch details.
          </p>
        ) : detail.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : detail.error ? (
          <p className="text-sm text-destructive">Post not found.</p>
        ) : detail.data ? (
          <div className="rounded-md border p-4">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold">{detail.data.title}</h3>
              <Badge
                variant={detail.data.published ? "success" : "muted"}
              >
                {detail.data.published ? "Published" : "Draft"}
              </Badge>
            </div>
            <p className="mt-2 text-muted-foreground">{detail.data.body}</p>
            <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
              <span>User #{detail.data.userId}</span>
              <span>{detail.data.likes} likes</span>
              <span>{detail.data.createdAt}</span>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}

export default Posts
