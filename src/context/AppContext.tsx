import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { api, setApiTokenProvider } from '../lib/api.ts';
import { BootstrapPayload, Lang, UserProfile } from '../types/index.ts';

interface AppContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  bootstrap: BootstrapPayload | null;
  loadingBootstrap: boolean;
  refreshBootstrap: () => Promise<void>;
  user: UserProfile | null;
  authLoading: boolean;
  loginWithGoogle: () => Promise<UserProfile>;
  loginWithEmail: (email: string, password: string) => Promise<UserProfile>;
  registerWithEmail: (payload: {
    fullName: string;
    email: string;
    phone: string;
    city: string;
    password: string;
  }) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr');
  const [bootstrap, setBootstrap] = useState<BootstrapPayload | null>(null);
  const [loadingBootstrap, setLoadingBootstrap] = useState(true);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // In-memory session token for email/password accounts (never localStorage)
  const localTokenRef = useRef<string | null>(null);
  const firebaseUserRef = useRef<FirebaseUser | null>(null);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    setApiTokenProvider(async () => {
      if (localTokenRef.current) return localTokenRef.current;
      if (firebaseUserRef.current) {
        return firebaseUserRef.current.getIdToken();
      }
      return null;
    });
  }, []);

  const refreshBootstrap = useCallback(async () => {
    try {
      const res = await api.get<BootstrapPayload>('/public/bootstrap');
      setBootstrap(res.data);
    } catch (err) {
      console.error('Failed to load bootstrap data:', err);
    } finally {
      setLoadingBootstrap(false);
    }
  }, []);

  useEffect(() => {
    void refreshBootstrap();
  }, [refreshBootstrap]);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await api.get<{ user: UserProfile }>('/auth/me');
      setUser(res.data.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      firebaseUserRef.current = fbUser;
      if (fbUser) {
        localTokenRef.current = null;
        try {
          const res = await api.get<{ user: UserProfile }>('/auth/me');
          setUser(res.data.user);
        } catch {
          setUser(null);
        }
      } else if (!localTokenRef.current) {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const loginWithGoogle = useCallback(async (): Promise<UserProfile> => {
    const cred = await signInWithPopup(auth, googleAuthProvider);
    firebaseUserRef.current = cred.user;
    localTokenRef.current = null;
    const res = await api.get<{ user: UserProfile }>('/auth/me');
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string): Promise<UserProfile> => {
    const res = await api.post<{ token: string; user: UserProfile }>('/auth/login', {
      email,
      password,
    });
    localTokenRef.current = res.data.token;
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const registerWithEmail = useCallback(
    async (payload: {
      fullName: string;
      email: string;
      phone: string;
      city: string;
      password: string;
    }): Promise<UserProfile> => {
      const res = await api.post<{ token: string; user: UserProfile }>('/auth/register', payload);
      localTokenRef.current = res.data.token;
      setUser(res.data.user);
      return res.data.user;
    },
    []
  );

  const logout = useCallback(async () => {
    localTokenRef.current = null;
    if (firebaseUserRef.current) {
      await signOut(auth);
      firebaseUserRef.current = null;
    }
    setUser(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        bootstrap,
        loadingBootstrap,
        refreshBootstrap,
        user,
        authLoading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
