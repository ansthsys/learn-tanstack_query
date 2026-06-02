import { useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/ui/button";
import { Badge } from "@/components/atoms/Badge";
import { PageHeader } from "@/components/molecules/PageHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/atoms/ui/alert-dialog";
import {
  createComment,
  deleteComment,
  getCommentsByPost,
  type Comment,
  type CreateCommentPayload,
} from "@/api/comments";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPostById } from "@/api/posts";
import { getUserById } from "@/api/users";
import NotFound from "./NotFound";

const USER_COMMENT_ID = "685VmOUK1Eu";

function Post2View() {
  const { id } = useParams();
  const [commentForm, setCommentForm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const postQuery = useQuery({
    queryKey: ["posts", id],
    queryFn: () => getPostById(id ?? ""),
    enabled: !!id,
  });

  const userQuery = useQuery({
    queryKey: ["users", postQuery.data?.userId],
    queryFn: () => getUserById(postQuery.data?.userId ?? ""),
    enabled: !!postQuery.data?.userId,
  });

  const commentQuery = useQuery({
    queryKey: ["posts", id, "comments"],
    queryFn: () => getCommentsByPost(id ?? ""),
    enabled: !!id,
  });

  const createPayload = (form: typeof commentForm): CreateCommentPayload => ({
    userId: USER_COMMENT_ID,
    postId: postQuery.data?.id ?? "",
    body: form.trim(),
    createdAt: new Date().toISOString().split("T")[0],
  });

  const createMutation = useMutation({
    mutationKey: ["posts", id, "comments", "create"],
    mutationFn: (payload: CreateCommentPayload) => createComment(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["posts", id, "comments"] });

      const prevComments = queryClient.getQueryData<Comment[]>([
        "posts",
        id,
        "comments",
      ]);

      queryClient.setQueryData<Comment[]>(["posts", id, "comments"], (old) => {
        const newPayload = { ...payload, id: crypto.randomUUID() };
        if (!old) return [newPayload];
        return [...old, newPayload];
      });

      return { prevComments };
    },
    // onSuccess: (res, payload) => {},
    onError: (err, _, context) => {
      if (context?.prevComments) {
        queryClient.setQueryData(
          ["posts", id, "comments"],
          context.prevComments,
        );
      }
      console.error("Error, rollback:", err.message);
      alert(`Error, rollback: ${err?.message}`);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ["posts", id, "comments"],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationKey: ["posts", id, "comments", "delete"],
    mutationFn: (deletedId: string) => deleteComment(deletedId),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["posts", id, "comments"] });

      const prevComments = queryClient.getQueryData<Comment[]>([
        "posts",
        id,
        "comments",
      ]);

      queryClient.setQueryData<Comment[]>(
        ["posts", id, "comments"],
        (old) => old?.filter((c) => c.id !== deletedId) ?? [],
      );

      return { prevComments };
    },
    onError: (_err, _deletedId, context) => {
      if (context?.prevComments) {
        queryClient.setQueryData(
          ["posts", id, "comments"],
          context.prevComments,
        );
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ["posts", id, "comments"],
      });
    },
  });

  const onDeleteComment = (commentId: string) => {
    setDeletingId(null);
    deleteMutation.mutate(commentId);
  };

  const onSubmitComment = () => {
    const payload = createPayload(commentForm);
    createMutation.mutate(payload);
  };

  if (!postQuery.isLoading && !postQuery.data) {
    return <NotFound />;
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <PageHeader
        title={`Post #${id}`}
        description="View post details and manage comments"
        action={
          <Button variant="ghost" asChild>
            <Link to="/post-2">
              <ArrowLeft />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </Button>
        }
      />

      {!postQuery.isLoading && !userQuery.isLoading ? (
        <div className="rounded-md border p-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-semibold">{postQuery.data?.title}</h3>
            <Badge variant={postQuery.data?.published ? "success" : "muted"}>
              {postQuery.data?.published ? "Published" : "Draft"}
            </Badge>
          </div>
          <p className="mt-2 text-muted-foreground">{postQuery.data?.body}</p>
          <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
            <span>{userQuery.data?.name}</span>
            <span>{postQuery.data?.likes} likes</span>
            <span>{postQuery.data?.createdAt}</span>
          </div>
        </div>
      ) : (
        <div className="w-full h-32 animate-pulse rounded-md border bg-gray-200" />
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold inline-flex items-center gap-1.5">
          Comments{" "}
          {commentQuery.isLoading ? (
            <span className="block w-8 h-6 animate-pulse rounded-md border bg-gray-200" />
          ) : (
            `(${commentQuery.data?.length})`
          )}
        </h2>
        {!commentQuery.isLoading ? (
          commentQuery.data && commentQuery.data.length > 0 ? (
            <div className="flex flex-col gap-3">
              {commentQuery.data.map((comment) => (
                <div key={comment.id} className="rounded-md border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="mt-1">{comment.body}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {comment.createdAt}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeletingId(comment.id)}
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          )
        ) : (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="w-full h-20 animate-pulse rounded-md border bg-gray-200"
              />
            ))}
          </div>
        )}
      </section>

      <section className="sticky bottom-0 bg-white py-5">
        <h2 className="mb-3 text-lg font-semibold">Add Comment</h2>
        <div className="flex flex-col gap-3">
          <textarea
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            rows={3}
            placeholder="Write a comment..."
            value={commentForm}
            onChange={(e) => setCommentForm(e.target.value)}
          />
          <div className="flex justify-end">
            <Button
              disabled={createMutation.isPending}
              onClick={onSubmitComment}
            >
              Add Comment
            </Button>
          </div>
        </div>
      </section>

      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deletingId !== null && onDeleteComment(deletingId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Post2View;
