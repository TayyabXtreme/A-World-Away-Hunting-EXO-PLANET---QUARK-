import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_AI_KEY || '');

// System prompt for ExoQuark context
const SYSTEM_PROMPT = `You are ExoQuark AI, an expert assistant for an exoplanet discovery platform. You help users understand:
- Exoplanet characteristics and classifications
- NASA missions (Kepler, K2, TESS) and their AI detection methods
- Our platform's 3D visualization and dataset explorer features
- Machine learning models used for exoplanet prediction (XGBoost, LGBM)
- Planetary science concepts in simple terms

Keep responses concise, friendly, and space-themed. Use emojis occasionally (🌌 🔭 🪐 ⭐ 🚀). 
If asked about features, guide users to explore the Kepler, K2, TESS analysis pages or the Dataset Explorer.`;

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export class GeminiService {
  private model;
  private chatHistory: ChatMessage[] = [];

  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT
    });
  }

  // Stream chat response
  async* streamChat(userMessage: string): AsyncGenerator<string, void, unknown> {
    try {
      // Add user message to history
      this.chatHistory.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

      // Start chat with history
      const chat = this.model.startChat({
        history: this.chatHistory.slice(0, -1), // Exclude the current message
      });

      // Stream the response
      const result = await chat.sendMessageStream(userMessage);
      
      let fullResponse = '';
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        yield chunkText;
      }

      // Add AI response to history
      this.chatHistory.push({
        role: 'model',
        parts: [{ text: fullResponse }]
      });

    } catch (error) {
      console.error('Gemini streaming error:', error);
      yield '🌌 Sorry, I encountered an error. Please try again!';
    }
  }

  // Reset chat history
  resetChat() {
    this.chatHistory = [];
  }

  // Get chat history
  getHistory() {
    return this.chatHistory;
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
