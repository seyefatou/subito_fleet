import apiClient, { ApiResponse } from '../client';

export interface Payment {
  id: string;
  paymentDate: string;
  vehicleId: string;
  driverId?: string;
  bankId?: string;
  dueAmount: number;
  paidAmount: number;
  paymentMethod?: 'CASH' | 'MOBILE_MONEY' | 'WAVE' | 'ORANGE_MONEY' | 'BANK_TRANSFER' | 'CHECK';
  transactionId?: string;
  status: 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE';
  notes?: string;
  routedToBank: boolean;
  routedAt?: string;
  vehicle?: any;
  driver?: any;
  bank?: any;
  paymentProofs?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDto {
  paymentDate: string;
  vehicleId: string;
  driverId?: string;
  bankId?: string;
  dueAmount?: number;
  paidAmount?: number;
  paymentMethod?: string;
  transactionId?: string;
  status?: string;
  notes?: string;
}

export interface MarkAsPaidDto {
  paidAmount?: number;
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
}

export interface PaymentFilters {
  skip?: number;
  take?: number;
  status?: string;
  vehicleId?: string;
  driverId?: string;
  bankId?: string;
  startDate?: string;
  endDate?: string;
}

export const paymentsService = {
  // Liste des paiements
  async list(filters?: PaymentFilters): Promise<ApiResponse<Payment[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get(`/payments?${params.toString()}`);
  },

  // Récupérer un paiement
  async get(id: string): Promise<ApiResponse<Payment>> {
    return apiClient.get(`/payments/${id}`);
  },

  // Créer un paiement
  async create(data: CreatePaymentDto): Promise<ApiResponse<Payment>> {
    return apiClient.post('/payments', data);
  },

  // Modifier un paiement
  async update(id: string, data: Partial<CreatePaymentDto>): Promise<ApiResponse<Payment>> {
    return apiClient.patch(`/payments/${id}`, data);
  },

  // Marquer comme payé
  async markAsPaid(id: string, data: MarkAsPaidDto): Promise<ApiResponse<Payment>> {
    return apiClient.post(`/payments/${id}/mark-paid`, data);
  },

  // Router vers la banque
  async routeToBank(id: string): Promise<ApiResponse<Payment>> {
    return apiClient.post(`/payments/${id}/route-to-bank`);
  },

  // Supprimer un paiement
  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`/payments/${id}`);
  },

  // Statistiques du jour
  async getTodayStats(): Promise<ApiResponse<any>> {
    return apiClient.get('/payments/today-stats');
  },

  // Paiements en retard
  async getOverdue(): Promise<ApiResponse<Payment[]>> {
    return apiClient.get('/payments/overdue');
  },

  // Générer les paiements journaliers
  async generateDaily(date?: string): Promise<ApiResponse<any>> {
    const params = date ? `?date=${date}` : '';
    return apiClient.post(`/payments/generate-daily${params}`);
  },

  // Ajouter une preuve de paiement
  async addProof(paymentId: string, data: {
    fileUrl: string;
    fileName?: string;
    fileType?: string;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.post(`/payments/${paymentId}/proof`, data);
  },

  // Vérifier une preuve de paiement
  async verifyProof(proofId: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/payments/proofs/${proofId}/verify`);
  },

  // Règles de routage
  async getRoutingRules(bankId?: string): Promise<ApiResponse<any[]>> {
    const params = bankId ? `?bankId=${bankId}` : '';
    return apiClient.get(`/payments/routing-rules${params}`);
  },

  // Créer une règle de routage
  async createRoutingRule(data: {
    name: string;
    description?: string;
    paymentMethod: string;
    bankId: string;
    priority?: number;
  }): Promise<ApiResponse<any>> {
    return apiClient.post('/payments/routing-rules', data);
  },

  // Modifier une règle de routage
  async updateRoutingRule(id: string, data: any): Promise<ApiResponse<any>> {
    return apiClient.patch(`/payments/routing-rules/${id}`, data);
  },

  // Supprimer une règle de routage
  async deleteRoutingRule(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`/payments/routing-rules/${id}`);
  },
};

export default paymentsService;
