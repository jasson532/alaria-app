import { supabase } from 'modules/shared/services/supabase';
import type { LoginCredentials, RegisterData, HouseUser } from '../types';

const USER_SESSION_KEY = 'house_user_session';

export const authService = {
  async login({ email, password }: LoginCredentials): Promise<HouseUser> {
    const { data, error } = await supabase
      .from('house_users')
      .select('*, house_roles(name)')
      .eq('email', email)
      .eq('password', password)
      .eq('is_active', true)
      .single();

    if (error || !data) throw new Error('Correo o contraseña incorrectos');

    // Guardar sesión en localStorage
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(data));
    return data;
  },

  async register({ email, password, full_name, phone, address, locality_id, stratum_id }: RegisterData): Promise<HouseUser> {
    // Verificar si el email ya existe
    const { data: existing } = await supabase
      .from('house_users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) throw new Error('Este correo ya está registrado');

    // Obtener rol 'user' por defecto
    const { data: roleData, error: roleError } = await supabase
      .from('house_roles')
      .select('id')
      .eq('name', 'user')
      .single();
    if (roleError) throw roleError;

    // Crear usuario
    const { data, error } = await supabase
      .from('house_users')
      .insert({
        email,
        password,
        full_name,
        phone: phone || null,
        address: address || null,
        locality_id: locality_id || null,
        stratum_id: stratum_id || null,
        role_id: roleData.id,
      })
      .select('*, house_roles(name)')
      .single();

    if (error) throw error;

    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(data));
    return data;
  },

  logout() {
    localStorage.removeItem(USER_SESSION_KEY);
  },

  getStoredSession(): HouseUser | null {
    const stored = localStorage.getItem(USER_SESSION_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },
};
