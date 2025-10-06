import api from "./api";

// ========== Types ==========
export enum PolicyStatus {
  ACTIVE = "Active",
  RETIRED = "Retired",
}

export enum PolicyType {
  LIFE = "Life Plan",
  BURIAL = "Burial Plan",
}

export enum PolicyTerm {
  MONTHLY = "Monthly",
  QUARTERLY = "Quarterly",
  ANNUALLY = "Annually",
}

export interface PolicyCategory {
  id: number;
  categoryName: string;
  description?: string;
  plans?: PolicyPlan[];
}

export interface PolicyPlan {
  id: number;
  policyName: string;
  policyType: PolicyType;
  term: PolicyTerm;
  duration: number;
  commition_rate: number;
  premium: number;
  status: "active" | "inactive" | string;
  categoryId: number;
  category?: PolicyCategory;
  createdAt?: string;
  updatedAt?: string;
}

// ========== Requests ==========

export interface CreatePolicyCategoryRequest {
  categoryName: string;
  description?: string;
  agencyId: number;
}

export interface CreatePolicyPlanRequest {
  policyName: string;
  policyType: PolicyType;
  term: PolicyTerm;
  duration: number;
  commition_rate: number;
  premium: number;
  status: "Active" | "Retired";
  categoryId: number;
}

export type UpdatePolicyPlanRequest = Partial<CreatePolicyPlanRequest>;

// ========== Services ==========

export const policyCategoryService = {
  // ✅ Create a new category
  async createCategory(
    data: CreatePolicyCategoryRequest
  ): Promise<PolicyCategory> {
    const res = await api.post<PolicyCategory>("/policy-categories", data);
    return res.data;
  },

  // ✅ Get all categories (optionally filtered by agencyId)
  async getCategories(agencyId?: number): Promise<PolicyCategory[]> {
    const res = await api.get<PolicyCategory[]>("/policy-categories", {
      params: agencyId ? { agencyId } : {},
    });
    return res.data;
  },

  // ✅ Get a single category by ID
  async getCategory(id: number): Promise<PolicyCategory> {
    const res = await api.get<PolicyCategory>(`/policy-categories/${id}`);
    return res.data;
  },

  // ✅ Update a category
  async updateCategory(
    id: number,
    data: Partial<CreatePolicyCategoryRequest>
  ): Promise<PolicyCategory> {
    const res = await api.patch<PolicyCategory>(
      `/policy-categories/${id}`,
      data
    );
    return res.data;
  },

  // ✅ Delete a category
  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/policy-categories/${id}`);
  },
};

export const policyPlanService = {
  // ✅ Create a plan
  async createPlan(dto: CreatePolicyPlanRequest): Promise<PolicyPlan> {
    const { data } = await api.post<PolicyPlan>("/policy-plans", dto);
    return data;
  },

  // ✅ Get all plans (optionally by categoryId)
  async getPlans(categoryId?: number): Promise<PolicyPlan[]> {
    const { data } = await api.get<PolicyPlan[]>("/policy-plans", {
      params: categoryId ? { categoryId } : {},
    });
    return data;
  },

  // ✅ Get a single plan
  async getPlanById(id: number): Promise<PolicyPlan> {
    const { data } = await api.get<PolicyPlan>(`/policy-plans/${id}`);
    return data;
  },

  // ✅ Update a plan
  async updatePlan(id: number, dto: Partial<PolicyPlan>): Promise<PolicyPlan> {
    const { data } = await api.patch<PolicyPlan>(`/policy-plans/${id}`, dto);
    return data;
  },

  // ✅ Delete a plan
  async deletePlan(id: number): Promise<void> {
    await api.delete(`/policy-plans/${id}`);
  },
};
