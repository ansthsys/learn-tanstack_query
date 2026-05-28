import http from "./http"

export type Comment = {
  id: number
  postId: number
  userId: number
  body: string
  createdAt: string
}

export type CreateCommentPayload = Omit<Comment, "id">
export type UpdateCommentPayload = Partial<CreateCommentPayload>

export const getComments = async (
  params?: Record<string, string>,
): Promise<Comment[]> => {
  const { data } = await http.get<Comment[]>("/comments", { params })
  return data
}

export const getCommentById = async (id: number): Promise<Comment> => {
  const { data } = await http.get<Comment>(`/comments/${id}`)
  return data
}

export const getCommentsByPost = async (postId: number): Promise<Comment[]> => {
  const { data } = await http.get<Comment[]>("/comments", { params: { postId: String(postId) } })
  return data
}

export const createComment = async (payload: CreateCommentPayload): Promise<Comment> => {
  const { data } = await http.post<Comment>("/comments", payload)
  return data
}

export const updateComment = async (
  id: number,
  payload: UpdateCommentPayload,
): Promise<Comment> => {
  const { data } = await http.put<Comment>(`/comments/${id}`, payload)
  return data
}

export const patchComment = async (
  id: number,
  payload: UpdateCommentPayload,
): Promise<Comment> => {
  const { data } = await http.patch<Comment>(`/comments/${id}`, payload)
  return data
}

export const deleteComment = async (id: number): Promise<void> => {
  await http.delete(`/comments/${id}`)
}
