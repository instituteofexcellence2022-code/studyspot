// ============================================
// STUDENT MANAGEMENT REDUX SLICE
// ============================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Student, StudentFilters, StudentDashboardData } from '../../modules/students/types';

interface StudentState {
  students: Student[];
  currentStudent: Student | null;
  dashboardData: StudentDashboardData | null;
  filters: Partial<StudentFilters>;
  loading: boolean;
  error: string | null;
  selectedStudents: string[];
}

const initialState: StudentState = {
  students: [],
  currentStudent: null,
  dashboardData: null,
  filters: {
    search: '',
    status: 'all',
    membershipType: 'all',
    paymentStatus: 'all',
    libraryId: 'all',
    tenantId: 'all',
    city: 'all',
    gender: 'all',
    dateRange: { type: 'all' },
    tags: [],
  },
  loading: false,
  error: null,
  selectedStudents: [],
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setStudents: (state, action: PayloadAction<Student[]>) => {
      state.students = action.payload;
      state.loading = false;
    },
    setCurrentStudent: (state, action: PayloadAction<Student>) => {
      state.currentStudent = action.payload;
    },
    setDashboardData: (state, action: PayloadAction<StudentDashboardData>) => {
      state.dashboardData = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<StudentFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSelectedStudents: (state, action: PayloadAction<string[]>) => {
      state.selectedStudents = action.payload;
    },
    addStudent: (state, action: PayloadAction<Student>) => {
      state.students.unshift(action.payload);
    },
    updateStudentInList: (state, action: PayloadAction<Student>) => {
      const index = state.students.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.students[index] = action.payload;
      }
    },
    removeStudent: (state, action: PayloadAction<string>) => {
      state.students = state.students.filter((s) => s.id !== action.payload);
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const {
  setStudents,
  setCurrentStudent,
  setDashboardData,
  setFilters,
  setLoading,
  setError,
  setSelectedStudents,
  addStudent,
  updateStudentInList,
  removeStudent,
  clearFilters,
} = studentSlice.actions;

export default studentSlice.reducer;

