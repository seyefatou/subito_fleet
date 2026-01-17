import apiClient, { ApiResponse } from '../client';

export interface VehicleLocation {
  id: string;
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  altitude?: number;
  signalQuality?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'NO_SIGNAL';
  batteryLevel?: number;
  recordedAt: string;
  vehicle?: any;
}

export interface GPSStats {
  totalVehicles: number;
  activeSignals: number;
  poorSignals: number;
  noSignals: number;
  averageBatteryLevel: number;
}

export const gpsService = {
  // Positions GPS de tous les véhicules
  async getVehicleLocations(status?: string): Promise<ApiResponse<VehicleLocation[]>> {
    const params = status ? `?status=${status}` : '';
    return apiClient.get(`/gps/vehicles${params}`);
  },

  // Position GPS d'un véhicule
  async getVehicleLocation(vehicleId: string): Promise<ApiResponse<VehicleLocation>> {
    return apiClient.get(`/gps/vehicles/${vehicleId}`);
  },

  // Historique GPS d'un véhicule
  async getTrackingHistory(vehicleId: string, params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<ApiResponse<VehicleLocation[]>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }
    return apiClient.get(`/gps/vehicles/${vehicleId}/history?${queryParams.toString()}`);
  },

  // Enregistrer une position GPS
  async recordLocation(vehicleId: string, data: {
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    altitude?: number;
    signalQuality?: string;
    batteryLevel?: number;
  }): Promise<ApiResponse<VehicleLocation>> {
    return apiClient.post(`/gps/vehicles/${vehicleId}/location`, data);
  },

  // Statistiques des signaux GPS
  async getStats(): Promise<ApiResponse<GPSStats>> {
    return apiClient.get('/gps/stats');
  },
};

export default gpsService;
