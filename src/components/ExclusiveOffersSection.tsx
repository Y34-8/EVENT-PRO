import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { EXCLUSIVE_OFFERS, formatDh } from '../lib/offers.ts';
import { Lang, ServiceItem } from '../types/index.ts';
import { SafeImage } from './BrandMark.tsx';

interface ExclusiveOffersSectionProps {
  lang: Lang;
  services: ServiceItem[];
}

export function ExclusiveOffersSection({ lang, services }: ExclusiveOffersSectionProps) {
  return (
    <section
      aria-labelledby="exclusive-offers-heading"
      className="py-20 lg:py-24 bg-[#FAFAFA] border-t border-neutral-200"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#8E6B1E] mb-3">
              {lang === 'ar'
                ? 'عروض موسمية مختارة · الدار البيضاء والمغرب'
                : 'Tarifs privilèges · Casablanca & Maroc'}
            </p>
            <h2
              id="exclusive-offers-heading"
              className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#0A0A0B] text-balance"
            >
              Exclusive Offers
            </h2>
            <p className="mt-3 text-base text-neutral-600 max-w-2xl">
              {lang === 'ar'
                ? 'استفيدوا من تخفيضات حصرية بالدرهم المغربي على باقاتنا الرئيسية عند الحجز عبر المنصة.'
                : 'Profitez d’avantages tarifaires en DH sur nos prestations événementielles phares en réservant directement en ligne.'}
            </p>
          </div>
          <Link
            to="/reserver"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A0A0B] hover:text-[#8E6B1E] transition-colors whitespace-nowrap shrink-0"
          >
            {lang === 'ar' ? 'احجز عرضاً الآن' : 'Réserver une offre'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {EXCLUSIVE_OFFERS.map((offer) => {
            const matchedService = services.find((s) => s.slug === offer.serviceSlug);
            const oldPrice = matchedService?.basePriceMad || offer.oldPriceDh;
            const newPrice = Math.round(oldPrice * (1 - offer.discountPercent / 100));
            const savings = oldPrice - newPrice;

            const bookingHref = `/reserver?${new URLSearchParams({
              ...(matchedService ? { serviceId: String(matchedService.id) } : {}),
              promo: offer.code,
            }).toString()}`;

            return (
              <article
                key={offer.code}
                className="group bg-white border border-neutral-200 rounded-xl overflow-hidden flex flex-col sm:flex-row transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="sm:w-2/5 aspect-[4/3] sm:aspect-auto overflow-hidden bg-neutral-100 relative">
                  <SafeImage
                    src={offer.imageUrl}
                    alt={lang === 'ar' ? offer.titleAr : offer.titleFr}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="sm:w-3/5 p-6 sm:p-7 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 mb-2 tabular-nums">
                      <span className="font-mono font-semibold text-[#8E6B1E]">
                        {offer.code}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-[#0A0A0B]">
                        -{offer.discountPercent} %
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{lang === 'ar' ? offer.validUntilAr : offer.validUntilFr}</span>
                    </div>

                    <h3 className="font-display text-2xl font-semibold text-[#0A0A0B] leading-snug">
                      {lang === 'ar' ? offer.titleAr : offer.titleFr}
                    </h3>

                    <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                      {lang === 'ar' ? offer.descAr : offer.descFr}
                    </p>

                    <ul className="mt-4 space-y-1.5 text-xs text-neutral-700">
                      {(lang === 'ar' ? offer.highlightsAr : offer.highlightsFr).map((h, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#B89038] shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-5 border-t border-neutral-100 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-sm text-neutral-400 line-through tabular-nums">
                          {formatDh(oldPrice, lang)}
                        </span>
                        <span className="text-xs font-medium text-[#8E6B1E] tabular-nums">
                          {lang === 'ar'
                            ? `وفر ${formatDh(savings, lang)}`
                            : `-${formatDh(savings, lang)}`}
                        </span>
                      </div>
                      <p className="font-display text-3xl font-semibold text-[#0A0A0B] tabular-nums mt-0.5">
                        {formatDh(newPrice, lang)}
                      </p>
                    </div>

                    <Link
                      to={bookingHref}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-[#0A0A0B] text-white rounded-lg hover:bg-[#B89038] hover:text-[#0A0A0B] transition-colors whitespace-nowrap shrink-0"
                    >
                      {lang === 'ar' ? 'استفد من العرض' : 'Profiter de l’offre'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
