import apiClient, { ApiResponse } from '../client';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'ADMIN' | 'OPERATOR' | 'BANK' | 'GIE' | 'DRIVER' | 'FUND' | 'INSURER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  avatar?: string;
  bankId?: string;
  gieId?: string;
  driverId?: string;
  guaranteeFundId?: string;
  insurerId?: string;
  bank?: any;
  gie?: any;
  driver?: any;
  guaranteeFund?: any;
  insurer?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  status?: string;
  bankId?: string;
  gieId?: string;
  driverId?: string;
  guaranteeFundId?: string;
  insurerId?: string;
}

export interface UserFilters {
  skip?: number;
  take?: number;
  role?: string;
  status?: string;
  search?: string;
}

export interface UserStats {
  total: number;
  byRole: Record<string, number>;
  byStatus: Record<string, number>;
  recentlyCreated: number;
}

export const usersService = {
  // Créer un utilisateur
  async create(data: CreateUserDto): Promise<ApiResponse<User>> {
    return apiClient.post('/users', data);
  },

  // Liste des utilisateurs
  async list(filters?: UserFilters): Promise<ApiResponse<User[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get(`/users?${params.toString()}`);
  },

  // Statistiques des utilisateurs
  async getStats(): Promise<ApiResponse<UserStats>> {
    return apiClient.get('/users/stats');
  },

  // Récupérer un utilisateur
  async get(id: string): Promise<ApiResponse<User>> {
    return apiClient.get(`/users/${id}`);
  },

  // Modifier un utilisateur
  async update(id: string, data: Partial<CreateUserDto>): Promise<ApiResponse<User>> {
    return apiClient.patch(`/users/${id}`, data);
  },

  // Modifier le statut d'un utilisateur
  async updateStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): Promise<ApiResponse<User>> {
    return apiClient.patch(`/users/${id}/status`, { status });
  },

  // Supprimer un utilisateur
  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`/users/${id}`);
  },
};

export default usersService;
