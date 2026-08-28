import React, { useState } from 'react';
import { useEventBus } from '../../context/EventBusContext';
import { MessageSquare, X, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';

interface PeachyMascotProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export const PeachyMascot: React.FC<PeachyMascotProps> = ({ currentPage = 'dashboard', onNavigate }) => {
  const { currentEvent, unreadCount, mascotState, setMascotState, dismissEvent } = useEventBus();
  const [showBubble, setShowBubble] = useState<boolean>(true);

  // Context-aware canned quick actions for idle chat state per page
  const getPageSuggestions = () => {
    switch (currentPage) {
      case 'profile':
        return [
          { text: 'How do I upload a resume to auto-fill?', action: 'Click the "Upload Resume to Auto-Fill" button above!' },
          { text: 'Add a bullet point variant', action: 'Inline edit any experience entry to add variants.' },
        ];
      case 'jobs':
        return [
          { text: 'Parse single LinkedIn Job URL', action: 'Paste any LinkedIn URL in the top import box.' },
          { text: 'Trigger fresh aggregator scan', action: 'Click "Scan Discovered Jobs" to poll APIs.' },
        ];
      case 'checker':
        return [
          { text: 'Run ATS score check', action: 'Upload any resume PDF & paste a JD to check keywords.' },
        ];
      case 'applications':
        return [
          { text: 'How does form-fill work?', action: 'Click "Fill & Preview" — it stops right before submit!' },
        ];
      default:
        return [
          { text: 'What should I do first?', action: 'Upload your resume in My Profile to auto-fill data.' },
          { text: 'Tailor a resume for a job', action: 'Go to Job Feed and click "Tailor Resume".' },
        ];
    }
  };

  const handleMascotClick = () => {
    if (mascotState === 'attention') {
      setMascotState('speaking');
      setShowBubble(true);
    } else if (mascotState === 'speaking') {
      setMascotState('idle_chat');
    } else if (mascotState === 'idle_chat') {
      setMascotState('idle');
      setShowBubble(false);
    } else {
      setMascotState('speaking');
      setShowBubble(true);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end pointer-events-none select-none">
      {/* Speech Bubble / Event Popover */}
      {showBubble && (currentEvent || mascotState === 'idle_chat' || mascotState === 'speaking') && (
        <div className="pointer-events-auto mb-3 max-w-xs w-72 bg-white dark:bg-espresso-800 border-2 border-peach-400 dark:border-peach-500/60 rounded-2xl p-4 shadow-xl text-slate-800 dark:text-slate-100 transition-all duration-200 animate-in fade-in slide-in-from-bottom-3">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-cream-200 dark:border-slate-700">
            <div className="flex items-center space-x-1.5 font-display font-semibold text-peach-600 dark:text-peach-400 text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Peachy Assistant</span>
            </div>
            <button
              onClick={() => {
                setShowBubble(false);
                dismissEvent();
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {currentEvent && mascotState !== 'idle_chat' ? (
            <div>
              <p className="font-semibold text-sm mb-1">{currentEvent.title}</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                {currentEvent.message}
              </p>
              {currentEvent.actionLabel && currentEvent.page && (
                <button
                  onClick={() => {
                    if (onNavigate && currentEvent.page) onNavigate(currentEvent.page);
                    dismissEvent();
                  }}
                  className="w-full inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-peach-500 hover:bg-peach-600 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
                >
                  <span>{currentEvent.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div>
              <p className="font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Quick Tips for {currentPage}
              </p>
              <div className="space-y-2">
                {getPageSuggestions().map((s, idx) => (
                  <div key={idx} className="bg-cream-50 dark:bg-slate-900/60 p-2 rounded-lg text-xs border border-cream-200 dark:border-slate-800">
                    <p className="font-medium text-peach-600 dark:text-peach-400">{s.text}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{s.action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Speech bubble tail pointer */}
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white dark:bg-espresso-800 border-r-2 border-b-2 border-peach-400 dark:border-peach-500/60 transform rotate-45" />
        </div>
      )}

      {/* Interactive Mascot SVG Wrapper */}
      <div className="relative pointer-events-auto cursor-pointer group" onClick={handleMascotClick}>
        {/* Unread Alert Dot */}
        {unreadCount > 0 && mascotState === 'attention' && (
          <span className="absolute -top-1 -right-1 z-10 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-peach-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-peach-500 text-[10px] text-white font-bold items-center justify-center">
              !
            </span>
          </span>
        )}

        {/* SVG Mascot Body (Peach shape with leaf, eyes, tie, and briefcase) */}
        <div
          className={`w-24 h-24 transition-transform duration-300 ${
            mascotState === 'attention'
              ? 'animate-peachy-wiggle'
              : 'animate-peachy-bob group-hover:scale-105'
          }`}
        >
          <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
            {/* Stem & Leaf */}
            <path
              d="M 60 22 C 65 10 75 8 82 12 C 85 20 78 28 64 26 Z"
              className="fill-leaf-500 dark:fill-leaf-400 stroke-leaf-700"
              strokeWidth="2"
            />
            <path d="M 60 24 C 58 18 55 12 50 8" stroke="#276749" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Peach Main Heart Body */}
            <path
              d="M 60 30 
                 C 40 18, 15 35, 18 65 
                 C 20 90, 48 110, 60 115 
                 C 72 110, 100 90, 102 65 
                 C 105 35, 80 18, 60 30 Z"
              className="fill-peach-400 dark:fill-peach-500 stroke-peach-700"
              strokeWidth="3.5"
            />

            {/* Soft Peach Cheek Blush */}
            <circle cx="36" cy="68" r="8" fill="#F97352" opacity="0.35" />
            <circle cx="84" cy="68" r="8" fill="#F97352" opacity="0.35" />

            {/* Eyes (Blinking animation support) */}
            <g className="animate-peachy-blink">
              {mascotState === 'attention' ? (
                // Excited star-eyes in attention state
                <>
                  <circle cx="44" cy="58" r="4.5" className="fill-slate-900 dark:fill-slate-100" />
                  <circle cx="76" cy="58" r="4.5" className="fill-slate-900 dark:fill-slate-100" />
                  <circle cx="46" cy="56" r="1.5" fill="#FFFFFF" />
                  <circle cx="78" cy="56" r="1.5" fill="#FFFFFF" />
                </>
              ) : (
                // Warm friendly eyes
                <>
                  <circle cx="44" cy="58" r="4" className="fill-slate-900 dark:fill-slate-100" />
                  <circle cx="76" cy="58" r="4" className="fill-slate-900 dark:fill-slate-100" />
                  <circle cx="45.5" cy="56.5" r="1.2" fill="#FFFFFF" />
                  <circle cx="77.5" cy="56.5" r="1.2" fill="#FFFFFF" />
                </>
              )}
            </g>

            {/* Happy Smile Curve */}
            <path
              d="M 52 68 Q 60 76 68 68"
              stroke="#1E293B"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />

            {/* Agent Professional Tie */}
            <polygon points="60,76 56,88 60,98 64,88" className="fill-slate-800 dark:fill-slate-200" />
            <polygon points="56,76 64,76 62,79 58,79" className="fill-peach-600" />

            {/* Cute Briefcase in Hand */}
            <rect x="86" y="78" width="16" height="12" rx="2" className="fill-amber-800 stroke-amber-950" strokeWidth="1.5" />
            <path d="M 91 78 L 91 75 C 91 74 97 74 97 75 L 97 78" stroke="#451A03" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
      </div>
    </div>
  );
};
