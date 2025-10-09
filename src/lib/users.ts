import { API } from '@/lib/api';

export type User = { id: number; name: string; email: string; createdAt: string; role: 'user' | 'admin'; };

export const listAllUsers = async (params?: {
  search?: string;
  sortBy?: 'id' | 'name' | 'email' | 'createdAt';
  sortDir?: 'ASC' | 'DESC';
}) => {
  const { data } = await API.get<User[]>('/user/all', { params });
  return data;
};

export const getUser = async (id: number) => {
  const { data } = await API.get<User>('/user/' + id);
  return data;
};

export async function createUser(input: { name: string; email: string; password: string, role: 'user' | 'admin' }) {
  const { data } = await API.post('/user', input);
  return data;
}

export async function updateUser(input: { id: number, name: string; email: string; password: string, role: 'user' | 'admin' }) {
  let user={ name: input.name, email: input.email, password: input.password?input.password:null, role:input.role  }
  const { data } = await API.patch('/user/'+input.id, user);
  return data;
}

export async function deleteUser(id: number) {
  const { data } = await API.delete(`/user/${id}`);
  return data;
}
