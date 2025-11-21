import { Server } from 'socket.io';
import { NotificationRepository } from '../../infrastructure/repositories/NotificationRepository';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { ActivityLogService } from './ActivityLogService';
import { env } from '../../core/config/env';
import { User } from '../types';

export interface NotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high';
  userId?: number;
  actionUrl?: string;
  data?: Record<string, any>;
}

export interface NotificationEvent {
  type: string;
  data: any;
  userId?: number;
  targetRole?: string[];
  targetUsers?: number[];
}

export class NotificationService {
  private io: Server;
  private notificationRepository: NotificationRepository;
  private userRepository: UserRepository;
  private activityLogService: ActivityLogService;
  private connectedUsers: Map<number, string[]> = new Map();

  constructor(server?: any) {
    this.notificationRepository = new NotificationRepository();
    this.userRepository = new UserRepository();
    this.activityLogService = new ActivityLogService();

    if (server) {
      this.initializeSocket(server);
    }
  }

  private initializeSocket(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('authenticate', async (data: { userId: number; token: string }) => {
        try {
          // Verify token and get user
          const user = await this.userRepository.findById(data.userId);
          if (user) {
            // Add user to connected users map
            if (!this.connectedUsers.has(data.userId)) {
              this.connectedUsers.set(data.userId, []);
            }
            this.connectedUsers.get(data.userId)?.push(socket.id);

            // Send any pending notifications
            await this.sendPendingNotifications(data.userId, socket);

            console.log(`User ${data.userId} authenticated with socket ${socket.id}`);
          }
        } catch (error) {
          console.error('Authentication error:', error);
          socket.disconnect();
        }
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Remove socket from connected users
        for (const [userId, socketIds] of this.connectedUsers.entries()) {
          const index = socketIds.indexOf(socket.id);
          if (index > -1) {
            socketIds.splice(index, 1);
            if (socketIds.length === 0) {
              this.connectedUsers.delete(userId);
            }
            break;
          }
        }
      });

      socket.on('mark_notification_read', async (notificationId: string) => {
        try {
          await this.markNotificationAsRead(notificationId);
        } catch (error) {
          console.error('Error marking notification as read:', error);
        }
      });

      socket.on('get_unread_notifications', async (userId: number) => {
        try {
          const notifications = await this.getUnreadNotifications(userId);
          socket.emit('unread_notifications', notifications);
        } catch (error) {
          console.error('Error getting unread notifications:', error);
        }
      });
    });
  }

  async createNotification(notificationData: NotificationData): Promise<void> {
    try {
      // Save to database
      const notification = await this.notificationRepository.create(notificationData);

      // Log activity
      await this.activityLogService.logActivity({
        userId: notificationData.userId,
        action: 'notification.created',
        resourceType: 'notification',
        resourceId: notification.id,
        details: {
          title: notificationData.title,
          type: notificationData.type,
          priority: notificationData.priority,
        },
      });

      // Send real-time notification if user is connected
      if (notificationData.userId && this.connectedUsers.has(notificationData.userId)) {
        const socketIds = this.connectedUsers.get(notificationData.userId) || [];
        socketIds.forEach(socketId => {
          this.io.to(socketId).emit('notification', notification);
        });
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async createBulkNotifications(notifications: NotificationData[]): Promise<void> {
    try {
      const promises = notifications.map(notification => this.createNotification(notification));
      await Promise.all(promises);
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  }

  async handleEvent(event: NotificationEvent): Promise<void> {
    try {
      switch (event.type) {
        case 'user.registered':
          await this.handleUserRegistered(event);
          break;
        case 'user.login':
          await this.handleUserLogin(event);
          break;
        case 'course.enrolled':
          await this.handleCourseEnrolled(event);
          break;
        case 'course.completed':
          await this.handleCourseCompleted(event);
          break;
        case 'assignment.submitted':
          await this.handleAssignmentSubmitted(event);
          break;
        case 'assignment.graded':
          await this.handleAssignmentGraded(event);
          break;
        case 'system.maintenance':
          await this.handleSystemMaintenance(event);
          break;
        case 'admin.announcement':
          await this.handleAdminAnnouncement(event);
          break;
        default:
          console.warn('Unknown event type:', event.type);
      }
    } catch (error) {
      console.error('Error handling event:', error);
    }
  }

  private async handleUserRegistered(event: NotificationEvent): Promise<void> {
    // Welcome notification for new user
    await this.createNotification({
      title: 'Hoş Geldiniz!',
      message: 'GökAkademi\'ye başarıyla kayıt oldunuz. Eğitim yolculuğunuz başlıyor!',
      type: 'success',
      priority: 'medium',
      userId: event.userId,
      actionUrl: '/dashboard',
    });
  }

  private async handleUserLogin(event: NotificationEvent): Promise<void> {
    // Security notification for login
    await this.createNotification({
      title: 'Giriş Yapıldı',
      message: 'Hesabınıza başarıyla giriş yapıldı.',
      type: 'info',
      priority: 'low',
      userId: event.userId,
      data: {
        ipAddress: event.data.ipAddress,
        userAgent: event.data.userAgent,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private async handleCourseEnrolled(event: NotificationEvent): Promise<void> {
    await this.createNotification({
      title: 'Eğitime Kayıt Oldunuz',
      message: `${event.data.courseTitle} eğitimine başarıyla kayıt oldunuz. İyi öğrenmeler!`,
      type: 'success',
      priority: 'medium',
      userId: event.userId,
      actionUrl: `/courses/${event.data.courseId}`,
    });
  }

  private async handleCourseCompleted(event: NotificationEvent): Promise<void> {
    await this.createNotification({
      title: 'Tebrikler!',
      message: `${event.data.courseTitle} eğitimini başarıyla tamamladınız. Sertifikanız profilinizde görüntülenebilir.`,
      type: 'success',
      priority: 'high',
      userId: event.userId,
      actionUrl: '/certificates',
    });
  }

  private async handleAssignmentSubmitted(event: NotificationEvent): Promise<void> {
    await this.createNotification({
      title: 'Ödev Gönderildi',
      message: `${event.data.assignmentTitle} ödeviniz başarıyla gönderildi.`,
      type: 'info',
      priority: 'medium',
      userId: event.userId,
      actionUrl: `/assignments/${event.data.assignmentId}`,
    });
  }

  private async handleAssignmentGraded(event: NotificationEvent): Promise<void> {
    const grade = event.data.grade;
    const message = grade >= 80 
      ? `Tebrikler! ${event.data.assignmentTitle} ödevinizden ${grade} puan aldınız.`
      : `${event.data.assignmentTitle} ödeviniz değerlendirildi. Puanınız: ${grade}`;

    await this.createNotification({
      title: 'Ödev Değerlendirildi',
      message,
      type: grade >= 80 ? 'success' : 'info',
      priority: 'high',
      userId: event.userId,
      actionUrl: `/assignments/${event.data.assignmentId}`,
    });
  }

  private async handleSystemMaintenance(event: NotificationEvent): Promise<void> {
    // Send to all users
    const users = await this.userRepository.findAll({ isActive: true });
    const notifications = users.map(user => ({
      title: 'Sistem Bakımı',
      message: event.data.message || 'Sistem bakımı planlanmaktadır. Belirtilen saatlerde sistem kullanılamayabilir.',
      type: 'warning' as const,
      priority: 'high' as const,
      userId: user.id,
      actionUrl: '/maintenance',
    }));

    await this.createBulkNotifications(notifications);
  }

  private async handleAdminAnnouncement(event: NotificationEvent): Promise<void> {
    let targetUsers: User[] = [];

    if (event.targetUsers && event.targetUsers.length > 0) {
      // Send to specific users
      targetUsers = await Promise.all(
        event.targetUsers.map(userId => this.userRepository.findById(userId))
      );
      targetUsers = targetUsers.filter(user => user && user.isActive) as User[];
    } else if (event.targetRole && event.targetRole.length > 0) {
      // Send to users with specific roles
      for (const role of event.targetRole) {
        const roleUsers = await this.userRepository.findAll({ role: role as any, isActive: true });
        targetUsers.push(...roleUsers);
      }
    } else {
      // Send to all active users
      targetUsers = await this.userRepository.findAll({ isActive: true });
    }

    const notifications = targetUsers.map(user => ({
      title: event.data.title || 'Duyuru',
      message: event.data.message,
      type: 'info' as const,
      priority: (event.data.priority as any) || 'medium',
      userId: user.id,
      actionUrl: event.data.actionUrl,
    }));

    await this.createBulkNotifications(notifications);
  }

  async getUnreadNotifications(userId: number): Promise<any[]> {
    try {
      return await this.notificationRepository.getUnreadByUserId(userId);
    } catch (error) {
      console.error('Error getting unread notifications:', error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await this.notificationRepository.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    try {
      await this.notificationRepository.markAllAsRead(userId);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  private async sendPendingNotifications(userId: number, socket: any): Promise<void> {
    try {
      const unreadNotifications = await this.getUnreadNotifications(userId);
      if (unreadNotifications.length > 0) {
        socket.emit('pending_notifications', unreadNotifications);
      }
    } catch (error) {
      console.error('Error sending pending notifications:', error);
    }
  }

  async cleanup(): Promise<void> {
    if (this.io) {
      this.io.close();
    }
  }
}