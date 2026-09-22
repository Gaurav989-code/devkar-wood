import api from "./api.js";

export const getAdminDashboardRequest =
  async () => {
    const response = await api.get(
      "/admin/dashboard",
    );

    return response.data;
  };