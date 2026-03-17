import axios from "axios";

// Create an Axios instance with base URL for the backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000", // Default Flask API port
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the JWT token if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
