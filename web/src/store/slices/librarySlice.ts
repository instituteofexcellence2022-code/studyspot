import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Library, PaginatedResponse, Seat } from '../../types';
import { libraryService, LibrarySearchParams } from '../../services/libraryService';

interface LibraryState {
  libraries: Library[];
  selectedLibrary: Library | null;
  librarySeats: Seat[];
  searchResults: Library[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
}

const initialState: LibraryState = {
  libraries: [],
  selectedLibrary: null,
  librarySeats: [],
  searchResults: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  isSearching: false,
  error: null,
};

// Async thunks
export const fetchLibraries = createAsyncThunk(
  'libraries/fetchLibraries',
  async (params: { page?: number; limit?: number; search?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await libraryService.getLibraries(params.page, params.limit, params.search);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch libraries');
    }
  }
);

export const fetchLibraryById = createAsyncThunk(
  'libraries/fetchLibraryById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await libraryService.getLibraryById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch library');
    }
  }
);

export const createLibrary = createAsyncThunk(
  'libraries/createLibrary',
  async (libraryData: Partial<Library>, { rejectWithValue }) => {
    try {
      const response = await libraryService.createLibrary(libraryData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create library');
    }
  }
);

export const updateLibrary = createAsyncThunk(
  'libraries/updateLibrary',
  async ({ id, libraryData }: { id: string; libraryData: Partial<Library> }, { rejectWithValue }) => {
    try {
      const response = await libraryService.updateLibrary(id, libraryData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update library');
    }
  }
);

export const deleteLibrary = createAsyncThunk(
  'libraries/deleteLibrary',
  async (id: string, { rejectWithValue }) => {
    try {
      await libraryService.deleteLibrary(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete library');
    }
  }
);

export const searchLibraries = createAsyncThunk(
  'libraries/searchLibraries',
  async (params: LibrarySearchParams, { rejectWithValue }) => {
    try {
      const response = await libraryService.searchLibraries(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search libraries');
    }
  }
);

export const fetchLibrarySeats = createAsyncThunk(
  'libraries/fetchLibrarySeats',
  async (libraryId: string, { rejectWithValue }) => {
    try {
      const response = await libraryService.getLibrarySeats(libraryId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch library seats');
    }
  }
);

export const createSeat = createAsyncThunk(
  'libraries/createSeat',
  async ({ libraryId, seatData }: { libraryId: string; seatData: Partial<Seat> }, { rejectWithValue }) => {
    try {
      const response = await libraryService.createSeat(libraryId, seatData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create seat');
    }
  }
);

export const updateSeat = createAsyncThunk(
  'libraries/updateSeat',
  async ({ id, seatData }: { id: string; seatData: Partial<Seat> }, { rejectWithValue }) => {
    try {
      const response = await libraryService.updateSeat(id, seatData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update seat');
    }
  }
);

export const deleteSeat = createAsyncThunk(
  'libraries/deleteSeat',
  async (id: string, { rejectWithValue }) => {
    try {
      await libraryService.deleteSeat(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete seat');
    }
  }
);

const librarySlice = createSlice({
  name: 'libraries',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedLibrary: (state) => {
      state.selectedLibrary = null;
      state.librarySeats = [];
    },
    setSelectedLibrary: (state, action: PayloadAction<Library>) => {
      state.selectedLibrary = action.payload;
    },
    updateLibraryInList: (state, action: PayloadAction<Library>) => {
      const index = state.libraries.findIndex(library => library.id === action.payload.id);
      if (index !== -1) {
        state.libraries[index] = action.payload;
      }
      if (state.selectedLibrary?.id === action.payload.id) {
        state.selectedLibrary = action.payload;
      }
    },
    removeLibraryFromList: (state, action: PayloadAction<string>) => {
      state.libraries = state.libraries.filter(library => library.id !== action.payload);
      if (state.selectedLibrary?.id === action.payload) {
        state.selectedLibrary = null;
        state.librarySeats = [];
      }
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Libraries
      .addCase(fetchLibraries.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLibraries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.libraries = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchLibraries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Library by ID
      .addCase(fetchLibraryById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLibraryById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedLibrary = action.payload;
        state.error = null;
      })
      .addCase(fetchLibraryById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Library
      .addCase(createLibrary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createLibrary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.libraries.unshift(action.payload);
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(createLibrary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Library
      .addCase(updateLibrary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLibrary.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.libraries.findIndex(library => library.id === action.payload.id);
        if (index !== -1) {
          state.libraries[index] = action.payload;
        }
        if (state.selectedLibrary?.id === action.payload.id) {
          state.selectedLibrary = action.payload;
        }
        state.error = null;
      })
      .addCase(updateLibrary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Library
      .addCase(deleteLibrary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteLibrary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.libraries = state.libraries.filter(library => library.id !== action.payload);
        state.pagination.total -= 1;
        if (state.selectedLibrary?.id === action.payload) {
          state.selectedLibrary = null;
          state.librarySeats = [];
        }
        state.error = null;
      })
      .addCase(deleteLibrary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Search Libraries
      .addCase(searchLibraries.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchLibraries.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload;
        state.error = null;
      })
      .addCase(searchLibraries.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload as string;
      })
      // Fetch Library Seats
      .addCase(fetchLibrarySeats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLibrarySeats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.librarySeats = action.payload;
        state.error = null;
      })
      .addCase(fetchLibrarySeats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Seat
      .addCase(createSeat.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSeat.fulfilled, (state, action) => {
        state.isLoading = false;
        state.librarySeats.push(action.payload);
        state.error = null;
      })
      .addCase(createSeat.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Seat
      .addCase(updateSeat.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSeat.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.librarySeats.findIndex(seat => seat.id === action.payload.id);
        if (index !== -1) {
          state.librarySeats[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateSeat.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Seat
      .addCase(deleteSeat.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSeat.fulfilled, (state, action) => {
        state.isLoading = false;
        state.librarySeats = state.librarySeats.filter(seat => seat.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteSeat.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  clearSelectedLibrary, 
  setSelectedLibrary, 
  updateLibraryInList, 
  removeLibraryFromList,
  clearSearchResults 
} = librarySlice.actions;
export default librarySlice.reducer;


