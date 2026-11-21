import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../i18n/translations.ts';
import { MasonryGallerySection } from '../components/MasonryGallerySection.tsx';
import { BeforeAfterGallerySection } from '../components/BeforeAfterGallerySection.tsx';

export function PortfolioPage() {
  const { lang, bootstrap } = useApp();
  const t = translations[lang];
  const items = bootstrap?.gallery || [];
  const services = bootstrap?.services || [];

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <section className="bg-[#0A0A0B] text-white py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-[#D4AE5E] tracking-wider mb-3">
            {lang === 'ar' ? 'معرض الأعمال' : 'Portfolio & Scénographies'}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
            {t.nav.portfolio}
          </h1>
          <p className="mt-4 text-neutral-300 max-w-2xl">
            {lang === 'ar'
              ? 'مختارات من حفلات الزفاف والمؤتمرات والديكورات التي أنجزناها في المغرب.'
              : 'Sélection de nos mariages, décors sur mesure, soirées privées et événements professionnels orchestrés à Casablanca et dans tout le Royaume.'}
          </p>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <MasonryGallerySection items={items} lang={lang} showExtendedFilters />
      </section>

      <BeforeAfterGallerySection lang={lang} services={services} variant="portfolio" />
    </div>
  );
}
