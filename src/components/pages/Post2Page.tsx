import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/atoms/ui/button";
import { Input } from "@/components/atoms/ui/input";
import { PageHeader } from "@/components/molecules/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { getPosts } from "@/api/posts";

function Post2Page() {
  const [postId, setPostId] = useState("");
  const navigate = useNavigate();

  const postQuery = useQuery({
    queryKey: ["posts"],
    queryFn: () => getPosts(),
    select: (d) => {
      return {
        length: d.length,
      };
    },
  });

  return (
    <div className="flex flex-col gap-6 py-8">
      <PageHeader
        title="Post Explorer"
        description="Enter a post ID to view details and comments"
      />
      <div className="flex max-w-sm items-end gap-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="postId" className="text-sm font-medium">
            Post ID
          </label>
          <Input
            id="postId"
            type="text"
            placeholder={`Post Id (Total ${postQuery.data?.length ?? 0})`}
            value={postId}
            onChange={(e) => setPostId(e.target.value)}
          />
        </div>
        <Button
          disabled={!postId}
          onClick={() => void navigate(`/post-2/${postId}`)}
        >
          View Post
        </Button>
      </div>
    </div>
  );
}

export default Post2Page;
