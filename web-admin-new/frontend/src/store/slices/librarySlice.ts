// ============================================
// LIBRARY OVERSIGHT REDUX SLICE
// ============================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Library, LibraryFilters, LibraryDashboardData, RealTimeOccupancy } from '../../modules/libraries/types';

interface LibraryState {
  libraries: Library[];
  currentLibrary: Library | null;
  dashboardData: LibraryDashboardData | null;
  realTimeOccupancy: RealTimeOccupancy[];
  filters: Partial<LibraryFilters>;
  loading: boolean;
  error: string | null;
  selectedLibraries: string[];
}

const initialState: LibraryState = {
  libraries: [],
  currentLibrary: null,
  dashboardData: null,
  realTimeOccupancy: [],
  filters: {
    search: '',
    status: 'all',
    type: 'all',
    tenantId: 'all',
    city: 'all',
    state: 'all',
    hasAmenity: [],
    dateRange: { type: 'all' },
  },
  loading: false,
  error: null,
  selectedLibraries: [],
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    setLibraries: (state, action: PayloadAction<Library[]>) => {
      state.libraries = action.payload;
      state.loading = false;
    },
    setCurrentLibrary: (state, action: PayloadAction<Library>) => {
      state.currentLibrary = action.payload;
    },
    setDashboardData: (state, action: PayloadAction<LibraryDashboardData>) => {
      state.dashboardData = action.payload;
    },
    setRealTimeOccupancy: (state, action: PayloadAction<RealTimeOccupancy[]>) => {
      state.realTimeOccupancy = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<LibraryFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSelectedLibraries: (state, action: PayloadAction<string[]>) => {
      state.selectedLibraries = action.payload;
    },
    updateLibraryInList: (state, action: PayloadAction<Library>) => {
      const index = state.libraries.findIndex((l) => l.id === action.payload.id);
      if (index !== -1) {
        state.libraries[index] = action.payload;
      }
    },
    removeLibrary: (state, action: PayloadAction<string>) => {
      state.libraries = state.libraries.filter((l) => l.id !== action.payload);
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const {
  setLibraries,
  setCurrentLibrary,
  setDashboardData,
  setRealTimeOccupancy,
  setFilters,
  setLoading,
  setError,
  setSelectedLibraries,
  updateLibraryInList,
  removeLibrary,
  clearFilters,
} = librarySlice.actions;

export default librarySlice.reducer;

