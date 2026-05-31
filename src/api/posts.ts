import http from "./http";

export type PaginatedResult<T> = {
  data: T[]
  total: number
}

export type Post = {
  id: string;
  title: string;
  body: string;
  userId: string;
  likes: number;
  published: boolean;
  createdAt: string;
};

export type CreatePostPayload = Omit<Post, "id">;
export type UpdatePostPayload = Partial<CreatePostPayload>;

export const getPosts = async (
  page: number,
  limit: number,
): Promise<PaginatedResult<Post>> => {
  const res = await http.get<Post[]>("/posts", {
    params: { _page: page, _limit: limit },
  })
  const total = Number(res.headers["x-total-count"]) || 0
  return { data: res.data, total }
};

export const getPostById = async (id: string): Promise<Post> => {
  const { data } = await http.get<Post>(`/posts/${id}`);
  return data;
};

export const getPostsByUser = async (userId: string): Promise<Post[]> => {
  const { data } = await http.get<Post[]>("/posts", {
    params: { userId: String(userId) },
  });
  return data;
};

export const createPost = async (payload: CreatePostPayload): Promise<Post> => {
  const { data } = await http.post<Post>("/posts", payload);
  return data;
};

export const updatePost = async (
  id: string,
  payload: UpdatePostPayload,
): Promise<Post> => {
  const { data } = await http.put<Post>(`/posts/${id}`, payload);
  return data;
};

export const patchPost = async (
  id: string,
  payload: UpdatePostPayload,
): Promise<Post> => {
  const { data } = await http.patch<Post>(`/posts/${id}`, payload);
  return data;
};

export const deletePost = async (id: string): Promise<void> => {
  await http.delete(`/posts/${id}`);
};
