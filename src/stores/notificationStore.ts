import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  userId?: number;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  (set, get) => ({
    notifications: [],
    unreadCount: 0,

    addNotification: (notification) => {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        read: false,
      };

      set((state) => ({
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }));

      // Auto-remove success notifications after 5 seconds
      if (notification.type === 'success') {
        setTimeout(() => {
          get().removeNotification(newNotification.id);
        }, 5000);
      }
    },

    markAsRead: (id) => {
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    },

    markAllAsRead: () => {
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    },

    removeNotification: (id) => {
      set((state) => {
        const notification = state.notifications.find((n) => n.id === id);
        return {
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadCount: notification && !notification.read ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });
    },

    clearAll: () => {
      set({
        notifications: [],
        unreadCount: 0,
      });
    },
  })
);