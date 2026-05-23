import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
// Clean up trailing slashes and ensure /api is appended correctly
const cleanBaseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

const API = axios.create({
  baseURL: `${cleanBaseUrl}/api`,
  withCredentials: true, // Required because your backend index.js has credentials: true
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto logout if token is expired or invalid
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if it's a 401 specifically from the server, not just a network error
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only redirect if not already on login to avoid loops
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;