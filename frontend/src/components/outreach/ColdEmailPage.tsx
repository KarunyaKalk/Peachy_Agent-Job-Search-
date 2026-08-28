import React, { useState, useEffect } from 'react';
import { apiService } from '../../api/client';
import { OutreachLog, Job } from '../../types';
import { useEventBus } from '../../context/EventBusContext';
import { Mail, Search, Send, CheckCircle, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';

export const ColdEmailPage: React.FC = () => {
  const { emitEvent } = useEventBus();
  const [logs, setLogs] = useState<OutreachLog[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number>(1);
  const [company, setCompany] = useState<string>('Orchard Tech AI');
  
  // Contact Discovery & Generator state
  const [findingContact, setFindingContact] = useState<boolean>(false);
  const [contactResult, setContactResult] = useState<any>(null);
  const [recipientName, setRecipientName] = useState<string>('Sarah Jenkins');
  const [recipientTitle, setRecipientTitle] = useState<string>('Lead Technical Recruiter');
  const [recipientEmail, setRecipientEmail] = useState<string>('s.jenkins@orchardtech.ai');
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);

  // Test Email Verification state
  const [testEmailAddress, setTestEmailAddress] = useState<string>('user@example.com');
  const [sendingTest, setSendingTest] = useState<boolean>(false);
  const [testResultMsg, setTestResultMsg] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const l = await apiService.getOutreachLogs();
      const j = await apiService.getJobs();
      setLogs(l);
      setJobs(j);
      if (j.length > 0) {
        setSelectedJobId(j[0].id);
        setCompany(j[0].company);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFindContact = async () => {
    setFindingContact(true);
    try {
      const res = await apiService.findContact(company);
      setContactResult(res);
      if (res.contact_found) {
        setRecipientName(res.name);
        setRecipientTitle(res.title);
        setRecipientEmail(res.email);
      }
    } catch (e) {
      alert('Contact lookup failed.');
    } finally {
      setFindingContact(false);
    }
  };

  const handleGenerateEmail = async () => {
    setGenerating(true);
    try {
      const draft = await apiService.generateColdEmail(selectedJobId, recipientName, recipientTitle, recipientEmail);
      setSubject(draft.subject);
      setBody(draft.body);
    } catch (e) {
      alert('Draft generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!recipientEmail || !subject || !body) return;
    setSending(true);
    try {
      await apiService.sendColdEmail({
        jobId: selectedJobId,
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        recipient_title: recipientTitle,
        subject,
        body
      });
      await loadData();
      emitEvent({
        title: 'Cold Email Dispatched',
        message: `Personalized cold email dispatched to ${recipientEmail}. Track status in Outreach Log.`,
        actionLabel: 'View Audit Log',
        page: 'audit'
      });
    } catch (e) {
      alert('Send failed.');
    } finally {
      setSending(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailAddress) return;
    setSendingTest(true);
    setTestResultMsg('');
    try {
      const res = await apiService.sendTestEmail(testEmailAddress);
      setTestResultMsg(`Test email verified and dispatched to ${testEmailAddress}!`);
      await loadData();
    } catch (e) {
      setTestResultMsg('Test email verification failed.');
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-espresso-800 p-6 rounded-2xl border border-cream-200 dark:border-slate-800 space-y-2 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <Mail className="w-6 h-6 text-peach-500" />
          <span>Cold Email Outreach & Contact Discovery</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Source hiring contacts via Hunter/Apollo APIs (never LinkedIn scraped). Generate CAN-SPAM compliant personalized drafts.
        </p>
      </div>

      {/* REAL TEST EMAIL VERIFICATION BANNER */}
      <div className="bg-peach-50 dark:bg-peach-950/40 border border-peach-300 dark:border-peach-700/60 p-5 rounded-2xl space-y-3">
        <div className="flex items-center space-x-2 font-display font-bold text-sm text-peach-800 dark:text-peach-200">
          <ShieldCheck className="w-5 h-5 text-peach-500" />
          <span>Verification Step: Send Real Test Email to Your Address</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Dispatches a real test email through the exact production SendGrid / SMTP code path to verify delivery headers & compliance.
        </p>

        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            type="email"
            placeholder="Enter your personal email address..."
            value={testEmailAddress}
            onChange={(e) => setTestEmailAddress(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-cream-200 dark:border-slate-700 text-xs"
          />

          <button
            onClick={handleSendTestEmail}
            disabled={sendingTest}
            className="px-5 py-2 bg-peach-500 hover:bg-peach-600 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
          >
            {sendingTest ? 'Sending Test...' : 'Send Real Test Email'}
          </button>
        </div>

        {testResultMsg && (
          <p className="text-xs font-semibold text-leaf-600 dark:text-leaf-400">{testResultMsg}</p>
        )}
      </div>

      {/* Contact Enrichment & Cold Email Generator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Enrichment Card */}
        <div className="peachy-card p-6 space-y-4">
          <h3 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            1. Contact Discovery (Enrichment APIs)
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Company Name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-slate-900 border border-cream-200 dark:border-slate-700"
              />
            </div>

            <button
              onClick={handleFindContact}
              disabled={findingContact}
              className="w-full py-2 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-bold text-xs rounded-xl hover:bg-slate-900 transition-colors"
            >
              {findingContact ? 'Searching Hunter/Apollo...' : 'Find Verified Hiring Contact'}
            </button>

            {contactResult && (
              <div className="p-3 bg-cream-50 dark:bg-slate-900/60 rounded-xl border border-cream-200 dark:border-slate-800 space-y-1">
                {contactResult.contact_found ? (
                  <>
                    <p className="font-bold text-leaf-600 dark:text-leaf-400">Verified Contact Found ({contactResult.source})</p>
                    <p>{contactResult.name} — {contactResult.title}</p>
                    <p className="font-mono text-slate-500">{contactResult.email}</p>
                  </>
                ) : (
                  <p className="font-semibold text-rose-600 dark:text-rose-400">{contactResult.message}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cold Email Generator & Editor */}
        <div className="peachy-card p-6 space-y-4">
          <h3 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            2. Email Generator & Editor
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Click Generate to draft personalized email..."
                className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-slate-900 border border-cream-200 dark:border-slate-700 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Email Body (Includes CAN-SPAM Opt-Out)</label>
              <textarea
                rows={5}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Generated draft text will appear here..."
                className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-slate-900 border border-cream-200 dark:border-slate-700 text-xs leading-relaxed"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleGenerateEmail}
                disabled={generating}
                className="flex-1 py-2 bg-peach-100 dark:bg-peach-950/40 text-peach-700 dark:text-peach-300 font-bold text-xs rounded-xl hover:bg-peach-200 transition-colors inline-flex items-center justify-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{generating ? 'Drafting...' : 'Generate Cold Draft'}</span>
              </button>

              <button
                onClick={handleSendEmail}
                disabled={sending}
                className="flex-1 py-2 bg-peach-500 hover:bg-peach-600 text-white font-bold text-xs rounded-xl transition-colors shadow-sm inline-flex items-center justify-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? 'Sending...' : 'Send Cold Email'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Outreach History Log */}
      <div className="peachy-card p-6 space-y-4">
        <h3 className="font-display font-bold text-base text-slate-900 dark:text-slate-100">
          Outreach History Log
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-cream-200 dark:border-slate-800 text-slate-400 font-mono uppercase">
                <th className="pb-2">Recipient</th>
                <th className="pb-2">Subject</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Sent Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 dark:divide-slate-800/60">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200">{log.recipient_email}</td>
                  <td className="py-2.5 text-slate-600 dark:text-slate-300">{log.subject}</td>
                  <td className="py-2.5">
                    <span className="peachy-pill bg-leaf-100 dark:bg-leaf-900/40 text-leaf-700 dark:text-leaf-300">
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2.5 font-mono text-slate-400">{new Date(log.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
