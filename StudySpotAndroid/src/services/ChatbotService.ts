/**
 * 🎓 STUDYSPOT - Chatbot Service
 * Handles AI assistant conversations
 */

import {API_CONFIG} from '@constants/index';
import NetworkService from './NetworkService';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export interface ChatbotResponse {
  message: string;
  intent: string;
  timestamp: string;
  suggestions: string[];
  quickReplies: string[];
}

export interface ConversationContext {
  userName?: string;
  userLocation?: string;
  lastLibrary?: string;
  lastBooking?: string;
  [key: string]: any;
}

class ChatbotService {
  /**
   * Send a message to the chatbot
   */
  async sendMessage(
    message: string,
    context?: ConversationContext,
  ): Promise<ChatbotResponse> {
    try {
      const response = await NetworkService.post<{
        success: boolean;
        data: ChatbotResponse;
        meta: {
          timestamp: string;
        };
      }>(API_CONFIG.ENDPOINTS.CHATBOT.MESSAGE, {
        message,
        context: context || {},
      });

      return response.data;
    } catch (error) {
      console.error('Error sending chatbot message:', error);
      throw error;
    }
  }

  /**
   * Get FAQ answer
   */
  async getFAQ(question: string): Promise<string> {
    try {
      const response = await this.sendMessage(`FAQ: ${question}`);
      return response.message;
    } catch (error) {
      console.error('Error fetching FAQ:', error);
      throw error;
    }
  }

  /**
   * Format conversation history for context
   */
  formatConversationHistory(messages: ChatMessage[]): string {
    return messages
      .map(msg => `${msg.sender}: ${msg.text}`)
      .join('\n');
  }

  /**
   * Generate unique message ID
   */
  generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new ChatbotService();


