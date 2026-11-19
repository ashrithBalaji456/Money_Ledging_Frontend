import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { BookOpen, Lock, User, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { Capacitor } from '@capacitor/core';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/api/auth/register', { username, password });
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Signup failed. Username may already exist or backend is unreachable.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '434137508884-ovbes788jb0jj372pksmovp7h4q48rec.apps.googleusercontent.com';

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      setError('');
      try {
        const response = await api.post('/api/auth/google', {
          accessToken: tokenResponse.access_token,
        });
        const { token, role, username: responseUser } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('username', responseUser);
        localStorage.setItem('role', role);

        navigate('/');
      } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Google registration failed. Please check backend status.');
        }
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      setError('Google Sign-in was cancelled or encountered an error.');
    },
  });

  const handleGoogleClick = async () => {
    if (Capacitor.isNativePlatform()) {
      setIsGoogleLoading(true);
      setError('');
      try {
        await SocialLogin.initialize({
          google: {
            webClientId: googleClientId,
          },
        });
        const res = await SocialLogin.login({
          provider: 'google',
          options: {},
        });

        const idToken = res?.result?.idToken || res?.result?.token;
        const accessToken = res?.result?.accessToken;

        const response = await api.post('/api/auth/google', {
          idToken: idToken,
          accessToken: accessToken,
        });

        const { token, role, username: responseUser } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('username', responseUser);
        localStorage.setItem('role', role);
        navigate('/');
      } catch (err) {
        if (err?.response?.data?.message) {
          setError(err.response.data.message);
        } else if (err?.message) {
          setError(err.message);
        } else {
          setError('Native Google Sign-in was cancelled or encountered an error.');
        }
      } finally {
        setIsGoogleLoading(false);
      }
      return;
    }

    if (!googleClientId || googleClientId.trim() === '' || googleClientId === 'dummy-google-client-id') {
      setError('Google OAuth Client ID is not configured yet. Please set VITE_GOOGLE_CLIENT_ID in your environment variables.');
      return;
    }
    triggerGoogleLogin();
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
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Create Account</h2>
        <p className="mt-1.5 text-xs text-slate-400 font-bold uppercase tracking-widest">
          Register for Lending Notebook Admin
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10 card-animate">
        <div className="glass-panel bg-slate-900/35 py-8 px-6 shadow-2xl rounded-3xl border border-white/5 sm:px-10">
          <form className="space-y-5" onSubmit={handleSignup}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl flex items-start gap-2.5 text-xs">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-400 mt-0.5" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/20 text-emerald-400 p-3.5 rounded-xl flex items-start gap-2.5 text-xs">
                <CheckCircle className="h-4.5 w-4.5 shrink-0 text-emerald-400 mt-0.5" />
                <span className="font-semibold">{success}</span>
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
                  className="block w-full pl-10 pr-3.5 py-3 glass-input text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
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
                  className="block w-full pl-10 pr-3.5 py-3 glass-input text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-3 glass-input text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Side-by-side Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 transition-all duration-300 btn-animate shadow-amber-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Registering...' : 'Register Account'}
              </button>

              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={isLoading || isGoogleLoading}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-xs sm:text-sm font-semibold text-slate-100 transition-all duration-300 btn-animate shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGoogleLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />
                ) : (
                  <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                )}
                <span>{isGoogleLoading ? 'Connecting...' : 'Continue with Gmail'}</span>
              </button>
            </div>
          </form>

          <div className="mt-5 text-center text-xs">
            <span className="text-slate-500">Already have an account? </span>
            <Link to="/login" className="font-bold text-amber-400 hover:text-amber-300 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
