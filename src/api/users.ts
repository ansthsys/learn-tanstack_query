import http from "./http";

export type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  active: boolean;
};

export type CreateUserPayload = Omit<User, "id">;
export type UpdateUserPayload = Partial<CreateUserPayload>;

export const getUsers = async (
  params?: Record<string, string>,
): Promise<User[]> => {
  const { data } = await http.get<User[]>("/users", { params })
  return data
}

export const getUserById = async (id: number): Promise<User> => {
  const { data } = await http.get<User>(`/users/${id}`);
  return data;
};

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const { data } = await http.post<User>("/users", payload);
  return data;
};

export const updateUser = async (
  id: number,
  payload: UpdateUserPayload
): Promise<User> => {
  const { data } = await http.put<User>(`/users/${id}`, payload);
  return data;
};

export const patchUser = async (
  id: number,
  payload: UpdateUserPayload
): Promise<User> => {
  const { data } = await http.patch<User>(`/users/${id}`, payload);
  return data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await http.delete(`/users/${id}`);
};
