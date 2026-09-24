import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Film, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMsg({
        type: 'success',
        text: 'Password reset instructions have been generated.',
      });
      if (res.data.resetToken) {
        setResetToken(res.data.resetToken);
      }
    } catch (err) {
      setMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to process request.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center mx-auto shadow-xl shadow-rose-600/30">
            <Film className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Forgot Password
          </h1>
          <p className="text-xs text-slate-400">
            Enter your email to receive a password reset token
          </p>
        </div>

        {msg.text && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 shadow-lg ${
              msg.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                : 'bg-red-950/80 border border-red-500/50 text-red-300'
            }`}
          >
            {msg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{msg.text}</span>
          </div>
        )}

        {/* Demo Token display for instant testing */}
        {resetToken && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 text-xs space-y-2 shadow-lg">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Dev Reset Token Generated:</span>
              <span className="text-[10px] text-emerald-400 font-mono">Ready to use</span>
            </div>
            <div className="p-2 rounded bg-slate-950 font-mono text-[11px] text-rose-400 break-all select-all">
              {resetToken}
            </div>
            <button
              onClick={() => navigate(`/reset-password?token=${resetToken}`)}
              className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
            >
              Continue to Reset Password Form →
            </button>
          </div>
        )}

        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-600/30 transition-all"
            >
              {loading ? 'Sending Request...' : 'Send Reset Instructions'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
