import { API } from '@/lib/api';

export type User = { id:number; name:string; email:string; createdAt:string };

export const listAllUsers = async (params?: {
  search?: string;
  sortBy?: 'id'|'name'|'email'|'createdAt';
  sortDir?: 'ASC'|'DESC';
}) => {
  const { data } = await API.get<User[]>('/user/all', { params });
  return data;
};
