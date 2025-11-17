import api from "./api";
import type { PolicyPlan, PolicyTerm } from "./policyServices";
import type { User } from "./userService";

// ==========================
// 📘 Types
// ==========================

/** ========================
 * 🧾 Billing Status Enum
 * ======================== */
export enum BillingStatus {
  PENDING = "Pending",
  PAID = "Paid",
  OVERDUE = "Overdue",
  LAPSED = "Lapsed",
}

/** ========================
 * 💰 Billing Interface
 * ======================== */
export interface Billing {
  id: number;
  soaId: number;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  amountPaid: number;
  paidDate?: string | null;
  status: BillingStatus;
  receiptNumber?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** ========================
 * 📄 SOA (Statement of Account)
 * ======================== */
export interface SOA {
  id: number;
  policyHolderId: number;
  policyPlanId: number;
  policyPlan: PolicyPlan;
  startDate: string;
  endDate: string;
  paymentTerm: PolicyTerm; // e.g. 'Monthly' | 'Quarterly' | 'Annually'
  duration: number; // number of months/years
  premiumPerTerm: number;
  totalPremium: number;
  totalPaid: number;
  balance: number;
  policyNumber: string;
  status: string; // e.g. 'Active'
  billings: Billing[];
  createdAt?: string;
  updatedAt?: string;
} 

// Optional enum for status (you can adjust based on your backend schema)
export enum PolicyHolderStatus {
  ACTIVE = "Active",
  RENEWALDUE = "Renewal Due",
  LAPSABLE = "Lapsable",
  LAPSED = "Lapsed",
  CANCELLED = "Cancelled",
}

// Represents a single Policy Holder record
export interface PolicyHolder {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  occupation?: string;
  email?: string;
  policyPlanId: number;
  agentId?: number;
  agencyId?: number;
  status: PolicyHolderStatus;
  createdAt?: string;
  updatedAt?: string;
  StartDate?: string;
  EndDate?: string;
  // Optional relations
  policyPlan: PolicyPlan;
  agent: User;
  leadId?: number | null;
  soa: SOA;
  receiptNumber?: string | null;
  policyNumber: string;
}

// Create DTO
export interface CreatePolicyHolderRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  occupation: string;
  email: string;
  policyPlanId: number;
  agentId: number;
  agencyId: number;
  StartDate?: string;
  EndDate?: string;
  status: PolicyHolderStatus;
  leadId?: number | null;
  receiptNumber?: string | null;
}

// Update DTO
export type UpdatePolicyHolderRequest = Partial<CreatePolicyHolderRequest>;

// ==========================
// ⚙️ Service
// ==========================
export const policyHolderService = {
  // ✅ Create Policy Holder
  async create(data: CreatePolicyHolderRequest): Promise<PolicyHolder> {
    const res = await api.post<PolicyHolder>("/policy-holders", data);
    return res.data;
  },

  // ✅ Get All Policy Holders (optionally filter by userId)
  async getAll(userId?: number): Promise<PolicyHolder[]> {
    const res = await api.get<PolicyHolder[]>("/policy-holders", {
      params: userId ? { userId } : {},
    });
    return res.data;
  },

  async findPolicyHolder(policyNumber: string): Promise<PolicyHolder> {
    const { data } = await api.get<PolicyHolder>(
      `/policy-holder/policy/${policyNumber}`
    );
    return data;
  },

  // ✅ Get Single Policy Holder by ID
  async getById(id: number): Promise<PolicyHolder> {
    const res = await api.get<PolicyHolder>(`/policy-holders/${id}`);
    return res.data;
  },

  // ✅ Update Policy Holder
  async update(
    id: number,
    data: UpdatePolicyHolderRequest
  ): Promise<PolicyHolder> {
    const res = await api.patch<PolicyHolder>(`/policy-holders/${id}`, data);
    return res.data;
  },

  // ✅ Delete Policy Holder
  async remove(id: number): Promise<void> {
    await api.delete(`/policy-holders/${id}`);
  },
};
