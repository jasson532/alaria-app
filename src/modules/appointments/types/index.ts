export interface HouseAppointment {
  id: string;
  property_id: string;
  user_id: string;
  appointment_date: string;
  appointment_time: string;
  notes: string | null;
  state_id: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentWithRelations extends HouseAppointment {
  house_properties: { id: string; title: string; address: string };
  house_users: { full_name: string; email: string; phone: string | null };
  house_appointment_states: { name: string };
}

export interface CreateAppointmentData {
  property_id: string;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
}
