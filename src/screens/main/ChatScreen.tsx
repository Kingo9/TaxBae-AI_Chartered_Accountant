import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  commonStyles,
} from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';
import { ChatMessage } from '../../types';
import { apiService } from '../../services/api';
import { generateChatResponse, CONVERSATION_STARTERS } from '../../sampleModels/chatbotSample';

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

export const ChatScreen: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Initialize chat session on component mount
  useEffect(() => {
    initializeChatSession();
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const initializeChatSession = async () => {
    try {
      setIsInitializing(true);
      
      // Get recent chat sessions
      const sessionsResponse = await apiService.getChatSessions(1);
      const sessions = sessionsResponse.data || [];
      
      if (sessions.length > 0) {
        // Load most recent session
        const recentSession = sessions[0];
        setCurrentSession(recentSession);
        
        // Load messages from the session
        const messagesResponse = await apiService.getChatMessages(recentSession.id);
        const chatMessages = (messagesResponse.data || []).map((msg: any) => ({
          id: msg.id,
          message: msg.content,
          sender: msg.role.toLowerCase() === 'user' ? 'user' : 'ai',
          timestamp: new Date(msg.timestamp),
        }));
        
        setMessages(chatMessages);
      } else {
        // Create new session with welcome message
        const welcomeMessage = `Hi ${user?.name || 'there'}! 👋\n\nI'm your AI Tax Assistant powered by advanced AI and your personal financial data. I can provide personalized advice on:\n\n• Tax planning & deductions (80C, 80D, HRA, etc.)\n• Investment strategies based on your spending patterns\n• Expense optimization suggestions\n• Insurance and retirement planning\n• Real-time tax-saving opportunities\n\nWhat would you like to know about your finances?`;
        
        const sessionResponse = await apiService.createChatSession(welcomeMessage);
        const newSession = sessionResponse.data;
        setCurrentSession(newSession);
        
        // Load messages from new session
        const messagesResponse = await apiService.getChatMessages(newSession.id);
        const chatMessages = (messagesResponse.data || []).map((msg: any) => ({
          id: msg.id,
          message: msg.content,
          sender: msg.role.toLowerCase() === 'user' ? 'user' : 'ai',
          timestamp: new Date(msg.timestamp),
        }));
        
        setMessages(chatMessages);
      }
    } catch (error) {
      console.error('Failed to initialize chat session:', error);
      // Fallback to local sample chatbot
      const welcomeResponse = generateChatResponse('Hello');
      setMessages([{
        id: '1',
        message: welcomeResponse.text,
        sender: 'ai',
        timestamp: new Date(),
      }]);
      
      // Set a mock session for local mode
      setCurrentSession({
        id: 'local-session',
        title: 'Local Chat Session',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 1
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    // Add user message immediately for better UX
    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      let response;
      
      if (currentSession) {
        // Send message to existing session
        response = await apiService.sendChatMessage(currentSession.id, currentMessage);
      } else {
        // Create new session with this message
        response = await apiService.createChatSession(currentMessage);
        const newSession = response.data;
        setCurrentSession(newSession);
        
        // Get the messages (including AI response)
        const messagesResponse = await apiService.getChatMessages(newSession.id);
        const chatMessages = (messagesResponse.data || []).map((msg: any) => ({
          id: msg.id,
          message: msg.content,
          sender: msg.role.toLowerCase() === 'user' ? 'user' : 'ai',
          timestamp: new Date(msg.timestamp),
        }));
        
        setMessages(chatMessages);
        return;
      }
      
      // Add AI response
      if (response.data && response.data.assistantMessage) {
        const aiMessage: ChatMessage = {
          id: `ai_${Date.now()}`,
          message: response.data.assistantMessage.content,
          sender: 'ai',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      
      // Fallback to local chatbot sample instead of removing the message
      try {
        // Generate local response using sample chatbot
        const localResponse = generateChatResponse(currentMessage, {
          userName: user?.name,
          userType: user?.userType
        });
        
        const aiMessage: ChatMessage = {
          id: `ai_${Date.now()}`,
          message: localResponse.text,
          sender: 'ai',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, aiMessage]);
      } catch (localError) {
        console.error('Local chatbot also failed:', localError);
        // Remove the user message only if local fallback also fails
        setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
        
        Alert.alert(
          'Error',
          'Unable to process your message. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = async (question: string) => {
    try {
      setIsLoading(true);
      
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        message: question,
        sender: 'user',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Use quick ask endpoint for faster responses
      const response = await apiService.askQuickQuestion(question);
      
      if (response.data && response.data.answer) {
        const aiMessage: ChatMessage = {
          id: `ai_${Date.now()}`,
          message: response.data.answer,
          sender: 'ai',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error: any) {
      console.error('Failed to ask quick question:', error);
      
      // Fallback to local chatbot sample
      try {
        const localResponse = generateChatResponse(question, {
          userName: user?.name,
          userType: user?.userType
        });
        
        const aiMessage: ChatMessage = {
          id: `ai_${Date.now()}`,
          message: localResponse.text,
          sender: 'ai',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, aiMessage]);
      } catch (localError) {
        console.error('Local chatbot failed for quick question:', localError);
        Alert.alert('Error', 'Unable to process your question. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      setIsLoading(true);
      
      // Create a new session
      const welcomeMessage = `Hi again! 😊\n\nI'm ready for a fresh conversation. What would you like to discuss about your finances today?`;
      const sessionResponse = await apiService.createChatSession(welcomeMessage);
      const newSession = sessionResponse.data;
      
      setCurrentSession(newSession);
      
      // Load messages from new session
      const messagesResponse = await apiService.getChatMessages(newSession.id);
      const chatMessages = (messagesResponse.data || []).map((msg: any) => ({
        id: msg.id,
        message: msg.content,
        sender: msg.role.toLowerCase() === 'user' ? 'user' : 'ai',
        timestamp: new Date(msg.timestamp),
      }));
      
      setMessages(chatMessages);
    } catch (error: any) {
      console.error('Failed to create new session:', error);
      Alert.alert('Error', 'Failed to create new chat session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === 'user';
    
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.aiMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isUser ? styles.userMessageBubble : styles.aiMessageBubble
        ]}>
          {!isUser && (
            <View style={styles.aiIcon}>
              <Ionicons name="sparkles" size={16} color={colors.primary} />
            </View>
          )}
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.aiMessageText
          ]}>
            {item.message}
          </Text>
          <Text style={[
            styles.messageTime,
            isUser ? styles.userMessageTime : styles.aiMessageTime
          ]}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isLoading) return null;
    
    return (
      <View style={[styles.messageContainer, styles.aiMessageContainer]}>
        <View style={[styles.messageBubble, styles.aiMessageBubble]}>
          <View style={styles.aiIcon}>
            <Ionicons name="sparkles" size={16} color={colors.primary} />
          </View>
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>AI is thinking</Text>
            <View style={styles.typingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Use conversation starters from sample data, fallback to hardcoded ones
  const quickSuggestions = CONVERSATION_STARTERS.length > 0 
    ? CONVERSATION_STARTERS.slice(0, 5).map(starter => starter.text)
    : [
        'How can I save tax this year?',
        'Tell me about Section 80C deductions',
        'Should I choose old or new tax regime?',
        'Best investment options for tax saving',
        'When should I file my ITR?',
      ];

  const renderQuickSuggestion = (suggestion: string, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.suggestionButton}
      onPress={() => {
        setInputText(suggestion);
        // Auto-send the suggestion
        setTimeout(() => {
          sendMessage();
        }, 100);
      }}
    >
      <Text style={styles.suggestionText}>{suggestion}</Text>
    </TouchableOpacity>
  );

  if (isInitializing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="sparkles" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.headerTitle}>AI Tax Assistant</Text>
              <Text style={styles.headerSubtitle}>Your personal finance advisor</Text>
            </View>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Initializing your AI assistant...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Ionicons name="sparkles" size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Tax Assistant</Text>
            <Text style={styles.headerSubtitle}>
              {currentSession ? 'Connected • RAG Powered' : 'Your personal finance advisor'}
            </Text>
          </View>
        </View>
        {currentSession && (
          <TouchableOpacity
            style={styles.newSessionButton}
            onPress={createNewSession}
            disabled={isLoading}
          >
            <Ionicons name="add" size={18} color={colors.primary} />
            <Text style={styles.newSessionText}>New</Text>
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderTypingIndicator}
        />

        {/* Quick Suggestions */}
        {messages.length <= 1 && !isLoading && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Quick questions:</Text>
            <View style={styles.suggestionsList}>
              {quickSuggestions.map((suggestion, index) => 
                renderQuickSuggestion(suggestion, index)
              )}
            </View>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me about taxes, investments, or financial planning..."
              placeholderTextColor={colors.textLight}
              multiline
              maxLength={500}
              editable={!isLoading && !isInitializing}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading || isInitializing) && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading || isInitializing}
            >
              <Ionicons 
                name={isLoading ? "hourglass" : "send"} 
                size={20} 
                color={(!inputText.trim() || isLoading || isInitializing) ? colors.textLight : colors.textWhite} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  messageContainer: {
    marginBottom: spacing.md,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  userMessageBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: borderRadius.sm,
  },
  aiMessageBubble: {
    backgroundColor: colors.backgroundLight,
    borderBottomLeftRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aiIcon: {
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  messageText: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  userMessageText: {
    color: colors.textWhite,
  },
  aiMessageText: {
    color: colors.textPrimary,
  },
  messageTime: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
  userMessageTime: {
    color: colors.textWhite,
    opacity: 0.7,
    textAlign: 'right',
  },
  aiMessageTime: {
    color: colors.textLight,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  typingDots: {
    flexDirection: 'row',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textLight,
    marginHorizontal: 2,
    opacity: 0.4,
  },
  dot1: {
    // Add animation later
  },
  dot2: {
    // Add animation later
  },
  dot3: {
    // Add animation later
  },
  suggestionsContainer: {
    padding: spacing.md,
    paddingTop: 0,
  },
  suggestionsTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  suggestionsList: {
    gap: spacing.sm,
  },
  suggestionButton: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
  },
  suggestionText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  inputContainer: {
    padding: spacing.md,
    backgroundColor: colors.backgroundLight,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    maxHeight: 100,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: colors.textLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  newSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  newSessionText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.xs,
  },
});

export default ChatScreen;
