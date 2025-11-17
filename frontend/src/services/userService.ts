import type { Agency } from "./agencyService";
import api from "./api";

export enum UserRole {
  ADMIN = "admin",
  AGENT = "agent",
  COLLECTION_SUPERVISOR = "collection_supervisor",
  SUPER_ADMIN = "super_admin",
}

export interface User {
  id: number;
  firstName: string;
  agency: Agency;
  supervisor?: User;
  lastName: string;
  email: string;
  phoneNumber: string;
  landlineNumber?: string;
  officeHours?: string;
  role: UserRole;
  agencyId: number;
  supervisorId?: number | null;
  isActive: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phoneNumber: string;
  landlineNumber?: string | null;
  officeHours?: string;
  isActive?: boolean;
  role: UserRole;
  agencyId: number;
  supervisorId?: number | null;
}

export interface UserUpdateRequest {
  firstName: string;
  lastName: string;
  email: string; // read-only in your form, but still part of the type
  phoneNumber: string;
  landlineNumber?: string | null;
  officeHours?: string | null;
  role: UserRole;
  isActive: boolean;
  agencyId: number;
  supervisorId?: number | null;
} 

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export const userService = {
  async getUsers(agencyId?: number): Promise<User[]> {
    const params = agencyId ? { agencyId } : {};
    const response = await api.get("/users", { params });
    return response.data;
  },

  async getUserById(id: number): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await api.post("/users", userData);
    return response.data;
  },

  async updateUser(
    id: number,
    userData: Partial<UserUpdateRequest>
  ): Promise<User> {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async deactivateUser(id: number): Promise<User> {
    const response = await api.patch(`/users/deactivate/${id}`);
    return response.data;
  },

  async activateUser(id: number): Promise<User> {
    const response = await api.patch(`/users/activate/${id}`);
    return response.data;
  }, 

  async changePassword(id: number, data: ChangePasswordRequest): Promise<void> {
    await api.patch(`/users/${id}/change-password`, data);
  },

  async isEmailTaken(email: string): Promise<boolean> {
    const response = await api.get(`/users/check-email`, {
      params: { email }, // axios will handle encoding
    });
    return response.data.exists; // assuming your backend returns { exists: true/false }
  },
};
