/**
 * ChatbotScreen
 * AI Assistant chat interface
 */

import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {RootState, AppDispatch} from '@store/index';
import {
  sendChatMessage,
  startNewConversation,
  clearConversation,
} from '@store/slices/chatbotSlice';
import {COLORS, LAYOUT, TYPOGRAPHY} from '@constants/index';
import {ChatMessage} from '@services/ChatbotService';

const ChatbotScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState('');

  const {messages, isTyping, loading, error, currentConversationId} = useSelector(
    (state: RootState) => state.chatbot,
  );

  useEffect(() => {
    // Start new conversation if none exists
    if (!currentConversationId) {
      dispatch(startNewConversation());
    }
  }, [currentConversationId, dispatch]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || loading) {return;}

    const message = inputText.trim();
    setInputText('');

    try {
      await dispatch(sendChatMessage({message})).unwrap();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleQuickReply = (text: string) => {
    setInputText(text);
  };

  const renderMessage = ({item}: {item: ChatMessage}) => {
    const isUser = item.sender === 'user';

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.botMessageContainer,
        ]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <Icon name="smart-toy" size={20} color={COLORS.WHITE} />
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.botBubble,
          ]}>
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.botText,
            ]}>
            {item.text}
          </Text>
          <Text style={styles.messageTime}>
            {new Date(item.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {isUser && (
          <View style={styles.userAvatar}>
            <Icon name="person" size={20} color={COLORS.WHITE} />
          </View>
        )}
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) {return null;}

    return (
      <View style={[styles.messageContainer, styles.botMessageContainer]}>
        <View style={styles.botAvatar}>
          <Icon name="smart-toy" size={20} color={COLORS.WHITE} />
        </View>
        <View style={[styles.messageBubble, styles.botBubble]}>
          <View style={styles.typingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      </View>
    );
  };

  const renderQuickReplies = () => {
    const quickReplies = [
      '🔍 Find libraries',
      '💰 View pricing',
      '📅 Book now',
      '❓ Help',
    ];

    return (
      <View style={styles.quickRepliesContainer}>
        <Text style={styles.quickRepliesTitle}>Quick Actions:</Text>
        <View style={styles.quickRepliesRow}>
          {quickReplies.map((reply, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickReplyChip}
              onPress={() => handleQuickReply(reply)}>
              <Text style={styles.quickReplyText}>{reply}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.headerAvatarContainer}>
          <Icon name="smart-toy" size={24} color={COLORS.WHITE} />
          <View style={styles.onlineIndicator} />
        </View>
        <View>
          <Text style={styles.headerTitle}>StudySpot Assistant</Text>
          <Text style={styles.headerSubtitle}>
            {isTyping ? 'Typing...' : 'Online'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.clearButton}
        onPress={() => dispatch(clearConversation())}>
        <Icon name="refresh" size={24} color={COLORS.TEXT.PRIMARY} />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="chat-bubble-outline" size={80} color={COLORS.GRAY[300]} />
      <Text style={styles.emptyTitle}>Welcome to StudySpot Assistant!</Text>
      <Text style={styles.emptyText}>
        I'm here to help you find the perfect study space. Ask me anything!
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      {renderHeader()}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderTypingIndicator}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        showsVerticalScrollIndicator={false}
      />

      {messages.length === 1 && renderQuickReplies()}

      {error && (
        <View style={styles.errorBanner}>
          <Icon name="error-outline" size={16} color={COLORS.ERROR} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor={COLORS.TEXT.PLACEHOLDER}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
          multiline
          maxLength={500}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || loading) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || loading}>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.WHITE} />
          ) : (
            <Icon name="send" size={24} color={COLORS.WHITE} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND.SECONDARY,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.PADDING.MD,
    paddingVertical: LAYOUT.PADDING.MD,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER.PRIMARY,
    elevation: 2,
    shadowColor: COLORS.SHADOW.LIGHT,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LAYOUT.MARGIN.MD,
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.SUCCESS,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.TEXT.PRIMARY,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.SUCCESS,
    marginTop: 2,
  },
  clearButton: {
    padding: LAYOUT.PADDING.SM,
  },
  messagesList: {
    padding: LAYOUT.PADDING.MD,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: LAYOUT.MARGIN.MD,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LAYOUT.MARGIN.SM,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: LAYOUT.MARGIN.SM,
  },
  messageBubble: {
    maxWidth: '70%',
    paddingHorizontal: LAYOUT.PADDING.MD,
    paddingVertical: LAYOUT.PADDING.SM,
    borderRadius: LAYOUT.BORDER_RADIUS.LG,
  },
  userBubble: {
    backgroundColor: COLORS.PRIMARY,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: COLORS.WHITE,
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: COLORS.SHADOW.LIGHT,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    lineHeight: 22,
  },
  userText: {
    color: COLORS.WHITE,
  },
  botText: {
    color: COLORS.TEXT.PRIMARY,
  },
  messageTime: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XS,
    color: COLORS.TEXT.TERTIARY,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.GRAY[400],
    marginHorizontal: 2,
  },
  dot1: {},
  dot2: {},
  dot3: {},
  quickRepliesContainer: {
    paddingHorizontal: LAYOUT.PADDING.MD,
    paddingVertical: LAYOUT.PADDING.SM,
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER.PRIMARY,
  },
  quickRepliesTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT.SECONDARY,
    marginBottom: 8,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM as any,
  },
  quickRepliesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickReplyChip: {
    backgroundColor: COLORS.PRIMARY_LIGHT + '20',
    paddingHorizontal: LAYOUT.PADDING.MD,
    paddingVertical: LAYOUT.PADDING.SM,
    borderRadius: LAYOUT.BORDER_RADIUS.MD,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY_LIGHT,
  },
  quickReplyText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM as any,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: LAYOUT.PADDING.MD,
    paddingVertical: LAYOUT.PADDING.SM,
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER.PRIMARY,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND.SECONDARY,
    borderRadius: LAYOUT.BORDER_RADIUS.LG,
    paddingHorizontal: LAYOUT.PADDING.MD,
    paddingVertical: LAYOUT.PADDING.SM,
    paddingTop: LAYOUT.PADDING.SM,
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    color: COLORS.TEXT.PRIMARY,
    maxHeight: 100,
    marginRight: LAYOUT.MARGIN.SM,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.GRAY[300],
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.PADDING.MD,
    paddingVertical: LAYOUT.PADDING.SM,
    backgroundColor: COLORS.ERROR + '10',
    borderTopWidth: 1,
    borderTopColor: COLORS.ERROR + '30',
  },
  errorText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.ERROR,
    marginLeft: 8,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.PADDING.XL,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.TEXT.PRIMARY,
    marginTop: LAYOUT.MARGIN.LG,
    marginBottom: LAYOUT.MARGIN.SM,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    color: COLORS.TEXT.SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default ChatbotScreen;


