import apiClient, { ApiResponse } from '../client';

export interface Insurance {
  id: string;
  vehicleId: string;
  insurerId: string;
  policyNumber: string;
  type: 'BASIC' | 'COMPREHENSIVE' | 'THIRD_PARTY';
  premiumAmount: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  coverageDetails?: string;
  vehicle?: any;
  insurer?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInsuranceDto {
  vehicleId: string;
  insurerId: string;
  policyNumber: string;
  type: string;
  premiumAmount: number;
  startDate: string;
  endDate: string;
  status?: string;
  coverageDetails?: string;
}

export interface InsuranceFilters {
  skip?: number;
  take?: number;
  vehicleId?: string;
  insurerId?: string;
  type?: string;
  status?: string;
}

export const insurancesService = {
  // Liste des assurances
  async list(filters?: InsuranceFilters): Promise<ApiResponse<Insurance[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get(`/insurances?${params.toString()}`);
  },

  // Récupérer une assurance
  async get(id: string): Promise<ApiResponse<Insurance>> {
    return apiClient.get(`/insurances/${id}`);
  },

  // Créer une assurance
  async create(data: CreateInsuranceDto): Promise<ApiResponse<Insurance>> {
    return apiClient.post('/insurances', data);
  },

  // Modifier une assurance
  async update(id: string, data: Partial<CreateInsuranceDto>): Promise<ApiResponse<Insurance>> {
    return apiClient.patch(`/insurances/${id}`, data);
  },

  // Supprimer une assurance
  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`/insurances/${id}`);
  },

  // Assurances expirant bientôt
  async getExpiring(days?: number): Promise<ApiResponse<Insurance[]>> {
    const params = days ? `?days=${days}` : '';
    return apiClient.get(`/insurances/expiring${params}`);
  },

  // Liste des sinistres
  async getClaims(insuranceId?: string): Promise<ApiResponse<any[]>> {
    const params = insuranceId ? `?insuranceId=${insuranceId}` : '';
    return apiClient.get(`/insurances/claims${params}`);
  },

  // Déclarer un sinistre
  async createClaim(insuranceId: string, data: {
    incidentDate: string;
    description: string;
    claimAmount: number;
    documents?: string[];
  }): Promise<ApiResponse<any>> {
    return apiClient.post(`/insurances/${insuranceId}/claims`, data);
  },

  // Mettre à jour le statut d'un sinistre
  async updateClaimStatus(claimId: string, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID', approvedAmount?: number): Promise<ApiResponse<any>> {
    return apiClient.patch(`/insurances/claims/${claimId}/status`, { status, approvedAmount });
  },
};

export default insurancesService;
