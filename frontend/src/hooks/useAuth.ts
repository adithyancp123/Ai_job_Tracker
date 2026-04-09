import { clearToken, getToken, setToken } from "../services/storage";

export const useAuth = () => {
  const isAuthenticated = (): boolean => Boolean(getToken());

  const loginWithToken = (token: string): void => {
    setToken(token);
  };

  const logout = (): void => {
    clearToken();
  };

  return {
    isAuthenticated,
    loginWithToken,
    logout
  };
};
