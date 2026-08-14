import { createSlice } from '@reduxjs/toolkit';

interface UiState {
  loadingCount: number;
}

const initialState: UiState = {
  loadingCount: 0,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showLoader(state) {
      state.loadingCount += 1;
    },
    hideLoader(state) {
      state.loadingCount = Math.max(0, state.loadingCount - 1);
    },
  },
});

export const { showLoader, hideLoader } = uiSlice.actions;
export default uiSlice.reducer;
