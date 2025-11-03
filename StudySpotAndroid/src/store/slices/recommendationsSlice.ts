/**
 * Redux Slice: Recommendations
 * Manages AI-powered library recommendations state
 */

import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import RecommendationsService, {
  RecommendedLibrary,
  TrendingLibrary,
  SimilarLibrary,
} from '@services/RecommendationsService';

// =============================================================================
// STATE INTERFACE
// =============================================================================

interface RecommendationsState {
  personalized: RecommendedLibrary[];
  trending: TrendingLibrary[];
  similar: Record<string, SimilarLibrary[]>; // keyed by libraryId
  loading: {
    personalized: boolean;
    trending: boolean;
    similar: boolean;
  };
  error: {
    personalized: string | null;
    trending: string | null;
    similar: string | null;
  };
  lastFetched: {
    personalized: string | null;
    trending: string | null;
  };
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: RecommendationsState = {
  personalized: [],
  trending: [],
  similar: {},
  loading: {
    personalized: false,
    trending: false,
    similar: false,
  },
  error: {
    personalized: null,
    trending: null,
    similar: null,
  },
  lastFetched: {
    personalized: null,
    trending: null,
  },
};

// =============================================================================
// ASYNC THUNKS
// =============================================================================

/**
 * Fetch personalized recommendations
 */
export const fetchPersonalizedRecommendations = createAsyncThunk(
  'recommendations/fetchPersonalized',
  async (
    options?: {limit?: number; minScore?: number},
    {rejectWithValue} = {} as any,
  ) => {
    try {
      const recommendations =
        await RecommendationsService.getPersonalizedRecommendations(options);
      return recommendations;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch recommendations',
      );
    }
  },
);

/**
 * Fetch trending libraries
 */
export const fetchTrendingLibraries = createAsyncThunk(
  'recommendations/fetchTrending',
  async (limit: number = 5, {rejectWithValue}) => {
    try {
      const trending = await RecommendationsService.getTrendingLibraries(limit);
      return trending;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch trending libraries',
      );
    }
  },
);

/**
 * Fetch similar libraries
 */
export const fetchSimilarLibraries = createAsyncThunk(
  'recommendations/fetchSimilar',
  async (
    {libraryId, limit = 4}: {libraryId: string; limit?: number},
    {rejectWithValue},
  ) => {
    try {
      const similar = await RecommendationsService.getSimilarLibraries(
        libraryId,
        limit,
      );
      return {libraryId, similar};
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch similar libraries',
      );
    }
  },
);

// =============================================================================
// SLICE
// =============================================================================

const recommendationsSlice = createSlice({
  name: 'recommendations',
  initialState,
  reducers: {
    clearRecommendations: state => {
      state.personalized = [];
      state.trending = [];
      state.similar = {};
      state.error = {
        personalized: null,
        trending: null,
        similar: null,
      };
    },
    clearError: (state, action: PayloadAction<keyof RecommendationsState['error']>) => {
      state.error[action.payload] = null;
    },
  },
  extraReducers: builder => {
    // Fetch Personalized Recommendations
    builder
      .addCase(fetchPersonalizedRecommendations.pending, state => {
        state.loading.personalized = true;
        state.error.personalized = null;
      })
      .addCase(fetchPersonalizedRecommendations.fulfilled, (state, action) => {
        state.loading.personalized = false;
        state.personalized = action.payload;
        state.lastFetched.personalized = new Date().toISOString();
      })
      .addCase(fetchPersonalizedRecommendations.rejected, (state, action) => {
        state.loading.personalized = false;
        state.error.personalized = action.payload as string;
      });

    // Fetch Trending Libraries
    builder
      .addCase(fetchTrendingLibraries.pending, state => {
        state.loading.trending = true;
        state.error.trending = null;
      })
      .addCase(fetchTrendingLibraries.fulfilled, (state, action) => {
        state.loading.trending = false;
        state.trending = action.payload;
        state.lastFetched.trending = new Date().toISOString();
      })
      .addCase(fetchTrendingLibraries.rejected, (state, action) => {
        state.loading.trending = false;
        state.error.trending = action.payload as string;
      });

    // Fetch Similar Libraries
    builder
      .addCase(fetchSimilarLibraries.pending, state => {
        state.loading.similar = true;
        state.error.similar = null;
      })
      .addCase(fetchSimilarLibraries.fulfilled, (state, action) => {
        state.loading.similar = false;
        state.similar[action.payload.libraryId] = action.payload.similar;
      })
      .addCase(fetchSimilarLibraries.rejected, (state, action) => {
        state.loading.similar = false;
        state.error.similar = action.payload as string;
      });
  },
});

// =============================================================================
// EXPORTS
// =============================================================================

export const {clearRecommendations, clearError} = recommendationsSlice.actions;
export default recommendationsSlice.reducer;


