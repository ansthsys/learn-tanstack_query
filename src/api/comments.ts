import http from "./http";
import type { JsonServerPage } from "./posts";

export type Comment = {
  id: string;
  postId: string;
  userId: string;
  body: string;
  createdAt: string;
};

export type CreateCommentPayload = Omit<Comment, "id">;
export type UpdateCommentPayload = Partial<CreateCommentPayload>;

export type CommentPaginatedResult = {
  comments: Comment[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export const getCommentsPaginated = async ({
  page = 1,
  limit = 3,
}: { page?: number; limit?: number } = {}): Promise<CommentPaginatedResult> => {
  const res = await http.get<JsonServerPage<Comment>>("/comments", {
    params: { _page: page, _per_page: limit },
  });
  return {
    comments: res.data.data,
    totalPages: res.data.last,
    totalItems: res.data.items,
    currentPage: page,
    hasNext: res.data.next !== null,
    hasPrev: res.data.prev !== null,
  };
};

export const getCommentById = async (id: string): Promise<Comment> => {
  const { data } = await http.get<Comment>(`/comments/${id}`);
  return data;
};

export const getCommentsByPost = async (
  postId: string,
  { page = 1, limit = 3 }: { page?: number; limit?: number } = {},
): Promise<CommentPaginatedResult> => {
  const res = await http.get<JsonServerPage<Comment>>("/comments", {
    params: { postId: String(postId), _page: page, _per_page: limit },
  });
  return {
    comments: res.data.data,
    totalPages: res.data.last,
    totalItems: res.data.items,
    currentPage: page,
    hasNext: res.data.next !== null,
    hasPrev: res.data.prev !== null,
  };
};

export const createComment = async (
  payload: CreateCommentPayload,
): Promise<Comment> => {
  const { data } = await http.post<Comment>("/comments", payload);
  return data;
};

export const updateComment = async (
  id: string,
  payload: UpdateCommentPayload,
): Promise<Comment> => {
  const { data } = await http.put<Comment>(`/comments/${id}`, payload);
  return data;
};

export const patchComment = async (
  id: string,
  payload: UpdateCommentPayload,
): Promise<Comment> => {
  const { data } = await http.patch<Comment>(`/comments/${id}`, payload);
  return data;
};

export const deleteComment = async (id: string): Promise<void> => {
  await http.delete(`/comments/${id}`);
};
