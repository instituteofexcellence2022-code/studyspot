/**
 * Redux Slice: Chatbot
 * Manages AI chatbot conversation state
 */

import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import ChatbotService, {
  ChatMessage,
  ChatbotResponse,
  ConversationContext,
} from '@services/ChatbotService';

// =============================================================================
// STATE INTERFACE
// =============================================================================

interface ChatbotState {
  messages: ChatMessage[];
  context: ConversationContext;
  isTyping: boolean;
  loading: boolean;
  error: string | null;
  currentConversationId: string | null;
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: ChatbotState = {
  messages: [],
  context: {},
  isTyping: false,
  loading: false,
  error: null,
  currentConversationId: null,
};

// =============================================================================
// ASYNC THUNKS
// =============================================================================

/**
 * Send a message to the chatbot
 */
export const sendChatMessage = createAsyncThunk(
  'chatbot/sendMessage',
  async (
    {message, context}: {message: string; context?: ConversationContext},
    {getState, rejectWithValue},
  ) => {
    try {
      const state = getState() as {chatbot: ChatbotState};
      const currentContext = context || state.chatbot.context;

      const response = await ChatbotService.sendMessage(message, currentContext);

      // Generate unique IDs for messages
      const userMessage: ChatMessage = {
        id: ChatbotService.generateMessageId(),
        text: message,
        sender: 'user',
        timestamp: new Date().toISOString(),
      };

      const botMessage: ChatMessage = {
        id: ChatbotService.generateMessageId(),
        text: response.message,
        sender: 'bot',
        timestamp: response.timestamp,
      };

      return {userMessage, botMessage, response};
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to send message',
      );
    }
  },
);

// =============================================================================
// SLICE
// =============================================================================

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState,
  reducers: {
    addUserMessage: (state, action: PayloadAction<string>) => {
      const message: ChatMessage = {
        id: ChatbotService.generateMessageId(),
        text: action.payload,
        sender: 'user',
        timestamp: new Date().toISOString(),
      };
      state.messages.push(message);
    },
    addBotMessage: (state, action: PayloadAction<string>) => {
      const message: ChatMessage = {
        id: ChatbotService.generateMessageId(),
        text: action.payload,
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
      state.messages.push(message);
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    updateContext: (state, action: PayloadAction<ConversationContext>) => {
      state.context = {...state.context, ...action.payload};
    },
    clearConversation: state => {
      state.messages = [];
      state.context = {};
      state.error = null;
      state.currentConversationId = null;
    },
    startNewConversation: state => {
      state.messages = [];
      state.context = {};
      state.error = null;
      state.currentConversationId = `conv_${Date.now()}`;

      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: ChatbotService.generateMessageId(),
        text: "Hello! 👋 I'm your StudySpot assistant. How can I help you find the perfect study space today?",
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
      state.messages.push(welcomeMessage);
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(sendChatMessage.pending, state => {
        state.loading = true;
        state.isTyping = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.isTyping = false;
        state.messages.push(action.payload.userMessage);
        state.messages.push(action.payload.botMessage);
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.isTyping = false;
        state.error = action.payload as string;
      });
  },
});

// =============================================================================
// EXPORTS
// =============================================================================

export const {
  addUserMessage,
  addBotMessage,
  setTyping,
  updateContext,
  clearConversation,
  startNewConversation,
  clearError,
} = chatbotSlice.actions;

export default chatbotSlice.reducer;


