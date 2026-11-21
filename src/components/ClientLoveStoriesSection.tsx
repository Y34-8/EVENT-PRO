import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Quote, Star } from 'lucide-react';
import { Lang, ReviewItem } from '../types/index.ts';

function getInitials(name: string): string {
  const cleaned = name
    .replace(/&/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (cleaned.length === 0) return 'EP';
  if (cleaned.length === 1) return cleaned[0].slice(0, 2).toUpperCase();
  return `${cleaned[0][0]}${cleaned[cleaned.length - 1][0]}`.toUpperCase();
}

interface ClientLoveStoriesSectionProps {
  lang: Lang;
  reviews: ReviewItem[];
}

export function ClientLoveStoriesSection({ lang, reviews }: ClientLoveStoriesSectionProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleReviews = showAll ? reviews : reviews.slice(0, 6);

  return (
    <section
      aria-labelledby="client-love-stories-heading"
      className="py-20 lg:py-24 bg-[#FAFAFA]"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#8E6B1E] mb-3">
              {lang === 'ar'
                ? 'شهادات عملائنا · الدار البيضاء والمغرب'
                : 'Témoignages clients · Casablanca & Maroc'}
            </p>
            <h2
              id="client-love-stories-heading"
              className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#0A0A0B] text-balance"
            >
              Client Love Stories
            </h2>
            <p className="mt-3 text-base text-neutral-600 max-w-2xl">
              {lang === 'ar'
                ? 'قصص حقيقية لعائلات وشركات وثقت بإيفنت برو لتنظيم أهم لحظاتها ومؤتمراتها.'
                : 'Récits authentiques de couples, dirigeants et institutions qui nous ont confié leurs moments décisifs.'}
            </p>
          </div>

          <Link
            to="/reserver"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A0A0B] hover:text-[#8E6B1E] transition-colors whitespace-nowrap shrink-0"
          >
            {lang === 'ar' ? 'ابدأ قصتك معنا' : 'Planifier votre événement'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {visibleReviews.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center text-sm text-neutral-500">
            {lang === 'ar'
              ? 'لا توجد شهادات منشورة حالياً.'
              : 'Aucun témoignage publié pour le moment.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleReviews.map((rev, idx) => (
              <blockquote
                key={rev.id}
                className="bg-white border border-neutral-200 rounded-2xl p-8 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div
                      className="flex items-center gap-1 text-[#B89038]"
                      aria-label={`${rev.rating} sur 5`}
                    >
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <Quote
                      className="w-5 h-5 text-[#B89038]/55 shrink-0"
                      strokeWidth={1.6}
                      aria-hidden="true"
                    />
                  </div>

                  <p className="text-[15px] text-neutral-700 leading-relaxed">
                    « {lang === 'ar' ? rev.commentAr : rev.commentFr} »
                  </p>
                </div>

                <footer className="mt-8 pt-5 border-t border-neutral-100 flex items-center gap-3.5">
                  <div
                    aria-hidden="true"
                    className="w-11 h-11 rounded-full bg-[#0A0A0B] text-[#D4AE5E] font-display text-base font-semibold flex items-center justify-center shrink-0"
                  >
                    {getInitials(rev.clientName)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-display text-xl font-semibold text-[#0A0A0B] truncate">
                        {rev.clientName}
                      </p>
                      <span className="font-mono text-[11px] text-neutral-400 tabular-nums shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5 truncate">
                      {rev.clientRole}
                      <span aria-hidden="true"> · </span>
                      {rev.companyOrEvent}
                    </p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        )}

        {reviews.length > 6 && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold border border-neutral-300 bg-white text-[#0A0A0B] rounded-lg hover:bg-[#0A0A0B] hover:text-white transition-colors cursor-pointer"
            >
              {showAll
                ? lang === 'ar'
                  ? 'عرض أقل'
                  : 'Afficher moins'
                : lang === 'ar'
                  ? `عرض جميع الشهادات (${reviews.length})`
                  : `Voir tous les témoignages (${reviews.length})`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
