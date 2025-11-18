import axios, { AxiosInstance } from 'axios';
import type {
  CampaignTemplate,
  UploadJob,
  Creative,
  JobStats,
  User,
  AdAccount,
  TeamMember,
  ActivityLog,
} from '../types';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await this.client.post('/auth/register', { name, email, password });
    return response.data;
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get('/auth/me');
    return response.data.user;
  }

  async getFacebookAuthUrl(): Promise<{ authUrl: string }> {
    const response = await this.client.get('/auth/facebook');
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
    localStorage.removeItem('auth_token');
  }

  async updateProfile(data: { name: string; email: string }): Promise<{ user: User }> {
    const response = await this.client.put('/auth/profile', data);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.client.post('/auth/change-password', { currentPassword, newPassword });
  }

  async uploadAvatar(formData: FormData): Promise<{ avatar_url: string }> {
    const response = await this.client.post('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async requestPasswordReset(email: string): Promise<void> {
    await this.client.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.client.post('/auth/reset-password', { token, newPassword });
  }

  // Settings
  async getSettings(): Promise<any> {
    const response = await this.client.get('/settings');
    return response.data.settings;
  }

  async updateSettings(settings: any): Promise<void> {
    await this.client.put('/settings', settings);
  }

  async deleteAccount(): Promise<void> {
    await this.client.delete('/auth/account');
  }

  // Ad Accounts
  async getAdAccounts(): Promise<AdAccount[]> {
    const response = await this.client.get('/ad-accounts');
    return response.data.accounts;
  }

  async syncAdAccountsFromMeta(): Promise<AdAccount[]> {
    const response = await this.client.post('/ad-accounts/sync');
    return response.data.accounts;
  }

  async getAdAccount(id: number): Promise<AdAccount> {
    const response = await this.client.get(`/ad-accounts/${id}`);
    return response.data.account;
  }

  async deleteAdAccount(id: number): Promise<void> {
    await this.client.delete(`/ad-accounts/${id}`);
  }

  // Templates
  async getTemplates(): Promise<CampaignTemplate[]> {
    const response = await this.client.get('/templates');
    return response.data.templates;
  }

  async getTemplate(id: number): Promise<CampaignTemplate> {
    const response = await this.client.get(`/templates/${id}`);
    return response.data.template;
  }

  async createTemplate(data: Partial<CampaignTemplate>): Promise<CampaignTemplate> {
    const response = await this.client.post('/templates', data);
    return response.data.template;
  }

  async updateTemplate(id: number, data: Partial<CampaignTemplate>): Promise<CampaignTemplate> {
    const response = await this.client.put(`/templates/${id}`, data);
    return response.data.template;
  }

  async deleteTemplate(id: number): Promise<void> {
    await this.client.delete(`/templates/${id}`);
  }

  async setDefaultTemplate(id: number): Promise<void> {
    await this.client.post(`/templates/${id}/set-default`);
  }

  // File Uploads
  async uploadFiles(files: File[], adAccountId: number, templateId?: number): Promise<{
    job: UploadJob;
    creatives: Creative[];
  }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('ad_account_id', adAccountId.toString());
    if (templateId) {
      formData.append('template_id', templateId.toString());
    }

    const response = await this.client.post('/uploads/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  async getJobFiles(jobId: number): Promise<{
    job: UploadJob;
    creatives: Creative[];
  }> {
    const response = await this.client.get(`/uploads/${jobId}/files`);
    return response.data;
  }

  async publishJob(jobId: number): Promise<void> {
    await this.client.post(`/uploads/${jobId}/publish`);
  }

  // Jobs
  async getJobs(page: number = 1, limit: number = 10, status?: string): Promise<UploadJob[]> {
    const response = await this.client.get('/jobs', {
      params: { page, limit, status },
    });
    return response.data.jobs;
  }

  async getJob(id: number): Promise<UploadJob> {
    const response = await this.client.get(`/jobs/${id}`);
    return response.data.job;
  }

  async getJobProgress(id: number): Promise<Partial<UploadJob>> {
    const response = await this.client.get(`/jobs/${id}/progress`);
    return response.data;
  }

  async cancelJob(id: number): Promise<void> {
    await this.client.delete(`/jobs/${id}`);
  }

  async getJobStats(): Promise<JobStats> {
    const response = await this.client.get('/jobs/stats');
    return response.data.stats;
  }

  // Team
  async getTeamMembers(): Promise<TeamMember[]> {
    const response = await this.client.get('/team');
    return response.data.members;
  }

  async inviteTeamMember(email: string, role: 'admin' | 'member'): Promise<TeamMember> {
    const response = await this.client.post('/team/invite', { email, role });
    return response.data.member;
  }

  async updateTeamMember(id: number, data: { role?: string; status?: string }): Promise<TeamMember> {
    const response = await this.client.put(`/team/${id}`, data);
    return response.data.member;
  }

  async removeTeamMember(id: number): Promise<void> {
    await this.client.delete(`/team/${id}`);
  }

  // Activity Logs
  async getActivityLogs(params: {
    page?: number;
    limit?: number;
    search?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ logs: ActivityLog[]; total: number }> {
    const response = await this.client.get('/activity-logs', { params });
    return response.data;
  }
}

export const api = new ApiService();
export default api;
