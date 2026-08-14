export interface HouseUser {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  address: string | null;
  locality_id: string | null;
  stratum_id: string | null;
  role_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  house_roles?: { name: string };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  address?: string;
  locality_id?: string;
  stratum_id?: string;
}

export type UserRole = 'admin' | 'user';
