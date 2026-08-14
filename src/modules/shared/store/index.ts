import { configureStore } from '@reduxjs/toolkit';
import authReducer from 'modules/auth/store/authSlice';
import catalogsReducer from 'modules/catalogs/store/catalogsSlice';
import propertiesReducer from 'modules/properties/store/propertiesSlice';
import appointmentsReducer from 'modules/appointments/store/appointmentsSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    catalogs: catalogsReducer,
    properties: propertiesReducer,
    appointments: appointmentsReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
