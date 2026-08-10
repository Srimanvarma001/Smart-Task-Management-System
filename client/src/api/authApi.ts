import { axiosClient, type ApiResponse } from "./axiosClient";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const authApi = {
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const { data } = await axiosClient.post<ApiResponse<AuthResponse>>("/auth/register", {
      name,
      email,
      password,
    });
    return data.data;
  },
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await axiosClient.post<ApiResponse<AuthResponse>>("/auth/login", { email, password });
    return data.data;
  },
  getMe: async (): Promise<AuthUser> => {
    const { data } = await axiosClient.get<ApiResponse<AuthUser>>("/auth/me");
    return data.data;
  },
};