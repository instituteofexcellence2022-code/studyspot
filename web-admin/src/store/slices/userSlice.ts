import { createSlice, createAsyncThunk, PayloadAction
  } from '@reduxjs/toolkit';
import { User, PaginatedResponse, RegisterRequest
  } from '../../types';
import { userService
  } from '../../services';

interface UserState {
  users: User[];
  selectedUser: User | null;
  pagination: {
    page?: number;
    limit?: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0},
  isLoading: false,
  error: null};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: { page?: number; limit?: number; search?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await userService.getUsers(params.page, params.limit, params.search);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await userService.getUserById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await userService.createUser(userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }: { id: string; userData: Partial<User> }, { rejectWithValue }) => {
    try {
      const response = await userService.updateUser(id, userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: string, { rejectWithValue }) => {
    try {
      await userService.deleteUser(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state: any) => {
      state.error = null;
    },
    clearSelectedUser: (state: any) => {
      state.selectedUser = null;
    },
    setSelectedUser: (state, action: PayloadAction<User>) => {
      state.selectedUser = action.payload;
    },
    updateUserInList: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex((user: any) => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
      if (state.selectedUser?.id === action.payload.id) {
        state.selectedUser = action.payload;
      }
    },
    removeUserFromList: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((user: any) => user.id !== action.payload);
      if (state.selectedUser?.id === action.payload) {
        state.selectedUser = null;
      }
    }},
  extraReducers: (builder: any) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        state.users = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch User by ID
      .addCase(fetchUserById.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        state.selectedUser = action.payload;
        state.error = null;
      })
      .addCase(fetchUserById.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create User
      .addCase(createUser.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        state.users.unshift(action.payload);
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(createUser.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update User
      .addCase(updateUser.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        const index = state.users.findIndex((user: any) => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
        state.error = null;
      })
      .addCase(updateUser.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete User
      .addCase(deleteUser.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        state.users = state.users.filter((user: any) => user.id !== action.payload);
        state.pagination.total -= 1;
        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null;
        }
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }});

export const { clearError, clearSelectedUser, setSelectedUser, updateUserInList, removeUserFromList } = userSlice.actions;
export default userSlice.reducer;


