import apiClient, { ApiResponse } from '../client';

export interface DashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  totalDrivers: number;
  activeDrivers: number;
  totalPaymentsToday: number;
  collectedToday: number;
  pendingToday: number;
  overduePayments: number;
  totalBanks: number;
  totalGies: number;
}

export interface FinancialReport {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalDue: number;
    totalCollected: number;
    collectionRate: number;
    overdueAmount: number;
  };
  byVehicle?: any[];
  byDriver?: any[];
  byBank?: any[];
  dailyBreakdown?: any[];
}

export interface VehicleReport {
  vehicle: any;
  financialSummary: any;
  maintenanceHistory: any[];
  incidentHistory: any[];
  paymentHistory: any[];
  gpsStats: any;
}

export interface DriverReport {
  driver: any;
  performanceMetrics: any;
  paymentHistory: any[];
  incidentHistory: any[];
  vehicleHistory: any[];
}

export const reportsService = {
  // Statistiques du tableau de bord
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return apiClient.get('/reports/dashboard');
  },

  // Rapport financier
  async getFinancialReport(params: {
    startDate: string;
    endDate: string;
    vehicleId?: string;
    driverId?: string;
    bankId?: string;
  }): Promise<ApiResponse<FinancialReport>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });
    return apiClient.get(`/reports/financial?${queryParams.toString()}`);
  },

  // Rapport d'un véhicule
  async getVehicleReport(vehicleId: string): Promise<ApiResponse<VehicleReport>> {
    return apiClient.get(`/reports/vehicles/${vehicleId}`);
  },

  // Rapport d'un conducteur
  async getDriverReport(driverId: string): Promise<ApiResponse<DriverReport>> {
    return apiClient.get(`/reports/drivers/${driverId}`);
  },

  // Exporter des données
  async exportData(type: 'payments' | 'vehicles' | 'drivers', format: 'json' | 'csv' = 'json'): Promise<ApiResponse<any>> {
    return apiClient.get(`/reports/export/${type}?format=${format}`);
  },
};

export default reportsService;
