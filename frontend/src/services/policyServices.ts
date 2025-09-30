import api from "./api";

// ========== Types ==========
export interface PolicyCategory {
  id: number;
  categoryName: string;
  description?: string;
  plans?: PolicyPlan[];
}

export interface PolicyPlan {
  id: number;
  categoryId: number;
  planName: string;
  monthlyRate: number;
  currency: string;
  coverageAmount: number;
  status: "active" | "inactive";
  category?: PolicyCategory;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePolicyCategoryRequest {
  categoryName: string;
  description?: string;
  agencyId: number; // Optional agencyId for associating category with an agency
}

export interface CreatePolicyPlanRequest {
  categoryId: number;
  planName: string;
  monthlyRate: number;
  currency: string;
  coverageAmount: number;
  status?: "active" | "inactive";
}

export type UpdatePolicyPlanRequest = Partial<CreatePolicyPlanRequest>;

export const policyCategoryService = {
  // ✅ Create a new category
  async createCategory(
    data: CreatePolicyCategoryRequest
  ): Promise<PolicyCategory> {
    const res = await api.post<PolicyCategory>("/policy-categories", data);
    return res.data;
  },

  // ✅ Get all categories (optionally filter by agencyId)
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

  // (Optional) if you later extend with plans directly under categories
  async createPlan(data: CreatePolicyPlanRequest): Promise<PolicyPlan> {
    const res = await api.post<PolicyPlan>("/policy-plans", data);
    return res.data;
  },
};

export const policyPlanService = {
  async createPlan(dto: CreatePolicyPlanRequest) {
    const { data } = await api.post<PolicyPlan>("/policy-plans", dto);
    return data;
  },
  async getPlans(categoryId?: number) {
    const { data } = await api.get<PolicyPlan[]>("/policy-plans", {
      params: categoryId ? { categoryId } : {},
    });
    return data;
  },
  async getPlanById(id: number) {
    const { data } = await api.get<PolicyPlan>(`/policy-plans/${id}`);
    return data;
  },
  async updatePlan(id: number, dto: UpdatePolicyPlanRequest) {
    const { data } = await api.patch<PolicyPlan>(`/policy-plans/${id}`, dto);
    return data;
  },
  async deletePlan(id: number) {
    await api.delete(`/policy-plans/${id}`);
  },
};
