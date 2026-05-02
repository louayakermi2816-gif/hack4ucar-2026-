/**
 * api.ts — Axios HTTP client configured for the HACK4UCAR backend.
 *
 * What is Axios?
 * A library that makes HTTP requests (GET, POST, etc.) to your API.
 * It's like fetch() but with automatic JSON parsing, interceptors, and error handling.
 *
 * What are interceptors?
 * Middleware that runs before every request or after every response.
 * We use a REQUEST interceptor to automatically attach the JWT token.
 */
import axios from "axios";

const api = axios.create({
  baseURL: "",
  headers: { "Content-Type": "application/json" },
});

// REQUEST interceptor — attaches JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE interceptor — if token expired (401), redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
