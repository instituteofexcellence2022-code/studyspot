/**
 * Redux Slice: Analytics
 * Manages predictive analytics state
 */

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import AnalyticsService, {
  OccupancyPrediction,
  PeakHoursAnalysis,
  WeeklyDemandForecast,
  PricingSuggestion,
  UserBehaviorPattern,
} from '@services/AnalyticsService';

// =============================================================================
// STATE INTERFACE
// =============================================================================

interface AnalyticsState {
  occupancy: Record<string, OccupancyPrediction>; // keyed by libraryId
  peakHours: Record<string, PeakHoursAnalysis>; // keyed by libraryId
  weeklyDemand: Record<string, WeeklyDemandForecast>; // keyed by libraryId
  pricing: Record<string, PricingSuggestion>; // keyed by libraryId
  userBehavior: UserBehaviorPattern | null;
  loading: {
    occupancy: boolean;
    peakHours: boolean;
    weeklyDemand: boolean;
    pricing: boolean;
    userBehavior: boolean;
  };
  error: {
    occupancy: string | null;
    peakHours: string | null;
    weeklyDemand: string | null;
    pricing: string | null;
    userBehavior: string | null;
  };
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: AnalyticsState = {
  occupancy: {},
  peakHours: {},
  weeklyDemand: {},
  pricing: {},
  userBehavior: null,
  loading: {
    occupancy: false,
    peakHours: false,
    weeklyDemand: false,
    pricing: false,
    userBehavior: false,
  },
  error: {
    occupancy: null,
    peakHours: null,
    weeklyDemand: null,
    pricing: null,
    userBehavior: null,
  },
};

// =============================================================================
// ASYNC THUNKS
// =============================================================================

/**
 * Predict library occupancy
 */
export const predictOccupancy = createAsyncThunk(
  'analytics/predictOccupancy',
  async (
    {libraryId, datetime}: {libraryId: string; datetime?: string},
    {rejectWithValue},
  ) => {
    try {
      const prediction = await AnalyticsService.predictOccupancy(
        libraryId,
        datetime,
      );
      return {libraryId, prediction};
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to predict occupancy',
      );
    }
  },
);

/**
 * Get peak hours analysis
 */
export const fetchPeakHours = createAsyncThunk(
  'analytics/fetchPeakHours',
  async (
    {libraryId, date}: {libraryId: string; date?: string},
    {rejectWithValue},
  ) => {
    try {
      const analysis = await AnalyticsService.getPeakHours(libraryId, date);
      return {libraryId, analysis};
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch peak hours',
      );
    }
  },
);

/**
 * Get weekly demand forecast
 */
export const fetchWeeklyDemand = createAsyncThunk(
  'analytics/fetchWeeklyDemand',
  async (libraryId: string, {rejectWithValue}) => {
    try {
      const forecast = await AnalyticsService.getWeeklyDemand(libraryId);
      return {libraryId, forecast};
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch weekly demand',
      );
    }
  },
);

/**
 * Get pricing suggestion
 */
export const fetchPricingSuggestion = createAsyncThunk(
  'analytics/fetchPricingSuggestion',
  async (
    {libraryId, datetime}: {libraryId: string; datetime?: string},
    {rejectWithValue},
  ) => {
    try {
      const suggestion = await AnalyticsService.getPricingSuggestion(
        libraryId,
        datetime,
      );
      return {libraryId, suggestion};
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch pricing suggestion',
      );
    }
  },
);

/**
 * Get user behavior patterns
 */
export const fetchUserBehavior = createAsyncThunk(
  'analytics/fetchUserBehavior',
  async (_, {rejectWithValue}) => {
    try {
      const behavior = await AnalyticsService.getUserBehavior();
      return behavior;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user behavior',
      );
    }
  },
);

// =============================================================================
// SLICE
// =============================================================================

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalytics: state => {
      state.occupancy = {};
      state.peakHours = {};
      state.weeklyDemand = {};
      state.pricing = {};
      state.userBehavior = null;
      state.error = {
        occupancy: null,
        peakHours: null,
        weeklyDemand: null,
        pricing: null,
        userBehavior: null,
      };
    },
    clearError: (state, action) => {
      if (action.payload in state.error) {
        state.error[action.payload as keyof typeof state.error] = null;
      }
    },
  },
  extraReducers: builder => {
    // Predict Occupancy
    builder
      .addCase(predictOccupancy.pending, state => {
        state.loading.occupancy = true;
        state.error.occupancy = null;
      })
      .addCase(predictOccupancy.fulfilled, (state, action) => {
        state.loading.occupancy = false;
        state.occupancy[action.payload.libraryId] = action.payload.prediction;
      })
      .addCase(predictOccupancy.rejected, (state, action) => {
        state.loading.occupancy = false;
        state.error.occupancy = action.payload as string;
      });

    // Fetch Peak Hours
    builder
      .addCase(fetchPeakHours.pending, state => {
        state.loading.peakHours = true;
        state.error.peakHours = null;
      })
      .addCase(fetchPeakHours.fulfilled, (state, action) => {
        state.loading.peakHours = false;
        state.peakHours[action.payload.libraryId] = action.payload.analysis;
      })
      .addCase(fetchPeakHours.rejected, (state, action) => {
        state.loading.peakHours = false;
        state.error.peakHours = action.payload as string;
      });

    // Fetch Weekly Demand
    builder
      .addCase(fetchWeeklyDemand.pending, state => {
        state.loading.weeklyDemand = true;
        state.error.weeklyDemand = null;
      })
      .addCase(fetchWeeklyDemand.fulfilled, (state, action) => {
        state.loading.weeklyDemand = false;
        state.weeklyDemand[action.payload.libraryId] = action.payload.forecast;
      })
      .addCase(fetchWeeklyDemand.rejected, (state, action) => {
        state.loading.weeklyDemand = false;
        state.error.weeklyDemand = action.payload as string;
      });

    // Fetch Pricing Suggestion
    builder
      .addCase(fetchPricingSuggestion.pending, state => {
        state.loading.pricing = true;
        state.error.pricing = null;
      })
      .addCase(fetchPricingSuggestion.fulfilled, (state, action) => {
        state.loading.pricing = false;
        state.pricing[action.payload.libraryId] = action.payload.suggestion;
      })
      .addCase(fetchPricingSuggestion.rejected, (state, action) => {
        state.loading.pricing = false;
        state.error.pricing = action.payload as string;
      });

    // Fetch User Behavior
    builder
      .addCase(fetchUserBehavior.pending, state => {
        state.loading.userBehavior = true;
        state.error.userBehavior = null;
      })
      .addCase(fetchUserBehavior.fulfilled, (state, action) => {
        state.loading.userBehavior = false;
        state.userBehavior = action.payload;
      })
      .addCase(fetchUserBehavior.rejected, (state, action) => {
        state.loading.userBehavior = false;
        state.error.userBehavior = action.payload as string;
      });
  },
});

// =============================================================================
// EXPORTS
// =============================================================================

export const {clearAnalytics, clearError} = analyticsSlice.actions;
export default analyticsSlice.reducer;


