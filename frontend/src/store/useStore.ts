import { create } from 'zustand';
import type { User, CampaignTemplate, UploadJob, JobStats } from '../types';

interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;

  // Templates
  templates: CampaignTemplate[];
  setTemplates: (templates: CampaignTemplate[]) => void;
  selectedTemplate: CampaignTemplate | null;
  setSelectedTemplate: (template: CampaignTemplate | null) => void;

  // Jobs
  jobs: UploadJob[];
  setJobs: (jobs: UploadJob[]) => void;
  currentJob: UploadJob | null;
  setCurrentJob: (job: UploadJob | null) => void;

  // Stats
  jobStats: JobStats | null;
  setJobStats: (stats: JobStats | null) => void;

  // UI state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  // User
  user: null,
  setUser: (user) => set({ user }),

  // Templates
  templates: [],
  setTemplates: (templates) => set({ templates }),
  selectedTemplate: null,
  setSelectedTemplate: (selectedTemplate) => set({ selectedTemplate }),

  // Jobs
  jobs: [],
  setJobs: (jobs) => set({ jobs }),
  currentJob: null,
  setCurrentJob: (currentJob) => set({ currentJob }),

  // Stats
  jobStats: null,
  setJobStats: (jobStats) => set({ jobStats }),

  // UI
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  loading: false,
  setLoading: (loading) => set({ loading }),
}));
