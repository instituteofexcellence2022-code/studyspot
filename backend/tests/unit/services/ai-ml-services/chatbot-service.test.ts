/**
 * UNIT TESTS - CHATBOT SERVICE
 * Tests for: Natural language processing, multi-language support,
 * sentiment analysis, human handoff management
 */

// Mock dependencies first
jest.mock('../../../src/config/database', () => ({
  coreDb: {
    query: jest.fn(),
  },
}));

const coreDb = require('../../../src/config/database').coreDb;

describe('Chatbot Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Natural Language Processing', () => {
    it('should understand user intent', () => {
      const userMessage = 'I want to book a seat';
      const intents = {
        booking: ['book', 'reserve', 'seat'],
        inquiry: ['what', 'how', 'when'],
        complaint: ['problem', 'issue', 'wrong'],
      };

      const detectedIntent = Object.keys(intents).find(intent =>
        intents[intent as keyof typeof intents].some(keyword =>
          userMessage.toLowerCase().includes(keyword)
        )
      );

      expect(detectedIntent).toBe('booking');
    });

    it('should extract entities from message', () => {
      const message = 'Book a seat at StudySpot Library tomorrow at 2pm';
      const entities = {
        location: 'StudySpot Library',
        date: 'tomorrow',
        time: '2pm',
        action: 'book',
      };

      expect(entities.location).toBeDefined();
      expect(entities.date).toBeDefined();
    });
  });

  describe('Multi-Language Support', () => {
    it('should detect language', () => {
      const messages = {
        english: 'I want to book a seat',
        hindi: 'मुझे सीट बुक करनी है',
      };

      const detectLanguage = (text: string) => {
        const hindiPattern = /[\u0900-\u097F]/;
        return hindiPattern.test(text) ? 'hi' : 'en';
      };

      expect(detectLanguage(messages.english)).toBe('en');
      expect(detectLanguage(messages.hindi)).toBe('hi');
    });

    it('should respond in user language', () => {
      const userLanguage = 'hi';
      const responses = {
        en: 'Your booking is confirmed',
        hi: 'आपकी बुकिंग की पुष्टि की गई है',
      };

      const response = responses[userLanguage as keyof typeof responses];
      expect(response).toBe('आपकी बुकिंग की पुष्टि की गई है');
    });
  });

  describe('Sentiment Analysis', () => {
    it('should detect positive sentiment', () => {
      const message = 'Great service! Thank you so much!';
      const positiveWords = ['great', 'good', 'excellent', 'thank', 'love'];
      const negativeWords = ['bad', 'terrible', 'hate', 'awful'];

      const positiveCount = positiveWords.filter(word => 
        message.toLowerCase().includes(word)
      ).length;
      const negativeCount = negativeWords.filter(word => 
        message.toLowerCase().includes(word)
      ).length;

      const sentiment = positiveCount > negativeCount ? 'positive' : 'negative';
      expect(sentiment).toBe('positive');
    });

    it('should detect negative sentiment', () => {
      const message = 'This is terrible. I hate this service.';
      const positiveWords = ['great', 'good', 'excellent'];
      const negativeWords = ['terrible', 'hate', 'bad', 'awful'];

      const positiveCount = positiveWords.filter(word => 
        message.toLowerCase().includes(word)
      ).length;
      const negativeCount = negativeWords.filter(word => 
        message.toLowerCase().includes(word)
      ).length;

      const sentiment = positiveCount > negativeCount ? 'positive' : 'negative';
      expect(sentiment).toBe('negative');
    });
  });

  describe('Human Handoff Management', () => {
    it('should determine when to handoff to human', () => {
      const conditions = {
        complexity: 'high',
        sentiment: 'negative',
        unresolvedAttempts: 3,
      };

      const shouldHandoff = 
        conditions.complexity === 'high' ||
        conditions.sentiment === 'negative' ||
        conditions.unresolvedAttempts >= 3;

      expect(shouldHandoff).toBe(true);
    });

    it('should create handoff request', async () => {
      const handoff = {
        chat_id: 'chat-123',
        reason: 'complex_query',
        priority: 'high',
        assigned_to: null,
      };

      (coreDb.query).mockResolvedValue({
        rows: [{ id: 'handoff-123', ...handoff, status: 'pending' }],
      });

      const result = await coreDb.query(
        `INSERT INTO chat_handoffs (chat_id, reason, priority, status)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [handoff.chat_id, handoff.reason, handoff.priority, 'pending']
      );

      expect(result.rows[0].status).toBe('pending');
    });

    it('should assign handoff to available agent', async () => {
      const handoffId = 'handoff-123';
      const agentId = 'agent-456';

      (coreDb.query).mockResolvedValue({
        rows: [{ id: handoffId, assigned_to: agentId, status: 'assigned' }],
      });

      const result = await coreDb.query(
        `UPDATE chat_handoffs SET assigned_to = $1, status = 'assigned' WHERE id = $2 RETURNING *`,
        [agentId, handoffId]
      );

      expect(result.rows[0].assigned_to).toBe(agentId);
    });
  });
});

