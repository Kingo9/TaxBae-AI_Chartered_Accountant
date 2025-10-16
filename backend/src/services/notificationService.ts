import { PrismaClient } from '@prisma/client';
import { SocketService } from './socket.service';

const prisma = new PrismaClient();

import type { NotificationType } from '@prisma/client';

interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  actionUrl?: string;
  metadata?: any;
}

export class NotificationService {
  private socketService: SocketService;

  constructor(socketService: SocketService) {
    this.socketService = socketService;
  }

  // Create and send notification
  async createNotification(data: NotificationData): Promise<any> {
    try {
      // Save to database
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          body: data.message, // 'body' is required and maps to the notification message
          type: data.type,
          // priority: data.priority, // Removed because 'priority' is not a valid field in the Notification model
          // actionUrl: data.actionUrl, // Removed because 'actionUrl' is not a valid field in the Notification model
          isRead: false,
        },
      });

      // Send real-time notification via WebSocket
      this.socketService.sendNotificationToUser(data.userId, {
        id: notification.id,
        title: notification.title,
        // message: notification.message, // Removed because 'message' is not a valid field in the Notification model
        type: notification.type,
        // priority: notification.priority, // Removed because 'priority' is not a valid field in the Notification model
        timestamp: notification.createdAt,
      });

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get notifications for user
  async getUserNotifications(userId: string, options: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  } = {}): Promise<any> {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = options;
      const skip = (page - 1) * limit;

      const notifications = await prisma.notification.findMany({
        where: {
          userId,
          ...(unreadOnly && { isRead: false }),
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      const totalCount = await prisma.notification.count({
        where: {
          userId,
          ...(unreadOnly && { isRead: false }),
        },
      });

      return {
        notifications,
        totalCount,
        page,
        hasMore: skip + notifications.length < totalCount,
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId, // Ensure user can only update their own notifications
        },
        data: { isRead: true },
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for user
  async markAllAsRead(userId: string): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      await prisma.notification.deleteMany({
        where: {
          id: notificationId,
          userId, // Ensure user can only delete their own notifications
        },
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Schedule tax deadline reminders
  async scheduleTaxDeadlineReminders(): Promise<void> {
    try {
      const currentYear = new Date().getFullYear();
      const taxDeadlines = [
        {
          date: new Date(currentYear + 1, 5, 31), // June 31 (ITR filing deadline)
          title: 'ITR Filing Deadline',
          message: 'Don\'t forget to file your Income Tax Return by June 31st',
          type: 'TAX_DEADLINE' as const,
        },
        {
          date: new Date(currentYear + 1, 2, 31), // March 31 (Financial Year End)
          title: 'Financial Year Ending',
          message: 'FY ends on March 31st. Plan your tax-saving investments',
          type: 'TAX_DEADLINE' as const,
        },
        {
          date: new Date(currentYear, 11, 31), // December 31 (ELSS, PPF deadline)
          title: 'Tax Saving Investments',
          message: 'Last chance to invest in ELSS, PPF for Section 80C benefits',
          type: 'INVESTMENT_OPPORTUNITY' as const,
        },
      ];

      // Get all users
      const users = await prisma.user.findMany({
        select: { id: true },
      });

      // Create notifications for all users
      const notifications = [];
      for (const deadline of taxDeadlines) {
        for (const user of users) {
          // Only create if deadline is in future
          if (deadline.date > new Date()) {
            notifications.push({
              userId: user.id,
              title: deadline.title,
              body: deadline.message, // 'body' is required by the Notification model
              type: deadline.type as NotificationType,
              // priority: 'HIGH' as const, // Removed because 'priority' is not a valid field in the Notification model
              scheduledFor: deadline.date,
            });
          }
        }
      }

      if (notifications.length > 0) {
        await prisma.notification.createMany({
          data: notifications,
          skipDuplicates: true,
        });
      }
    } catch (error) {
      console.error('Error scheduling tax deadline reminders:', error);
      throw error;
    }
  }

  // Send investment opportunity notifications
  async sendInvestmentOpportunities(userId: string, opportunities: any[]): Promise<void> {
    try {
      for (const opportunity of opportunities) {
        await this.createNotification({
          userId,
          title: `Investment Opportunity: ${opportunity.name}`,
          message: `${opportunity.description} - Expected return: ${opportunity.expectedReturn}%`,
          type: 'INVESTMENT_OPPORTUNITY' as NotificationType,
          // priority: 'MEDIUM', // Removed because 'priority' is not a valid field in the Notification model
          metadata: opportunity,
          priority: 'LOW'
        });
      }
    } catch (error) {
      console.error('Error sending investment opportunities:', error);
      throw error;
    }
  }

  // Send government update notifications
  async sendGovernmentUpdate(title: string, message: string, actionUrl?: string): Promise<void> {
    try {
      // Get all users
      const users = await prisma.user.findMany({
        select: { id: true },
      });

      // Send to all users
      for (const user of users) {
        await this.createNotification({
          userId: user.id,
          title,
          message,
          type: 'GOVERNMENT_UPDATE' as NotificationType,
          // priority: 'HIGH', // Removed because 'priority' is not a valid field in the Notification model
          actionUrl,
          priority: 'LOW'
        });
      }
    } catch (error) {
      console.error('Error sending government update:', error);
      throw error;
    }
  }

  // Get notification statistics
  async getNotificationStats(userId: string): Promise<{
    totalCount: number;
    unreadCount: number;
    recentCount: number;
  }> {
    try {
      const [totalCount, unreadCount, recentCount] = await Promise.all([
        prisma.notification.count({ where: { userId } }),
        prisma.notification.count({ where: { userId, isRead: false } }),
        prisma.notification.count({
          where: {
            userId,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
      ]);

      return { totalCount, unreadCount, recentCount };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  }
}
