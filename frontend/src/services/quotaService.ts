import api from "./api"; // your existing Axios instance
export interface CreateQuotaRequest {
  year: number;
  month: string;
  targetPolicies: number;
  adminId: number; // ✅ Added adminId
}

export interface Quota {
  id: number;
  month: string;
  year: number;
  targetPolicies: number;
  agencyId: number;
  createdBy?: number;
  updatedBy?: number;
  createdAt: string;
  updatedAt: string;
}

export const quotaService = {
  // 🟢 Create a new quota (auto-assigns agent quotas)
  async create(data: CreateQuotaRequest) {
    const res = await api.post("/quotas", data);
    return res.data as Quota;
  },

  // 🟢 Get all quotas (with agent performance)
  async getAll(agencyId: number) {
    const res = await api.get(`/quotas?agencyId=${agencyId}`);
    return res.data as Quota[];
  },

  // 🟢 Get single quota by ID
  async getQuotaById(id: number) {
    const res = await api.get(`/quotas/${id}`);
    return res.data;
  },

  // 🟡 Update quota (e.g. change targetPolicies)
  async updateQuota(
    id: number,
    data: Partial<{ month: string; year: number; targetPolicies: number }>
  ) {
    const res = await api.patch(`/quotas/${id}`, data);
    return res.data;
  },
};
