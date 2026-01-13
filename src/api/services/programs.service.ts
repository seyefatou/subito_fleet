import apiClient, { ApiResponse } from '../client';

export interface Program {
  id: string;
  name: string;
  description?: string;
  bank_id?: string;
  guarantee_fund_id?: string;
  vehicle_count?: number;
  total_financed?: number;
  status: 'ACTIVE' | 'COMPLETED' | 'SUSPENDED';
  start_date?: string;
  end_date?: string;
  banks?: any;
  guarantee_funds?: any;
  created_at: string;
  updated_at: string;
}

export interface CreateProgramDto {
  name: string;
  description?: string;
  bankId?: string;
  guaranteeFundId?: string;
  vehicleCount?: number;
  totalFinanced?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface ProgramFilters {
  skip?: number;
  take?: number;
  status?: string;
  bankId?: string;
}

export const programsService = {
  // Créer un programme
  async create(data: CreateProgramDto): Promise<ApiResponse<Program>> {
    return apiClient.post('/programs', data);
  },

  // Liste des programmes
  async list(filters?: ProgramFilters): Promise<ApiResponse<Program[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get(`/programs?${params.toString()}`);
  },

  // Récupérer un programme
  async get(id: string): Promise<ApiResponse<Program>> {
    return apiClient.get(`/programs/${id}`);
  },

  // Modifier un programme
  async update(id: string, data: Partial<CreateProgramDto>): Promise<ApiResponse<Program>> {
    return apiClient.patch(`/programs/${id}`, data);
  },

  // Supprimer un programme
  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`/programs/${id}`);
  },
};

export default programsService;
