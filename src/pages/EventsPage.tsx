import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { formatLocalDate, formatMad, translations } from '../i18n/translations.ts';
import { SafeImage } from '../components/BrandMark.tsx';

export function EventsPage() {
  const { lang, bootstrap } = useApp();
  const t = translations[lang];
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  const events = bootstrap?.events || [];
  const filtered = events.filter((e) => {
    if (filter === 'upcoming') return e.status === 'upcoming' || e.status === 'featured';
    if (filter === 'completed') return e.status === 'completed';
    return true;
  });

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <section className="bg-[#0A0A0B] text-white py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-[#D4AE5E] tracking-wider mb-3">
            Casablanca · Marrakech · Rabat
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
            {t.nav.events}
          </h1>
          <p className="mt-4 text-neutral-300 max-w-2xl">
            {lang === 'ar'
              ? 'الفعاليات القادمة والإنتاجات المنجزة تحت إشراف وكالة إيفنت برو.'
              : 'Calendrier des productions à venir et rétrospective des grands formats orchestrés par EVENT PRO.'}
          </p>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="inline-flex items-center gap-1 p-1 bg-neutral-200/70 rounded-lg mb-10">
          {[
            { id: 'all', fr: 'Tous', ar: 'الكل' },
            { id: 'upcoming', fr: 'À venir', ar: 'القادمة' },
            { id: 'completed', fr: 'Terminés', ar: 'المنجزة' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as 'all' | 'upcoming' | 'completed')}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                filter === tab.id ? 'bg-white text-[#0A0A0B] shadow-sm' : 'text-neutral-600'
              }`}
            >
              {lang === 'ar' ? tab.ar : tab.fr}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((evt) => (
            <article
              key={evt.id}
              className="bg-white border border-neutral-200 rounded-xl overflow-hidden flex flex-col"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <SafeImage
                  src={evt.imageUrl}
                  alt={lang === 'ar' ? evt.titleAr : evt.titleFr}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 sm:p-8 flex-1 flex flex-col">
                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mb-3 tabular-nums">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#B89038]" />
                    {formatLocalDate(evt.eventDate, lang)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#B89038]" />
                    {evt.venue}, {evt.city}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#B89038]" />
                    {evt.capacity} {lang === 'ar' ? 'مقعد' : 'places'}
                  </span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#0A0A0B]">
                  {lang === 'ar' ? evt.titleAr : evt.titleFr}
                </h2>
                <p className="mt-3 text-sm text-neutral-600 leading-relaxed flex-1">
                  {lang === 'ar' ? evt.descriptionAr : evt.descriptionFr}
                </p>
                <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#0A0A0B] tabular-nums">
                    {evt.ticketPriceMad > 0
                      ? formatMad(evt.ticketPriceMad, lang)
                      : lang === 'ar'
                        ? 'دخول بدعوة'
                        : 'Accès sur invitation'}
                  </span>
                  <Link
                    to="/reserver"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8E6B1E] hover:text-[#0A0A0B]"
                  >
                    {lang === 'ar' ? 'تنظيم فعالية مماثلة' : 'Organiser un format similaire'}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
