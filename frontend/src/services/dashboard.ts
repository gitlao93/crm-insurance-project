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

  /** 🆕 Sales Performance Report Table */
  async getSalesPerformance() {
    const { data } = await api.get("/dashboard/sales-performance");
    return data;
  },

  async getCollectionSummary(
    supervisorId: number,
    startDate: string,
    endDate: string
  ) {
    const params = new URLSearchParams();
    params.append("supervisorId", supervisorId.toString());
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const { data } = await api.get(
      `/dashboard/collection-summary?${params.toString()}`
    );
    return data;
  },

  async getInstallmentRecovery(
    supervisorId: number,
    startDate: string,
    endDate: string
  ) {
    const params = new URLSearchParams();
    params.append("supervisorId", supervisorId.toString());
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const { data } = await api.get(
      `/dashboard/collection-ir-percentage?${params.toString()}`
    );
    return data;
  },

  /** 📊 NEW — Charts */

  // 🔹 Bar Chart: Collections per Agent
  async getCollectionsPerAgent(supervisorId: number) {
    const { data } = await api.get(
      `/dashboard/charts/collections-per-agent?supervisorId=${supervisorId}`
    );
    return data;
  },

  // 🔹 Pie Chart: Lapsed vs Active Policies
  async getPolicyStatus(supervisorId: number) {
    const { data } = await api.get(
      `/dashboard/charts/policy-status?supervisorId=${supervisorId}`
    );
    return data;
  },

  // 🔹 Line Chart: Monthly Collection Trend
  async getMonthlyCollectionTrend(supervisorId: number) {
    const { data } = await api.get(
      `/dashboard/charts/monthly-collection-trend?supervisorId=${supervisorId}`
    );
    return data;
  },
};
