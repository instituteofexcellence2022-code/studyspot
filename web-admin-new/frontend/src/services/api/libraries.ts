// ============================================
// LIBRARY OVERSIGHT SERVICE
// Platform-wide library data and monitoring
// ============================================

import api from './client';
import type {
  Library,
  LibraryPerformance,
  LibraryAnalytics,
  LibraryComparison,
  LibraryFilters,
  LibraryDashboardData,
  RealTimeOccupancy,
  LibraryApproval,
} from '../../modules/libraries/types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ============================================
// LIBRARY CRUD OPERATIONS
// ============================================

export const getAllLibraries = async (
  filters?: Partial<LibraryFilters>
): Promise<ApiResponse<Library[]>> => {
  try {
    const { data } = await api.get<Library[]>('/libraries', { params: filters });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getLibraryById = async (id: string): Promise<ApiResponse<Library>> => {
  try {
    const { data } = await api.get<Library>(`/libraries/${id}`);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateLibrary = async (id: string, data: Partial<Library>): Promise<ApiResponse<Library>> => {
  try {
    const { data: result } = await api.put<Library>(`/libraries/${id}`, data);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteLibrary = async (id: string): Promise<ApiResponse<void>> => {
  try {
    await api.delete(`/libraries/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ============================================
// PERFORMANCE & ANALYTICS
// ============================================

export const getLibraryPerformance = async (id: string): Promise<ApiResponse<LibraryPerformance>> => {
  try {
    const { data } = await api.get<LibraryPerformance>(`/libraries/${id}/performance`);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getLibraryAnalytics = async (
  filters?: Partial<LibraryFilters>
): Promise<ApiResponse<LibraryAnalytics>> => {
  try {
    const { data } = await api.get<LibraryAnalytics>('/libraries/analytics', { params: filters });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getDashboardData = async (): Promise<ApiResponse<LibraryDashboardData>> => {
  try {
    const { data } = await api.get<LibraryDashboardData>('/libraries/dashboard');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const compareLibraries = async (libraryIds: string[]): Promise<ApiResponse<LibraryComparison>> => {
  try {
    const { data } = await api.post<LibraryComparison>('/libraries/compare', { libraryIds });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ============================================
// REAL-TIME MONITORING
// ============================================

export const getRealTimeOccupancy = async (): Promise<ApiResponse<RealTimeOccupancy[]>> => {
  try {
    const { data } = await api.get<RealTimeOccupancy[]>('/libraries/realtime-occupancy');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getLibraryOccupancy = async (id: string): Promise<ApiResponse<RealTimeOccupancy>> => {
  try {
    const { data } = await api.get<RealTimeOccupancy>(`/libraries/${id}/occupancy`);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ============================================
// APPROVAL WORKFLOW
// ============================================

export const getPendingApprovals = async (): Promise<ApiResponse<LibraryApproval[]>> => {
  try {
    const { data } = await api.get<LibraryApproval[]>('/libraries/pending-approvals');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const approveLibrary = async (
  id: string,
  notes?: string
): Promise<ApiResponse<Library>> => {
  try {
    const { data } = await api.post<Library>(`/libraries/${id}/approve`, { notes });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const rejectLibrary = async (
  id: string,
  reason: string
): Promise<ApiResponse<void>> => {
  try {
    await api.post(`/libraries/${id}/reject`, { reason });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const requestChanges = async (
  id: string,
  changes: string[]
): Promise<ApiResponse<void>> => {
  try {
    await api.post(`/libraries/${id}/request-changes`, { changes });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ============================================
// LIBRARY ACTIONS
// ============================================

export const suspendLibrary = async (id: string, reason: string): Promise<ApiResponse<Library>> => {
  try {
    const { data } = await api.post<Library>(`/libraries/${id}/suspend`, { reason });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const reactivateLibrary = async (id: string): Promise<ApiResponse<Library>> => {
  try {
    const { data } = await api.post<Library>(`/libraries/${id}/reactivate`);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const exportLibraries = async (
  filters?: Partial<LibraryFilters>,
  format: 'csv' | 'excel' | 'pdf' = 'csv'
): Promise<ApiResponse<Blob>> => {
  try {
    const { data } = await api.get<Blob>('/libraries/export', {
      params: { ...filters, format },
      responseType: 'blob',
    });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

const libraryService = {
  getAllLibraries,
  getLibraryById,
  updateLibrary,
  deleteLibrary,
  getLibraryPerformance,
  getLibraryAnalytics,
  getDashboardData,
  compareLibraries,
  getRealTimeOccupancy,
  getLibraryOccupancy,
  getPendingApprovals,
  approveLibrary,
  rejectLibrary,
  requestChanges,
  suspendLibrary,
  reactivateLibrary,
  exportLibraries,
};

export default libraryService;

