import React, { useState, useEffect } from 'react';
import { Job } from '../../types/job';
import { HiringContact, ColdEmailDraft, DailyQuota } from '../../types/outreach';
import { outreachService } from '../../services/outreach';
import {
  Sparkles,
  UserCheck,
  Mail,
  Copy,
  Check,
  X,
  RefreshCw,
  Save,
  ShieldCheck,
  Send,
  AlertCircle,
} from 'lucide-react';
import { usePeachyEvents } from '../../context/PeachyEventContext';

interface Props {
  job: Job;
  onClose: () => void;
}

export const ContactFinderModal: React.FC<Props> = ({ job, onClose }) => {
  const { emitNotification } = usePeachyEvents();
  
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [contacts, setContacts] = useState<HiringContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<HiringContact | null>(null);

  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [activeDraft, setActiveDraft] = useState<ColdEmailDraft | null>(null);

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  const [quota, setQuota] = useState<DailyQuota | null>(null);

  const fetchQuota = async () => {
    try {
      const stats = await outreachService.getDailyQuota();
      setQuota(stats);
    } catch (err) {
      console.error('Failed to fetch quota:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchContacts = async () => {
      try {
        const results = await outreachService.findContacts(job.id);
        if (isMounted) {
          setContacts(results);
          if (results.length > 0) setSelectedContact(results[0]);
        }
      } catch (err) {
        console.error('Failed to find contacts:', err);
      } finally {
        if (isMounted) setLoadingContacts(false);
      }
    };

    fetchContacts();
    fetchQuota();
    return () => {
      isMounted = false;
    };
  }, [job.id]);

  const handleGenerateEmail = async (contactToUse?: HiringContact) => {
    const contact = contactToUse || selectedContact;
    if (!contact) return;

    setGeneratingEmail(true);
    try {
      const draft = await outreachService.generateColdEmail({
        job_id: job.id,
        contact_name: contact.name,
        contact_title: contact.title,
        contact_email: contact.email,
        confidence_score: contact.confidence_score,
      });

      setActiveDraft(draft);
      setSubject(draft.subject);
      setBody(draft.body);

      emitNotification({
        type: 'resume_tailored',
        title: `Cold Email Drafted for ${contact.name}!`,
        message: `Generated personalized outreach for ${job.company}.`,
        link: '/email',
      });
    } catch (err) {
      console.error('Failed to generate cold email:', err);
    } finally {
      setGeneratingEmail(false);
    }
  };

  const handleCopyEmail = () => {
    const fullText = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveDraft = async () => {
    if (!activeDraft) return;
    setSaving(true);
    try {
      const updated = await outreachService.updateColdEmailDraft(activeDraft.id, {
        subject,
        body,
        status: 'ready',
      });
      setActiveDraft(updated);
      emitNotification({
        type: 'resume_tailored',
        title: 'Cold Email Saved',
        message: `Saved outreach draft to your Cold Email Hub.`,
        link: '/email',
      });
    } catch (err) {
      console.error('Failed to save draft:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSendEmail = async () => {
    if (!activeDraft) return;
    setSending(true);
    try {
      // Save current edits first
      await outreachService.updateColdEmailDraft(activeDraft.id, { subject, body });
      
      const record = await outreachService.sendColdEmail(activeDraft.id);
      await fetchQuota();

      emitNotification({
        type: 'resume_tailored',
        title: `Cold Email Dispatched to ${record.recipient_name}!`,
        message: `Sent from your identity to ${record.recipient_email}. Logged to Outreach Log.`,
        link: '/email',
      });

      onClose();
    } catch (err: any) {
      console.error('Failed to send email:', err);
      alert(err.message || 'Failed to dispatch email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-dark-card border border-dark-border rounded-xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-dark-border/60 flex items-center justify-between shrink-0 bg-dark-bg/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Hiring Contact Enrichment & Cold Email Generator
                </h3>
                {quota && (
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Cap: {quota.sent_today}/{quota.daily_cap} Today
                  </span>
                )}
              </div>
              <p className="text-xs text-dark-muted">
                Company: <strong className="text-slate-200">{job.company}</strong> • Role: {job.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs">
          {/* STEP 1: HUNTER.IO CONTACT ENRICHMENT */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-dark-border/60">
              <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-400" />
                <span>Hunter.io Verified Hiring Contacts</span>
              </span>
              <span className="text-[11px] text-dark-muted">
                Legitimate Domain Search • Zero LinkedIn Scraping
              </span>
            </div>

            {loadingContacts ? (
              <div className="p-8 flex flex-col items-center justify-center space-y-2">
                <div className="w-8 h-8 border-3 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                <p className="text-xs text-dark-muted">Searching Hunter.io domain records for {job.company}...</p>
              </div>
            ) : contacts.length === 0 ? (
              <p className="text-slate-400 italic">No direct hiring contacts found for this domain.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {contacts.map((contact, idx) => {
                  const isSelected = selectedContact?.name === contact.name;

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedContact(contact)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'bg-purple-500/10 border-purple-500/40 shadow-lg'
                          : 'bg-dark-bg/60 border-dark-border hover:border-slate-600'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between">
                          <h5 className="font-bold text-white text-sm">{contact.name}</h5>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              contact.confidence_score >= 90
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {contact.confidence_score}% Confidence
                          </span>
                        </div>
                        <p className="text-slate-300 font-medium line-clamp-1">{contact.title}</p>
                        {contact.email && (
                          <p className="text-purple-300 font-mono text-[11px] truncate">
                            {contact.email}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContact(contact);
                          handleGenerateEmail(contact);
                        }}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-colors ${
                          isSelected
                            ? 'bg-purple-500 text-white shadow-glow-purple'
                            : 'bg-dark-hover hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Cold Email</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* STEP 2: CLAUDE AI PERSONALISED COLD EMAIL EDITOR */}
          {selectedContact && (
            <div className="space-y-4 pt-2 border-t border-dark-border/60">
              <div className="flex items-center justify-between pb-2 border-b border-dark-border/60">
                <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span>Personalized Cold Email Draft for {selectedContact.name}</span>
                </span>

                <button
                  onClick={() => handleGenerateEmail()}
                  disabled={generatingEmail}
                  className="px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded text-xs font-bold flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${generatingEmail ? 'animate-spin' : ''}`} />
                  <span>{generatingEmail ? 'Generating via Claude AI...' : 'Regenerate Draft'}</span>
                </button>
              </div>

              {/* Anti-Spam Footer Notice */}
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-between text-cyan-200 text-xs">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    <strong>CAN-SPAM Compliant:</strong> Dispatched with your own email identity & includes opt-out unsubscribe footer line.
                  </span>
                </div>
                <span className="font-mono text-[11px] font-bold text-cyan-300">
                  Daily Cap: {quota?.sent_today || 0} / {quota?.daily_cap || 15}
                </span>
              </div>

              {generatingEmail ? (
                <div className="p-12 flex flex-col items-center justify-center space-y-3 glass-panel">
                  <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                  <p className="text-xs text-white font-bold animate-pulse">
                    Crafting personalized cold email via Claude AI...
                  </p>
                  <p className="text-[11px] text-dark-muted">
                    Combining tailored resume achievements, {job.company} JD keywords, and recipient's title ({selectedContact.title})...
                  </p>
                </div>
              ) : activeDraft ? (
                <div className="space-y-4 glass-panel p-5 border-dark-border">
                  {/* Recipient Header */}
                  <div className="flex items-center space-x-2 bg-dark-bg/80 p-2.5 rounded-lg border border-dark-border/60 text-xs">
                    <span className="text-dark-muted font-bold">To:</span>
                    <span className="text-white font-bold">{selectedContact.name}</span>
                    <span className="text-slate-400">({selectedContact.title})</span>
                    {selectedContact.email && (
                      <span className="text-purple-300 font-mono text-[11px] ml-auto">
                        &lt;{selectedContact.email}&gt;
                      </span>
                    )}
                  </div>

                  {/* Editable Subject Line */}
                  <div>
                    <label className="text-dark-muted block mb-1 font-bold uppercase tracking-wider text-[11px]">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg text-white font-bold focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Editable Email Body */}
                  <div>
                    <label className="text-dark-muted block mb-1 font-bold uppercase tracking-wider text-[11px]">
                      Email Body (Editable Text Area)
                    </label>
                    <textarea
                      rows={10}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="w-full p-3.5 bg-dark-bg border border-dark-border rounded-xl text-slate-200 leading-relaxed font-sans focus:outline-none focus:border-cyan-500 resize-y"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center glass-panel space-y-2">
                  <Sparkles className="w-8 h-8 text-purple-400 mx-auto" />
                  <p className="text-slate-300">
                    Click <strong>"Generate Cold Email"</strong> on any contact card above to craft a personalized 3-paragraph draft.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        {activeDraft && (
          <div className="p-4 border-t border-dark-border/60 bg-dark-bg/60 flex items-center justify-between shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-dark-hover text-slate-300 font-semibold text-xs"
            >
              Close
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleCopyEmail}
                className="px-3.5 py-2 rounded-lg bg-dark-hover hover:bg-slate-700 text-white font-semibold text-xs flex items-center space-x-1 border border-dark-border"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-purple-400" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onClick={handleSaveDraft}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-dark-hover hover:bg-slate-700 text-purple-300 border border-purple-500/30 font-semibold text-xs flex items-center space-x-1"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Draft'}</span>
              </button>

              <button
                onClick={handleSendEmail}
                disabled={sending || (quota ? quota.remaining <= 0 : false)}
                className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-glow-emerald flex items-center space-x-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{sending ? 'Dispatching Email...' : 'Send Cold Email Now'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
