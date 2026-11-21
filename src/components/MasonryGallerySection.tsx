import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { GalleryItem, Lang } from '../types/index.ts';
import { SafeImage } from './BrandMark.tsx';

export interface MasonryFilterOption {
  id: string;
  fr: string;
  ar: string;
}

const CORE_FILTERS: MasonryFilterOption[] = [
  { id: 'all', fr: 'Toutes', ar: 'الكل' },
  { id: 'mariages', fr: 'Mariages', ar: 'الأعراس' },
  { id: 'decorations', fr: 'Décorations', ar: 'الديكور' },
  { id: 'soirees', fr: 'Soirées', ar: 'السهرات' },
  { id: 'professionnels', fr: 'Événements professionnels', ar: 'الفعاليات المهنية' },
];

const EXTENDED_FILTERS: MasonryFilterOption[] = [
  ...CORE_FILTERS,
  { id: 'conferences', fr: 'Conférences', ar: 'المؤتمرات' },
  { id: 'anniversaires', fr: 'Anniversaires', ar: 'أعياد الميلاد' },
];

const CATEGORY_LABELS: Record<string, { fr: string; ar: string }> = {
  mariages: { fr: 'Mariages', ar: 'الأعراس' },
  decorations: { fr: 'Décorations', ar: 'الديكور' },
  soirees: { fr: 'Soirées', ar: 'السهرات' },
  professionnels: { fr: 'Événements professionnels', ar: 'الفعاليات المهنية' },
  conferences: { fr: 'Conférences', ar: 'المؤتمرات' },
  anniversaires: { fr: 'Anniversaires', ar: 'أعياد الميلاد' },
};

function getMasonryAspectClass(imageUrl: string, index: number): string {
  if (
    imageUrl.includes('masonry_wedding_courtyard') ||
    imageUrl.includes('masonry_decor_tablescape') ||
    imageUrl.includes('masonry_corporate_gala')
  ) {
    return 'aspect-[3/4]';
  }
  if (imageUrl.includes('masonry_soiree_rooftop')) {
    return 'aspect-square';
  }
  const fallbackPattern = ['aspect-[4/3]', 'aspect-[4/5]', 'aspect-[16/10]', 'aspect-square'];
  return fallbackPattern[index % fallbackPattern.length];
}

interface MasonryGallerySectionProps {
  items: GalleryItem[];
  lang: Lang;
  showExtendedFilters?: boolean;
  maxItems?: number;
}

export function MasonryGallerySection({
  items,
  lang,
  showExtendedFilters = false,
  maxItems,
}: MasonryGallerySectionProps) {
  const [filter, setFilter] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filterOptions = showExtendedFilters ? EXTENDED_FILTERS : CORE_FILTERS;

  const filteredItems = useMemo(() => {
    const base =
      filter === 'all'
        ? items
        : items.filter((it) => it.category === filter);
    return typeof maxItems === 'number' ? base.slice(0, maxItems) : base;
  }, [items, filter, maxItems]);

  const activeItem =
    lightboxIndex !== null && filteredItems[lightboxIndex]
      ? filteredItems[lightboxIndex]
      : null;

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % filteredItems.length
        );
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev - 1 + filteredItems.length) % filteredItems.length
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, filteredItems.length]);

  useEffect(() => {
    setLightboxIndex(null);
  }, [filter]);

  return (
    <div>
      {/* Interactive Category Filter Controls */}
      <div
        role="tablist"
        aria-label={lang === 'ar' ? 'تصنيف الصور' : 'Filtrer la galerie par catégorie'}
        className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-200/75 rounded-lg mb-10 w-fit"
      >
        {filterOptions.map((c) => {
          const isActive = filter === c.id;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setFilter(c.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#0A0A0B] text-white shadow-sm'
                  : 'text-neutral-700 hover:text-[#0A0A0B]'
              }`}
            >
              {lang === 'ar' ? c.ar : c.fr}
            </button>
          );
        })}
      </div>

      {/* Multi-Column Masonry Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center text-sm text-neutral-500">
          {lang === 'ar'
            ? 'لا توجد صور متاحة في هذا التصنيف حالياً.'
            : 'Aucune réalisation publiée dans cette catégorie pour le moment.'}
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
          {filteredItems.map((item, idx) => {
            const aspectClass = getMasonryAspectClass(item.imageUrl, idx);
            const catLabel = CATEGORY_LABELS[item.category]
              ? lang === 'ar'
                ? CATEGORY_LABELS[item.category].ar
                : CATEGORY_LABELS[item.category].fr
              : item.category;

            return (
              <figure
                key={item.id}
                className="break-inside-avoid mb-6 group relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100"
              >
                <button
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  aria-label={
                    lang === 'ar'
                      ? `تكبير: ${item.titleAr}`
                      : `Agrandir : ${item.titleFr}`
                  }
                  className={`block w-full relative overflow-hidden text-start cursor-pointer ${aspectClass}`}
                >
                  <SafeImage
                    src={item.imageUrl}
                    alt={lang === 'ar' ? item.titleAr : item.titleFr}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <span
                    aria-hidden="true"
                    className="absolute top-3.5 end-3.5 p-2 rounded-lg bg-[#0A0A0B]/75 text-[#D4AE5E] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </span>

                  <figcaption className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white">
                    <p className="text-xs text-[#D4AE5E] font-medium">
                      {catLabel}
                      <span aria-hidden="true"> · </span>
                      <span className="text-neutral-200">
                        {item.city} · {item.eventDateLabel}
                      </span>
                    </p>
                    <p className="font-display text-xl font-semibold mt-1 leading-snug text-white">
                      {lang === 'ar' ? item.titleAr : item.titleFr}
                    </p>
                  </figcaption>
                </button>
              </figure>
            );
          })}
        </div>
      )}

      {/* Fullscreen Editorial Lightbox */}
      {activeItem && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lang === 'ar' ? activeItem.titleAr : activeItem.titleFr}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-6"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#111113] rounded-xl overflow-hidden border border-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label={lang === 'ar' ? 'إغلاق' : 'Fermer'}
              className="absolute top-3.5 end-3.5 z-20 p-2.5 bg-black/75 text-white rounded-lg hover:bg-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {filteredItems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex(
                      (lightboxIndex - 1 + filteredItems.length) % filteredItems.length
                    )
                  }
                  aria-label={lang === 'ar' ? 'السابق' : 'Précédent'}
                  className="absolute top-1/2 -translate-y-1/2 start-3 z-20 p-2.5 bg-black/70 text-white rounded-lg hover:bg-black transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((lightboxIndex + 1) % filteredItems.length)
                  }
                  aria-label={lang === 'ar' ? 'التالي' : 'Suivant'}
                  className="absolute top-1/2 -translate-y-1/2 end-3 z-20 p-2.5 bg-black/70 text-white rounded-lg hover:bg-black transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <div className="max-h-[72vh] bg-[#0A0A0B] flex items-center justify-center overflow-hidden">
              <SafeImage
                key={activeItem.id}
                src={activeItem.imageUrl}
                alt={lang === 'ar' ? activeItem.titleAr : activeItem.titleFr}
                className="max-h-[72vh] w-auto max-w-full object-contain"
              />
            </div>

            <div className="p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-neutral-800">
              <div>
                <p className="text-xs font-medium text-[#D4AE5E]">
                  {CATEGORY_LABELS[activeItem.category]
                    ? lang === 'ar'
                      ? CATEGORY_LABELS[activeItem.category].ar
                      : CATEGORY_LABELS[activeItem.category].fr
                    : activeItem.category}
                  <span aria-hidden="true"> · </span>
                  <span className="text-neutral-300">
                    {activeItem.city} · {activeItem.eventDateLabel}
                  </span>
                </p>
                <h2 className="font-display text-2xl font-semibold mt-1">
                  {lang === 'ar' ? activeItem.titleAr : activeItem.titleFr}
                </h2>
              </div>
              <p className="font-mono text-xs text-neutral-400 tabular-nums shrink-0">
                {String(lightboxIndex + 1).padStart(2, '0')} /{' '}
                {String(filteredItems.length).padStart(2, '0')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
