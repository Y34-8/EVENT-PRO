import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { formatMad, translations } from '../i18n/translations.ts';
import { SafeImage } from '../components/BrandMark.tsx';

export function ServicesPage() {
  const { lang, bootstrap, loadingBootstrap } = useApp();
  const t = translations[lang];
  const [selectedCat, setSelectedCat] = useState<number | 'all'>('all');
  const [query, setQuery] = useState('');

  const categories = bootstrap?.categories || [];
  const services = bootstrap?.services || [];

  const filtered = services.filter((s) => {
    if (selectedCat !== 'all' && s.categoryId !== selectedCat) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      return (
        s.titleFr.toLowerCase().includes(q) ||
        s.titleAr.toLowerCase().includes(q) ||
        s.shortDescFr.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <section className="bg-[#0A0A0B] text-white py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-[#D4AE5E] tracking-wider mb-3">
            {lang === 'ar' ? '12 تخصصاً متكاملاً' : 'Catalogue complet · 12 expertises'}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
            {t.nav.services}
          </h1>
          <p className="mt-4 text-neutral-300 max-w-2xl">
            {lang === 'ar'
              ? 'اكتشفوا جميع خدماتنا لتنظيم الأعراس والمؤتمرات والسهرات الخاصة والفعاليات المهنية في الدار البيضاء والمغرب.'
              : 'Découvrez l\'ensemble de nos prestations événementielles avec tarifs indicatifs en MAD, options sur mesure et réservation en ligne.'}
          </p>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-200/70 rounded-lg">
            <button
              type="button"
              onClick={() => setSelectedCat('all')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                selectedCat === 'all'
                  ? 'bg-white text-[#0A0A0B] shadow-sm'
                  : 'text-neutral-600 hover:text-[#0A0A0B]'
              }`}
            >
              {lang === 'ar' ? 'الكل (12)' : `Toutes (${services.length})`}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCat(cat.id)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCat === cat.id
                    ? 'bg-white text-[#0A0A0B] shadow-sm'
                    : 'text-neutral-600 hover:text-[#0A0A0B]'
                }`}
              >
                {lang === 'ar' ? cat.nameAr : cat.nameFr}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-neutral-400 absolute top-1/2 -translate-y-1/2 start-3.5" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'ابحث عن خدمة...' : 'Rechercher une prestation...'}
              className="w-full ps-10 pe-4 py-2.5 text-sm bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0A0A0B]"
            />
          </div>
        </div>

        {loadingBootstrap ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-96 bg-neutral-200/60 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
            <p className="text-neutral-600">
              {lang === 'ar' ? 'لا توجد خدمات مطابقة لبحثكم.' : 'Aucun service ne correspond à votre recherche.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((service) => (
              <article
                key={service.id}
                className="group bg-white border border-neutral-200 rounded-xl overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                  <SafeImage
                    src={service.imageUrl}
                    alt={lang === 'ar' ? service.titleAr : service.titleFr}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-xs text-neutral-500 mb-1.5 tabular-nums">
                    {lang === 'ar' ? service.priceUnitAr : service.priceUnitFr}{' '}
                    <strong className="text-[#0A0A0B] font-semibold">
                      {formatMad(service.basePriceMad, lang)}
                    </strong>
                  </p>
                  <h2 className="font-display text-2xl font-semibold text-[#0A0A0B]">
                    {lang === 'ar' ? service.titleAr : service.titleFr}
                  </h2>
                  <p className="mt-2.5 text-sm text-neutral-600 leading-relaxed flex-1">
                    {lang === 'ar' ? service.shortDescAr : service.shortDescFr}
                  </p>
                  <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between gap-4">
                    <Link
                      to={`/services/${service.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#0A0A0B] text-white rounded-lg hover:bg-[#B89038] hover:text-[#0A0A0B] transition-colors"
                    >
                      {t.actions.discover}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      to={`/reserver?serviceId=${service.id}`}
                      className="text-xs font-semibold text-[#8E6B1E] hover:underline"
                    >
                      {t.nav.bookNow}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
