import React, { useState, useEffect } from 'react';
import { Header } from '../components/Layout/Header';
import { Job } from '../types/job';
import { ColdEmailDraft, OutreachRecord, DailyQuota } from '../types/outreach';
import { jobService } from '../services/jobs';
import { outreachService } from '../services/outreach';
import { ContactFinderModal } from '../components/Outreach/ContactFinderModal';
import {
  Mail,
  Sparkles,
  UserCheck,
  Building,
  Copy,
  Check,
  Edit3,
  Send,
  ShieldCheck,
  Clock,
  Save,
  X,
  FileText,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { usePeachyEvents } from '../context/PeachyEventContext';

export const ColdEmailPage: React.FC = () => {
  const { emitNotification } = usePeachyEvents();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [drafts, setDrafts] = useState<ColdEmailDraft[]>([]);
  const [logs, setLogs] = useState<OutreachRecord[]>([]);
  const [quota, setQuota] = useState<DailyQuota | null>(null);
  const [loading, setLoading] = useState(true);

  // Active sub-tab: 'jobs' | 'drafts' | 'log'
  const [activeTab, setActiveTab] = useState<'jobs' | 'drafts' | 'log'>('jobs');

  // Contact Finder Modal active job
  const [contactJob, setContactJob] = useState<Job | null>(null);

  // Copy state per draft ID
  const [copiedDraftId, setCopiedDraftId] = useState<number | null>(null);
  const [sendingDraftId, setSendingDraftId] = useState<number | null>(null);

  // Active editing draft in drawer/modal
  const [editingDraft, setEditingDraft] = useState<ColdEmailDraft | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [savingDraft, setSavingDraft] = useState(false);

  // View Sent Log Item Modal
  const [viewLogItem, setViewLogItem] = useState<OutreachRecord | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedJobs, fetchedDrafts, fetchedLogs, fetchedQuota] = await Promise.all([
        jobService.getJobs(),
        outreachService.getColdEmailDrafts(),
        outreachService.getOutreachLog(),
        outreachService.getDailyQuota(),
      ]);
      setJobs(fetchedJobs);
      setDrafts(fetchedDrafts);
      setLogs(fetchedLogs);
      setQuota(fetchedQuota);
    } catch (err) {
      console.error('Failed to fetch outreach data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopyDraft = (draft: ColdEmailDraft) => {
    const fullText = `Subject: ${draft.subject}\n\n${draft.body}`;
    navigator.clipboard.writeText(fullText);
    setCopiedDraftId(draft.id);
    setTimeout(() => setCopiedDraftId(null), 2500);
  };

  const handleSendDraft = async (draft: ColdEmailDraft) => {
    setSendingDraftId(draft.id);
    try {
      const record = await outreachService.sendColdEmail(draft.id);
      await fetchData();
      emitNotification({
        type: 'resume_tailored',
        title: `Cold Email Sent to ${record.recipient_name}!`,
        message: `Dispatched to ${record.recipient_email} and logged to Outreach Log.`,
        link: '/email',
      });
    } catch (err: any) {
      console.error('Failed to send cold email:', err);
      alert(err.message || 'Failed to dispatch email.');
    } finally {
      setSendingDraftId(null);
    }
  };

  const handleSaveDraftEdits = async () => {
    if (!editingDraft) return;
    setSavingDraft(true);
    try {
      await outreachService.updateColdEmailDraft(editingDraft.id, {
        subject: editSubject,
        body: editBody,
      });
      setEditingDraft(null);
      await fetchData();
      emitNotification({
        type: 'resume_tailored',
        title: 'Outreach Draft Updated',
        message: `Saved changes to email for ${editingDraft.contact_name}.`,
        link: '/email',
      });
    } catch (err) {
      console.error('Failed to save draft edits:', err);
    } finally {
      setSavingDraft(false);
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="Cold Email Outreach Hub"
        subtitle="Hiring manager contact enrichment via Hunter.io, personalized Claude AI cold email generator, SendGrid/SMTP dispatch with 15/day cap, and Outreach Log."
      />

      {/* Metrics & Daily Quota Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 flex items-center space-x-4 border-dark-border">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-dark-muted font-bold uppercase tracking-wider block">
              Hunter.io Domain Search
            </span>
            <span className="text-xl font-bold text-white">Legitimate Enrichment</span>
          </div>
        </div>

        {/* Daily Send Cap Indicator */}
        <div className="glass-panel p-5 space-y-2 border-dark-border">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-dark-muted font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              Daily Send Quota (Cap: 15)
            </span>
            <span className="text-xs font-bold font-mono text-emerald-300">
              {quota ? `${quota.sent_today} / ${quota.daily_cap}` : '0 / 15'}
            </span>
          </div>
          <div className="w-full h-2.5 bg-dark-bg border border-dark-border rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-glow-emerald"
              style={{
                width: `${Math.min(100, ((quota?.sent_today || 0) / (quota?.daily_cap || 15)) * 100)}%`,
              }}
            ></div>
          </div>
          <span className="text-[11px] text-slate-400 block font-mono">
            {quota ? `${quota.remaining} emails remaining today` : '15 remaining'}
          </span>
        </div>

        <div className="glass-panel p-5 flex items-center space-x-4 border-dark-border">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-dark-muted font-bold uppercase tracking-wider block">
              Sent Outreach Log
            </span>
            <span className="text-xl font-bold text-cyan-300">{logs.length} Emails Sent</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-3 border-b border-dark-border/60 pb-3 text-xs">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'jobs'
              ? 'bg-purple-600 text-white shadow-glow-purple'
              : 'bg-dark-card text-slate-400 hover:text-white border border-dark-border'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Tracked Companies ({jobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('drafts')}
          className={`px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'drafts'
              ? 'bg-purple-600 text-white shadow-glow-purple'
              : 'bg-dark-card text-slate-400 hover:text-white border border-dark-border'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Draft Outreach ({drafts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('log')}
          className={`px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'log'
              ? 'bg-emerald-500 text-white shadow-glow-emerald'
              : 'bg-dark-card text-slate-400 hover:text-white border border-dark-border'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Outreach Log ({logs.length})</span>
        </button>
      </div>

      {/* TAB 1: TRACKED JOBS */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-purple-400" />
              <span>Select a Company to Find Hiring Contacts</span>
            </h3>
            <span className="text-xs text-dark-muted">
              Enrich emails with Hunter.io & generate Claude AI cold outreach
            </span>
          </div>

          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
              <p className="text-xs text-dark-muted">Loading tracked job opportunities...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="glass-panel p-5 space-y-4 border-dark-border hover:border-purple-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-base font-bold text-white">{job.title}</h4>
                        <p className="text-xs text-dark-muted">
                          Company: <strong className="text-slate-200">{job.company}</strong> • Location: {job.location}
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                        {job.relevance_score}% Match
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-dark-bg/60 p-2.5 rounded-lg border border-dark-border/40">
                      {job.jd_text}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-dark-border/60">
                    <span className="text-[11px] text-dark-muted">
                      Source: {job.source_platform}
                    </span>

                    <button
                      onClick={() => setContactJob(job)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs shadow-glow-purple flex items-center space-x-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Find Contacts & Draft Email</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SAVED DRAFTS */}
      {activeTab === 'drafts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-400" />
              <span>Saved Personalized Cold Email Drafts ({drafts.length})</span>
            </h3>
          </div>

          {drafts.length === 0 ? (
            <div className="glass-panel p-12 text-center space-y-3 max-w-xl mx-auto my-8">
              <Mail className="w-12 h-12 text-slate-500 mx-auto" />
              <h4 className="text-base font-bold text-white">No Saved Cold Email Drafts Yet</h4>
              <p className="text-xs text-dark-muted leading-relaxed">
                Click <strong>"Find Contacts & Draft Email"</strong> on any tracked company above to generate personalized outreach.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {drafts.map((draft) => {
                const isCopied = copiedDraftId === draft.id;
                const isSending = sendingDraftId === draft.id;

                return (
                  <div
                    key={draft.id}
                    className="glass-panel p-5 space-y-3 border-dark-border hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start justify-between border-b border-dark-border/60 pb-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-base font-bold text-white">{draft.contact_name}</h4>
                          <span className="text-xs text-slate-300">({draft.contact_title || 'Hiring Lead'})</span>
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-bold">
                            {draft.confidence_score}% Confidence
                          </span>
                          {draft.status === 'sent' && (
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              ✓ Email Dispatched
                            </span>
                          )}
                        </div>
                        {draft.contact_email && (
                          <p className="text-xs text-purple-300 font-mono">
                            Email: {draft.contact_email}
                          </p>
                        )}
                      </div>

                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(draft.updated_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-dark-muted font-bold block mb-0.5">Subject:</span>
                        <p className="font-bold text-white bg-dark-bg/60 p-2.5 rounded-lg border border-dark-border/60">
                          {draft.subject}
                        </p>
                      </div>

                      <div>
                        <span className="text-dark-muted font-bold block mb-0.5">Body Preview:</span>
                        <p className="text-slate-300 bg-dark-bg/60 p-3 rounded-lg border border-dark-border/60 whitespace-pre-line leading-relaxed">
                          {draft.body}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-dark-border/60">
                      <span className="text-[11px] text-dark-muted font-mono">
                        Includes CAN-SPAM opt-out line
                      </span>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingDraft(draft);
                            setEditSubject(draft.subject);
                            setEditBody(draft.body);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-dark-hover hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center space-x-1 border border-dark-border"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleCopyDraft(draft)}
                          className="px-3.5 py-1.5 rounded-lg bg-dark-hover hover:bg-slate-700 text-white font-semibold text-xs flex items-center space-x-1 border border-dark-border"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-400" />}
                          <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>

                        <button
                          onClick={() => handleSendDraft(draft)}
                          disabled={isSending || (quota ? quota.remaining <= 0 : false)}
                          className="px-5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-glow-emerald flex items-center space-x-1.5 disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSending ? 'Sending...' : 'Send Email Now'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: OUTREACH LOG VIEW */}
      {activeTab === 'log' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Outreach Delivery Audit Log ({logs.length})</span>
            </h3>
            <span className="text-xs text-dark-muted font-mono">
              Tracked in `outreach` DB table
            </span>
          </div>

          {logs.length === 0 ? (
            <div className="glass-panel p-12 text-center space-y-3 max-w-xl mx-auto my-8">
              <Clock className="w-12 h-12 text-slate-500 mx-auto" />
              <h4 className="text-base font-bold text-white">No Emails Sent Yet</h4>
              <p className="text-xs text-dark-muted leading-relaxed">
                Sent cold emails will be recorded here with delivery timestamps, recipient emails, and job references.
              </p>
            </div>
          ) : (
            <div className="glass-panel overflow-hidden border-dark-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-dark-bg/80 border-b border-dark-border/60 text-dark-muted font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5">Recipient</th>
                    <th className="p-3.5">Company / Role</th>
                    <th className="p-3.5">Subject</th>
                    <th className="p-3.5">Sent Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/40 text-slate-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-dark-hover/40 transition-colors">
                      <td className="p-3.5 font-bold text-white">
                        <div>{log.recipient_name}</div>
                        <div className="text-[11px] text-purple-300 font-mono">{log.recipient_email}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-200">{log.job?.company || 'Company'}</div>
                        <div className="text-[11px] text-dark-muted">{log.job?.title || 'Role'}</div>
                      </td>
                      <td className="p-3.5 font-medium max-w-xs truncate">{log.subject}</td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-400">
                        {new Date(log.sent_at).toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          ✓ Sent (Capped 15/day)
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setViewLogItem(log)}
                          className="px-3 py-1 bg-dark-bg hover:bg-slate-700 border border-dark-border rounded text-[11px] font-semibold text-cyan-300"
                        >
                          View Sent Email
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Contact Finder Modal */}
      {contactJob && (
        <ContactFinderModal
          job={contactJob}
          onClose={() => {
            setContactJob(null);
            fetchData();
          }}
        />
      )}

      {/* View Log Item Modal */}
      {viewLogItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-dark-border/60">
              <div>
                <h3 className="font-bold text-white text-base">Outreach Audit Record #{viewLogItem.id}</h3>
                <p className="text-xs text-dark-muted">
                  To: {viewLogItem.recipient_name} &lt;{viewLogItem.recipient_email}&gt;
                </p>
              </div>
              <button
                onClick={() => setViewLogItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-dark-muted font-bold block mb-1">Subject</span>
                <p className="p-3 bg-dark-bg border border-dark-border rounded-lg text-white font-bold">
                  {viewLogItem.subject}
                </p>
              </div>

              <div>
                <span className="text-dark-muted font-bold block mb-1">Dispatched Email Body (With Opt-Out Line)</span>
                <div className="p-4 bg-dark-bg border border-dark-border rounded-xl text-slate-200 whitespace-pre-line leading-relaxed font-sans max-h-72 overflow-y-auto">
                  {viewLogItem.body}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-dark-border/60">
              <span className="text-[11px] text-dark-muted font-mono">
                Sent At: {new Date(viewLogItem.sent_at).toLocaleString()}
              </span>
              <button
                onClick={() => setViewLogItem(null)}
                className="px-4 py-2 rounded-lg bg-dark-hover text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Draft Modal */}
      {editingDraft && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-dark-border/60">
              <h3 className="font-bold text-white text-base">Edit Cold Email Draft</h3>
              <button
                onClick={() => setEditingDraft(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-dark-muted font-bold block mb-1">Subject Line</label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg text-white font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-dark-muted font-bold block mb-1">Email Body</label>
                <textarea
                  rows={10}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="w-full p-3 bg-dark-bg border border-dark-border rounded-xl text-slate-200 leading-relaxed font-sans focus:outline-none focus:border-cyan-500 resize-y"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-dark-border/60">
              <button
                onClick={() => setEditingDraft(null)}
                className="px-4 py-2 rounded-lg bg-dark-hover text-slate-400 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDraftEdits}
                disabled={savingDraft}
                className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-glow-cyan flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{savingDraft ? 'Saving...' : 'Save Draft Edits'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
