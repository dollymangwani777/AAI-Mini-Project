import axios from 'axios';
import {
  Incident,
  TrackResponse,
  ComplaintSubmissionResponse,
  AnalyticsOverview,
  HeatmapPoint
} from '../types';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const api = {
  // Citizen Ingestion Pipeline
  submitComplaint: async (data: {
    description: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    citizen_contact?: string;
    image_url?: string;
  }): Promise<ComplaintSubmissionResponse> => {
    const res = await apiClient.post<ComplaintSubmissionResponse>('/complaints/submit', data);
    return res.data;
  },

  // Real-Time Tracking
  trackComplaint: async (ticketNumber: string): Promise<TrackResponse> => {
    const res = await apiClient.get<TrackResponse>(`/complaints/track/${encodeURIComponent(ticketNumber)}`);
    return res.data;
  },

  // Admin Incidents
  getIncidents: async (params?: {
    department?: string;
    ward_id?: string;
    severity?: string;
    status?: string;
    sla_risk?: string;
    search?: string;
  }): Promise<Incident[]> => {
    const res = await apiClient.get<Incident[]>('/admin/incidents', { params });
    return res.data;
  },

  // Update Status / Field Resolution
  updateStatus: async (
    incidentId: number,
    data: {
      status: string;
      resolution_notes?: string;
      resolved_by?: string;
    }
  ): Promise<Incident> => {
    const res = await apiClient.patch<Incident>(`/admin/incidents/${incidentId}/status`, data);
    return res.data;
  },

  // Analytics & Heatmap
  getAnalyticsOverview: async (): Promise<AnalyticsOverview> => {
    const res = await apiClient.get<AnalyticsOverview>('/admin/analytics/overview');
    return res.data;
  },

  getHeatmapData: async (): Promise<HeatmapPoint[]> => {
    const res = await apiClient.get<HeatmapPoint[]>('/admin/analytics/heatmap');
    return res.data;
  },

  // Trigger Database Reseed
  seedDatabase: async (): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>('/admin/seed?force=true');
    return res.data;
  }
};
