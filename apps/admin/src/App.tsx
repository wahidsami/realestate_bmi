import React, { useEffect, useState } from 'react';
import { AdminPanel } from '../../../packages/ui/src/components/AdminPanel';
import { useLanguage } from '../../../packages/ui/src/contexts/LanguageContext';
import { authRepository, getApiErrorMessage } from '@bina/shared';

let adminBootstrapPromise: Promise<{ status: 'authenticated' | 'unauthenticated'; user: { fullName?: string; email?: string } | null }> | null = null;
let adminAuthSnapshotMemory: AdminAuthSnapshot | null = null;

type AdminAuthSnapshot = {
  status: 'authenticated' | 'unauthenticated';
  user: { fullName?: string; email?: string } | null;
};

const readAdminAuthSnapshot = (): AdminAuthSnapshot | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const inMemorySnapshot = (window as any).__binaAdminAuthSnapshot as AdminAuthSnapshot | undefined;
  return inMemorySnapshot || adminAuthSnapshotMemory;
};

const persistAdminAuthSnapshot = (snapshot: AdminAuthSnapshot | null) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (snapshot) {
    adminAuthSnapshotMemory = snapshot;
    (window as any).__binaAdminAuthSnapshot = snapshot;
    return;
  }

  adminAuthSnapshotMemory = null;
  delete (window as any).__binaAdminAuthSnapshot;
};

const getAdminAuthSnapshot = (): AdminAuthSnapshot | null => {
  return readAdminAuthSnapshot();
};

const setAdminAuthSnapshot = (snapshot: AdminAuthSnapshot) => {
  persistAdminAuthSnapshot(snapshot);
};

const clearAdminAuthSnapshot = () => {
  persistAdminAuthSnapshot(null);
};

interface AdminAppProps {
  onBackToWebsite: () => void;
}

export function AdminApp({ onBackToWebsite }: AdminAppProps) {
  const { language, staticT } = useLanguage();
  const cachedAuth = getAdminAuthSnapshot();
  const [status, setStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [bootstrapComplete, setBootstrapComplete] = useState(false);
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState<{ fullName?: string; email?: string } | null>(cachedAuth?.user || null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleLogout = () => {
      setCurrentUser(null);
      setStatus('unauthenticated');
      clearAdminAuthSnapshot();
    };

    window.addEventListener('bina:auth:logout', handleLogout as EventListener);
    return () => window.removeEventListener('bina:auth:logout', handleLogout as EventListener);
  }, []);

  useEffect(() => {
    const bootstrapSession = async (): Promise<{ status: 'authenticated' | 'unauthenticated'; user: { fullName?: string; email?: string } | null }> => {
      try {
        if (authRepository.hasAccessToken()) {
          const result = await authRepository.me();
          const user = (result as { user?: { fullName?: string; email?: string } })?.user;
          return { status: 'authenticated', user: user || null };
        }

        if (authRepository.canAttemptRefresh()) {
          const refreshed = await authRepository.refresh();
          if (refreshed) {
            const result = await authRepository.me();
            const user = (result as { user?: { fullName?: string; email?: string } })?.user;
            return { status: 'authenticated', user: user || null };
          }
        }
      } catch {
        // fall through to login gate
      }

      return { status: 'unauthenticated', user: null };
    };

    if (!adminBootstrapPromise) {
      adminBootstrapPromise = bootstrapSession().finally(() => {
        adminBootstrapPromise = null;
      });
    }

    void adminBootstrapPromise
      .then((result) => {
        setCurrentUser(result.user);
        setStatus(result.status);
        setBootstrapComplete(true);
        if (result.status === 'authenticated') {
          setAdminAuthSnapshot(result);
        } else {
          clearAdminAuthSnapshot();
        }
      })
      .catch((error) => {
        console.error('Admin session bootstrap failed:', error);
        setCurrentUser(null);
        setStatus('unauthenticated');
        setBootstrapComplete(true);
        clearAdminAuthSnapshot();
      });
  }, []);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const result = await authRepository.login(identifier.trim(), password);
      const user = (result.user as { fullName?: string; email?: string } | undefined) || null;
      setCurrentUser(user);
      setStatus('authenticated');
      setAdminAuthSnapshot({ status: 'authenticated', user });
      setPassword('');
    } catch (err) {
      setError(getApiErrorMessage(err));
      setStatus('unauthenticated');
      clearAdminAuthSnapshot();
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setSubmitting(true);
    try {
      await authRepository.logout();
    } finally {
      setCurrentUser(null);
      setStatus('unauthenticated');
      clearAdminAuthSnapshot();
      setSubmitting(false);
    }
  };

  if (!bootstrapComplete || status === 'checking') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl shadow-black/40">
          <div className="mb-6">
            <div className="text-xs uppercase tracking-[0.35em] text-amber-300 font-black">
              {staticT('adminHeader')}
            </div>
            <h1 className="mt-3 text-3xl font-black leading-tight">
              {language === 'ar' ? 'جارٍ التحقق من الجلسة...' : 'Checking session...'}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {language === 'ar'
                ? 'يرجى الانتظار بينما نتحقق من حالة الدخول ونحمّل إعدادات الإدارة.'
                : 'Please wait while we verify your session and load the admin workspace.'}
            </p>
          </div>

          <div className="space-y-3">
            <div className="h-3 w-3/4 rounded-full bg-slate-800 animate-pulse" />
            <div className="h-3 w-full rounded-full bg-slate-800 animate-pulse" />
            <div className="h-3 w-5/6 rounded-full bg-slate-800 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl shadow-black/40">
          <div className="mb-6">
            <div className="text-xs uppercase tracking-[0.35em] text-amber-300 font-black">
              {staticT('adminHeader')}
            </div>
            <h1 className="mt-3 text-3xl font-black leading-tight">
              {language === 'ar' ? 'تسجيل دخول الإدارة' : 'Admin Sign In'}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {language === 'ar'
                ? 'استخدم بيانات الاعتماد المعتمدة للدخول إلى لوحة التحكم والوسائط والصفحات.'
                : 'Use approved credentials to access the dashboard, media, and pages.'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-xs font-bold text-slate-300">{language === 'ar' ? 'البريد الإلكتروني أو اسم المستخدم' : 'Email or Username'}</span>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-amber-300"
                autoComplete="username"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-bold text-slate-300">{language === 'ar' ? 'كلمة المرور' : 'Password'}</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-amber-300"
                autoComplete="current-password"
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:brightness-105 disabled:opacity-60"
            >
              {submitting ? (language === 'ar' ? 'جارٍ التحقق...' : 'Signing in...') : (language === 'ar' ? 'دخول الإدارة' : 'Sign In')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div id="admin-workspace-root" className="relative">
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 py-3 text-xs text-slate-300 backdrop-blur">
        <div>
          <span className="font-bold text-amber-300">{staticT('adminHeader')}</span>
          {currentUser?.fullName ? <span className="ml-2 text-slate-400">{currentUser.fullName}</span> : null}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={submitting}
            className="rounded-full border border-slate-700 px-3 py-1.5 font-bold text-slate-200 transition hover:border-amber-300 hover:text-amber-300 disabled:opacity-50"
          >
            {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
          </button>
          <button
            type="button"
            onClick={onBackToWebsite}
            className="rounded-full border border-slate-700 px-3 py-1.5 font-bold text-slate-200 transition hover:border-amber-300 hover:text-amber-300"
          >
            {staticT('backToWebsite')}
          </button>
        </div>
      </div>
      <AdminPanel onBackToWebsite={onBackToWebsite} />
    </div>
  );
}
