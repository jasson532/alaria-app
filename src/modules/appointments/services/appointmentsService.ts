import { supabase } from 'modules/shared/services/supabase';
import type { AppointmentWithRelations, CreateAppointmentData } from '../types';

const APPOINTMENT_SELECT = `
  *,
  house_properties(id, title, address),
  house_users(full_name, email, phone),
  house_appointment_states(name)
`;

export const appointmentsService = {
  async getAll(): Promise<AppointmentWithRelations[]> {
    const { data, error } = await supabase
      .from('house_appointments')
      .select(APPOINTMENT_SELECT)
      .order('appointment_date', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getByUser(userId: string): Promise<AppointmentWithRelations[]> {
    const { data, error } = await supabase
      .from('house_appointments')
      .select(APPOINTMENT_SELECT)
      .eq('user_id', userId)
      .order('appointment_date', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async create(appointment: CreateAppointmentData, userId: string): Promise<AppointmentWithRelations> {
    // Obtener estado 'Pendiente'
    const { data: stateData, error: stateError } = await supabase
      .from('house_appointment_states')
      .select('id')
      .eq('name', 'Pendiente')
      .single();
    if (stateError) throw stateError;

    const { data, error } = await supabase
      .from('house_appointments')
      .insert({
        ...appointment,
        user_id: userId,
        state_id: stateData.id,
        notes: appointment.notes || null,
      })
      .select(APPOINTMENT_SELECT)
      .single();
    if (error) throw error;
    return data;
  },

  async updateState(id: string, stateName: string): Promise<void> {
    const { data: stateData, error: stateError } = await supabase
      .from('house_appointment_states')
      .select('id')
      .eq('name', stateName)
      .single();
    if (stateError) throw stateError;

    const { error } = await supabase
      .from('house_appointments')
      .update({ state_id: stateData.id })
      .eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('house_appointments')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
