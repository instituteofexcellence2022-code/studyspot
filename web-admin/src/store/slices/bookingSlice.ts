import { createSlice, createAsyncThunk, PayloadAction
  } from '@reduxjs/toolkit';
import { Booking, PaginatedResponse, BookingSearchParams } from '../../types';
import { bookingService } from '../../services';

interface BookingState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  userBookings: Booking[];
  libraryBookings: Booking[];
  availability: {
    availableSeats: number;
    totalSeats: number;
    bookings: Array<{
      seatId: string;
      startTime: string;
      endTime: string;
    }>;
  } | null;
  stats: {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    noShowBookings: number;
    totalRevenue: number;
    averageBookingDuration: number;
  } | null;
  pagination: {
    page?: number;
    limit?: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  selectedBooking: null,
  userBookings: [],
  libraryBookings: [],
  availability: null,
  stats: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0},
  isLoading: false,
  error: null};

// Async thunks
export const fetchBookings = createAsyncThunk(
  'bookings/fetchBookings',
  async (params: BookingSearchParams = {}, { rejectWithValue }) => {
    try {
      const response = await bookingService.getBookings(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }
);

export const fetchBookingById = createAsyncThunk(
  'bookings/fetchBookingById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await bookingService.getBookingById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch booking');
    }
  }
);

export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData: Partial<Booking>, { rejectWithValue }) => {
    try {
      const response = await bookingService.createBooking(bookingData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create booking');
    }
  }
);

export const updateBooking = createAsyncThunk(
  'bookings/updateBooking',
  async ({ id, bookingData }: { id: string; bookingData: Partial<Booking> }, { rejectWithValue }) => {
    try {
      const response = await bookingService.updateBooking(id, bookingData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update booking');
    }
  }
);

export const deleteBooking = createAsyncThunk(
  'bookings/deleteBooking',
  async (id: string, { rejectWithValue }) => {
    try {
      await bookingService.deleteBooking(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete booking');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancelBooking',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await bookingService.cancelBooking(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel booking');
    }
  }
);

export const checkInBooking = createAsyncThunk(
  'bookings/checkInBooking',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await bookingService.checkInBooking(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check in booking');
    }
  }
);

export const checkOutBooking = createAsyncThunk(
  'bookings/checkOutBooking',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await bookingService.checkOutBooking(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check out booking');
    }
  }
);

export const fetchUserBookings = createAsyncThunk(
  'bookings/fetchUserBookings',
  async ({ userId, params }: { userId: string; params?: Omit<BookingSearchParams, 'userId'> }, { rejectWithValue }) => {
    try {
      const response = await bookingService.getUserBookings(userId, params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user bookings');
    }
  }
);

export const fetchLibraryBookings = createAsyncThunk(
  'bookings/fetchLibraryBookings',
  async ({ libraryId, params }: { libraryId: string; params?: Omit<BookingSearchParams, 'libraryId'> }, { rejectWithValue }) => {
    try {
      const response = await bookingService.getLibraryBookings(libraryId, params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch library bookings');
    }
  }
);

export const fetchBookingAvailability = createAsyncThunk(
  'bookings/fetchBookingAvailability',
  async ({ libraryId, date }: { libraryId: string; date: string }, { rejectWithValue }) => {
    try {
      const response = await bookingService.getBookingAvailability(libraryId, date);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch booking availability');
    }
  }
);

export const fetchBookingStats = createAsyncThunk(
  'bookings/fetchBookingStats',
  async (params: { libraryId?: string; startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await bookingService.getBookingStats(params.libraryId, params.startDate, params.endDate);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch booking stats');
    }
  }
);

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearError: (state: any) => {
      state.error = null;
    },
    clearSelectedBooking: (state: any) => {
      state.selectedBooking = null;
    },
    setSelectedBooking: (state, action: PayloadAction<Booking>) => {
      state.selectedBooking = action.payload;
    },
    updateBookingInList: (state, action: PayloadAction<Booking>) => {
      const index = state.bookings.findIndex((booking: any) => booking.id === action.payload.id);
      if (index !== -1) {
        state.bookings[index] = action.payload;
      }
      if (state.selectedBooking?.id === action.payload.id) {
        state.selectedBooking = action.payload;
      }
    },
    removeBookingFromList: (state, action: PayloadAction<string>) => {
      state.bookings = state.bookings.filter((booking: any) => booking.id !== action.payload);
      if (state.selectedBooking?.id === action.payload) {
        state.selectedBooking = null;
      }
    },
    clearAvailability: (state: any) => {
      state.availability = null;
    },
    clearStats: (state: any) => {
      state.stats = null;
    }},
  extraReducers: (builder: any) => {
    builder
      // Fetch Bookings
      .addCase(fetchBookings.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        state.bookings = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchBookings.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Booking by ID
      .addCase(fetchBookingById.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        state.selectedBooking = action.payload;
        state.error = null;
      })
      .addCase(fetchBookingById.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Booking
      .addCase(createBooking.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        state.bookings.unshift(action.payload);
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(createBooking.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Booking
      .addCase(updateBooking.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBooking.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        const index = state.bookings.findIndex((booking: any) => booking.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.selectedBooking?.id === action.payload.id) {
          state.selectedBooking = action.payload;
        }
        state.error = null;
      })
      .addCase(updateBooking.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Booking
      .addCase(deleteBooking.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBooking.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        state.bookings = state.bookings.filter((booking: any) => booking.id !== action.payload);
        state.pagination.total -= 1;
        if (state.selectedBooking?.id === action.payload) {
          state.selectedBooking = null;
        }
        state.error = null;
      })
      .addCase(deleteBooking.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Cancel Booking
      .addCase(cancelBooking.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        const index = state.bookings.findIndex((booking: any) => booking.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.selectedBooking?.id === action.payload.id) {
          state.selectedBooking = action.payload;
        }
        state.error = null;
      })
      .addCase(cancelBooking.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Check In Booking
      .addCase(checkInBooking.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkInBooking.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        const index = state.bookings.findIndex((booking: any) => booking.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.selectedBooking?.id === action.payload.id) {
          state.selectedBooking = action.payload;
        }
        state.error = null;
      })
      .addCase(checkInBooking.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Check Out Booking
      .addCase(checkOutBooking.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkOutBooking.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        const index = state.bookings.findIndex((booking: any) => booking.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.selectedBooking?.id === action.payload.id) {
          state.selectedBooking = action.payload;
        }
        state.error = null;
      })
      .addCase(checkOutBooking.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch User Bookings
      .addCase(fetchUserBookings.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserBookings.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        state.userBookings = action.payload.data;
        state.error = null;
      })
      .addCase(fetchUserBookings.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Library Bookings
      .addCase(fetchLibraryBookings.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLibraryBookings.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        state.libraryBookings = action.payload.data;
        state.error = null;
      })
      .addCase(fetchLibraryBookings.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Booking Availability
      .addCase(fetchBookingAvailability.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookingAvailability.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        state.availability = action.payload;
        state.error = null;
      })
      .addCase(fetchBookingAvailability.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Booking Stats
      .addCase(fetchBookingStats.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookingStats.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchBookingStats.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }});

export const { 
  clearError, 
  clearSelectedBooking, 
  setSelectedBooking, 
  updateBookingInList, 
  removeBookingFromList,
  clearAvailability,
  clearStats
} = bookingSlice.actions;
export default bookingSlice.reducer;


