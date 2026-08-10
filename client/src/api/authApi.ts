import { axiosClient } from "./axiosClient";

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await axiosClient.post<AuthResponse>("/auth/login", { email, password });
    return data;
  },
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const { data } = await axiosClient.post<AuthResponse>("/auth/register", { name, email, password });
    return data;
  },
  me: async (): Promise<AuthResponse["user"]> => {
    const { data } = await axiosClient.get<AuthResponse["user"]>("/auth/me");
    return data;
  },
};