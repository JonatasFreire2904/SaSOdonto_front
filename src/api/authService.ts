import api from "./axiosConfig";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  userName: string;
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  async getMe(): Promise<AuthResponse> {
    const response = await api.get("/auth/me");
    return response.data;
  },
};