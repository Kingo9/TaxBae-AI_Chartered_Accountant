import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export class SocketService {
  private static instance: SocketService;
  private io: SocketServer;
  private userSocketMap = new Map<string, string>(); // userId -> socketId

  constructor(io: SocketServer) {
    this.io = io;
  }

  static getInstance(io?: SocketServer): SocketService {
    if (!SocketService.instance && io) {
      SocketService.instance = new SocketService(io);
    } else if (!SocketService.instance) {
      throw new Error('SocketService must be initialized with io instance first');
    }
    return SocketService.instance;
  }

  initialize() {
    this.io.use(this.authenticateSocket.bind(this));
    this.io.on('connection', this.handleConnection.bind(this));
  }

  private async authenticateSocket(socket: any, next: any) {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      if (!process.env.JWT_SECRET) {
        return next(new Error('JWT_SECRET not configured'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        userId: string;
        email: string;
      };

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true },
      });

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user.id;
      socket.userEmail = user.email;
      socket.userName = user.name;
      
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  }

  private handleConnection(socket: any) {
    console.log(`User connected: ${socket.userName} (${socket.userId})`);
    
    // Store user socket mapping
    this.userSocketMap.set(socket.userId, socket.id);
    
    // Join user to personal room
    socket.join(`user:${socket.userId}`);

    // Handle chat events
    socket.on('join_chat', (sessionId: string) => {
      socket.join(`chat:${sessionId}`);
    });

    socket.on('leave_chat', (sessionId: string) => {
      socket.leave(`chat:${sessionId}`);
    });

    socket.on('typing', (data: { sessionId: string; isTyping: boolean }) => {
      socket.to(`chat:${data.sessionId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.userName,
        isTyping: data.isTyping,
      });
    });

    // Handle notification acknowledgment
    socket.on('notification_read', async (notificationIds: string[]) => {
      try {
        await prisma.notification.updateMany({
          where: {
            id: { in: notificationIds },
            userId: socket.userId,
          },
          data: { isRead: true },
        });
        
        socket.emit('notifications_marked_read', { count: notificationIds.length });
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    });

    // Handle market data subscription
    socket.on('subscribe_market_data', () => {
      socket.join('market_data');
    });

    socket.on('unsubscribe_market_data', () => {
      socket.leave('market_data');
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userName} (${socket.userId})`);
      this.userSocketMap.delete(socket.userId);
    });
  }

  // Send notification to specific user
  async sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.userSocketMap.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('new_notification', notification);
    }
    
    // Also emit to user room
    this.io.to(`user:${userId}`).emit('new_notification', notification);
  }

  // Send market update to all subscribed users
  sendMarketUpdate(data: any) {
    this.io.to('market_data').emit('market_update', data);
  }

  // Send chat message
  sendChatMessage(sessionId: string, message: any) {
    this.io.to(`chat:${sessionId}`).emit('new_message', message);
  }

  // Broadcast system announcement
  broadcastAnnouncement(announcement: any) {
    this.io.emit('system_announcement', announcement);
  }

  // Send investment reminder
  async sendInvestmentReminder(userId: string, reminder: any) {
    this.sendNotificationToUser(userId, {
      type: 'investment_reminder',
      title: 'Investment Reminder',
      body: reminder.message,
      data: reminder,
    });
  }

  // Send tax deadline notification
  async sendTaxDeadlineNotification(userId: string, deadline: any) {
    this.sendNotificationToUser(userId, {
      type: 'tax_deadline',
      title: 'Tax Filing Deadline Approaching',
      body: `Don't forget: ${deadline.description} is due on ${deadline.date}`,
      data: deadline,
    });
  }

  // Get online users count
  getOnlineUsersCount(): number {
    return this.userSocketMap.size;
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.userSocketMap.has(userId);
  }
}
