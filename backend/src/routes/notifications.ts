import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { NotificationService } from '../services/notificationService';
import { SocketService } from '../services/socket.service';

const router = Router();

// Function to get services lazily
const getServices = () => {
  const socketService = SocketService.getInstance();
  const notificationService = new NotificationService(socketService);
  return { socketService, notificationService };
};

// Apply auth middleware to all routes
router.use(authenticate);

// Get user notifications
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { notificationService } = getServices();
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }
    const { page, limit, unreadOnly } = req.query;
    
    const result = await notificationService.getUserNotifications(userId, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      unreadOnly: unreadOnly === 'true',
    });
    
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get notification statistics
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const { notificationService } = getServices();
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }
    const stats = await notificationService.getNotificationStats(userId);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark notification as read
router.patch('/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    const { notificationService } = getServices();
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }
    const { id } = req.params;
    
    await notificationService.markAsRead(id, userId);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark all notifications as read
router.patch('/read-all', async (req: AuthRequest, res: Response) => {
  try {
    const { notificationService } = getServices();
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }
    await notificationService.markAllAsRead(userId);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete notification
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { notificationService } = getServices();
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }
    const { id } = req.params;
    
    await notificationService.deleteNotification(id, userId);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create notification (admin only - for testing)
router.post('/test', async (req: AuthRequest, res: Response) => {
  try {
    const { notificationService } = getServices();
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }
    const { title, message, type = 'SYSTEM', priority = 'MEDIUM' } = req.body;
    
    const notification = await notificationService.createNotification({
      userId,
      title,
      message,
      type,
      priority,
    });
    
    res.json({ success: true, data: notification });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export { router as notificationRoutes };
