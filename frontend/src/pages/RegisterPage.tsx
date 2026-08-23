import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Lock, Mail, User as UserIcon, AlertCircle, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Client-Side Validation Rules
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasDigit && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordValid) {
      setError('Password does not meet required security strength constraints.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register(email, password, fullName);
      navigate('/');
    } catch (err: any) {
      let msg = 'Failed to create account. Please check your backend connection.';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          msg = detail;
        } else if (Array.isArray(detail) && detail.length > 0) {
          msg = detail[0].msg || 'Invalid registration payload.';
        }
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-peach-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-peach-600 via-peach-500 to-peach-300 mx-auto flex items-center justify-center text-3xl shadow-glow-peach">
            🍑
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create your Account</h1>
          <p className="text-xs text-dark-muted">Setup your single-user credentials for Peachy</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-dark-muted absolute left-3 top-3" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Developer"
                className="w-full pl-9 pr-4 py-2.5 bg-dark-bg/80 border border-dark-border rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-peach-500 focus:ring-1 focus:ring-peach-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-dark-muted absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-4 py-2.5 bg-dark-bg/80 border border-dark-border rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-peach-500 focus:ring-1 focus:ring-peach-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-dark-muted absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-dark-bg/80 border border-dark-border rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-peach-500 focus:ring-1 focus:ring-peach-500 transition-all"
              />
            </div>

            {/* Password Security Requirement Badges */}
            <div className="mt-2.5 p-3 rounded-lg bg-dark-bg/60 border border-dark-border/60 text-[11px] space-y-1.5">
              <p className="font-semibold text-slate-400">Password Security Requirements:</p>
              <div className="grid grid-cols-2 gap-1 text-dark-muted">
                <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-400 font-semibold' : ''}`}>
                  <CheckCircle2 className="w-3 h-3" /> 8+ Characters
                </span>
                <span className={`flex items-center gap-1 ${hasUpper ? 'text-emerald-400 font-semibold' : ''}`}>
                  <CheckCircle2 className="w-3 h-3" /> 1 Uppercase (A-Z)
                </span>
                <span className={`flex items-center gap-1 ${hasLower ? 'text-emerald-400 font-semibold' : ''}`}>
                  <CheckCircle2 className="w-3 h-3" /> 1 Lowercase (a-z)
                </span>
                <span className={`flex items-center gap-1 ${hasDigit ? 'text-emerald-400 font-semibold' : ''}`}>
                  <CheckCircle2 className="w-3 h-3" /> 1 Number (0-9)
                </span>
                <span className={`flex items-center gap-1 ${hasSpecial ? 'text-emerald-400 font-semibold' : ''} col-span-2`}>
                  <CheckCircle2 className="w-3 h-3" /> 1 Special Character (!@#$%...)
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isPasswordValid}
            className="w-full py-3 px-4 bg-gradient-to-r from-peach-600 to-peach-500 hover:from-peach-500 hover:to-peach-400 text-white font-semibold text-sm rounded-lg shadow-glow-peach flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Creating account...' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-dark-border/60">
          <p className="text-xs text-dark-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-peach-400 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
