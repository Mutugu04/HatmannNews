
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      if (isRegistering) {
        await register(email, password, firstName, lastName);
        setSuccess('Account provisioned! Please sign in with your new credentials.');
        setIsRegistering(false);
        setPassword('');
      } else {
        await login(email, password);
        setTimeout(() => navigate('/dashboard'), 300);
      }
    } catch (err: any) {
      console.error('[NewsVortex] Auth Error:', err);
      let message = err.message || 'Authentication sequence failed.';
      
      if (err.message === 'Invalid login credentials') {
        message = 'Invalid secure identifier or access key. Please verify and retry.';
      } else if (err.message.includes('User already registered')) {
        message = 'This identity already exists in the cluster. Please log in instead.';
      }
      
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('admin@newsvortex.com');
    setPassword('password123');
    setIsRegistering(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md border border-slate-100 animate-in fade-in zoom-in-95 duration-500 overflow-hidden relative">
        {/* Header Section */}
        <div className="mb-10 text-center relative z-10">
          <div className="w-20 h-20 bg-primary-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-600/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-3">NewsVortex</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
            {isRegistering ? 'Provision New Access' : 'Secure Operational Login'}
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-5 rounded-2xl mb-8 flex items-start gap-4 animate-in slide-in-from-top-2 duration-300">
            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            <p className="text-[10px] font-black uppercase leading-tight tracking-tight">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-5 rounded-2xl mb-8 flex items-start gap-4 animate-in slide-in-from-top-2 duration-300">
            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            <p className="text-[10px] font-black uppercase leading-tight tracking-tight">{success}</p>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {isRegistering && (
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-left-4 duration-300">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Abbas"
                  className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 text-xs font-black text-slate-900 focus:ring-4 focus:ring-primary-500/10 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Dalhatu"
                  className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 text-xs font-black text-slate-900 focus:ring-4 focus:ring-primary-500/10 transition-all"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Secure Identifier</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@cluster.com"
              className="w-full bg-slate-50 border-0 rounded-2xl px-6 py-4 text-xs font-black text-slate-900 focus:ring-4 focus:ring-primary-500/10 transition-all placeholder:text-slate-200"
              required
            />
          </div>

          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Access Key</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border-0 rounded-2xl px-6 py-4 text-xs font-black text-slate-900 focus:ring-4 focus:ring-primary-500/10 transition-all placeholder:text-slate-200"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 text-white py-5 rounded-2xl hover:bg-primary-700 disabled:opacity-50 transition-all font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary-600/30 active:scale-[0.98]"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Negotiating...
              </span>
            ) : isRegistering ? 'Provision Access' : 'Establish Connection'}
          </button>
        </form>
        
        {/* Toggle & Tools */}
        <div className="mt-10 pt-8 border-t border-slate-50 flex flex-col gap-6 relative z-10">
          <button 
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
              setSuccess('');
            }}
            className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-700 transition-colors"
          >
            {isRegistering ? 'Already have access? Sign In' : "Don't have access? Register Identity"}
          </button>
          
          <div className="flex justify-between items-center text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] px-2">
            <button onClick={fillDemo} className="hover:text-primary-600 transition-colors">Load Demo Node</button>
            <span>v3.5 Cluster STABLE</span>
          </div>
        </div>

        {/* Decorative Background Blur */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary-600/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
