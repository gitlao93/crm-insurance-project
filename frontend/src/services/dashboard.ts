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

  async getSalesTrend() {
    const { data } = await api.get("/dashboard/sales-trend");
    return data;
  },

  async getTopAgents() {
    const { data } = await api.get("/dashboard/top-agents");
    return data;
  },

  async getLeadConversion() {
    const { data } = await api.get("/dashboard/lead-conversion");
    return data;
  },
};
