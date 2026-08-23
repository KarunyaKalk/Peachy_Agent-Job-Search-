import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePeachyEvents, PeachyNotification } from '../../context/PeachyEventContext';
import { PeachyMascotSvg } from './PeachyMascotSvg';
import { Sparkles, X, ArrowRight, Bell, MessageSquare, Check, Compass } from 'lucide-react';

export const PeachyMascotWidget: React.FC = () => {
  const { unreadCount, activeNotification, markAsRead, notifications } = usePeachyEvents();
  const location = useLocation();
  const navigate = useNavigate();

  // Widget Popover State: 'closed' | 'speaking' | 'chat'
  const [popoverState, setPopoverState] = useState<'closed' | 'speaking' | 'chat'>('closed');
  const widgetRef = useRef<HTMLDivElement>(null);

  // Auto open speaking popover when a high-priority unread notification arrives
  useEffect(() => {
    if (activeNotification) {
      setPopoverState('speaking');
    }
  }, [activeNotification?.id]);

  // Dismiss popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setPopoverState('closed');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWidgetClick = () => {
    if (activeNotification) {
      setPopoverState(popoverState === 'speaking' ? 'closed' : 'speaking');
    } else {
      setPopoverState(popoverState === 'chat' ? 'closed' : 'chat');
    }
  };

  const handleNotificationClick = (notif: PeachyNotification) => {
    markAsRead(notif.id);
    setPopoverState('closed');
    if (notif.link) {
      navigate(notif.link);
    }
  };

  // Route-Specific Contextual Quick Actions (No LLM required)
  const getContextualPrompts = () => {
    const path = location.pathname;

    if (path === '/jobs') {
      return [
        { label: 'Tailor a resume for a top match', link: '/jobs', action: 'tailor' },
        { label: 'Import a single LinkedIn Job URL', link: '/jobs', action: 'linkedin' },
        { label: 'Run a multi-source job scan', link: '/jobs', action: 'scan' },
      ];
    } else if (path === '/profile') {
      return [
        { label: 'Add alternate bullet variants', link: '/profile', action: 'bullets' },
        { label: 'Update target roles & salary floor', link: '/profile', action: 'preferences' },
        { label: 'Add new technical skills', link: '/profile', action: 'skills' },
      ];
    } else if (path === '/applications') {
      return [
        { label: 'Review pre-filled application forms', link: '/applications', action: 'review' },
        { label: 'Draft a personalized cold email', link: '/cold-email', action: 'email' },
      ];
    } else if (path === '/settings') {
      return [
        { label: 'Check scan interval & daily caps', link: '/settings', action: 'settings' },
      ];
    } else {
      return [
        { label: 'View disovered job feed', link: '/jobs', action: 'feed' },
        { label: 'Edit master profile & resume', link: '/profile', action: 'profile' },
        { label: 'Check cold email manager', link: '/cold-email', action: 'email' },
      ];
    }
  };

  const isAttentionSeeking = unreadCount > 0;

  return (
    <div ref={widgetRef} className="fixed bottom-5 right-5 z-50 select-none flex flex-col items-end">
      {/* --- SPEECH BUBBLE POPOVER (Speaking / Attention State) --- */}
      {popoverState === 'speaking' && activeNotification && (
        <div className="mb-3 w-80 glass-panel p-4 shadow-2xl border-peach-500/40 rounded-2xl relative animate-fadeIn">
          {/* Speech Bubble Tail Arrow */}
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-dark-card border-r border-b border-peach-500/40 transform rotate-45"></div>

          <div className="flex items-start justify-between pb-2 border-b border-dark-border/60">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-peach-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Peachy Notice</span>
            </div>
            <button
              onClick={() => setPopoverState('closed')}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-dark-hover"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-2.5 space-y-1">
            <h4 className="text-xs font-bold text-white">{activeNotification.title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{activeNotification.message}</p>
          </div>

          <button
            onClick={() => handleNotificationClick(activeNotification)}
            className="w-full py-2 px-3 bg-peach-500 hover:bg-peach-600 text-white font-semibold text-xs rounded-lg shadow-glow-peach flex items-center justify-between transition-all"
          >
            <span>Take Action</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* --- CONTEXT CHAT POPOVER (Idle Chat Nudges) --- */}
      {popoverState === 'chat' && (
        <div className="mb-3 w-80 glass-panel p-4 shadow-2xl border-cyan-500/30 rounded-2xl relative animate-fadeIn">
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-dark-card border-r border-b border-cyan-500/30 transform rotate-45"></div>

          <div className="flex items-center justify-between pb-2 border-b border-dark-border/60">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-cyan-400">
              <Compass className="w-3.5 h-3.5" />
              <span>Peachy Assistant Nudges</span>
            </div>
            <button
              onClick={() => setPopoverState('closed')}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-dark-hover"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-2.5 space-y-2">
            <p className="text-xs text-slate-300 font-medium">How can I assist you on this page?</p>
            <div className="space-y-1.5">
              {getContextualPrompts().map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPopoverState('closed');
                    navigate(prompt.link);
                  }}
                  className="w-full text-left p-2 rounded-lg bg-dark-bg/80 hover:bg-dark-hover border border-dark-border/60 text-xs text-slate-200 hover:text-peach-400 flex items-center justify-between transition-all group"
                >
                  <span>{prompt.label}</span>
                  <ArrowRight className="w-3 h-3 text-dark-muted group-hover:text-peach-400 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- MASCOT FLOATING ICON WIDGET --- */}
      <button
        onClick={handleWidgetClick}
        aria-label="Peachy Mascot Guide"
        className={`relative w-20 h-24 focus:outline-none cursor-pointer group transition-transform ${
          isAttentionSeeking ? 'peachy-bounce' : 'peachy-bob'
        }`}
      >
        {/* Unread Alert Indicator Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 right-1 z-20 flex h-5 w-5 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-peach-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-peach-500 text-white font-mono font-bold text-[10px] items-center justify-center shadow-glow-peach border border-white/40">
              {unreadCount}
            </span>
          </span>
        )}

        {/* Mascot SVG Artwork */}
        <PeachyMascotSvg isWaving={isAttentionSeeking} className="transition-transform group-hover:scale-105" />
      </button>
    </div>
  );
};
