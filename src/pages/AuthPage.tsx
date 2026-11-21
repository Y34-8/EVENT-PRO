import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import { MOROCCAN_CITIES } from '../i18n/translations.ts';
import { api, getApiErrorMessage } from '../lib/api.ts';

export function AuthPage() {
  const { lang, user, loginWithGoogle, loginWithEmail, registerWithEmail } = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: 'Casablanca',
    password: '',
  });
  const [forgotEmail, setForgotEmail] = useState('');

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/espace-client', { replace: true });
    }
  }, [user, navigate]);

  const handleGoogle = async () => {
    setBusy(true);
    setError(null);
    try {
      const profile = await loginWithGoogle();
      navigate(profile.role === 'admin' ? '/admin' : '/espace-client');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Connexion Google annulée ou impossible.'));
    } finally {
      setBusy(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const profile = await loginWithEmail(loginForm.email, loginForm.password);
      navigate(profile.role === 'admin' ? '/admin' : '/espace-client');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const profile = await registerWithEmail(regForm);
      navigate(profile.role === 'admin' ? '/admin' : '/espace-client');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await api.post<{ message: string }>('/auth/forgot-password', {
        email: forgotEmail,
      });
      setInfo(res.data.message);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-[#FAFAFA] min-h-[82vh] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-xl p-8">
        <div className="text-center mb-7">
          <p className="text-xs font-semibold text-[#8E6B1E] tracking-wider mb-1">EVENT PRO</p>
          <h1 className="font-display text-3xl font-semibold text-[#0A0A0B]">
            {mode === 'login'
              ? lang === 'ar'
                ? 'تسجيل الدخول'
                : 'Connexion'
              : mode === 'register'
                ? lang === 'ar'
                  ? 'إنشاء حساب'
                  : 'Créer un compte'
                : lang === 'ar'
                  ? 'استعادة كلمة المرور'
                  : 'Mot de passe oublié'}
          </h1>
        </div>

        <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-lg mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              setInfo(null);
            }}
            className={`py-2 rounded-md cursor-pointer ${
              mode === 'login' ? 'bg-white text-[#0A0A0B] shadow-sm' : 'text-neutral-600'
            }`}
          >
            {lang === 'ar' ? 'دخول' : 'Connexion'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
              setInfo(null);
            }}
            className={`py-2 rounded-md cursor-pointer ${
              mode === 'register' ? 'bg-white text-[#0A0A0B] shadow-sm' : 'text-neutral-600'
            }`}
          >
            {lang === 'ar' ? 'تسجيل جديد' : 'Inscription'}
          </button>
        </div>

        {error && (
          <p className="mb-4 text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-2.5 rounded-lg">
            {error}
          </p>
        )}
        {info && (
          <p className="mb-4 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 rounded-lg">
            {info}
          </p>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {lang === 'ar' ? 'البريد الإلكتروني' : 'Adresse e-mail'}
              </label>
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {lang === 'ar' ? 'كلمة المرور' : 'Mot de passe'}
              </label>
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-xs text-neutral-600 hover:text-[#0A0A0B] underline cursor-pointer"
              >
                {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Mot de passe oublié ?'}
              </button>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 text-sm font-semibold bg-[#0A0A0B] text-white rounded-lg hover:bg-neutral-800 cursor-pointer"
            >
              {busy ? '...' : lang === 'ar' ? 'تسجيل الدخول' : 'Se connecter'}
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <input
              type="text"
              required
              placeholder={lang === 'ar' ? 'الاسم الكامل *' : 'Nom complet *'}
              value={regForm.fullName}
              onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
            />
            <input
              type="email"
              required
              placeholder={lang === 'ar' ? 'البريد الإلكتروني *' : 'Adresse e-mail *'}
              value={regForm.email}
              onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="tel"
                placeholder="+212 6 61 48 90 12"
                value={regForm.phone}
                onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
              />
              <select
                value={regForm.city}
                onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg bg-white"
              >
                {MOROCCAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="password"
              required
              minLength={8}
              placeholder={
                lang === 'ar' ? 'كلمة المرور (8 أحرف على الأقل)' : 'Mot de passe (8 caractères min.) *'
              }
              value={regForm.password}
              onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 text-sm font-semibold bg-[#0A0A0B] text-white rounded-lg hover:bg-neutral-800 cursor-pointer"
            >
              {busy ? '...' : lang === 'ar' ? 'إنشاء الحساب' : 'Créer mon compte'}
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <input
              type="email"
              required
              placeholder={lang === 'ar' ? 'بريدك الإلكتروني' : 'Votre adresse e-mail'}
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 text-sm font-semibold bg-[#0A0A0B] text-white rounded-lg cursor-pointer"
            >
              {lang === 'ar' ? 'إرسال رابط الاستعادة' : 'Réinitialiser le mot de passe'}
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full text-xs text-neutral-600 underline cursor-pointer"
            >
              {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Retour à la connexion'}
            </button>
          </form>
        )}

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-200" />
          <span className="text-xs text-neutral-400">{lang === 'ar' ? 'أو' : 'ou'}</span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy}
          className="w-full py-3 px-4 border border-neutral-300 rounded-lg text-sm font-medium text-[#0A0A0B] hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
            />
          </svg>
          <span>{lang === 'ar' ? 'المتابعة عبر Google' : 'Continuer avec Google'}</span>
        </button>
      </div>
    </div>
  );
}
