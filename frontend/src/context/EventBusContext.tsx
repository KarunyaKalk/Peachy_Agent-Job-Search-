import React, { createContext, useContext, useState, useCallback } from 'react';

export interface MascotEvent {
  id: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  page?: string;
}

interface EventBusContextType {
  currentEvent: MascotEvent | null;
  unreadCount: number;
  emitEvent: (event: Omit<MascotEvent, 'id'>) => void;
  dismissEvent: () => void;
  mascotState: 'idle' | 'attention' | 'speaking' | 'idle_chat';
  setMascotState: (state: 'idle' | 'attention' | 'speaking' | 'idle_chat') => void;
}

const EventBusContext = createContext<EventBusContextType>({
  currentEvent: null,
  unreadCount: 0,
  emitEvent: () => {},
  dismissEvent: () => {},
  mascotState: 'idle',
  setMascotState: () => {},
});

export const EventBusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentEvent, setCurrentEvent] = useState<MascotEvent | null>({
    id: 'welcome-1',
    title: 'Hello! I\'m Peachy 🍑',
    message: 'Welcome to your job agent dashboard! I\'m ready to help discover jobs, tailor your resume, score ATS parseability, and prepare for interviews.',
    actionLabel: 'View Master Profile',
    page: 'profile'
  });
  const [unreadCount, setUnreadCount] = useState<number>(1);
  const [mascotState, setMascotState] = useState<'idle' | 'attention' | 'speaking' | 'idle_chat'>('attention');

  const emitEvent = useCallback((eventData: Omit<MascotEvent, 'id'>) => {
    const newEvent: MascotEvent = {
      ...eventData,
      id: `evt-${Date.now()}`
    };
    setCurrentEvent(newEvent);
    setUnreadCount((prev) => prev + 1);
    setMascotState('attention');
  }, []);

  const dismissEvent = useCallback(() => {
    setCurrentEvent(null);
    setUnreadCount(0);
    setMascotState('idle');
  }, []);

  return (
    <EventBusContext.Provider
      value={{
        currentEvent,
        unreadCount,
        emitEvent,
        dismissEvent,
        mascotState,
        setMascotState,
      }}
    >
      {children}
    </EventBusContext.Provider>
  );
};

export const useEventBus = () => useContext(EventBusContext);
