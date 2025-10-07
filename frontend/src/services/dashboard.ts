import api from "./api";

export const dashboardService = {
  async getPolicyHoldersByAgent() {
    const res = await api.get("/dashboard/policyholders-by-agent");
    return res.data;
  },
  async getPoliciesByMonth() {
    const res = await api.get("/dashboard/policies-by-month");
    return res.data;
  },
  async getSummary() {
    const res = await api.get("/dashboard/summary");
    return res.data;
  },
};
