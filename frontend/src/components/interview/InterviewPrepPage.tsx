import React, { useState, useEffect } from 'react';
import { apiService } from '../../api/client';
import { Job } from '../../types';
import { BookOpen, CheckSquare, Sparkles, HelpCircle, UserCheck } from 'lucide-react';

import { mockJobs } from '../../api/mockData';

export const InterviewPrepPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [selectedJobId, setSelectedJobId] = useState<number>(mockJobs[0].id);
  const [loading, setLoading] = useState<boolean>(false);
  const [prepPack, setPrepPack] = useState<any>(null);

  // Prep checklist state
  const [checklist, setChecklist] = useState<Array<{ id: number; text: string; done: boolean }>>([
    { id: 1, text: 'Review company mission statement and recent technical blogs', done: true },
    { id: 2, text: 'Practice STAR stories for async queue latency optimization project', done: true },
    { id: 3, text: 'Prepare questions about team microservice deployment practices', done: false },
    { id: 4, text: 'Confirm camera/microphone setup for video interview', done: false },
  ]);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await apiService.getJobs();
      const jobList = data && data.length > 0 ? data : mockJobs;
      setJobs(jobList);
      if (jobList.length > 0) {
        setSelectedJobId(jobList[0].id);
        fetchPrep(jobList[0].id);
      }
    } catch (e) {
      setJobs(mockJobs);
      setSelectedJobId(mockJobs[0].id);
      fetchPrep(mockJobs[0].id);
    }
  };

  const fetchPrep = async (jobId: number) => {
    setLoading(true);
    try {
      const data = await apiService.getInterviewPrep(jobId);
      setPrepPack(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleChecklistItem = (id: number) => {
    setChecklist(
      checklist.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-espresso-800 p-6 rounded-2xl border border-cream-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-peach-500" />
              <span>Interview Preparation Pack & STAR Answers</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generated via Gemini API based on JD requirements + your truthful master resume experience.
            </p>
          </div>

          <select
            value={selectedJobId}
            onChange={(e) => {
              const id = Number(e.target.value);
              setSelectedJobId(id);
              fetchPrep(id);
            }}
            className="px-4 py-2 rounded-xl bg-cream-50 dark:bg-slate-900 border border-cream-200 dark:border-slate-700 text-xs font-semibold"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} at {j.company}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Generating interview prep kit...</div>
      ) : prepPack ? (
        <div className="space-y-6">
          {/* Overview */}
          <div className="peachy-card p-6 space-y-2">
            <h3 className="font-display font-bold text-sm text-peach-600 dark:text-peach-400 uppercase tracking-wider">
              Company Context & Focus
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {prepPack.company_overview}
            </p>
          </div>

          {/* Behavioral Questions with STAR format */}
          <div className="peachy-card p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-peach-500" />
              <span>Behavioral Questions & STAR Draft Answers</span>
            </h3>

            <div className="space-y-4">
              {(prepPack.behavioral_questions || []).map((q: any, idx: number) => (
                <div key={idx} className="bg-cream-50 dark:bg-slate-900/60 p-4 rounded-xl border border-cream-200 dark:border-slate-800 space-y-2 text-xs">
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">Q{idx + 1}: {q.question}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                    <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-cream-200 dark:border-slate-700">
                      <span className="font-bold text-peach-600 dark:text-peach-400">Situation:</span> {q.situation}
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-cream-200 dark:border-slate-700">
                      <span className="font-bold text-peach-600 dark:text-peach-400">Task:</span> {q.task}
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-cream-200 dark:border-slate-700">
                      <span className="font-bold text-peach-600 dark:text-peach-400">Action:</span> {q.action}
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-cream-200 dark:border-slate-700">
                      <span className="font-bold text-peach-600 dark:text-peach-400">Result:</span> {q.result}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Questions */}
          <div className="peachy-card p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-peach-500" />
              <span>Likely Technical Questions</span>
            </h3>

            <div className="space-y-3 text-xs">
              {(prepPack.technical_questions || []).map((t: any, idx: number) => (
                <div key={idx} className="p-3 bg-cream-50 dark:bg-slate-900/60 rounded-xl border border-cream-200 dark:border-slate-800">
                  <p className="font-bold text-slate-900 dark:text-slate-100">{t.question}</p>
                  <p className="text-slate-600 dark:text-slate-300 mt-1 italic">Suggested response: {t.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Checklist UI */}
          <div className="peachy-card p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <CheckSquare className="w-5 h-5 text-peach-500" />
              <span>Personal Preparation Checklist</span>
            </h3>

            <div className="space-y-2 text-xs">
              {checklist.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center space-x-3 p-3 rounded-xl bg-cream-50 dark:bg-slate-900/60 border border-cream-200 dark:border-slate-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggleChecklistItem(item.id)}
                    className="h-4 w-4 rounded border-cream-300 text-peach-500 focus:ring-peach-400"
                  />
                  <span className={item.done ? 'line-through text-slate-400' : 'font-medium text-slate-800 dark:text-slate-200'}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
