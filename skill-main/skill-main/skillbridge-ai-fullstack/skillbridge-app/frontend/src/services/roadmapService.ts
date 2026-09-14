import api from './api';
import type { Roadmap } from '@/types';

export const roadmapService = {
  async get(userId: string): Promise<Roadmap> {
    const { data } = await api.get(`/roadmap/${userId}`);
    return data;
  },
  async generate(userId: string, domainId: string): Promise<Roadmap> {
    const { data } = await api.post('/roadmap/generate', { user_id: userId, domain_id: domainId });
    return data;
  },
};
