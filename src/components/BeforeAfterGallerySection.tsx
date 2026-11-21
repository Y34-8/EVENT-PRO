import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  ChevronsLeftRight,
  Eye,
  MapPin,
  MousePointerClick,
  Sparkles,
  Users,
} from 'lucide-react';
import { Lang, ServiceItem } from '../types/index.ts';
import { SafeImage } from './BrandMark.tsx';

export interface BeforeAfterPair {
  id: string;
  titleFr: string;
  titleAr: string;
  categoryFr: string;
  categoryAr: string;
  city: string;
  districtFr: string;
  districtAr: string;
  capacity: number;
  transformHours: number;
  summaryFr: string;
  summaryAr: string;
  highlightsFr: string[];
  highlightsAr: string[];
  beforeUrl: string;
  afterUrl: string;
  serviceSlugHint: string;
}

const BEFORE_AFTER_PAIRS: BeforeAfterPair[] = [
  {
    id: 'palais-anfa',
    titleFr: 'Palais d’Anfa — Réception Royale',
    titleAr: 'قصر أنفا — حفل استقبال ملكي',
    categoryFr: 'Mariage & Haute Décoration Florale',
    categoryAr: 'زفاف وتنسيق زهري فاخر',
    city: 'Casablanca',
    districtFr: 'Anfa Supérieur',
    districtAr: 'أنفا العليا',
    capacity: 450,
    transformHours: 14,
    summaryFr:
      'Métamorphose complète de la grande nef en marbre : suspension de compositions florales ivoire, habillage des arches aux lustres cristal et nappage sur mesure.',
    summaryAr:
      'تحول كامل للقاعة الرخامية الكبرى: تعليق باقات الزهور البيضاء، ثريات الكريستال، وتنسيق موائد الاستقبال الفاخرة.',
    highlightsFr: ['4 500 tiges de roses blanches', 'Lustres cristal & bougeoirs dorés', 'Art de la table sur mesure'],
    highlightsAr: ['4500 وردة بيضاء طبيعية', 'ثريات كريستال وشمعدانات ذهبية', 'تنسيق موائد مخصص'],
    beforeUrl: '/src/assets/images/before_palais_anfa_1795278783185.jpg',
    afterUrl: '/src/assets/images/venue_palais_anfa_1795278190140.jpg',
    serviceSlugHint: 'decoration-scenographie',
  },
  {
    id: 'auditorium-cfc',
    titleFr: 'Grand Salon CFC Sky — Gala Corporate',
    titleAr: 'الصالون الكبير القطب المالي — حفل شركات',
    categoryFr: 'Sommet Exécutif & Lancement de Marque',
    categoryAr: 'مؤتمر تنفيذي وإطلاق علامة تجارية',
    city: 'Casablanca',
    districtFr: 'Casablanca Finance City',
    districtAr: 'القطب المالي للدار البيضاء',
    capacity: 600,
    transformHours: 10,
    summaryFr:
      'D’un plateau panoramique brut à un salon de gala haute couture : acoustique calibrée, éclairage architectural chaud et mise en scène nocturne.',
    summaryAr:
      'من فضاء بانورامي فارغ إلى قاعة احتفالات متكاملة بإضاءة معمارية دافئة وأنظمة صوتية احترافية.',
    highlightsFr: ['Éclairage architectural chaud', 'Tables miroir noires & laiton', 'Scénographie panoramique'],
    highlightsAr: ['إضاءة معمارية دافئة', 'طاولات سوداء مع لمسات نحاسية', 'سينوغرافيا بانورامية'],
    beforeUrl: '/src/assets/images/before_auditorium_cfc_1795278783208.jpg',
    afterUrl: '/src/assets/images/venue_auditorium_cfc_1795278190851.jpg',
    serviceSlugHint: 'evenements-corporate',
  },
  {
    id: 'salon-royal-gala',
    titleFr: 'Salon Impérial Royal Gala — Soirée Prestige',
    titleAr: 'الصالون الإمبراطوري — أمسية فاخرة',
    categoryFr: 'Dîner de Gala & Célébration Privée',
    categoryAr: 'عشاء احتفالي وأمسية خاصة',
    city: 'Casablanca',
    districtFr: "Boulevard d'Anfa",
    districtAr: 'شارع أنفا',
    capacity: 350,
    transformHours: 12,
    summaryFr:
      'Révélation nocturne d’une salle en marbre noir : centaines de bougies en verre fumé, centres de table sculpturaux or & blanc et acoustique feutrée.',
    summaryAr:
      'تحويل قاعة الرخام الأسود إلى أمسية ساحرة بمئات الشموع الزجاجية وتنسيقات ذهبية وبيضاء راقية.',
    highlightsFr: ['320 photophores en cristal', 'Vaisselle fine dorée à la main', 'Ambiance sonore & lumière ambrée'],
    highlightsAr: ['320 شمعدان كريستال', 'أواني مائدة مطلية بالذهب', 'إضاءة دافئة وصوتيات هادئة'],
    beforeUrl: '/src/assets/images/before_royal_gala_1795278783446.jpg',
    afterUrl: '/src/assets/images/hero_event_gala_1795276605928.jpg',
    serviceSlugHint: 'organisation-de-mariages',
  },
];

interface BeforeAfterGallerySectionProps {
  lang: Lang;
  services: ServiceItem[];
  variant?: 'home' | 'portfolio';
}

export function BeforeAfterGallerySection({
  lang,
  services,
  variant = 'home',
}: BeforeAfterGallerySectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [sliderPos, setSliderPos] = useState(52);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverFollow, setHoverFollow] = useState(false);
  const [isAnimatedTransition, setIsAnimatedTransition] = useState(true);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const animTimerRef = useRef<number | null>(null);

  const activePair = BEFORE_AFTER_PAIRS[activeIndex];
  const matchedService =
    services.find((s) => s.slug.includes(activePair.serviceSlugHint)) ||
    services.find((s) => s.slug.includes('decoration')) ||
    services[0];

  const bookingUrl = matchedService
    ? `/reserver?serviceId=${matchedService.id}&city=${encodeURIComponent(activePair.city)}&venue=${encodeURIComponent(
        lang === 'ar' ? activePair.titleAr : activePair.titleFr,
      )}`
    : `/reserver?city=${encodeURIComponent(activePair.city)}`;

  const clampPos = (value: number) => Math.max(0, Math.min(100, value));

  const getPercentageFromClientX = useCallback((clientX: number) => {
    const el = stageRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return null;
    return clampPos(((clientX - rect.left) / rect.width) * 100);
  }, []);

  const triggerSmoothPreset = useCallback(
    (nextPos: number) => {
      if (animTimerRef.current) {
        window.clearTimeout(animTimerRef.current);
      }
      setIsAnimatedTransition(!prefersReducedMotion);
      setSliderPos(clampPos(nextPos));
    },
    [prefersReducedMotion],
  );

  useEffect(() => {
    return () => {
      if (animTimerRef.current) {
        window.clearTimeout(animTimerRef.current);
      }
    };
  }, []);

  const handleRoomSelect = (idx: number) => {
    setActiveIndex(idx);
    if (!prefersReducedMotion) {
      setIsAnimatedTransition(true);
      setSliderPos(24);
      animTimerRef.current = window.setTimeout(() => {
        setSliderPos(54);
      }, 110);
    } else {
      setSliderPos(50);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const target = e.target as HTMLElement;
    if (target.closest('button, a')) return;

    const pct = getPercentageFromClientX(e.clientX);
    if (pct === null) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    // Smooth snap on initial click, then immediate fluid response during drag
    setIsAnimatedTransition(!prefersReducedMotion);
    setSliderPos(pct);
    if (animTimerRef.current) window.clearTimeout(animTimerRef.current);
    animTimerRef.current = window.setTimeout(() => {
      setIsAnimatedTransition(false);
    }, 180);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging && !hoverFollow) return;
    const pct = getPercentageFromClientX(e.clientX);
    if (pct === null) return;

    if (isDragging) {
      setIsAnimatedTransition(false);
      setSliderPos(pct);
    } else if (hoverFollow) {
      setIsAnimatedTransition(!prefersReducedMotion);
      setSliderPos(pct);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
    setIsAnimatedTransition(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 4;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      triggerSmoothPreset(sliderPos - step);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      triggerSmoothPreset(sliderPos + step);
    } else if (e.key === 'Home') {
      e.preventDefault();
      triggerSmoothPreset(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      triggerSmoothPreset(100);
    }
  };

  // Percentage labels cleanly compute how much of Before vs After is visible
  const beforePct = Math.round(sliderPos);
  const afterPct = 100 - beforePct;

  const isPortfolio = variant === 'portfolio';

  return (
    <section
      aria-labelledby="before-after-heading"
      className={
        isPortfolio
          ? 'py-16 lg:py-20 bg-white border-t border-neutral-200'
          : 'py-20 lg:py-28 bg-white border-y border-neutral-200'
      }
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 lg:mb-12">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wider text-[#8E6B1E] uppercase mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#B89038]" />
              <span>{lang === 'ar' ? 'معرض قبل وبعد · السينوغرافيا' : 'Galerie Before & After · Métamorphoses'}</span>
            </p>
            <h2
              id="before-after-heading"
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#0A0A0B] text-balance"
            >
              {lang === 'ar'
                ? 'من الفضاء الخام إلى التحفة الاحتفالية'
                : 'De l’espace brut à l’excellence scénographique'}
            </h2>
            <p className="mt-3.5 text-base text-neutral-600 leading-relaxed">
              {lang === 'ar'
                ? 'اسحبوا المؤشر يميناً أو يساراً لمقارنة القاعة قبل التجهيز وبعد لمسة إيفنت برو.'
                : 'Déplacez le curseur sur la photographie pour révéler en temps réel la transformation d’une salle nue en décor d’exception.'}
            </p>
          </div>

          {/* Interactive Controls Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center border border-neutral-200 rounded-lg p-1 bg-[#FAFAFA]">
              <button
                type="button"
                onClick={() => triggerSmoothPreset(100)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  sliderPos >= 92
                    ? 'bg-[#0A0A0B] text-white'
                    : 'text-neutral-700 hover:text-[#0A0A0B]'
                }`}
              >
                {lang === 'ar' ? 'قبل التجهيز' : 'Avant brut'}
              </button>
              <button
                type="button"
                onClick={() => triggerSmoothPreset(50)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors tabular-nums whitespace-nowrap ${
                  sliderPos > 40 && sliderPos < 60
                    ? 'bg-[#B89038] text-[#0A0A0B]'
                    : 'text-neutral-700 hover:text-[#0A0A0B]'
                }`}
              >
                50 / 50
              </button>
              <button
                type="button"
                onClick={() => triggerSmoothPreset(0)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  sliderPos <= 8
                    ? 'bg-[#0A0A0B] text-[#D4AE5E]'
                    : 'text-neutral-700 hover:text-[#0A0A0B]'
                }`}
              >
                {lang === 'ar' ? 'بعد الديكور' : 'Après décor'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setHoverFollow((prev) => !prev)}
              aria-pressed={hoverFollow}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border rounded-lg transition-colors whitespace-nowrap ${
                hoverFollow
                  ? 'bg-[#0A0A0B] text-[#D4AE5E] border-[#0A0A0B]'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
              }`}
            >
              <MousePointerClick className="w-3.5 h-3.5" />
              <span>
                {lang === 'ar'
                  ? hoverFollow
                    ? 'تتبع المؤشر مفعل'
                    : 'تتبع حركة الماوس'
                  : hoverFollow
                    ? 'Suivi curseur actif'
                    : 'Suivi au survol'}
              </span>
            </button>
          </div>
        </div>

        {/* Main Comparison Canvas + Info Side Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Interactive Before / After Stage */}
          <div className="lg:col-span-8 flex flex-col">
            <div
              ref={stageRef}
              dir="ltr"
              role="slider"
              tabIndex={0}
              aria-label={
                lang === 'ar'
                  ? 'مقارنة القاعة قبل وبعد الديكور'
                  : 'Curseur comparatif avant et après décoration'
              }
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={beforePct}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onKeyDown={handleKeyDown}
              className={`relative w-full h-[320px] sm:h-[440px] lg:h-[540px] rounded-xl overflow-hidden border border-neutral-200 bg-[#0A0A0B] select-none touch-pan-y focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B89038] ${
                isDragging ? 'cursor-ew-resize' : hoverFollow ? 'cursor-col-resize' : 'cursor-ew-resize'
              }`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePair.id}
                  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0.25 }}
                  animate={{ opacity: 1 }}
                  exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0.25 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  {/* BOTTOM LAYER: AFTER DECORATION (100% full width) */}
                  <SafeImage
                    src={activePair.afterUrl}
                    alt={`${lang === 'ar' ? activePair.titleAr : activePair.titleFr} — ${
                      lang === 'ar' ? 'بعد الديكور' : 'Après décoration'
                    }`}
                    className="w-full h-full object-cover pointer-events-none select-none"
                  />

                  {/* Subtle dark edge gradient for legible architectural labels */}
                  <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0A0A0B]/60 to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0A0A0B]/80 via-[#0A0A0B]/25 to-transparent pointer-events-none" />

                  {/* TOP LAYER: BEFORE DECORATION (Clipped dynamically to sliderPos%) */}
                  <div
                    className={`absolute inset-0 overflow-hidden will-change-[clip-path] ${
                      isAnimatedTransition
                        ? 'transition-[clip-path] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]'
                        : ''
                    }`}
                    style={{
                      clipPath: `inset(0 ${Math.max(0, 100 - sliderPos)}% 0 0)`,
                    }}
                  >
                    <SafeImage
                      src={activePair.beforeUrl}
                      alt={`${lang === 'ar' ? activePair.titleAr : activePair.titleFr} — ${
                        lang === 'ar' ? 'قبل التجهيز' : 'Avant décoration'
                      }`}
                      className="w-full h-full object-cover pointer-events-none select-none"
                    />
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0A0A0B]/55 to-transparent pointer-events-none" />
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0A0A0B]/75 via-[#0A0A0B]/20 to-transparent pointer-events-none" />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Corner Label: AVANT (Left side) */}
              <div
                className={`absolute top-4 left-4 z-10 pointer-events-none transition-opacity duration-200 ${
                  sliderPos < 16 ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <div className="bg-[#0A0A0B]/85 backdrop-blur-sm border border-white/15 px-3 py-1.5 rounded-md flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-neutral-400" />
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-white">
                    {lang === 'ar' ? 'قبل التجهيز' : 'Avant'}
                  </span>
                  <span className="text-[11px] text-neutral-400 tabular-nums">{beforePct}%</span>
                </div>
              </div>

              {/* Corner Label: APRÈS (Right side) */}
              <div
                className={`absolute top-4 right-4 z-10 pointer-events-none transition-opacity duration-200 ${
                  sliderPos > 84 ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <div className="bg-[#0A0A0B]/90 backdrop-blur-sm border border-[#D4AE5E]/40 px-3 py-1.5 rounded-md flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#D4AE5E]" />
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-[#D4AE5E]">
                    {lang === 'ar' ? 'بعد الديكور' : 'Après'}
                  </span>
                  <span className="text-[11px] text-neutral-300 tabular-nums">{afterPct}%</span>
                </div>
              </div>

              {/* Vertical Gold Split Beam + Reveal Sheen */}
              <div
                className={`absolute inset-y-0 z-20 pointer-events-none ${
                  isAnimatedTransition
                    ? 'transition-[left] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]'
                    : ''
                }`}
                style={{ left: `${sliderPos}%` }}
              >
                {/* Soft golden reveal halo radiating into the decorated side */}
                <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#D4AE5E]/25 to-transparent" />
                {/* Crisp central gold seam */}
                <div className="absolute inset-y-0 -translate-x-1/2 w-[2px] bg-[#D4AE5E] shadow-[0_0_16px_rgba(212,174,94,0.85)]" />

                {/* Interactive Center Grip Handle */}
                <div
                  className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto touch-none flex items-center justify-center w-12 h-12 rounded-xl border transition-transform duration-150 ${
                    isDragging
                      ? 'scale-110 bg-[#D4AE5E] text-[#0A0A0B] border-white shadow-[0_8px_28px_rgba(212,174,94,0.55)]'
                      : 'bg-[#0A0A0B]/95 text-[#D4AE5E] border-[#D4AE5E] shadow-[0_6px_24px_rgba(0,0,0,0.6)] hover:scale-105'
                  }`}
                >
                  <ChevronsLeftRight className="w-5 h-5" />
                </div>
              </div>

              {/* Bottom caption bar on canvas */}
              <div className="absolute bottom-4 inset-x-4 z-10 pointer-events-none flex items-center justify-between gap-4 text-xs text-neutral-200">
                <span className="font-medium tracking-wide bg-[#0A0A0B]/75 backdrop-blur-sm px-3 py-1.5 rounded-md border border-white/10 truncate">
                  {lang === 'ar' ? activePair.titleAr : activePair.titleFr}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 bg-[#0A0A0B]/75 backdrop-blur-sm px-3 py-1.5 rounded-md border border-white/10 text-neutral-300">
                  <Eye className="w-3.5 h-3.5 text-[#D4AE5E]" />
                  <span>
                    {lang === 'ar' ? 'اسحب للمقارنة' : 'Glisser pour révéler'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel: Venue Scenography Details & Booking Action */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-[#0A0A0B] text-white rounded-xl p-6 sm:p-8 border border-neutral-800">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePair.id}
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div>
                  <p className="text-xs font-semibold tracking-wider text-[#D4AE5E] uppercase mb-2">
                    {lang === 'ar' ? activePair.categoryAr : activePair.categoryFr}
                  </p>
                  <h3 className="font-display text-2xl sm:text-3xl font-semibold text-white leading-tight">
                    {lang === 'ar' ? activePair.titleAr : activePair.titleFr}
                  </h3>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-400 tabular-nums">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#D4AE5E]" />
                      {activePair.city} ·{' '}
                      {lang === 'ar' ? activePair.districtAr : activePair.districtFr}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#D4AE5E]" />
                      {activePair.capacity} {lang === 'ar' ? 'ضيف' : 'invités'}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-neutral-300 leading-relaxed">
                  {lang === 'ar' ? activePair.summaryAr : activePair.summaryFr}
                </p>

                {/* Key Transformation Metrics */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-800">
                  <div className="p-3.5 rounded-lg bg-[#141416] border border-neutral-800">
                    <p className="text-[11px] uppercase tracking-wider text-neutral-400">
                      {lang === 'ar' ? 'مدة التجهيز' : 'Montage'}
                    </p>
                    <p className="mt-1 font-display text-2xl font-semibold text-[#D4AE5E] tabular-nums">
                      {activePair.transformHours}h
                    </p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#141416] border border-neutral-800">
                    <p className="text-[11px] uppercase tracking-wider text-neutral-400">
                      {lang === 'ar' ? 'نسبة الكشف' : 'Révélation'}
                    </p>
                    <p className="mt-1 font-display text-2xl font-semibold text-white tabular-nums">
                      {afterPct}%
                    </p>
                  </div>
                </div>

                {/* Highlights Checklist */}
                <div className="space-y-2.5 pt-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    {lang === 'ar' ? 'تفاصيل الديكور المنجز' : 'Éléments scénographiques'}
                  </p>
                  <ul className="space-y-2">
                    {(lang === 'ar' ? activePair.highlightsAr : activePair.highlightsFr).map(
                      (item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-sm text-neutral-200"
                        >
                          <span className="mt-1.5 w-1.5 h-1.5 bg-[#D4AE5E] shrink-0" />
                          <span>{item}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 pt-6 border-t border-neutral-800 space-y-3">
              <Link
                to={bookingUrl}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold bg-[#B89038] text-[#0A0A0B] rounded-lg hover:bg-[#CCA44B] transition-colors"
              >
                <span>
                  {lang === 'ar' ? 'احجزوا هذا التحول لقاعتكم' : 'Réserver cette métamorphose'}
                </span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
              <Link
                to="/services"
                className="w-full inline-flex items-center justify-center px-5 py-2.5 text-xs font-medium text-neutral-300 hover:text-white transition-colors"
              >
                {lang === 'ar' ? 'استكشفوا باقات الديكور' : 'Voir nos prestations scénographiques'}
              </Link>
            </div>
          </div>
        </div>

        {/* Venue Switcher Thumbnails */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {BEFORE_AFTER_PAIRS.map((pair, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={pair.id}
                type="button"
                onClick={() => handleRoomSelect(idx)}
                aria-pressed={isActive}
                className={`group text-start p-3 rounded-xl border transition-all flex items-center gap-4 ${
                  isActive
                    ? 'bg-[#0A0A0B] text-white border-[#0A0A0B]'
                    : 'bg-[#FAFAFA] text-[#0A0A0B] border-neutral-200 hover:border-neutral-400 hover:bg-white'
                }`}
              >
                <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0 bg-neutral-900">
                  <SafeImage
                    src={pair.afterUrl}
                    alt={lang === 'ar' ? pair.titleAr : pair.titleFr}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Diagonal split mini-preview hint showing Before left corner */}
                  <div
                    className="absolute inset-0"
                    style={{ clipPath: 'polygon(0 0, 48% 0, 35% 100%, 0 100%)' }}
                  >
                    <SafeImage
                      src={pair.beforeUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    className="absolute inset-y-0 left-[41%] w-[1.5px] bg-[#D4AE5E] rotate-[10deg] origin-center pointer-events-none"
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[11px] font-mono tabular-nums ${
                        isActive ? 'text-[#D4AE5E]' : 'text-[#8E6B1E]'
                      }`}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`text-[11px] truncate ${
                        isActive ? 'text-neutral-400' : 'text-neutral-500'
                      }`}
                    >
                      {pair.city}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm font-semibold truncate">
                    {lang === 'ar' ? pair.titleAr : pair.titleFr}
                  </p>
                  <p
                    className={`mt-0.5 text-xs truncate ${
                      isActive ? 'text-neutral-300' : 'text-neutral-500'
                    }`}
                  >
                    {lang === 'ar' ? pair.categoryAr : pair.categoryFr}
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
