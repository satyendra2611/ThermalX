import api from './api';

export const interviewService = {
  async start(userId: string, domainId: string) {
    const { data } = await api.post('/interview/start', { user_id: userId, domain_id: domainId });
    return data;
  },
  async respond(sessionId: string, answer: string) {
    const { data } = await api.post('/interview/respond', { session_id: sessionId, answer });
    return data;
  },
  async result(sessionId: string) {
    const { data } = await api.get('/interview/result', { params: { session_id: sessionId } });
    return data;
  },
};
