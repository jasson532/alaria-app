export interface HouseProperty {
  id: string;
  title: string;
  description: string | null;
  address: string;
  neighborhood: string | null;
  locality_id: string;
  stratum_id: string;
  property_type_id: string;
  transaction_type_id: string;
  state_id: string;
  price: number;
  admin_fee: number;
  area_m2: number;
  bedrooms: number;
  bathrooms: number;
  parking_spaces: number;
  floor_number: number | null;
  has_balcony: boolean;
  has_elevator: boolean;
  has_gym: boolean;
  has_pool: boolean;
  has_security: boolean;
  year_built: number | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyWithRelations extends HouseProperty {
  house_localities: { name: string };
  house_strata: { level: number; name: string };
  house_property_types: { name: string };
  house_transaction_types: { name: string };
  house_property_states: { name: string };
  house_property_media: PropertyMedia[];
}

export interface PropertyMedia {
  id: string;
  property_id: string;
  file_url: string;
  file_type: 'photo' | 'video';
  file_name: string;
  file_size: number | null;
  is_cover: boolean;
  sort_order: number;
  created_at: string;
}

export interface PropertyFormData {
  title: string;
  description: string;
  address: string;
  neighborhood: string;
  locality_id: string;
  stratum_id: string;
  property_type_id: string;
  transaction_type_id: string;
  state_id: string;
  price: number;
  admin_fee: number;
  area_m2: number;
  bedrooms: number;
  bathrooms: number;
  parking_spaces: number;
  floor_number: number | null;
  has_balcony: boolean;
  has_elevator: boolean;
  has_gym: boolean;
  has_pool: boolean;
  has_security: boolean;
  year_built: number | null;
  latitude: number | null;
  longitude: number | null;
}

export interface PropertyFilters {
  transaction_type_id?: string;
  property_type_id?: string;
  locality_id?: string;
  stratum_id?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
}
