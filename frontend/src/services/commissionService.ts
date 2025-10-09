// src/services/commissionService.ts
import api from "./api";
import type { Billing } from "./billingService";
import type { PolicyHolder } from "./policyHolderService";
import type { PolicyPlan } from "./policyServices";
import type { User } from "./userService";

// ==========================
// 📘 Types
// ==========================

export interface Commission {
  id: number;
  billingId: number;
  soaId: number;
  policyPlanId: number;
  policyHolderId: number;
  agentId: number;
  amount: number;
  paid: boolean;
  createdAt?: string;
  updatedAt?: string;

  // Optional nested relations (depending on backend populate)
  billing?: Billing;
  policyPlan?: PolicyPlan;
  policyHolder?: PolicyHolder;
  agent?: User;
}

// ==========================
// ⚙️ Commission Service
// ==========================

export const commissionService = {
  /** ✅ Get all commissions */
  async getAll(): Promise<Commission[]> {
    const res = await api.get<Commission[]>("/commissions");
    return res.data;
  },

  /** ✅ Get commissions by agent */
  async getByAgent(agentId: number): Promise<Commission[]> {
    const res = await api.get<Commission[]>(`/commissions/agent/${agentId}`);
    return res.data;
  },

  /** ✅ Manually trigger commission creation for a billing */
  async createForBilling(billingId: number): Promise<Commission> {
    const res = await api.post<Commission>(`/commissions/create/${billingId}`);
    return res.data;
  },
};
