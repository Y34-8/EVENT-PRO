import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, User, Shield, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../i18n/translations.ts';
import { BrandLogo } from './BrandMark.tsx';

export function Layout({ children }: { children: React.ReactNode }) {
  const { lang, setLang, user, logout, bootstrap } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const t = translations[lang];
  const company = bootstrap?.settings?.companyInfo;

  const navLinks = [
    { to: '/', label: t.nav.home },
    { to: '/evenements', label: t.nav.events },
    { to: '/services', label: t.nav.services },
    { to: '/realisations', label: t.nav.portfolio },
    { to: '/a-propos', label: t.nav.about },
    { to: '/contact', label: t.nav.contact },
  ];

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#111113]">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
          <Link to="/" className="shrink-0 focus-visible:outline-2 focus-visible:outline-[#B89038]">
            <BrandLogo />
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                    isActive
                      ? 'text-[#0A0A0B] border-[#B89038]'
                      : 'text-neutral-600 border-transparent hover:text-[#0A0A0B] hover:border-neutral-300'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4 shrink-0">
            <div
              className="flex items-center border border-neutral-200 rounded-md overflow-hidden text-xs font-medium"
              role="group"
              aria-label="Langue"
            >
              <button
                type="button"
                onClick={() => setLang('fr')}
                className={`px-2.5 py-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  lang === 'fr' ? 'bg-[#0A0A0B] text-white' : 'bg-white text-neutral-600 hover:text-black'
                }`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setLang('ar')}
                className={`px-2.5 py-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  lang === 'ar' ? 'bg-[#0A0A0B] text-white' : 'bg-white text-neutral-600 hover:text-black'
                }`}
              >
                العربية
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8E6B1E] hover:text-[#0A0A0B] whitespace-nowrap shrink-0"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    {t.nav.admin}
                  </Link>
                )}
                <Link
                  to="/espace-client"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-[#0A0A0B] whitespace-nowrap shrink-0"
                >
                  <User className="w-4 h-4" />
                  {t.nav.account}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  title={t.nav.logout}
                  className="p-2 text-neutral-500 hover:text-[#0A0A0B] transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/connexion"
                className="text-sm font-medium text-neutral-700 hover:text-[#0A0A0B] whitespace-nowrap shrink-0 transition-colors"
              >
                {t.nav.login}
              </Link>
            )}

            <Link
              to="/reserver"
              className="px-4 py-2 text-xs font-semibold tracking-wide bg-[#0A0A0B] text-white rounded-lg hover:bg-[#B89038] hover:text-[#0A0A0B] transition-colors duration-200 whitespace-nowrap shrink-0"
            >
              {t.nav.bookNow}
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden p-2.5 text-neutral-800 hover:bg-neutral-100 rounded-lg cursor-pointer"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white px-4 py-4 space-y-3">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive ? 'bg-neutral-100 text-[#0A0A0B]' : 'text-neutral-600'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="pt-3 border-t border-neutral-200 flex items-center justify-between gap-3">
              <div className="flex items-center border border-neutral-200 rounded-md overflow-hidden text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setLang('fr')}
                  className={`px-3 py-1.5 ${lang === 'fr' ? 'bg-[#0A0A0B] text-white' : 'bg-white'}`}
                >
                  FR
                </button>
                <button
                  type="button"
                  onClick={() => setLang('ar')}
                  className={`px-3 py-1.5 ${lang === 'ar' ? 'bg-[#0A0A0B] text-white' : 'bg-white'}`}
                >
                  العربية
                </button>
              </div>

              {user ? (
                <div className="flex items-center gap-3">
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="text-xs font-semibold text-[#8E6B1E]"
                    >
                      {t.nav.admin}
                    </Link>
                  )}
                  <Link
                    to="/espace-client"
                    onClick={() => setMobileOpen(false)}
                    className="text-sm font-medium text-neutral-900"
                  >
                    {t.nav.account}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-xs text-neutral-500 underline"
                  >
                    {t.nav.logout}
                  </button>
                </div>
              ) : (
                <Link
                  to="/connexion"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-neutral-900"
                >
                  {t.nav.login}
                </Link>
              )}
            </div>

            <Link
              to="/reserver"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center px-4 py-3 text-sm font-semibold bg-[#0A0A0B] text-white rounded-lg"
            >
              {t.nav.bookNow}
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-[#0A0A0B] text-neutral-300 border-t border-neutral-800">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <BrandLogo dark />
            <p className="text-sm text-neutral-400 leading-relaxed max-w-xs">
              {lang === 'ar'
                ? 'وكالة متخصصة في تنظيم وتنسيق الفعاليات الراقية في الدار البيضاء وجميع أنحاء المغرب.'
                : 'Maison d\'organisation et de scénographie événementielle basée à Casablanca, intervenant partout au Maroc.'}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-[#C59B41] tracking-wider mb-4">
              {lang === 'ar' ? 'التنقل' : 'Navigation'}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {navLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/reserver" className="text-[#C59B41] hover:text-white transition-colors">
                  {t.nav.bookNow}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-[#C59B41] tracking-wider mb-4">
              {lang === 'ar' ? 'المقر الرئيسي' : 'Siège Casablanca'}
            </h3>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>{company?.address || "28 Boulevard d'Anfa, 20000 Casablanca"}</li>
              <li className="tabular-nums">{company?.phone || '+212 522 48 90 12'}</li>
              <li>{company?.email || 'contact@eventpro.ma'}</li>
              <li>
                {lang === 'ar'
                  ? company?.hoursAr || 'الإثنين – السبت: 09:00 – 19:00'
                  : company?.hoursFr || 'Lun – Sam : 09h00 – 19h00'}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-[#C59B41] tracking-wider mb-4">
              {lang === 'ar' ? 'الشبكات الاجتماعية' : 'Réseaux & Accès'}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {company?.instagram && (
                <li>
                  <a
                    href={company.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Instagram
                  </a>
                </li>
              )}
              {company?.linkedin && (
                <li>
                  <a
                    href={company.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    LinkedIn
                  </a>
                </li>
              )}
              {company?.facebook && (
                <li>
                  <a
                    href={company.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Facebook
                  </a>
                </li>
              )}
              <li>
                <Link to="/espace-client" className="hover:text-white transition-colors">
                  {t.nav.account}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800/80 py-5 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>
            © {new Date().getFullYear()} EVENT PRO Maroc.{' '}
            {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'Tous droits réservés.'}
          </p>
          <p>Casablanca · Rabat · Marrakech · Tanger</p>
        </div>
      </footer>
    </div>
  );
}
