import api from "@/lib/api";
import { LoginCredentials, RegisterCredentials, AuthResponse } from "@/types/auth";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<any> {
    const response = await api.post("/auth/register", credentials);
    return response.data;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
