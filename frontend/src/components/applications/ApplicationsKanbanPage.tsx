import React, { useState, useEffect } from 'react';
import { apiService } from '../../api/client';
import { Application } from '../../types';
import { useEventBus } from '../../context/EventBusContext';
import {
  Layers,
  Play,
  CheckCircle,
  AlertTriangle,
  FileText,
  Building,
  Calendar,
  Clock,
  ShieldAlert
} from 'lucide-react';

import { mockApplications } from '../../api/mockData';

const KANBAN_COLUMNS = [
  'Not Applied',
  'Ready to Apply',
  'Applied',
  'Under Review',
  'Interview',
  'Rejected',
  'Offer'
] as const;

export const ApplicationsKanbanPage: React.FC = () => {
  const { emitEvent } = useEventBus();
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [loading, setLoading] = useState<boolean>(false);

  // Playwright Form-Fill Preview Modal State
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [activeAppId, setActiveAppId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await apiService.getApplications();
      setApplications(data && data.length > 0 ? data : mockApplications);
    } catch (e) {
      setApplications(mockApplications);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteFormFill = async (appId: number) => {
    setActiveAppId(appId);
    setSubmitting(true);
    try {
      const res = await apiService.executeFormFillPreview(appId);
      setPreviewData(res);
      setShowPreviewModal(true);
    } catch (e) {
      alert('Form fill preview failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalizeSubmit = async () => {
    if (!activeAppId) return;
    setSubmitting(true);
    try {
      await apiService.finalizeSubmission(activeAppId);
      setShowPreviewModal(false);
      await loadApplications();
      emitEvent({
        title: 'Application Submitted!',
        message: 'Application recorded cleanly following your explicit approval click.',
        actionLabel: 'View Outreach',
        page: 'outreach'
      });
    } catch (e) {
      alert('Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-peach-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white dark:bg-espresso-800 p-6 rounded-2xl border border-cream-200 dark:border-slate-800 space-y-2 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <Layers className="w-6 h-6 text-peach-500" />
          <span>Applications Kanban Board</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Track application workflow states. Playwright form fills pause before final submit for human confirmation.
        </p>
      </div>

      {/* Kanban Board Grid */}
      <div className="flex overflow-x-auto pb-4 gap-4">
        {KANBAN_COLUMNS.map((colStatus) => {
          const colApps = applications.filter((a) => a.status === colStatus);
          return (
            <div
              key={colStatus}
              className="flex-1 min-w-[240px] bg-cream-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-cream-200 dark:border-slate-800 space-y-3"
            >
              <div className="flex justify-between items-center px-1">
                <h3 className="font-display font-bold text-xs uppercase text-slate-600 dark:text-slate-300">
                  {colStatus}
                </h3>
                <span className="peachy-pill bg-cream-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {colApps.length}
                </span>
              </div>

              {colApps.map((app) => (
                <div key={app.id} className="peachy-card p-4 space-y-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{app.job_title}</h4>
                    <p className="text-xs text-peach-600 dark:text-peach-400 font-medium">{app.company}</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{app.match_score || 85}% Match</span>
                    <span className="font-mono">{app.submission_type.split('/')[0]}</span>
                  </div>

                  {colStatus === 'Ready to Apply' && (
                    <button
                      onClick={() => handleExecuteFormFill(app.id)}
                      className="w-full py-1.5 bg-peach-500 hover:bg-peach-600 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center justify-center space-x-1.5"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Fill & Preview</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* PLAYWRIGHT FORM-FILL CONFIRMATION MODAL */}
      {showPreviewModal && previewData && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-espresso-800 rounded-2xl border border-cream-200 dark:border-slate-700 max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center space-x-2 font-display font-bold text-lg text-slate-900 dark:text-slate-100 border-b border-cream-200 dark:border-slate-700 pb-3">
              <ShieldAlert className="w-6 h-6 text-amber-500" />
              <span>Human Approval Required Before Submit</span>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-400 p-4 rounded-xl text-xs space-y-1 text-amber-900 dark:text-amber-200">
              <p className="font-bold">Playwright Form Fill Paused Right Before Final Submit</p>
              <p>{previewData.preview_message}</p>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-700 dark:text-slate-300">Populated Form Fields Summary:</p>
              {Object.entries(previewData.fields_filled || {}).map(([k, v], idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-cream-100 dark:border-slate-800">
                  <span className="text-slate-500">{k}:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{String(v)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-cream-200 dark:border-slate-700">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold"
              >
                Cancel / Edit
              </button>

              <button
                onClick={handleFinalizeSubmit}
                disabled={submitting}
                className="px-5 py-2 bg-peach-500 hover:bg-peach-600 text-white rounded-xl text-xs font-bold shadow-md inline-flex items-center space-x-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{submitting ? 'Submitting...' : 'Explicit Confirm & Submit'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
