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
  agencyId: number;
  policyPlanId: number;
  status: LeadStatus;
}

export interface LeadInteraction {
  id: number;
  leadId: number;
  agentId: number;
  type: InteractionType;
  status: InteractionStatus;
  description: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  dueDate: Date;
  lead?: Lead;
  agent?: User;
}

export interface CreateLeadInteractionRequest {
  leadId: number;
  agentId: number;
  type: InteractionType;
  description: string;
  notes?: string;
  dueDate: Date;
  status: InteractionStatus;
}

export type UpdateLeadInteractionRequest =
  Partial<CreateLeadInteractionRequest>;

export type UpdateLeadRequest = Partial<CreateLeadRequest>;

export const leadService = {
  // ✅ Create a new lead
  async createLead(payload: CreateLeadRequest): Promise<Lead> {
    const { data } = await api.post<Lead>("/leads", payload);
    return data;
  },

  // ✅ Get all leads (optionally filter by agent/userId)
  async getLeads(userId?: number): Promise<Lead[]> {
    const { data } = await api.get<Lead[]>("/leads", {
      params: userId ? { userId } : {},
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

  async getLeadInteractions(leadId?: number) {
    const { data } = await api.get(`/lead-interactions`, {
      params: { leadId }, // axios will handle encoding
    });
    return data;
  },
};

export const leadInteractionService = {
  // ✅ Create a new interaction
  async createInteraction(
    payload: CreateLeadInteractionRequest
  ): Promise<LeadInteraction> {
    const { data } = await api.post<LeadInteraction>(
      "/lead-interactions",
      payload
    );
    return data;
  },

  // ✅ Get all interactions (optionally filter by leadId)
  async getInteractions(leadId?: number): Promise<LeadInteraction[]> {
    const { data } = await api.get<LeadInteraction[]>("/lead-interactions", {
      params: leadId ? { leadId } : {},
    });
    return data;
  },

  // ✅ Get single interaction by ID
  async getInteraction(id: number): Promise<LeadInteraction> {
    const { data } = await api.get<LeadInteraction>(`/lead-interactions/${id}`);
    return data;
  },

  // ✅ Update an interaction
  async updateInteraction(
    id: number,
    payload: UpdateLeadInteractionRequest
  ): Promise<LeadInteraction> {
    const { data } = await api.patch(`/lead-interactions/${id}`, payload);
    return data;
  },

  // ✅ Delete an interaction
  async deleteInteraction(id: number): Promise<void> {
    await api.delete(`/lead-interactions/${id}`);
  },
};
