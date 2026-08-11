import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { BookOpen, Lock, User, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/api/auth/login', { username, password });
      const { token, role, username: responseUser } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('username', responseUser);
      localStorage.setItem('role', role);
      
      navigate('/');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please check your credentials or database status.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-[#070b13] text-slate-100">
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 card-animate">
        <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/20 shadow-xl mb-4 text-amber-400">
          <BookOpen className="h-9 w-9" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Lending Notebook</h2>
        <p className="mt-1.5 text-xs text-slate-400 font-bold uppercase tracking-widest">
          Digital record keeper for personal lending
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 card-animate">
        <div className="glass-panel bg-slate-900/35 py-8 px-6 shadow-2xl rounded-3xl border border-white/5 sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl flex items-start gap-2.5 text-xs">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-400 mt-0.5" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Admin Username
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-3 glass-input text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm w-full"
                  placeholder="e.g. admin"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-3 glass-input text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm w-full"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 transition-all duration-300 btn-animate shadow-amber-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign in to Ledger'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-[10px] text-slate-500 border-t border-white/5 pt-4">
            <p>Default credentials: <strong className="text-amber-400/80">admin</strong> / <strong className="text-amber-400/80">admin123</strong></p>
          </div>

          <div className="mt-4 text-center text-xs">
            <span className="text-slate-500">Don't have an account? </span>
            <Link to="/register" className="font-bold text-amber-400 hover:text-amber-300 transition-colors">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
