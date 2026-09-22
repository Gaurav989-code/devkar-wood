import api from "./api.js";

export const loginAdminRequest = async (credentials) => {
  const response = await api.post("/admin/auth/login", credentials);

  return response.data;
};

export const getCurrentAdminRequest = async () => {
  const response = await api.get("/admin/auth/me");

  return response.data;
};

export const logoutAdminRequest = async () => {
  const response = await api.post("/admin/auth/logout");

  return response.data;
};
