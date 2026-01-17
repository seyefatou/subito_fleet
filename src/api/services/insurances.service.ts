import apiClient, { ApiResponse } from '../client';

export interface Insurance {
  id: string;
  vehicle_id: string;
  insurer_id: string;
  policy_number: string;
  insurance_type: 'COMPREHENSIVE' | 'THIRD_PARTY' | 'ALL_RISK' | 'DRIVER_INCAPACITY';
  premium_amount: number;
  coverage_amount?: number;
  start_date: string;
  expiry_date: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  vehicle?: any;
  insurer?: any;
  created_at: string;
  updated_at: string;
}

export interface CreateInsuranceDto {
  vehicleId: string;
  insurerId: string;
  insuranceType: string;
  policyNumber?: string;
  premiumAmount?: number;
  coverageAmount?: number;
  startDate: string;
  expiryDate: string;
  status?: string;
}

export interface InsuranceFilters {
  skip?: number;
  take?: number;
  vehicleId?: string;
  insurerId?: string;
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
