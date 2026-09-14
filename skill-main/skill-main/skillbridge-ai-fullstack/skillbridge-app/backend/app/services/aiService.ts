import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

interface AskAIResponse {
  response: string;
}

export const aiService = {
  async ask(message: string): Promise<string> {
    const response = await axios.post<AskAIResponse>(
      `${API_BASE_URL}/ai/ask`,
      {
        message,
      }
    );

    return response.data.response;
  },
};