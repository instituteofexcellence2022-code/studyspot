/**
 * 🎓 STUDYSPOT - AI Chatbot Service
 * Phase 5: AI Study Assistant
 * 
 * Provides intelligent conversational assistance for:
 * - Library recommendations
 * - Booking assistance
 * - FAQ responses
 * - Study tips
 * - General queries
 */

class ChatbotService {
  constructor() {
    // Intent patterns for natural language understanding
    this.intents = {
      GREETING: /^(hi|hello|hey|good morning|good evening)/i,
      BOOKING: /(book|reserve|seat|library|study)/i,
      RECOMMENDATION: /(recommend|suggest|best|find|looking for)/i,
      PRICING: /(price|cost|how much|fees|payment)/i,
      HOURS: /(hours|time|open|close|timing|when)/i,
      AMENITIES: /(amenities|facilities|wifi|parking|coffee)/i,
      LOCATION: /(where|location|address|city|area)/i,
      HELP: /(help|support|contact|issue|problem)/i,
      CANCELLATION: /(cancel|refund|change booking)/i,
      GAMIFICATION: /(points|badges|rewards|level|streak)/i,
      GOODBYE: /^(bye|goodbye|see you|thanks|thank you)/i
    };

    // Response templates
    this.responses = {
      GREETING: ["Hello! 👋 I'm your StudySpot assistant. How can I help you find the perfect study space today?", "Hi there! 🎓 Looking for a great place to study? I can help you find and book the best library!", "Hey! 😊 Ready to boost your productivity? Let me help you discover amazing study spots!"],
      BOOKING: ["I'd love to help you book a study space! 📚\n\nTo get started:\n1. Tell me your preferred city or location\n2. What date and time do you need?\n3. Any specific amenities you prefer?\n\nOr I can show you our top recommended libraries!", "Great! Let's find you the perfect spot. 🎯\n\nQuick questions:\n- Which city are you in?\n- When do you want to study?\n- Budget per session?\n\nI'll find the best matches for you!", "Booking made easy! ✨\n\nYou can:\n• Browse available libraries\n• Filter by location & amenities\n• Book in just 3 clicks\n\nWhat city are you interested in?"],
      RECOMMENDATION: ["I can suggest perfect libraries based on your preferences! 🌟\n\nTell me:\n- Your city/area\n- Price range\n- Must-have amenities (WiFi, AC, Parking, etc.)\n- When you plan to study\n\nI'll find the top matches!", "Let me help you discover great study spots! 🔍\n\nOur top-rated libraries:\n• Central Study Hub (Bangalore) - ⭐ 4.5\n• Knowledge Point (Gurgaon) - ⭐ 4.7\n• Elite Study Lounge (Mumbai) - ⭐ 4.8\n\nWant details on any of these?", "Based on popular choice, I recommend:\n\n🏆 Elite Study Lounge, Mumbai\n   - Premium facility with complimentary coffee\n   - Rating: 4.8⭐ (267 reviews)\n   - Price: ₹450/day\n\nInterested? I can check availability!"],
      PRICING: ["Our pricing varies by library and location! 💰\n\nTypical ranges:\n• Budget: ₹250-350/day\n• Standard: ₹300-450/day\n• Premium: ₹450-750/day\n\nMost libraries also offer:\n- Hourly rates (₹40-80/hr)\n- Weekly passes (20% off)\n- Monthly plans (40% off)\n\nWhich city are you looking at?", "Great question! Here's our pricing breakdown: 💳\n\n📊 Average Daily Rates:\n- Bangalore: ₹300\n- Delhi: ₹280\n- Mumbai: ₹450 (premium)\n- Kolkata: ₹250\n- Gurgaon: ₹350\n\n💡 Pro tip: Book weekly for better rates!", "Prices start from just ₹40/hour! ⚡\n\nOptions:\n1. Hourly (flexible): ₹40-80/hr\n2. Full day (8 hours): ₹250-450\n3. Weekly pass: Save 20%\n4. Monthly unlimited: Save 40%\n\nStudent discounts available! 🎓"],
      HOURS: ["Most libraries have flexible timings! ⏰\n\nTypical hours:\n• Weekdays: 6 AM - 11 PM\n• Weekends: 7 AM - 10 PM\n\nSome 24x7 options available!\n\nWant to check specific library timings?", "Our partner libraries operate:\n\n🌅 Early birds: Open from 5-6 AM\n🌙 Night owls: Close at 11 PM - 12 AM\n⚡ 24x7: Available in major cities\n\nWhich library are you interested in?", "Flexible timing to match your schedule! 📅\n\n- Central Study Hub: 6 AM - 11 PM\n- Knowledge Point: 7 AM - 10 PM\n- Elite Study Lounge: 8 AM - 11 PM\n- Student Success Library: 5 AM - 11 PM\n\nWhich one suits you?"],
      AMENITIES: ["All our libraries come with great facilities! ✨\n\nStandard amenities:\n✅ High-speed WiFi\n✅ Air conditioning\n✅ Power outlets\n✅ Clean washrooms\n✅ Security/CCTV\n\nPremium features:\n☕ Coffee/snacks\n🅿️ Parking\n🔇 Silent zones\n🤝 Group rooms\n📚 Study materials\n\nAny specific needs?", "We've got everything you need to study! 🎯\n\nMost popular:\n• Fast WiFi (100+ Mbps)\n• Comfortable seating\n• AC & good lighting\n• Lockers\n• Water/coffee\n\nLooking for something specific?", "Amenities by category: 🏢\n\n🌐 Tech: WiFi, charging ports, printers\n☕ Comfort: AC, ergonomic chairs, refreshments\n🔒 Security: CCTV, lockers, 24x7 staff\n🤝 Collaboration: Group rooms, whiteboards\n\nWhich matters most to you?"],
      LOCATION: ["We're in 5 major cities across India! 🗺️\n\n📍 Available locations:\n• Bangalore (Karnataka)\n• Mumbai (Maharashtra)\n• Delhi (NCR)\n• Gurgaon (Haryana)\n• Kolkata (West Bengal)\n\nWhich city interests you?", "Find us in prime locations! 🌆\n\nPopular areas:\n- Bangalore: MG Road, Koramangala\n- Mumbai: Bandra, Andheri\n- Delhi: Connaught Place, Karol Bagh\n- Gurgaon: Cyber City, DLF\n- Kolkata: Park Street, Salt Lake\n\nWant specific addresses?", "All our libraries are:\n✅ Near metro stations\n✅ In safe neighborhoods\n✅ Easy to reach\n✅ Well-connected\n\nTell me your area, I'll find the nearest one!"],
      HELP: ["I'm here to help! 🤝\n\nI can assist with:\n• Finding & booking libraries\n• Checking availability\n• Pricing information\n• Cancellations & refunds\n• Account issues\n• General questions\n\nWhat do you need help with?", "No problem, let's solve this! 💡\n\nCommon issues:\n1. Can't login? Try reset password\n2. Booking failed? Check payment details\n3. Want to cancel? Go to My Bookings\n4. Technical issue? Contact support@studyspot.com\n\nWhich one applies to you?", "Support options: 📞\n\n💬 Chat: Right here with me!\n📧 Email: support@studyspot.com\n📱 Phone: +91-98765-43210\n⏰ Hours: 9 AM - 9 PM (Mon-Sat)\n\nHow can I help you today?"],
      GAMIFICATION: ["Love the enthusiasm! 🎮\n\nYour gamification features:\n🏆 Points: Earn on every booking\n🎖️ Badges: 30+ achievements\n📊 Levels: 10 progression tiers\n🎁 Rewards: Redeem for discounts\n🔥 Streaks: Daily study bonuses\n📈 Leaderboard: Compete with friends\n\nCurrent stats: Check your dashboard!", "Gamification explained: 🌟\n\nEarn points by:\n• Completing bookings: 20 pts\n• Writing reviews: 15 pts\n• Referring friends: 100 pts\n• Daily streaks: 5 pts/day\n\nRedeem for:\n- 10% discount: 100 pts\n- Free coffee: 50 pts\n- Free hour: 150 pts\n- Priority booking: 200 pts\n\nStart earning now!", "Your gamification journey: 🚀\n\nLevel up from:\nBeginner 🌱 → Student 📖 → Scholar 📚 → Expert 🎓 → Master 👨‍🎓 → Legend 🏆\n\nUnlock badges:\n- First Step, Week Warrior, Night Owl, Study Champion & more!\n\nCheck your progress in the app!"],
      CANCELLATION: ["No worries! Cancellation policy: 🔄\n\n✅ Free cancellation:\n- Up to 24 hours before: 100% refund\n- 12-24 hours: 50% refund\n- Less than 12 hours: No refund\n\nTo cancel:\n1. Go to 'My Bookings'\n2. Select booking\n3. Click 'Cancel Booking'\n4. Confirm cancellation\n\nRefund in 3-5 days!", "Let's help you with that! 🔧\n\nCancellation options:\n• Full refund if 24+ hours notice\n• Reschedule for free (one time)\n• Convert to credit for future use\n\nWant to:\n1. Cancel completely?\n2. Change date/time?\n3. Get credit instead?\n\nLet me know!", "Easy cancellation process: ✨\n\nSteps:\n1. Login to your account\n2. Navigate to 'My Bookings'\n3. Find your reservation\n4. Click 'Cancel & Refund'\n\nProcessing:\n- Approved instantly\n- Refund in 3-5 business days\n- Email confirmation sent\n\nNeed help with the process?"],
      GOODBYE: ["Happy studying! 📚 Feel free to reach out anytime you need help. Good luck with your studies! 🎓", "You're welcome! 😊 Have a productive study session. See you soon at StudySpot! ✨", "Goodbye! 👋 Remember, I'm here 24/7 if you need anything. Keep up the great work! 🌟"],
      DEFAULT: ["I understand you're asking about that! 🤔\n\nI can help you with:\n• Finding libraries\n• Making bookings\n• Pricing & plans\n• Amenities & facilities\n• Account support\n\nCould you please rephrase your question?", "Hmm, I'm not quite sure about that. 💭\n\nI'm best at helping with:\n- Library recommendations\n- Booking assistance\n- General information\n\nTry asking: 'Show me libraries in [city]' or 'What are your prices?'", "I want to help! 🤝 But I didn't quite understand.\n\nPopular questions:\n❓ 'Recommend a library in Bangalore'\n❓ 'What are your timings?'\n❓ 'How much does it cost?'\n❓ 'How do I cancel a booking?'\n\nWhat would you like to know?"]
    };
  }

  /**
   * Process user message and generate response
   */
  processMessage(message, context = {}) {
    const intent = this.detectIntent(message);
    const response = this.generateResponse(intent, message, context);
    return {
      message: response,
      intent,
      timestamp: new Date().toISOString(),
      suggestions: this.getSuggestions(intent),
      quickReplies: this.getQuickReplies(intent)
    };
  }

  /**
   * Detect user intent from message
   */
  detectIntent(message) {
    const msg = message.trim();
    for (const [intent, pattern] of Object.entries(this.intents)) {
      if (pattern.test(msg)) {
        return intent;
      }
    }
    return 'DEFAULT';
  }

  /**
   * Generate response based on intent
   */
  generateResponse(intent, message, context) {
    const responses = this.responses[intent] || this.responses.DEFAULT;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    // Personalize response if user context available
    if (context.userName) {
      return `Hi ${context.userName}! ${randomResponse}`;
    }
    return randomResponse;
  }

  /**
   * Get contextual suggestions
   */
  getSuggestions(intent) {
    const suggestions = {
      GREETING: ['Find libraries', 'Show pricing', 'Help me book'],
      BOOKING: ['Bangalore libraries', 'Today\'s availability', 'Best rated'],
      RECOMMENDATION: ['Budget friendly', 'Near me', 'Premium options'],
      PRICING: ['Compare plans', 'Student discount', 'Weekly rates'],
      HOURS: ['24x7 libraries', 'Weekend timing', 'Early morning slots'],
      AMENITIES: ['WiFi speed', 'Parking available', 'Coffee included'],
      LOCATION: ['Nearest library', 'All locations', 'Map view'],
      HELP: ['FAQ', 'Contact support', 'Chat with agent'],
      GAMIFICATION: ['My points', 'Available rewards', 'Leaderboard'],
      CANCELLATION: ['Cancel policy', 'Refund status', 'Reschedule'],
      DEFAULT: ['Popular libraries', 'How it works', 'Contact us']
    };
    return suggestions[intent] || suggestions.DEFAULT;
  }

  /**
   * Get quick reply options
   */
  getQuickReplies(intent) {
    const quickReplies = {
      GREETING: ['🔍 Find Libraries', '💰 View Pricing', '❓ Help'],
      BOOKING: ['📍 Choose City', '📅 Select Date', '⭐ Top Rated'],
      RECOMMENDATION: ['🏆 Premium', '💵 Budget', '🔥 Trending'],
      PRICING: ['💳 All Plans', '🎓 Student Offer', '📞 Contact'],
      DEFAULT: ['🏠 Home', '📚 Libraries', '👤 My Account']
    };
    return quickReplies[intent] || quickReplies.DEFAULT;
  }

  /**
   * Get FAQ responses
   */
  getFAQ(question) {
    const faqs = {
      'how_to_book': 'To book: 1) Browse libraries 2) Select date & time 3) Choose seat 4) Complete payment. It takes less than 2 minutes!',
      'payment_methods': 'We accept: Credit/Debit cards, UPI, Net Banking, Wallets (Paytm, PhonePe, Google Pay), and EMI options.',
      'cancellation_policy': 'Free cancellation 24+ hours before booking. 50% refund if 12-24 hours. No refund if less than 12 hours.',
      'refund_time': 'Refunds are processed within 3-5 business days to your original payment method.',
      'student_discount': 'Yes! Students get 15% off on monthly plans. Verify with your college email ID.',
      'group_booking': 'Group bookings (5+ people) get 20% discount. Contact us for custom arrangements.',
      'wifi_speed': 'All libraries have high-speed WiFi (100+ Mbps). Perfect for video calls and downloads!',
      'first_time_user': 'Welcome! Get ₹100 off on your first booking. Use code: FIRST100 at checkout.'
    };
    return faqs[question] || 'I don\'t have information on that. Please contact support@studyspot.com';
  }

  /**
   * Get conversation history summary
   */
  getConversationSummary(messages) {
    if (!messages || messages.length === 0) {
      return 'No conversation history';
    }
    const intents = messages.map(m => this.detectIntent(m.text));
    const uniqueIntents = [...new Set(intents)];
    return {
      messageCount: messages.length,
      topics: uniqueIntents,
      duration: messages.length > 1 ? new Date(messages[messages.length - 1].timestamp) - new Date(messages[0].timestamp) : 0
    };
  }
}
module.exports = new ChatbotService();