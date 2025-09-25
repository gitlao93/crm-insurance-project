import api from "./api";
import type { PolicyPlan } from "./policyServices";
import type { User } from "./userService";

export enum LeadStatus {
  NEW = "New",
  INPROGRESS = "In-Progress",
  CONVERTED = "Converted",
  DROPPED = "Dropped",
}

export enum InteractionType {
  CALL = "call",
  MEETING = "meeting",
  FOLLOW_UP = "follow-up",
  EMAIL = "email",
}

export enum InteractionStatus {
  PENDING = "Pending",
  COMPLETED = "Completed",
  RESCHEDULED = "Rescheduled",
}

export interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  status: LeadStatus;
  agentId: number;
  agent: User;
  policyPlanId: number;
  policyPlan: PolicyPlan;
  createdAt: string;
}

export interface CreateLeadRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  agentId: number;
  policyPlanId: number;
  status: LeadStatus;
}

export type UpdateLeadRequest = Partial<CreateLeadRequest>;

export const leadService = {
  // ✅ Create a new lead
  async createLead(payload: CreateLeadRequest): Promise<Lead> {
    const { data } = await api.post<Lead>("/leads", payload);
    return data;
  },

  // ✅ Get all leads (optionally filter by agent/userId)
  async getLeads(agencyId?: number): Promise<Lead[]> {
    const { data } = await api.get<Lead[]>("/leads", {
      params: agencyId ? { agencyId } : {},
    });
    return data;
  },

  // ✅ Get single lead by ID
  async getLead(id: number): Promise<Lead> {
    const { data } = await api.get<Lead>(`/leads/${id}`);
    return data;
  },

  // ✅ Update a lead
  async updateLead(id: number, payload: UpdateLeadRequest): Promise<Lead> {
    const { data } = await api.patch<Lead>(`/leads/${id}`, payload);
    return data;
  },

  // ✅ Drop a lead (set status = DROPPED on backend)
  async dropLead(id: number): Promise<Lead> {
    const { data } = await api.patch<Lead>(`/leads/drop/${id}`);
    return data;
  },

  // ✅ Delete a lead
  async deleteLead(id: number): Promise<void> {
    await api.delete(`/leads/${id}`);
  },

  async getLeadInteractions(leadId?: number): Promise<string[]> {
    const { data } = await api.get<string[]>(`/lead-interactions`, {
      params: { leadId }, // axios will handle encoding
    });
    return data;
  },
};
