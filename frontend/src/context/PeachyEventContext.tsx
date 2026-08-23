import React, { createContext, useContext, useState, useEffect } from 'react';

export interface PeachyNotification {
  id: string;
  type: 'job_scan' | 'resume_tailored' | 'ats_score' | 'application_status' | 'general';
  title: string;
  message: string;
  link?: string;
  timestamp: string;
  isRead: boolean;
}

interface PeachyEventContextType {
  notifications: PeachyNotification[];
  unreadCount: number;
  activeNotification: PeachyNotification | null;
  emitNotification: (notif: Omit<PeachyNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

const PeachyEventContext = createContext<PeachyEventContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'peachy_notifications_v1';

export const PeachyEventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<PeachyNotification[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notifications));
    } catch (err) {
      console.error('Failed to persist notifications:', err);
    }
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const activeNotification = notifications.find((n) => !n.isRead) || null;

  const emitNotification = (notifData: Omit<PeachyNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: PeachyNotification = {
      ...notifData,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };

    setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]); // Keep last 20 notifications
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <PeachyEventContext.Provider
      value={{
        notifications,
        unreadCount,
        activeNotification,
        emitNotification,
        markAsRead,
        clearAll,
      }}
    >
      {children}
    </PeachyEventContext.Provider>
  );
};

export const usePeachyEvents = () => {
  const context = useContext(PeachyEventContext);
  if (!context) {
    throw new Error('usePeachyEvents must be used within a PeachyEventProvider');
  }
  return context;
};
