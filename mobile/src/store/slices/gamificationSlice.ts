/**
 * Redux Slice: Gamification
 * Manages gamification state (points, badges, rewards, leaderboard)
 */

import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import GamificationService, {
  GamificationSummary,
  LeaderboardEntry,
  Reward,
} from '@services/GamificationService';

// =============================================================================
// STATE INTERFACE
// =============================================================================

interface GamificationState {
  summary: GamificationSummary | null;
  leaderboard: LeaderboardEntry[];
  rewards: Reward[];
  loading: {
    summary: boolean;
    leaderboard: boolean;
    rewards: boolean;
    redeem: boolean;
  };
  error: {
    summary: string | null;
    leaderboard: string | null;
    rewards: string | null;
    redeem: string | null;
  };
  lastFetched: {
    summary: string | null;
    leaderboard: string | null;
    rewards: string | null;
  };
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: GamificationState = {
  summary: null,
  leaderboard: [],
  rewards: [],
  loading: {
    summary: false,
    leaderboard: false,
    rewards: false,
    redeem: false,
  },
  error: {
    summary: null,
    leaderboard: null,
    rewards: null,
    redeem: null,
  },
  lastFetched: {
    summary: null,
    leaderboard: null,
    rewards: null,
  },
};

// =============================================================================
// ASYNC THUNKS
// =============================================================================

/**
 * Fetch user gamification summary
 */
export const fetchGamificationSummary = createAsyncThunk(
  'gamification/fetchSummary',
  async (_, {rejectWithValue}) => {
    try {
      const summary = await GamificationService.getUserSummary();
      return summary;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch gamification summary',
      );
    }
  },
);

/**
 * Fetch leaderboard
 */
export const fetchLeaderboard = createAsyncThunk(
  'gamification/fetchLeaderboard',
  async (
    {metric = 'totalPoints', limit = 10}: {metric?: string; limit?: number},
    {rejectWithValue},
  ) => {
    try {
      const leaderboard = await GamificationService.getLeaderboard(
        metric,
        limit,
      );
      return leaderboard;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch leaderboard',
      );
    }
  },
);

/**
 * Fetch available rewards
 */
export const fetchRewards = createAsyncThunk(
  'gamification/fetchRewards',
  async (_, {rejectWithValue}) => {
    try {
      const rewards = await GamificationService.getAvailableRewards();
      return rewards;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch rewards',
      );
    }
  },
);

/**
 * Redeem a reward
 */
export const redeemReward = createAsyncThunk(
  'gamification/redeemReward',
  async (rewardId: string, {rejectWithValue, dispatch}) => {
    try {
      const result = await GamificationService.redeemReward(rewardId);

      // Refresh summary and rewards after redemption
      dispatch(fetchGamificationSummary());
      dispatch(fetchRewards());

      return result;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to redeem reward',
      );
    }
  },
);

// =============================================================================
// SLICE
// =============================================================================

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    clearGamification: state => {
      state.summary = null;
      state.leaderboard = [];
      state.rewards = [];
      state.error = {
        summary: null,
        leaderboard: null,
        rewards: null,
        redeem: null,
      };
    },
    clearError: (
      state,
      action: PayloadAction<keyof GamificationState['error']>,
    ) => {
      state.error[action.payload] = null;
    },
  },
  extraReducers: builder => {
    // Fetch Summary
    builder
      .addCase(fetchGamificationSummary.pending, state => {
        state.loading.summary = true;
        state.error.summary = null;
      })
      .addCase(fetchGamificationSummary.fulfilled, (state, action) => {
        state.loading.summary = false;
        state.summary = action.payload;
        state.lastFetched.summary = new Date().toISOString();
      })
      .addCase(fetchGamificationSummary.rejected, (state, action) => {
        state.loading.summary = false;
        state.error.summary = action.payload as string;
      });

    // Fetch Leaderboard
    builder
      .addCase(fetchLeaderboard.pending, state => {
        state.loading.leaderboard = true;
        state.error.leaderboard = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading.leaderboard = false;
        state.leaderboard = action.payload;
        state.lastFetched.leaderboard = new Date().toISOString();
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading.leaderboard = false;
        state.error.leaderboard = action.payload as string;
      });

    // Fetch Rewards
    builder
      .addCase(fetchRewards.pending, state => {
        state.loading.rewards = true;
        state.error.rewards = null;
      })
      .addCase(fetchRewards.fulfilled, (state, action) => {
        state.loading.rewards = false;
        state.rewards = action.payload;
        state.lastFetched.rewards = new Date().toISOString();
      })
      .addCase(fetchRewards.rejected, (state, action) => {
        state.loading.rewards = false;
        state.error.rewards = action.payload as string;
      });

    // Redeem Reward
    builder
      .addCase(redeemReward.pending, state => {
        state.loading.redeem = true;
        state.error.redeem = null;
      })
      .addCase(redeemReward.fulfilled, state => {
        state.loading.redeem = false;
      })
      .addCase(redeemReward.rejected, (state, action) => {
        state.loading.redeem = false;
        state.error.redeem = action.payload as string;
      });
  },
});

// =============================================================================
// EXPORTS
// =============================================================================

export const {clearGamification, clearError} = gamificationSlice.actions;
export default gamificationSlice.reducer;


