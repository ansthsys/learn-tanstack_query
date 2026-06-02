import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPostById } from "@/api/posts";
import { getCommentsByPost } from "@/api/comments";
import { Badge } from "@/components/atoms/Badge";
import { Input } from "@/components/atoms/ui/input";
import { PageHeader } from "@/components/molecules/PageHeader";

function Comments() {
  const [postId, setPostId] = useState("");

  const post = useQuery({
    queryKey: ["posts", "detail", postId],
    queryFn: () => getPostById(postId),
    enabled: postId.length > 0,
  });

  const comments = useQuery({
    queryKey: ["comments", { postId }],
    queryFn: () => getCommentsByPost(postId),
    enabled: postId.length > 0,
  });

  return (
    <div className="flex flex-col gap-6 py-8">
      <PageHeader
        title="Comments"
        description="Dependent queries — comments load based on post selection"
      />

      <section>
        <h2 className="mb-3 text-lg font-semibold">Select Post</h2>
        <Input
          type="number"
          min={1}
          max={8}
          placeholder="Enter post ID (1–8)"
          value={postId}
          onChange={(e) => setPostId(e.target.value)}
          className="max-w-xs"
        />
        {!postId && (
          <p className="mt-2 text-sm text-muted-foreground">
            Enter a post ID to fetch the post and its comments.
          </p>
        )}
      </section>

      {postId && (
        <>
          <hr className="border-border" />

          <section>
            <h2 className="mb-3 text-lg font-semibold">Post</h2>
            {post.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading post...</p>
            ) : post.error ? (
              <p className="text-sm text-destructive">Post not found.</p>
            ) : post.data ? (
              <div className="rounded-md border p-4">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold">{post.data.title}</h3>
                  <Badge variant={post.data.published ? "success" : "muted"}>
                    {post.data.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <p className="mt-2 text-muted-foreground">{post.data.body}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  User #{post.data.userId} &middot; {post.data.likes} likes
                  &middot; {post.data.createdAt}
                </p>
              </div>
            ) : null}
          </section>

          <hr className="border-border" />

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              Comments
              {comments.data && (
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  ({comments.data.totalItems})
                </span>
              )}
            </h2>
            {comments.isLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading comments...
              </p>
            ) : comments.data && comments.data.totalItems > 0 ? (
              <div className="flex flex-col gap-3">
                {comments.data.comments.map((comment) => (
                  <div key={comment.id} className="rounded-md border p-3">
                    <p className="text-sm text-muted-foreground">
                      User #{comment.userId}
                    </p>
                    <p className="mt-1">{comment.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {comment.createdAt}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No comments for this post.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default Comments;
