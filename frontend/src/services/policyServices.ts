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
  note?: string;
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
