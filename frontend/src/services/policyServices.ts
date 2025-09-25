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
}

export interface CreatePolicyPlanRequest {
  categoryId: number;
  planName: string;
  monthlyRate: number;
  currency: string;
  coverageAmount: number;
  status?: "active" | "inactive";
}
