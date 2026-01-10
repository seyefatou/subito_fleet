import apiClient, { ApiResponse } from '../client';

export interface GIE {
  id: string;
  name: string;
  representativeName?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  memberCount?: number;
  vehicleCount?: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface CreateGIEDto {
  name: string;
  representativeName?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  memberCount?: number;
  vehicleCount?: number;
  status?: string;
}

export interface GIEFilters {
  skip?: number;
  take?: number;
  status?: string;
  search?: string;
}

export const giesService = {
  // Liste des GIE
  async list(filters?: GIEFilters): Promise<ApiResponse<GIE[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get(`/gies?${params.toString()}`);
  },

  // Récupérer un GIE
  async get(id: string): Promise<ApiResponse<GIE>> {
    return apiClient.get(`/gies/${id}`);
  },

  // Créer un GIE
  async create(data: CreateGIEDto): Promise<ApiResponse<GIE>> {
    return apiClient.post('/gies', data);
  },

  // Modifier un GIE
  async update(id: string, data: Partial<CreateGIEDto>): Promise<ApiResponse<GIE>> {
    return apiClient.patch(`/gies/${id}`, data);
  },

  // Supprimer un GIE
  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`/gies/${id}`);
  },

  // Membres d'un GIE (conducteurs et utilisateurs)
  async getMembers(id: string): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/gies/${id}/members`);
  },

  // Statistiques d'un GIE
  async getStats(id: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/gies/${id}/stats`);
  },
};

export default giesService;
