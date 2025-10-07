import api from "./api";

export interface Agency {
  id: number;
  agencyName: string;
  street: string;
  cityMunicipality: string;
  postalCode: string;
  email: string;
  phoneNumber?: string;
  landLine?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Update DTO
export type UpdateAgencyRequest = Partial<Agency>;

// ==========================
// ⚙️ Service
// ==========================
export const agencyService = {
  // ✅ Create a new Agency
  async create(data: Agency): Promise<Agency> {
    const res = await api.post<Agency>("/agencies", data);
    return res.data;
  },

  // ✅ Get all Agencies
  async getAll(): Promise<Agency[]> {
    const res = await api.get<Agency[]>("/agencies");
    return res.data;
  },

  // ✅ Get a single Agency by ID
  async getById(id: number): Promise<Agency> {
    const res = await api.get<Agency>(`/agencies/${id}`);
    return res.data;
  },

  // ✅ Update an Agency
  async update(id: number, data: UpdateAgencyRequest): Promise<Agency> {
    const res = await api.patch<Agency>(`/agencies/${id}`, data);
    return res.data;
  },

  // ✅ Deactivate an Agency
  async deactivate(id: number): Promise<{ message: string }> {
    const res = await api.patch<{ message: string }>(
      `/agencies/deactivate/${id}`
    );
    return res.data;
  },

  // ✅ Activate an Agency
  async activate(id: number): Promise<{ message: string }> {
    const res = await api.patch<{ message: string }>(
      `/agencies/activate/${id}`
    );
    return res.data;
  },
};
