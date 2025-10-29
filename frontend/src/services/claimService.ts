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
  dateProcessed?: Date | null;
  remarks?: string | null;
}

export interface CreateClaimRequest {
  policyHolderId: number;
  claimType: Partial<Record<ClaimType, number>>;
  description?: string;
  dateFiled: Date;
}

export type UpdateClaimRequest = Partial<CreateClaimRequest> & {
  processedBy: number;
  status: ClaimStatus;
  remarks?: string | null;
  dateProcessed: Date;
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
  async getClaims(
    agencyId?: number,
    policyHolderId?: number
  ): Promise<Claim[]> {
    const params: Record<string, number> = {};

    if (agencyId) params.agencyId = agencyId;
    if (policyHolderId) params.policyHolderId = policyHolderId;

    const { data } = await api.get<Claim[]>("/claims", { params });
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
    console.log("Updated claim data:", data);
    return data;
  },

  // ✅ Delete a claim (optional, if supported by backend)
  async deleteClaim(id: number): Promise<void> {
    await api.delete(`/claims/${id}`);
  },
};
