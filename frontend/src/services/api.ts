import axios from "axios";

import { clearToken, getToken } from "./storage";

const baseUrl = ((import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:5000").replace(
  /\/$/,
  ""
);

const api = axios.create({
  baseURL: `${baseUrl}/api`,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearToken();
    }
    return Promise.reject(error);
  }
);

export default api;
