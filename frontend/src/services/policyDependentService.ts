import api from "./api";
import type { PolicyHolder } from "./policyHolderService";

// ==========================
// 📘 Types
// ==========================

export interface PolicyDependent {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  relationship?: string;
  policyHolderId: string;
  createdAt?: string;
  updatedAt?: string;

  // Optional relation (for populated responses)
  policyHolder?: PolicyHolder;
}

// Create DTO
export interface CreatePolicyDependentRequest {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  relationship?: string;
  policyHolderId: number | null;
}

// Update DTO
export type UpdatePolicyDependentRequest =
  Partial<CreatePolicyDependentRequest>;

// ==========================
// ⚙️ Service
// ==========================

export const policyDependentService = {
  // ✅ Create Policy Dependent
  async create(data: CreatePolicyDependentRequest): Promise<PolicyDependent> {
    const res = await api.post<PolicyDependent>("/policy-dependents", data);
    return res.data;
  },

  // ✅ Get All Policy Dependents
  async getAll(): Promise<PolicyDependent[]> {
    const res = await api.get<PolicyDependent[]>("/policy-dependents");
    return res.data;
  },

  // ✅ Get Single Policy Dependent by ID
  async getById(id: string): Promise<PolicyDependent> {
    const res = await api.get<PolicyDependent>(`/policy-dependents/${id}`);
    return res.data;
  },

  // ✅ Get All Dependents by Policy Holder ID
  async getByPolicyHolder(policyHolderId: string): Promise<PolicyDependent[]> {
    const res = await api.get<PolicyDependent[]>(
      `/policy-dependents/holder/${policyHolderId}`
    );
    return res.data;
  },

  // ✅ Update Policy Dependent
  async update(
    id: string,
    data: UpdatePolicyDependentRequest
  ): Promise<PolicyDependent> {
    const res = await api.patch<PolicyDependent>(
      `/policy-dependents/${id}`,
      data
    );
    return res.data;
  },

  // ✅ Delete Policy Dependent
  async remove(id: string): Promise<void> {
    await api.delete(`/policy-dependents/${id}`);
  },
};
