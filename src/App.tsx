import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext.tsx';
import { Layout } from './components/Layout.tsx';
import { GoldenCursor } from './components/GoldenCursor.tsx';
import { ScrollProgressBar } from './components/ScrollProgressBar.tsx';
import { SplashLoader } from './components/SplashLoader.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { ServicesPage } from './pages/ServicesPage.tsx';
import { ServiceDetailPage } from './pages/ServiceDetailPage.tsx';
import { EventsPage } from './pages/EventsPage.tsx';
import { PortfolioPage } from './pages/PortfolioPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { BookingPage } from './pages/BookingPage.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import { ClientPortalPage } from './pages/ClientPortalPage.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';

export default function App() {
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  useEffect(() => {
    const handler = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handler);
    return () => window.removeEventListener('gmp-quota-exceeded', handler);
  }, []);

  return (
    <AppProvider>
      <BrowserRouter>
        <SplashLoader />
        <ScrollProgressBar />
        <GoldenCursor />
        {mapsQuotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:slug" element={<ServiceDetailPage />} />
            <Route path="/evenements" element={<EventsPage />} />
            <Route path="/realisations" element={<PortfolioPage />} />
            <Route path="/a-propos" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/reserver" element={<BookingPage />} />
            <Route path="/connexion" element={<AuthPage />} />
            <Route path="/espace-client" element={<ClientPortalPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
