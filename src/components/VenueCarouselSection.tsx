import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Pause, Play, Users } from 'lucide-react';
import { Lang, ServiceItem } from '../types/index.ts';
import { SafeImage } from './BrandMark.tsx';

interface VenueItem {
  id: string;
  nameFr: string;
  nameAr: string;
  city: string;
  districtFr: string;
  districtAr: string;
  capacity: number;
  areaSqm: number;
  descFr: string;
  descAr: string;
  imageUrl: string;
}

const VENUES: VenueItem[] = [
  {
    id: 'palais-anfa',
    nameFr: 'Palais d’Anfa & Jardins',
    nameAr: 'قصر أنفا والحدائق',
    city: 'Casablanca',
    districtFr: 'Anfa Supérieur',
    districtAr: 'أنفا العليا',
    capacity: 450,
    areaSqm: 1200,
    descFr:
      'Grand salon de réception aux arches sculptées, lustres en cristal et terrasses ouvrant sur des jardins privés.',
    descAr:
      'قاعة استقبال كبرى بأقواس منحوتة وثريات كريستالية وشرفات تفتح على حدائق خاصة.',
    imageUrl: '/src/assets/images/venue_palais_anfa_1795278190140.jpg',
  },
  {
    id: 'villa-dar-bouazza',
    nameFr: 'Villa Océan Dar Bouazza',
    nameAr: 'فيلا المحيط دار بوعزة',
    city: 'Dar Bouazza',
    districtFr: 'Corniche Atlantique',
    districtAr: 'الكورنيش الأطلسي',
    capacity: 280,
    areaSqm: 900,
    descFr:
      'Pavillon contemporain vitré face à l’Atlantique avec terrasse en travertin et bassin miroir pour vos réceptions en plein air.',
    descAr:
      'جناح زجاجي معاصر مطل على المحيط الأطلسي مع شرفة رخامية ومسبح عاكس لحفلاتكم الخارجية.',
    imageUrl: '/src/assets/images/venue_villa_dar_bouazza_1795278190099.jpg',
  },
  {
    id: 'auditorium-cfc',
    nameFr: 'Grand Salon CFC Sky',
    nameAr: 'الصالون الكبير القطب المالي',
    city: 'Casablanca',
    districtFr: 'Casablanca Finance City',
    districtAr: 'القطب المالي للدار البيضاء',
    capacity: 600,
    areaSqm: 1600,
    descFr:
      'Espace modulable panoramique dédié aux galas d’entreprise, congrès exécutifs et lancements de marque à haute portée.',
    descAr:
      'فضاء بانورامي متطور مخصص لحفلات الشركات والمؤتمرات الكبرى وإطلاق المنتجات.',
    imageUrl: '/src/assets/images/venue_auditorium_cfc_1795278190851.jpg',
  },
  {
    id: 'pavillon-palmeraie',
    nameFr: 'Pavillon de la Palmeraie',
    nameAr: 'جناح النخيل الملكي',
    city: 'Marrakech',
    districtFr: 'Palmeraie',
    districtAr: 'النخيل',
    capacity: 500,
    areaSqm: 2400,
    descFr:
      'Colonnade monumentale autour d’un bassin central éclairé aux lanternes en laiton pour mariages et dîners de prestige.',
    descAr:
      'أروقة معمارية كبرى تحيط بحوض مائي مضاء بالفوانيس النحاسية للأعراس والمآدب الراقية.',
    imageUrl: '/src/assets/images/venue_riad_palmeraie_1795278193877.jpg',
  },
  {
    id: 'salon-imperial-anfa',
    nameFr: 'Salon Impérial Royal Gala',
    nameAr: 'الصالون الإمبراطوري الملكي',
    city: 'Casablanca',
    districtFr: "Boulevard d'Anfa",
    districtAr: 'شارع أنفا',
    capacity: 350,
    areaSqm: 850,
    descFr:
      'Salle prestigieuse au cœur de Casablanca offrant acoustique calibrée, suite privée et logistique traiteur intégrée.',
    descAr:
      'قاعة مرموقة في قلب الدار البيضاء مجهزة بأحدث أنظمة الصوتيات وأجنحة خاصة ومرافق ضيافة.',
    imageUrl: '/src/assets/images/hero_event_gala_1795276605928.jpg',
  },
];

interface VenueCarouselSectionProps {
  lang: Lang;
  services: ServiceItem[];
}

export function VenueCarouselSection({ lang, services }: VenueCarouselSectionProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const thumbRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const touchStartXRef = useRef<number | null>(null);

  const venueService =
    services.find((s) => s.slug.includes('location-de-salles')) || services[0];

  const activeVenue = VENUES[activeIdx];

  const goTo = useCallback(
    (nextIndex: number, dir?: number) => {
      const normalized = (nextIndex + VENUES.length) % VENUES.length;
      setDirection(
        dir !== undefined ? dir : normalized >= activeIdx ? 1 : -1
      );
      setActiveIdx(normalized);
    },
    [activeIdx]
  );

  const goNext = useCallback(() => {
    goTo(activeIdx + 1, 1);
  }, [activeIdx, goTo]);

  const goPrev = useCallback(() => {
    goTo(activeIdx - 1, -1);
  }, [activeIdx, goTo]);

  // Center active thumbnail strictly inside the horizontal track without moving page vertical scroll
  useEffect(() => {
    const track = trackRef.current;
    const thumb = thumbRefs.current[activeIdx];
    if (!track || !thumb) return;
    const targetLeft =
      thumb.offsetLeft - track.clientWidth / 2 + thumb.clientWidth / 2;
    track.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: 'smooth',
    });
  }, [activeIdx]);

  // Subtle auto-advance that respects reduced-motion and user hover/pause
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || isPaused || isHovered) return;

    const timer = setInterval(() => {
      setDirection(1);
      setActiveIdx((prev) => (prev + 1) % VENUES.length);
    }, 6500);

    return () => clearInterval(timer);
  }, [isPaused, isHovered]);

  const bookingUrl = `/reserver?${new URLSearchParams({
    ...(venueService ? { serviceId: String(venueService.id) } : {}),
    city: activeVenue.city,
    venue: lang === 'ar' ? activeVenue.nameAr : activeVenue.nameFr,
  }).toString()}`;

  return (
    <section
      aria-labelledby="venues-carousel-heading"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="py-20 lg:py-24 bg-[#0A0A0B] text-white border-y border-neutral-800"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#D4AE5E] mb-3">
              {lang === 'ar'
                ? 'فضاءات وقاعات مختارة · الدار البيضاء والمغرب'
                : 'Collection exclusive · Casablanca & Maroc'}
            </p>
            <h2
              id="venues-carousel-heading"
              className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-white text-balance max-w-2xl"
            >
              {lang === 'ar'
                ? 'قاعات استقبال وفضاءات معمارية استثنائية.'
                : 'Salles de réception & lieux d’exception.'}
            </h2>
            <p className="mt-3 text-base text-neutral-400 max-w-2xl">
              {lang === 'ar'
                ? 'اكتشفوا مجموعتنا المنتقاة من القصور والفيلات البحرية والقاعات البانورامية المجهزة بالكامل.'
                : 'Parcourez notre sélection privée de palais, villas océanes et salons panoramiques prêts à accueillir vos réceptions.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="font-mono text-xs text-neutral-400 tabular-nums me-2">
              {String(activeIdx + 1).padStart(2, '0')} / {String(VENUES.length).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              aria-label={
                isPaused
                  ? lang === 'ar'
                    ? 'تشغيل العرض التلقائي'
                    : 'Reprendre le défilement'
                  : lang === 'ar'
                    ? 'إيقاف العرض التلقائي'
                    : 'Mettre en pause'
              }
              className="w-11 h-11 rounded-lg border border-neutral-800 bg-[#141416] text-neutral-300 hover:text-white hover:border-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={goPrev}
              aria-label={lang === 'ar' ? 'القاعة السابقة' : 'Salle précédente'}
              className="w-11 h-11 rounded-lg border border-neutral-800 bg-[#141416] text-white hover:border-[#D4AE5E] hover:text-[#D4AE5E] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label={lang === 'ar' ? 'القاعة التالية' : 'Salle suivante'}
              className="w-11 h-11 rounded-lg border border-neutral-800 bg-[#141416] text-white hover:border-[#D4AE5E] hover:text-[#D4AE5E] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Large Cinematic Feature Stage */}
        <div
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
          }}
          onTouchStart={(e) => {
            touchStartXRef.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            if (touchStartXRef.current === null) return;
            const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
            const delta = touchStartXRef.current - endX;
            if (Math.abs(delta) > 45) {
              if (delta > 0) goNext();
              else goPrev();
            }
            touchStartXRef.current = null;
          }}
          className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-[#141416] h-[420px] sm:h-[500px] lg:h-[580px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AE5E]"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeVenue.id}
              initial={{ opacity: 0, x: direction > 0 ? 40 : -40, scale: 1.02 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <SafeImage
                src={activeVenue.imageUrl}
                alt={lang === 'ar' ? activeVenue.nameAr : activeVenue.nameFr}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B]/95 via-[#0A0A0B]/40 to-[#0A0A0B]/15" />

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm text-[#D4AE5E] font-medium mb-3 tabular-nums">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {activeVenue.city} · {lang === 'ar' ? activeVenue.districtAr : activeVenue.districtFr}
                    </span>
                    <span aria-hidden="true" className="text-neutral-500">·</span>
                    <span className="inline-flex items-center gap-1.5 text-neutral-200">
                      <Users className="w-3.5 h-3.5 text-[#D4AE5E] shrink-0" />
                      {lang === 'ar'
                        ? `حتى ${activeVenue.capacity} ضيف`
                        : `Jusqu'à ${activeVenue.capacity} convives`}
                    </span>
                    <span aria-hidden="true" className="text-neutral-500">·</span>
                    <span className="text-neutral-200">{activeVenue.areaSqm.toLocaleString('fr-MA')} m²</span>
                  </div>

                  <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
                    {lang === 'ar' ? activeVenue.nameAr : activeVenue.nameFr}
                  </h3>

                  <p className="mt-3 text-sm sm:text-base text-neutral-200 leading-relaxed max-w-xl">
                    {lang === 'ar' ? activeVenue.descAr : activeVenue.descFr}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    to={bookingUrl}
                    className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold bg-[#B89038] text-[#0A0A0B] rounded-lg hover:bg-[#CCA44B] transition-colors whitespace-nowrap shrink-0"
                  >
                    {lang === 'ar' ? 'احجز هذه القاعة' : 'Réserver cette salle'}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Horizontal Carousel Thumbnail Track */}
        <div
          ref={trackRef}
          className="mt-6 flex items-stretch gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'thin' }}
        >
          {VENUES.map((venue, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={venue.id}
                ref={(el) => {
                  thumbRefs.current[idx] = el;
                }}
                type="button"
                onClick={() => goTo(idx)}
                aria-current={isActive ? 'true' : undefined}
                className={`group shrink-0 w-[240px] sm:w-[272px] snap-start text-start rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'border-[#D4AE5E] bg-[#161618]'
                    : 'border-neutral-800 bg-[#111113] opacity-75 hover:opacity-100 hover:border-neutral-600'
                }`}
              >
                <div className="aspect-[16/9] overflow-hidden bg-neutral-900">
                  <SafeImage
                    src={venue.imageUrl}
                    alt={lang === 'ar' ? venue.nameAr : venue.nameFr}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <p className="text-[11px] font-medium text-[#D4AE5E] tabular-nums">
                    {venue.city} · {venue.capacity} {lang === 'ar' ? 'ضيف' : 'pers.'}
                  </p>
                  <p className="font-display text-lg font-semibold text-white mt-0.5 truncate">
                    {lang === 'ar' ? venue.nameAr : venue.nameFr}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
