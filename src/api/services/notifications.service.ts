import apiClient, { ApiResponse } from '../client';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  isRead: boolean;
  link?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  channel: 'EMAIL' | 'SMS' | 'PUSH' | 'ALL';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationFilters {
  skip?: number;
  take?: number;
  unreadOnly?: boolean;
}

export const notificationsService = {
  // Mes notifications
  async list(filters?: NotificationFilters): Promise<ApiResponse<Notification[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get(`/notifications?${params.toString()}`);
  },

  // Marquer comme lue
  async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    return apiClient.patch(`/notifications/${id}/read`);
  },

  // Marquer toutes comme lues
  async markAllAsRead(): Promise<ApiResponse<{ count: number }>> {
    return apiClient.post('/notifications/mark-all-read');
  },

  // Supprimer une notification
  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`/notifications/${id}`);
  },

  // Liste des modèles de rappel
  async getTemplates(): Promise<ApiResponse<ReminderTemplate[]>> {
    return apiClient.get('/notifications/templates');
  },

  // Créer un modèle de rappel
  async createTemplate(data: {
    name: string;
    subject: string;
    content: string;
    channel?: string;
  }): Promise<ApiResponse<ReminderTemplate>> {
    return apiClient.post('/notifications/templates', data);
  },

  // Modifier un modèle de rappel
  async updateTemplate(id: string, data: Partial<{
    name: string;
    subject: string;
    content: string;
    channel: string;
    isActive: boolean;
  }>): Promise<ApiResponse<ReminderTemplate>> {
    return apiClient.patch(`/notifications/templates/${id}`, data);
  },

  // Supprimer un modèle de rappel
  async deleteTemplate(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`/notifications/templates/${id}`);
  },
};

export default notificationsService;
