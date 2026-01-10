// Client API compatible avec l'ancien format base44
// Utilise les vrais services API pour communiquer avec le backend NestJS

import {
  vehiclesService,
  driversService,
  banksService,
  paymentsService,
  guaranteesService,
  guaranteeFundsService,
  giesService,
  maintenancesService,
  incidentsService,
  insurancesService,
  insurersService,
  usersService,
  programsService,
  gpsService,
  reportsService,
  notificationsService,
} from './services';
import apiClient from './client';

// Helper pour transformer les réponses API vers le format attendu
const transformResponse = async <T>(promise: Promise<any>): Promise<T> => {
  const response = await promise;
  return response.data;
};

// Helper pour transformer une liste avec filtres
const transformListResponse = async <T>(promise: Promise<any>): Promise<T[]> => {
  const response = await promise;
  return response.data || [];
};

// Interface pour les entités CRUD
interface EntityService<T, CreateDto, UpdateDto = Partial<CreateDto>> {
  list: (filters?: any) => Promise<T[]>;
  get: (id: string) => Promise<T>;
  create: (data: CreateDto) => Promise<T>;
  update: (id: string, data: UpdateDto) => Promise<T>;
  delete: (id: string) => Promise<void>;
  filter?: (params: any) => Promise<T[]>;
}

// Créer un wrapper pour chaque entité
const createEntityWrapper = <T>(service: any): EntityService<T, any> => ({
  list: async (filters?: any) => transformListResponse<T>(service.list(filters)),
  get: async (id: string) => transformResponse<T>(service.get(id)),
  create: async (data: any) => transformResponse<T>(service.create(data)),
  update: async (id: string, data: any) => transformResponse<T>(service.update(id, data)),
  delete: async (id: string) => {
    await service.delete(id);
  },
  filter: async (params: any) => transformListResponse<T>(service.list(params)),
});

// Client principal compatible base44
export const base44 = {
  entities: {
    // Véhicules
    Vehicle: {
      ...createEntityWrapper(vehiclesService),
      getStats: async () => transformResponse(vehiclesService.getStats()),
      getFinancialSummary: async (id: string) => transformResponse(vehiclesService.getFinancialSummary(id)),
      updateGpsLocation: async (id: string, data: any) => transformResponse(vehiclesService.updateGpsLocation(id, data)),
      getMaintenanceHistory: async (id: string) => transformListResponse(vehiclesService.getMaintenanceHistory(id)),
      getGuaranteeHistory: async (id: string) => transformListResponse(vehiclesService.getGuaranteeHistory(id)),
      calculateTCO: async (id: string) => transformResponse(vehiclesService.calculateTCO(id)),
    },

    // Conducteurs
    Driver: {
      ...createEntityWrapper(driversService),
      assignVehicle: async (driverId: string, vehicleId: string) =>
        transformResponse(driversService.assignVehicle(driverId, vehicleId)),
      unassignVehicle: async (driverId: string) =>
        transformResponse(driversService.unassignVehicle(driverId)),
      getPaymentHistory: async (id: string, params?: any) =>
        transformListResponse(driversService.getPaymentHistory(id, params)),
      getPerformance: async (id: string) =>
        transformResponse(driversService.getPerformance(id)),
      checkExpiringDocuments: async (daysAhead?: number) =>
        transformListResponse(driversService.checkExpiringDocuments(daysAhead)),
    },

    // Banques
    Bank: {
      ...createEntityWrapper(banksService),
      getStats: async (id: string) => transformResponse(banksService.getStats(id)),
    },

    // Paiements
    DailyPayment: {
      ...createEntityWrapper(paymentsService),
      markAsPaid: async (id: string, data: any) => transformResponse(paymentsService.markAsPaid(id, data)),
      routeToBank: async (id: string) => transformResponse(paymentsService.routeToBank(id)),
      getTodayStats: async () => transformResponse(paymentsService.getTodayStats()),
      getOverdue: async () => transformListResponse(paymentsService.getOverdue()),
      generateDaily: async (date?: string) => transformResponse(paymentsService.generateDaily(date)),
      addProof: async (paymentId: string, data: any) => transformResponse(paymentsService.addProof(paymentId, data)),
      verifyProof: async (proofId: string) => transformResponse(paymentsService.verifyProof(proofId)),
    },

    // Règles de routage
    PaymentRoutingRule: {
      list: async (bankId?: string) => transformListResponse(paymentsService.getRoutingRules(bankId)),
      create: async (data: any) => transformResponse(paymentsService.createRoutingRule(data)),
      update: async (id: string, data: any) => transformResponse(paymentsService.updateRoutingRule(id, data)),
      delete: async (id: string) => { await paymentsService.deleteRoutingRule(id); },
    },

    // Garanties
    Guarantee: {
      ...createEntityWrapper(guaranteesService),
      call: async (id: string, data: any) => transformResponse(guaranteesService.call(id, data)),
      release: async (id: string) => transformResponse(guaranteesService.release(id)),
      close: async (id: string) => transformResponse(guaranteesService.close(id)),
      getCallHistory: async (id: string) => transformListResponse(guaranteesService.getCallHistory(id)),
    },

    // Fonds de garantie
    GuaranteeFund: createEntityWrapper(guaranteeFundsService),

    // GIE
    GIE: {
      ...createEntityWrapper(giesService),
      getMembers: async (id: string) => transformListResponse(giesService.getMembers(id)),
      getStats: async (id: string) => transformResponse(giesService.getStats(id)),
    },

    // Maintenances
    Maintenance: {
      ...createEntityWrapper(maintenancesService),
      getUpcoming: async (days?: number) => transformListResponse(maintenancesService.getUpcoming(days)),
      getPredictiveAlerts: async (vehicleId?: string) => transformListResponse(maintenancesService.getPredictiveAlerts(vehicleId)),
      generatePredictiveAlerts: async () => transformResponse(maintenancesService.generatePredictiveAlerts()),
      resolvePredictiveAlert: async (id: string) => transformResponse(maintenancesService.resolvePredictiveAlert(id)),
      markAsFalseAlarm: async (id: string) => transformResponse(maintenancesService.markAsFalseAlarm(id)),
      getConfig: async (vehicleId: string) => transformResponse(maintenancesService.getConfig(vehicleId)),
      updateConfig: async (vehicleId: string, config: any) => transformResponse(maintenancesService.updateConfig(vehicleId, config)),
    },

    // Incidents
    Incident: {
      ...createEntityWrapper(incidentsService),
      getStats: async () => transformResponse(incidentsService.getStats()),
      resolve: async (id: string, notes?: string) => transformResponse(incidentsService.resolve(id, notes)),
      escalate: async (id: string, notes?: string) => transformResponse(incidentsService.escalate(id, notes)),
    },

    // Assurances
    Insurance: {
      ...createEntityWrapper(insurancesService),
      getExpiring: async (days?: number) => transformListResponse(insurancesService.getExpiring(days)),
      getClaims: async (insuranceId?: string) => transformListResponse(insurancesService.getClaims(insuranceId)),
      createClaim: async (insuranceId: string, data: any) => transformResponse(insurancesService.createClaim(insuranceId, data)),
      updateClaimStatus: async (claimId: string, status: any, approvedAmount?: number) =>
        transformResponse(insurancesService.updateClaimStatus(claimId, status, approvedAmount)),
    },

    // Assureurs
    Insurer: createEntityWrapper(insurersService),

    // GPS Tracking
    GPSTracking: {
      list: async (status?: string) => transformListResponse(gpsService.getVehicleLocations(status)),
      get: async (vehicleId: string) => transformResponse(gpsService.getVehicleLocation(vehicleId)),
      getHistory: async (vehicleId: string, params?: any) => transformListResponse(gpsService.getTrackingHistory(vehicleId, params)),
      recordLocation: async (vehicleId: string, data: any) => transformResponse(gpsService.recordLocation(vehicleId, data)),
      getStats: async () => transformResponse(gpsService.getStats()),
    },

    // Notifications
    Notification: {
      list: async (params?: any) => transformListResponse(notificationsService.list(params)),
      markAsRead: async (id: string) => transformResponse(notificationsService.markAsRead(id)),
      markAllAsRead: async () => transformResponse(notificationsService.markAllAsRead()),
      delete: async (id: string) => { await notificationsService.delete(id); },
      getTemplates: async () => transformListResponse(notificationsService.getTemplates()),
      createTemplate: async (data: any) => transformResponse(notificationsService.createTemplate(data)),
      updateTemplate: async (id: string, data: any) => transformResponse(notificationsService.updateTemplate(id, data)),
      deleteTemplate: async (id: string) => { await notificationsService.deleteTemplate(id); },
    },

    // Programmes de financement
    FinancingProgram: {
      ...createEntityWrapper(programsService),
    },

    // Utilisateurs
    User: {
      ...createEntityWrapper(usersService),
      getStats: async () => transformResponse(usersService.getStats()),
      updateStatus: async (id: string, status: any) => transformResponse(usersService.updateStatus(id, status)),
    },

    // Rapports
    Report: {
      getDashboardStats: async () => transformResponse(reportsService.getDashboardStats()),
      getFinancialReport: async (params: any) => transformResponse(reportsService.getFinancialReport(params)),
      getVehicleReport: async (vehicleId: string) => transformResponse(reportsService.getVehicleReport(vehicleId)),
      getDriverReport: async (driverId: string) => transformResponse(reportsService.getDriverReport(driverId)),
      exportData: async (type: any, format?: any) => transformResponse(reportsService.exportData(type, format)),
    },

    // Consommation de carburant
    FuelConsumption: {
      list: async (vehicleId?: string) => {
        const params = vehicleId ? { vehicleId } : {};
        return transformListResponse(apiClient.get('/fuel-consumption', { params }));
      },
      create: async (data: any) => transformResponse(apiClient.post('/fuel-consumption', data)),
    },
  },

  // Fonctions personnalisées
  functions: {
    invoke: async (functionName: string, params: any) => {
      // Map les noms de fonctions vers les endpoints API
      const functionMap: Record<string, () => Promise<any>> = {
        calculateVehicleTCO: () => vehiclesService.calculateTCO(params.vehicleId),
        getDriverPerformance: () => driversService.getPerformance(params.driverId),
        generateDailyPayments: () => paymentsService.generateDaily(params.date),
        getTodayPaymentStats: () => paymentsService.getTodayStats(),
        getOverduePayments: () => paymentsService.getOverdue(),
        sendDriverMessage: () => apiClient.post('/notifications/send-driver-message', params),
      };

      const fn = functionMap[functionName];
      if (fn) {
        const response = await fn();
        return response.data || response;
      }
      throw new Error(`Fonction inconnue: ${functionName}`);
    },
  },

  // Intégrations
  integrations: {
    Core: {
      UploadFile: async ({ file }: { file: File }) => {
        const formData = new FormData();
        formData.append('file', file);
        const response: any = await apiClient.post('/uploads', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return { file_url: response.data?.url || response?.url || '' };
      },
    },
  },
};

export default base44;
