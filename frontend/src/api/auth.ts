import api from './axios';
import { ApiResponse, User } from '../types';

interface AuthPayload {
  token: string;
  user: User;
}

export const authApi = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
    role?: 'admin' | 'sales_user';
  }): Promise<AuthPayload> => {
    const res = await api.post<ApiResponse<AuthPayload>>('/auth/register', data);
    return res.data.data!;
  },

  login: async (data: { email: string; password: string }): Promise<AuthPayload> => {
    const res = await api.post<ApiResponse<AuthPayload>>('/auth/login', data);
    return res.data.data!;
  },

  getMe: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data!;
  },
};
