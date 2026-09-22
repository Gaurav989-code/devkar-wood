import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const normalizedError = {
      status: error.response?.status || 500,

      message:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong",

      errors: error.response?.data?.errors || [],
    };

    return Promise.reject(normalizedError);
  },
);

export default api;
