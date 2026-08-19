import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { propertiesService } from '../services/propertiesService';
import type { PropertyWithRelations, PropertyFormData, PropertyFilters } from '../types';

interface PropertiesState {
  items: PropertyWithRelations[];
  selectedProperty: PropertyWithRelations | null;
  isLoading: boolean;
  error: string | null;
  filters: PropertyFilters;
}

const initialState: PropertiesState = {
  items: [],
  selectedProperty: null,
  isLoading: false,
  error: null,
  filters: {},
};

export const fetchProperties = createAsyncThunk(
  'properties/fetchAll',
  async ({ filters, includePending }: { filters?: PropertyFilters; includePending?: boolean } = {}) => {
    return await propertiesService.getAll(filters, includePending);
  },
);

export const fetchPropertyById = createAsyncThunk(
  'properties/fetchById',
  async (id: string) => {
    return await propertiesService.getById(id);
  },
);

export const createProperty = createAsyncThunk(
  'properties/create',
  async ({ data, createdBy }: { data: PropertyFormData; createdBy: string }) => {
    return await propertiesService.create(data, createdBy);
  },
);

export const updateProperty = createAsyncThunk(
  'properties/update',
  async ({ id, data }: { id: string; data: Partial<PropertyFormData> }) => {
    return await propertiesService.update(id, data);
  },
);

const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = action.payload;
    },
    clearSelectedProperty(state) {
      state.selectedProperty = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder.addCase(fetchProperties.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchProperties.fulfilled, (state, action) => {
      state.isLoading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchProperties.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Error al cargar inmuebles';
    });

    // Fetch by ID
    builder.addCase(fetchPropertyById.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchPropertyById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.selectedProperty = action.payload;
    });
    builder.addCase(fetchPropertyById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Error al cargar inmueble';
    });

    // Create
    builder.addCase(createProperty.fulfilled, (state, action) => {
      state.items.unshift(action.payload);
    });

    // Update
    builder.addCase(updateProperty.fulfilled, (state, action) => {
      const index = state.items.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) state.items[index] = action.payload;
      if (state.selectedProperty?.id === action.payload.id) {
        state.selectedProperty = action.payload;
      }
    });
  },
});

export const { setFilters, clearSelectedProperty } = propertiesSlice.actions;
export default propertiesSlice.reducer;
