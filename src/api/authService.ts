import axios from "./axiosConfig";

export const authService = {
  async login(data: { email: string; password: string }) {
    const response = await axios.post("/auth/login", data);
    return response.data;
  },
};