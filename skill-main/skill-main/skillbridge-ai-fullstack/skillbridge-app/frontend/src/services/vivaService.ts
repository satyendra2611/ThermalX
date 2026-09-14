import api from './api';

export const vivaService = {
  async start(projectId: string) {
    const { data } = await api.post('/viva/start', { project_id: projectId });
    return data;
  },
  async respond(sessionId: string, answer: string) {
    const { data } = await api.post('/viva/respond', { session_id: sessionId, answer });
    return data;
  },
  async result(sessionId: string) {
    const { data } = await api.get('/viva/result', { params: { session_id: sessionId } });
    return data;
  },
};
