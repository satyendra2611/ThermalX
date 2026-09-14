import api from './api';
import type { JobReadinessReport } from '@/types';

export const readinessService = {
  async calculate(userId: string): Promise<JobReadinessReport> {
    const { data } = await api.post('/readiness/calculate', { user_id: userId });
    return data;
  },
  async getReport(userId: string): Promise<JobReadinessReport> {
    const { data } = await api.get(`/readiness/${userId}`);
    return data;
  },
};
