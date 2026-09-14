import api from './api';
import type { AssessmentQuestion, AssessmentResult, AssessmentSubmission } from '@/types';

export const assessmentService = {
  async getQuestions(domainId: string): Promise<AssessmentQuestion[]> {
    const { data } = await api.get('/assessment/questions', { params: { domain_id: domainId } });
    return data;
  },
  async submit(payload: AssessmentSubmission): Promise<AssessmentResult> {
    const { data } = await api.post('/assessment/submit', payload);
    return data;
  },
  async getResult(userId: string): Promise<AssessmentResult> {
    const { data } = await api.get('/assessment/result', { params: { user_id: userId } });
    return data;
  },
};
