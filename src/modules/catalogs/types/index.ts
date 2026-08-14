export interface CatalogItem {
  id: string;
  name: string;
  created_at: string;
}

export interface ContactItem {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CatalogConfig {
  key: string;
  label: string;
  table: string;
}

export const CATALOG_CONFIGS: CatalogConfig[] = [
  { key: 'property_types', label: 'Tipos de Inmueble', table: 'house_property_types' },
  { key: 'transaction_types', label: 'Tipos de Transacción', table: 'house_transaction_types' },
  { key: 'localities', label: 'Localidades', table: 'house_localities' },
  { key: 'property_states', label: 'Estados de Inmueble', table: 'house_property_states' },
  { key: 'appointment_states', label: 'Estados de Cita', table: 'house_appointment_states' },
  { key: 'contacts', label: 'Contactos', table: 'house_contacts' },
];
