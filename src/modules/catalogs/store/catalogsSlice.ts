import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { catalogsService } from '../services/catalogsService';
import type { CatalogItem } from '../types';

interface CatalogsState {
  items: CatalogItem[];
  isLoading: boolean;
  error: string | null;
  activeTable: string;
}

const initialState: CatalogsState = {
  items: [],
  isLoading: false,
  error: null,
  activeTable: '',
};

export const fetchCatalog = createAsyncThunk(
  'catalogs/fetchCatalog',
  async (table: string) => {
    return await catalogsService.getAll(table);
  },
);

export const createCatalogItem = createAsyncThunk(
  'catalogs/create',
  async ({ table, name }: { table: string; name: string }) => {
    return await catalogsService.create(table, name);
  },
);

export const updateCatalogItem = createAsyncThunk(
  'catalogs/update',
  async ({ table, id, name }: { table: string; id: string; name: string }) => {
    return await catalogsService.update(table, id, name);
  },
);

export const deleteCatalogItem = createAsyncThunk(
  'catalogs/delete',
  async ({ table, id }: { table: string; id: string }) => {
    await catalogsService.remove(table, id);
    return id;
  },
);

const catalogsSlice = createSlice({
  name: 'catalogs',
  initialState,
  reducers: {
    setActiveTable(state, action) {
      state.activeTable = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCatalog.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCatalog.fulfilled, (state, action) => {
      state.isLoading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchCatalog.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Error al cargar catálogo';
    });

    builder.addCase(createCatalogItem.fulfilled, (state, action) => {
      state.items.push(action.payload);
      state.items.sort((a, b) => a.name.localeCompare(b.name));
    });

    builder.addCase(updateCatalogItem.fulfilled, (state, action) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) state.items[index] = action.payload;
    });

    builder.addCase(deleteCatalogItem.fulfilled, (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    });
  },
});

export const { setActiveTable } = catalogsSlice.actions;
export default catalogsSlice.reducer;
