import api from "./api";
import type { SOA } from "./policyHolderService"; // or wherever your SOA type is

// ==========================
// 📘 Types
// ==========================

export enum BillingStatus {
  PENDING = "Pending",
  PAID = "Paid",
  OVERDUE = "Overdue",
  LAPSED = "Lapsed",
}

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
  soa?: SOA;
}

// Create DTO
export interface CreateBillingRequest {
  soaId: number;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  amountPaid?: number;
  paidDate?: string;
  status?: BillingStatus;
  receiptNumber?: string;
}

// Update DTO (Partial allows flexible patch updates)
export type UpdateBillingRequest = Partial<CreateBillingRequest>;

// ==========================
// ⚙️ Billing Service
// ==========================

export const billingService = {
  /** ✅ Create Billing */
  async create(data: CreateBillingRequest): Promise<Billing> {
    const res = await api.post<Billing>("/billings", data);
    return res.data;
  },

  /** ✅ Get All Billings */
  async getAll(): Promise<Billing[]> {
    const res = await api.get<Billing[]>("/billings");
    return res.data;
  },

  /** ✅ Get Billing by ID */
  async getById(id: number): Promise<Billing> {
    const res = await api.get<Billing>(`/billings/${id}`);
    return res.data;
  },

  /** ✅ Update Billing (includes payments, triggers commission on backend) */
  async update(id: number, data: UpdateBillingRequest): Promise<Billing> {
    const res = await api.patch<Billing>(`/billings/${id}`, data);
    console.log("update.data", data);
    return res.data;
  },

  /** ✅ Delete Billing */
  async remove(id: number): Promise<void> {
    await api.delete(`/billings/${id}`);
  },

  async getNearDueBillings(userId: number, daysAhead: number = 5) {
    console.log("Fetching near due billings with daysAhead:", daysAhead);
    const res = await api.get(`/billings/near-due`, {
      params: { userId, daysAhead },
    });
    console.log("Near due billings response:", res.data);
    return res.data;
  },
};
