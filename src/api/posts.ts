import http from "./http";

export type Post = {
  id: string
  title: string
  body: string
  userId: string
  likes: number
  published: boolean
  createdAt: string
}

export type CreatePostPayload = Omit<Post, "id">
export type UpdatePostPayload = Partial<CreatePostPayload>

type JsonServerPage<T> = {
  data: T[]
  items: number
  first: number
  prev: number | null
  next: number | null
  last: number
  pages: number
}

export type PostPaginatedResult = {
  posts: Post[]
  totalPages: number
  totalItems: number
  currentPage: number
  hasNext: boolean
  hasPrev: boolean
}

export const getPostsPaginated = async ({
  page = 1,
  limit = 3,
}: { page?: number; limit?: number } = {}): Promise<PostPaginatedResult> => {
  const res = await http.get<JsonServerPage<Post>>("/posts", {
    params: { _page: page, _per_page: limit },
  })
  return {
    posts: res.data.data,
    totalPages: res.data.last,
    totalItems: res.data.items,
    currentPage: page,
    hasNext: res.data.next !== null,
    hasPrev: res.data.prev !== null,
  }
}



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
