import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import {
  ArrowRight,
  Award,
  CalendarCheck,
  Compass,
  Layers,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { Lang } from '../types/index.ts';

interface TimelineStep {
  num: string;
  milestoneFr: string;
  milestoneAr: string;
  titleFr: string;
  titleAr: string;
  descFr: string;
  descAr: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    num: '01',
    milestoneFr: 'J-90 · Réservation',
    milestoneAr: 'قبل 90 يوماً · الحجز',
    titleFr: 'Réservation en ligne & Vérification de date',
    titleAr: 'الحجز عبر المنصة والتحقق الفوري من التوفر',
    descFr:
      'Sélectionnez votre prestation et votre lieu, consultez l’estimation en DH / MAD et recevez un numéro de dossier unique sans risque de double réservation.',
    descAr:
      'اختاروا الخدمة والمدينة مع تقدير فوري بالدرهم المغربي والحصول على مرجع حجز خاص دون أي تضارب في التواريخ.',
    Icon: CalendarCheck,
  },
  {
    num: '02',
    milestoneFr: 'J-75 · Cadrage',
    milestoneAr: 'قبل 75 يوماً · التأطير',
    titleFr: 'Direction artistique & Cahier des charges',
    titleAr: 'التوجيه الفني وتحديد دفتر التحملات',
    descFr:
      'Rencontre avec votre directeur de projet à Casablanca ou en visioconférence pour définir le concept, la palette de matières et les priorités protocolaires.',
    descAr:
      'لقاء مع مدير المشروع في الدار البيضاء أو عن بُعد لتحديد المفهوم البصري والألوان وأولويات البروتوكول.',
    Icon: Compass,
  },
  {
    num: '03',
    milestoneFr: 'J-45 · Conception',
    milestoneAr: 'قبل 45 يوماً · التصميم',
    titleFr: 'Visite de salle, Scénographie 3D & Dégustation',
    titleAr: 'معاينة القاعة والتصميم ثلاثي الأبعاد والتذوق',
    descFr:
      'Repérage technique du lieu retenu, validation des plans d’implantation, essais floraux et séance de dégustation gastronomique avec nos chefs.',
    descAr:
      'معاينة تقنية للفضاء المختار واعتماد مخططات التوزيع وتنسيقات الزهور وجلسة تذوق مع الطهاة التنفيذيين.',
    Icon: Sparkles,
  },
  {
    num: '04',
    milestoneFr: 'J-15 · Coordination',
    milestoneAr: 'قبل 15 يوماً · التنسيق',
    titleFr: 'Régie technique & Conducteur minuté',
    titleAr: 'تنسيق المزودين والجدول الزمني الدقيق',
    descFr:
      'Synchronisation de l’ensemble des pôles — sonorisation, éclairage, traiteur, photographie et accueil VIP — autour d’un planning minute par minute.',
    descAr:
      'مواءمة كافة الفرق من صوتيات وإضاءة وتموين وتصوير واستقبال وفق برنامج زمني مضبوط بالدقيقة.',
    Icon: Layers,
  },
  {
    num: '05',
    milestoneFr: 'J-1 · Montage',
    milestoneAr: 'قبل يوم واحد · التركيب',
    titleFr: 'Installation scénique & Balances acoustiques',
    titleAr: 'تركيب الديكور والاختبارات التقنية',
    descFr:
      'Déploiement des structures, mise en lumière architecturale, tests micro et dressage des arts de la table sous contrôle qualité strict.',
    descAr:
      'تثبيت الهياكل وضبط الإضاءة المعمارية واختبار الصوتيات وتجهيز الموائد تحت إشراف مباشر.',
    Icon: Wrench,
  },
  {
    num: '06',
    milestoneFr: 'Jour J · Réalisation',
    milestoneAr: 'يوم الحدث · التنفيذ',
    titleFr: 'Orchestration fluide jusqu’au dernier instant',
    titleAr: 'إدارة متكاملة وانسيابية تامة يوم المناسبة',
    descFr:
      'Votre brigade dédiée pilote l’accueil des convives, les temps forts du programme et la coordination en coulisses pour que vous viviez pleinement votre événement.',
    descAr:
      'يشرف فريقنا الميداني على استقبال الضيوف وتسيير فقرات البرنامج في الكواليس لتستمتعوا بكل لحظة.',
    Icon: Award,
  },
];

export function EventTimelineSection({ lang }: { lang: Lang }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 75%', 'end 65%'],
  });

  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      aria-labelledby="event-timeline-heading"
      className="py-20 lg:py-24 bg-white border-b border-neutral-200"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#8E6B1E] mb-3">
              {lang === 'ar'
                ? 'من الحجز إلى يوم الحدث · منهجية إيفنت برو'
                : 'Méthodologie EVENT PRO · De la réservation au Jour J'}
            </p>
            <h2
              id="event-timeline-heading"
              className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#0A0A0B] text-balance"
            >
              Event Timeline
            </h2>
            <p className="mt-3 text-base text-neutral-600 max-w-2xl">
              {lang === 'ar'
                ? 'ست مراحل واضحة ومنظمة لمواكبتكم خطوة بخطوة نحو فعالية متكاملة في المغرب.'
                : 'Six étapes maîtrisées pour transformer votre réservation en ligne en une réception irréprochable.'}
            </p>
          </div>

          <Link
            to="/reserver"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#0A0A0B] text-white rounded-lg hover:bg-[#B89038] hover:text-[#0A0A0B] transition-colors whitespace-nowrap shrink-0"
          >
            {lang === 'ar' ? 'ابدأ الخطوة الأولى' : 'Lancer la préparation'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Vertical Animated Timeline */}
        <div ref={containerRef} className="relative">
          {/* Static Background Spine */}
          <div
            aria-hidden="true"
            className="absolute top-2 bottom-2 start-5 lg:start-1/2 lg:-translate-x-1/2 lg:rtl:translate-x-1/2 w-px bg-neutral-200"
          />

          {/* Scroll-Driven Gold Progress Spine */}
          {!prefersReducedMotion && (
            <motion.div
              aria-hidden="true"
              style={{ scaleY: lineScaleY, transformOrigin: 'top' }}
              className="absolute top-2 bottom-2 start-5 lg:start-1/2 lg:-translate-x-1/2 lg:rtl:translate-x-1/2 w-0.5 bg-[#B89038]"
            />
          )}

          <div className="space-y-10 lg:space-y-12">
            {TIMELINE_STEPS.map((step, idx) => {
              const Icon = step.Icon;
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={step.num}
                  className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-center"
                >
                  {/* Central / Left Milestone Node */}
                  <motion.div
                    initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    aria-hidden="true"
                    className="absolute top-7 lg:top-1/2 lg:-translate-y-1/2 start-5 -translate-x-1/2 rtl:translate-x-1/2 lg:start-1/2 w-10 h-10 rounded-full bg-[#0A0A0B] border-2 border-[#B89038] text-[#D4AE5E] flex items-center justify-center z-10 shadow-sm"
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.8} />
                  </motion.div>

                  {/* Card Container alternating Left / Right on Desktop */}
                  <motion.article
                    initial={
                      prefersReducedMotion
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0, y: 24 }
                    }
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={`ms-14 lg:ms-0 ${
                      isEven ? 'lg:col-start-1 lg:pe-4' : 'lg:col-start-2 lg:ps-4'
                    }`}
                  >
                    <div className="bg-[#FAFAFA] border border-neutral-200 rounded-2xl p-7 sm:p-8 hover:border-neutral-300 transition-colors">
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <span className="text-xs font-semibold text-[#8E6B1E] tracking-wide">
                          {lang === 'ar' ? step.milestoneAr : step.milestoneFr}
                        </span>
                        <span className="font-mono text-xs font-medium text-neutral-400 tabular-nums">
                          {step.num}
                        </span>
                      </div>

                      <h3 className="font-display text-2xl font-semibold text-[#0A0A0B]">
                        {lang === 'ar' ? step.titleAr : step.titleFr}
                      </h3>

                      <p className="mt-2.5 text-sm text-neutral-600 leading-relaxed">
                        {lang === 'ar' ? step.descAr : step.descFr}
                      </p>
                    </div>
                  </motion.article>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
