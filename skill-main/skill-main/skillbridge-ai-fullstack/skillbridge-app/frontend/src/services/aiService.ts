const API_BASE_URL = 'http://127.0.0.1:8000/api';

interface AskAIResponse {
  response: string;
}

export const aiService = {
  async ask(question: string): Promise<string> {
    const token = localStorage.getItem('sb_token');

    const response = await fetch(`${API_BASE_URL}/ai/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
      body: JSON.stringify({
        question,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      throw new Error(
        errorData?.detail ||
          'Unable to get a response from SkillBridge AI.'
      );
    }

    const data: AskAIResponse = await response.json();

    return data.response;
  },
};