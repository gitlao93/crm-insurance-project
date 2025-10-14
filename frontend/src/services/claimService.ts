import api from "./api";
import type { PolicyHolder } from "./policyHolderService";
import type { User } from "./userService";

/** -------------------------------
 * 🧾 ENUMS
 * ------------------------------- */
export enum ClaimStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  PAID = "Paid",
}

export enum ClaimType {
  DEATH = "Death",
  BURIAL = "Burial",
  ACCIDENT = "Accident",
  HOSPITALIZATION = "Hospitalization",
}

/** -------------------------------
 * 🧠 INTERFACES
 * ------------------------------- */
export interface Claim {
  id: number;
  policyHolderId: number;
  policyHolder: PolicyHolder;
  claimType: Partial<Record<ClaimType, number>>;
  description?: string;
  dateFiled: Date;
  status: ClaimStatus;
  createdAt: string;
  updatedAt: string;
  processedBy?: User | null;
}

export interface CreateClaimRequest {
  policyHolderId: number;
  claimType: Partial<Record<ClaimType, number>>;
  description?: string;
  dateFiled: Date;
}

export type UpdateClaimRequest = Partial<CreateClaimRequest> & {
  status?: ClaimStatus;
  amountApproved?: number;
};

/** -------------------------------
 * ⚙️ SERVICE METHODS
 * ------------------------------- */
export const claimService = {
  // ✅ Create new claim
  async createClaim(payload: CreateClaimRequest): Promise<Claim> {
    const { data } = await api.post<Claim>("/claims", payload);
    return data;
  },

  // ✅ Get all claims (optionally filtered by policyHolderId)
  async getClaims(policyHolderId?: number): Promise<Claim[]> {
    const { data } = await api.get<Claim[]>("/claims", {
      params: policyHolderId ? { policyHolderId } : {},
    });
    return data;
  },

  // ✅ Get single claim by ID
  async getClaim(id: number): Promise<Claim> {
    const { data } = await api.get<Claim>(`/claims/${id}`);
    return data;
  },

  // ✅ Update a claim (approve, reject, edit, etc.)
  async updateClaim(id: number, payload: UpdateClaimRequest): Promise<Claim> {
    const { data } = await api.patch<Claim>(`/claims/${id}`, payload);
    return data;
  },

  // ✅ Delete a claim (optional, if supported by backend)
  async deleteClaim(id: number): Promise<void> {
    await api.delete(`/claims/${id}`);
  },
};
