import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { appointmentsService } from '../services/appointmentsService';
import type { AppointmentWithRelations, CreateAppointmentData } from '../types';

interface AppointmentsState {
  items: AppointmentWithRelations[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AppointmentsState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchAllAppointments = createAsyncThunk('appointments/fetchAll', async () => {
  return await appointmentsService.getAll();
});

export const fetchUserAppointments = createAsyncThunk(
  'appointments/fetchByUser',
  async (userId: string) => {
    return await appointmentsService.getByUser(userId);
  },
);

export const createAppointment = createAsyncThunk(
  'appointments/create',
  async ({ data, userId }: { data: CreateAppointmentData; userId: string }) => {
    return await appointmentsService.create(data, userId);
  },
);

export const updateAppointmentState = createAsyncThunk(
  'appointments/updateState',
  async ({ id, stateName }: { id: string; stateName: string }) => {
    await appointmentsService.updateState(id, stateName);
    return { id, stateName };
  },
);

export const deleteAppointment = createAsyncThunk(
  'appointments/delete',
  async (id: string) => {
    await appointmentsService.delete(id);
    return id;
  },
);

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAllAppointments.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAllAppointments.fulfilled, (state, action) => {
      state.isLoading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchAllAppointments.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Error al cargar citas';
    });

    builder.addCase(fetchUserAppointments.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchUserAppointments.fulfilled, (state, action) => {
      state.isLoading = false;
      state.items = action.payload;
    });

    builder.addCase(createAppointment.fulfilled, (state, action) => {
      state.items.push(action.payload);
    });

    builder.addCase(updateAppointmentState.fulfilled, (state, action) => {
      const item = state.items.find((a) => a.id === action.payload.id);
      if (item) {
        item.house_appointment_states = { name: action.payload.stateName };
      }
    });

    builder.addCase(deleteAppointment.fulfilled, (state, action) => {
      state.items = state.items.filter((a) => a.id !== action.payload);
    });
  },
});

export default appointmentsSlice.reducer;
