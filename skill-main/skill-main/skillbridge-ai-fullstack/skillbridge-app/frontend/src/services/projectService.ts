import api from './api';
import type { ProjectChallenge, ProjectSubmission } from '@/types';

export const projectService = {
  async getChallenge(topicId: string): Promise<ProjectChallenge> {
    const { data } = await api.get('/projects/challenge', { params: { topic_id: topicId } });
    return data;
  },
  async submit(formData: FormData): Promise<ProjectSubmission> {
    const { data } = await api.post('/projects/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
