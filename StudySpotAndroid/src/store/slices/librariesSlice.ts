/**
 * StudySpot Mobile App - Libraries Slice
 * Redux slice for managing library data and search
 */

import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {Library, Seat, LibraryFilters} from '../../types/index';
import LibrariesService from '../../services/LibrariesService';

// =============================================================================
// INITIAL STATE
// =============================================================================

interface LibrariesState {
  libraries: Library[];
  selectedLibrary: Library | null;
  librarySeats: Seat[];
  searchResults: Library[];
  filters: LibraryFilters;
  isLoading: boolean;
  error: string | null;
  lastSearchTime: string | null;
}

const initialState: LibrariesState = {
  libraries: [],
  selectedLibrary: null,
  librarySeats: [],
  searchResults: [],
  filters: {},
  isLoading: false,
  error: null,
  lastSearchTime: null,
};

// =============================================================================
// ASYNC THUNKS
// =============================================================================

/**
 * Get all libraries
 */
export const getLibraries = createAsyncThunk(
  'libraries/getLibraries',
  async (params: {page?: number; limit?: number; filters?: LibraryFilters} = {}, {rejectWithValue}) => {
    try {
      const response = await LibrariesService.getLibraries(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get libraries');
    }
  }
);

/**
 * Get library details
 */
export const getLibraryDetails = createAsyncThunk(
  'libraries/getLibraryDetails',
  async (libraryId: string, {rejectWithValue}) => {
    try {
      const response = await LibrariesService.getLibraryDetails(libraryId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get library details');
    }
  }
);

/**
 * Search libraries
 */
export const searchLibraries = createAsyncThunk(
  'libraries/searchLibraries',
  async (params: {query: string; filters?: LibraryFilters}, {rejectWithValue}) => {
    try {
      const response = await LibrariesService.searchLibraries(params.query, params.filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

/**
 * Get library seats
 */
export const getLibrarySeats = createAsyncThunk(
  'libraries/getLibrarySeats',
  async (params: {libraryId: string; date?: string; zone?: string}, {rejectWithValue}) => {
    try {
      const response = await LibrariesService.getLibrarySeats(params.libraryId, params.date, params.zone);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get library seats');
    }
  }
);

/**
 * Check seat availability
 */
export const checkSeatAvailability = createAsyncThunk(
  'libraries/checkSeatAvailability',
  async (params: {
    libraryId: string;
    date: string;
    startTime: string;
    endTime: string;
    zone?: string;
  }, {rejectWithValue}) => {
    try {
      const response = await LibrariesService.checkSeatAvailability(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check availability');
    }
  }
);

// =============================================================================
// LIBRARIES SLICE
// =============================================================================

const librariesSlice = createSlice({
  name: 'libraries',
  initialState,
  reducers: {
    // Clear error
    clearError: state => {
      state.error = null;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set selected library
    setSelectedLibrary: (state, action: PayloadAction<Library | null>) => {
      state.selectedLibrary = action.payload;
    },

    // Update filters
    updateFilters: (state, action: PayloadAction<LibraryFilters>) => {
      state.filters = {...state.filters, ...action.payload};
    },

    // Clear filters
    clearFilters: state => {
      state.filters = {};
    },

    // Add library to favorites
    addToFavorites: (state, action: PayloadAction<string>) => {
      const library = state.libraries.find(lib => lib.id === action.payload);
      if (library) {
        // Add favorite flag or update local storage
      }
    },

    // Remove library from favorites
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      const library = state.libraries.find(lib => lib.id === action.payload);
      if (library) {
        // Remove favorite flag or update local storage
      }
    },

    // Update library rating
    updateLibraryRating: (state, action: PayloadAction<{libraryId: string; rating: number}>) => {
      const library = state.libraries.find(lib => lib.id === action.payload.libraryId);
      if (library) {
        library.rating = action.payload.rating;
      }
    },

    // Clear search results
    clearSearchResults: state => {
      state.searchResults = [];
    },

    // Cache libraries
    cacheLibraries: (state, action: PayloadAction<Library[]>) => {
      state.libraries = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // Get Libraries
      .addCase(getLibraries.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getLibraries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.libraries = action.payload;
        state.error = null;
      })
      .addCase(getLibraries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get Library Details
      .addCase(getLibraryDetails.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getLibraryDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedLibrary = action.payload;
        state.error = null;
      })
      .addCase(getLibraryDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Search Libraries
      .addCase(searchLibraries.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchLibraries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
        state.lastSearchTime = new Date().toISOString();
        state.error = null;
      })
      .addCase(searchLibraries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get Library Seats
      .addCase(getLibrarySeats.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getLibrarySeats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.librarySeats = action.payload;
        state.error = null;
      })
      .addCase(getLibrarySeats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Check Seat Availability
      .addCase(checkSeatAvailability.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkSeatAvailability.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(checkSeatAvailability.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// =============================================================================
// ACTIONS
// =============================================================================

export const {
  clearError,
  setLoading,
  setSelectedLibrary,
  updateFilters,
  clearFilters,
  addToFavorites,
  removeFromFavorites,
  updateLibraryRating,
  clearSearchResults,
  cacheLibraries,
} = librariesSlice.actions;

// =============================================================================
// SELECTORS
// =============================================================================

export const selectLibraries = (state: {libraries: LibrariesState}) => state.libraries;
export const selectLibrariesList = (state: {libraries: LibrariesState}) => state.libraries.libraries;
export const selectSelectedLibrary = (state: {libraries: LibrariesState}) => state.libraries.selectedLibrary;
export const selectLibrarySeats = (state: {libraries: LibrariesState}) => state.libraries.librarySeats;
export const selectSearchResults = (state: {libraries: LibrariesState}) => state.libraries.searchResults;
export const selectLibraryFilters = (state: {libraries: LibrariesState}) => state.libraries.filters;
export const selectLibrariesLoading = (state: {libraries: LibrariesState}) => state.libraries.isLoading;
export const selectLibrariesError = (state: {libraries: LibrariesState}) => state.libraries.error;

// =============================================================================
// EXPORTS
// =============================================================================

export default librariesSlice.reducer;
