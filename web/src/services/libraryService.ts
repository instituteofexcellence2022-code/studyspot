import { Library, PaginatedResponse, Seat } from '../types';
import { apiService } from './api';
import { API_CONFIG } from '../constants';

export interface LibrarySearchParams {
  search?: string;
  city?: string;
  amenities?: string[];
  minPrice?: number;
  maxPrice?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export class LibraryService {
  async getLibraries(page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResponse<Library>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });

    return await apiService.get<PaginatedResponse<Library>>(
      `${API_CONFIG.ENDPOINTS.LIBRARIES.LIST}?${params}`
    );
  }

  async getLibraryById(id: string): Promise<Library> {
    return await apiService.get<Library>(
      API_CONFIG.ENDPOINTS.LIBRARIES.BY_ID.replace(':id', id)
    );
  }

  async createLibrary(libraryData: Partial<Library>): Promise<Library> {
    return await apiService.post<Library>(
      API_CONFIG.ENDPOINTS.LIBRARIES.CREATE,
      libraryData
    );
  }

  async updateLibrary(id: string, libraryData: Partial<Library>): Promise<Library> {
    return await apiService.put<Library>(
      API_CONFIG.ENDPOINTS.LIBRARIES.UPDATE.replace(':id', id),
      libraryData
    );
  }

  async deleteLibrary(id: string): Promise<void> {
    return await apiService.delete<void>(
      API_CONFIG.ENDPOINTS.LIBRARIES.DELETE.replace(':id', id)
    );
  }

  async searchLibraries(params: LibrarySearchParams): Promise<Library[]> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    return await apiService.get<Library[]>(
      `${API_CONFIG.ENDPOINTS.LIBRARIES.SEARCH}?${searchParams}`
    );
  }

  async uploadLibraryImage(id: string, file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);

    return await apiService.upload<{ imageUrl: string }>(
      `${API_CONFIG.ENDPOINTS.LIBRARIES.BY_ID.replace(':id', id)}/image`,
      formData
    );
  }

  async getLibrarySeats(libraryId: string): Promise<Seat[]> {
    return await apiService.get<Seat[]>(
      API_CONFIG.ENDPOINTS.SEATS.BY_LIBRARY.replace(':libraryId', libraryId)
    );
  }

  async createSeat(libraryId: string, seatData: Partial<Seat>): Promise<Seat> {
    return await apiService.post<Seat>(
      API_CONFIG.ENDPOINTS.SEATS.CREATE,
      { ...seatData, libraryId }
    );
  }

  async updateSeat(id: string, seatData: Partial<Seat>): Promise<Seat> {
    return await apiService.put<Seat>(
      API_CONFIG.ENDPOINTS.SEATS.UPDATE.replace(':id', id),
      seatData
    );
  }

  async deleteSeat(id: string): Promise<void> {
    return await apiService.delete<void>(
      API_CONFIG.ENDPOINTS.SEATS.DELETE.replace(':id', id)
    );
  }

  async getLibraryStats(libraryId: string, startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return await apiService.get<any>(
      `${API_CONFIG.ENDPOINTS.LIBRARIES.BY_ID.replace(':id', libraryId)}/stats?${params}`
    );
  }
}

export const libraryService = new LibraryService();


