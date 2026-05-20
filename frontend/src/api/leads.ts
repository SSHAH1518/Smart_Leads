import api from './axios';
import { ApiResponse, Lead, LeadFilters, LeadFormData, LeadStats, PaginationMeta } from '../types';

interface LeadsResponse {
  leads: Lead[];
  meta: PaginationMeta;
}

export const leadsApi = {
  getLeads: async (filters: LeadFilters = {}): Promise<LeadsResponse> => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.source) params.set('source', filters.source);
    if (filters.search) params.set('search', filters.search);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.page) params.set('page', String(filters.page));
    params.set('limit', '10');

    const res = await api.get<ApiResponse<Lead[]>>(`/leads?${params.toString()}`);
    return { leads: res.data.data ?? [], meta: res.data.meta! };
  },

  getLeadById: async (id: string): Promise<Lead> => {
    const res = await api.get<ApiResponse<Lead>>(`/leads/${id}`);
    return res.data.data!;
  },

  createLead: async (data: LeadFormData): Promise<Lead> => {
    const res = await api.post<ApiResponse<Lead>>('/leads', data);
    return res.data.data!;
  },

  updateLead: async (id: string, data: Partial<LeadFormData>): Promise<Lead> => {
    const res = await api.put<ApiResponse<Lead>>(`/leads/${id}`, data);
    return res.data.data!;
  },

  deleteLead: async (id: string): Promise<void> => {
    await api.delete(`/leads/${id}`);
  },

  exportCSV: async (): Promise<void> => {
    const res = await api.get('/leads/export/csv', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'leads.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  getStats: async (): Promise<LeadStats> => {
    const res = await api.get<ApiResponse<LeadStats>>('/leads/stats');
    return res.data.data!;
  },
};
