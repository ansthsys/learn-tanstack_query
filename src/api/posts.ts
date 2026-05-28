import http from "./http";

export type Post = {
  id: number;
  title: string;
  body: string;
  userId: number;
  likes: number;
  published: boolean;
  createdAt: string;
};

export type CreatePostPayload = Omit<Post, "id">;
export type UpdatePostPayload = Partial<CreatePostPayload>;

export const getPosts = async (
  params?: Record<string, string>,
): Promise<Post[]> => {
  const { data } = await http.get<Post[]>("/posts", { params });
  return data;
};

export const getPostById = async (id: number): Promise<Post> => {
  const { data } = await http.get<Post>(`/posts/${id}`);
  return data;
};

export const getPostsByUser = async (userId: number): Promise<Post[]> => {
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
  id: number,
  payload: UpdatePostPayload,
): Promise<Post> => {
  const { data } = await http.put<Post>(`/posts/${id}`, payload);
  return data;
};

export const patchPost = async (
  id: number,
  payload: UpdatePostPayload,
): Promise<Post> => {
  const { data } = await http.patch<Post>(`/posts/${id}`, payload);
  return data;
};

export const deletePost = async (id: number): Promise<void> => {
  await http.delete(`/posts/${id}`);
};
