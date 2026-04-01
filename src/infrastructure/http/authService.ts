/**
 * INFRASTRUCTURE — Auth HTTP Service
 */

import apiClient from "@/infrastructure/http/apiClient";
import type { LoginRequest, RegisterRequest, AuthResponse } from "@/domain/types";

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post("/auth/login", data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post("/auth/register", data);
    return response.data;
  },

  async getMe(): Promise<AuthResponse> {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },
};
