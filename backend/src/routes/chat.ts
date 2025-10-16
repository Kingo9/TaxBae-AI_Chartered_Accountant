import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
// import { AIChatbotService } from '../services/aiChatbotService';
// import { GeminiChatbotService } from '../services/geminiChatbotService';
import { FallbackChatbotService } from '../services/fallbackChatbotService';

const router = Router();
const chatbotService = new FallbackChatbotService();

// Apply auth middleware to all routes
router.use(authenticate);

// Get user's chat sessions
router.get('/sessions', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { limit } = req.query;
    
    const sessions = await chatbotService.getChatSessions(
      userId, 
      limit ? parseInt(limit as string) : undefined
    );
    
    res.json({ success: true, data: sessions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new chat session
router.post('/sessions', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { initialMessage } = req.body;
    
    const session = await chatbotService.createChatSession(userId, initialMessage);
    res.json({ success: true, data: session });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get messages from a specific session
router.get('/sessions/:sessionId/messages', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { sessionId } = req.params;
    
    const messages = await chatbotService.getChatMessages(sessionId, userId);
    res.json({ success: true, data: messages });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
});

// Send message in a session
router.post('/sessions/:sessionId/messages', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { sessionId } = req.params;
    const { message } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'Message content is required' 
      });
    }
    
    const result = await chatbotService.sendMessage(sessionId, userId, message.trim());
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete chat session
router.delete('/sessions/:sessionId', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { sessionId } = req.params;
    
    await chatbotService.deleteChatSession(sessionId, userId);
    res.json({ success: true, message: 'Chat session deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get quick tax tips
router.get('/tips', async (req: AuthRequest, res: Response) => {
  try {
    const tips = await chatbotService.getQuickTips();
    res.json({ success: true, data: tips });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Quick ask endpoint (for simple queries without session)
router.post('/ask', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { question } = req.body;
    
    if (!question || question.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'Question is required' 
      });
    }
    
    const response = await chatbotService.generateResponse(userId, question.trim());
    res.json({ 
      success: true, 
      data: { 
        question: question.trim(), 
        answer: response 
      } 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export { router as chatRoutes };
