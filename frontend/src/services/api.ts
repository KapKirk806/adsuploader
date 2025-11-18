import axios, { AxiosInstance } from 'axios';
import type {
  CampaignTemplate,
  UploadJob,
  Creative,
  JobStats,
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
}

export const api = new ApiService();
export default api;
