import api from "./api";
import type { AuthRequest, AuthResponse, RegisterRequest } from "../types/auth.types";

const login = async (payload: AuthRequest): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
};

const register = async (payload: RegisterRequest): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return data;
};

const authService = {
  login,
  register
};

export default authService;
