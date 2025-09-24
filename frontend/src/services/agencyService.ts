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
  createdAt?: string; // if your backend has timestamps
}
