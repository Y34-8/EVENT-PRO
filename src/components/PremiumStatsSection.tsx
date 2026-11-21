import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { BookmarkCheck, CalendarCheck, Handshake, Users } from 'lucide-react';
import { Lang } from '../types/index.ts';

interface StatDefinition {
  id: string;
  target: number;
  suffix: string;
  labelFr: string;
  labelAr: string;
  descFr: string;
  descAr: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

interface PremiumStatsSectionProps {
  lang: Lang;
  eventsCount?: number;
  reservationsCount?: number;
}

function AnimatedCounter({
  target,
  active,
  delayMs,
  lang,
}: {
  target: number;
  active: boolean;
  delayMs: number;
  lang: Lang;
}) {
  const [value, setValue] = useState(0);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!active) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      hasAnimatedRef.current = true;
      setValue(target);
      return;
    }

    if (hasAnimatedRef.current) {
      setValue(target);
      return;
    }

    let rafId = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const durationMs = 1600;

    timeoutId = setTimeout(() => {
      const startTime = performance.now();
      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / durationMs);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        setValue(current);

        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          hasAnimatedRef.current = true;
          setValue(target);
        }
      };
      rafId = requestAnimationFrame(tick);
    }, delayMs);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [active, target, delayMs]);

  const formatted = new Intl.NumberFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA', {
    maximumFractionDigits: 0,
  }).format(value);

  return <span>{formatted}</span>;
}

export function PremiumStatsSection({
  lang,
  eventsCount = 0,
  reservationsCount = 0,
}: PremiumStatsSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const items: StatDefinition[] = [
    {
      id: 'events',
      target: 340 + eventsCount,
      suffix: '+',
      labelFr: 'Événements organisés',
      labelAr: 'الفعاليات المنظمة',
      descFr: 'Mariages, congrès, galas et lancements orchestrés depuis Casablanca',
      descAr: 'حفلات زفاف ومؤتمرات وسهرات كبرى منظمة انطلاقاً من الدار البيضاء',
      Icon: CalendarCheck,
    },
    {
      id: 'clients',
      target: 1280,
      suffix: '+',
      labelFr: 'Clients satisfaits',
      labelAr: 'عملاء راضون',
      descFr: 'Directions générales, institutions et familles accompagnées au Maroc',
      descAr: 'شركات ومؤسسات وعائلات تم مواكبتها عبر جميع مدن المغرب',
      Icon: Users,
    },
    {
      id: 'partners',
      target: 85,
      suffix: '+',
      labelFr: 'Prestataires partenaires',
      labelAr: 'مزودو خدمات شركاء',
      descFr: 'Lieux d’exception, chefs traiteurs, régies audiovisuelles et décorateurs',
      descAr: 'فضاءات فاخرة وطهاة ومهندسو صوت وإضاءة ومصممو ديكور معتمدون',
      Icon: Handshake,
    },
    {
      id: 'reservations',
      target: 620 + reservationsCount,
      suffix: '+',
      labelFr: 'Réservations',
      labelAr: 'الحجوزات المؤكدة',
      descFr: 'Dossiers planifiés avec vérification anti double-réservation en ligne',
      descAr: 'طلبات محجوزة ومجدولة مع التحقق الفوري من التوفر عبر المنصة',
      Icon: BookmarkCheck,
    },
  ];

  return (
    <section
      ref={sectionRef}
      aria-labelledby="premium-stats-heading"
      className="py-20 lg:py-24 bg-[#0A0A0B] text-white border-y border-neutral-800"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#D4AE5E] mb-3">
              {lang === 'ar' ? 'إيفنت برو بالأرقام · الدار البيضاء' : 'EVENT PRO en chiffres · Casablanca'}
            </p>
            <h2
              id="premium-stats-heading"
              className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-white text-balance max-w-2xl"
            >
              {lang === 'ar'
                ? 'أرقام تعكس التميز والثقة عبر المملكة.'
                : 'Une maîtrise éprouvée au service de chaque événement.'}
            </h2>
          </div>
          <p className="text-sm text-neutral-400 max-w-md leading-relaxed">
            {lang === 'ar'
              ? 'مؤشرات أداء حقيقية منذ تأسيس الوكالة في الدار البيضاء سنة 2018.'
              : 'Indicateurs consolidés de nos productions privées et institutionnelles à Casablanca et partout au Maroc.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => {
            const Icon = item.Icon;
            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                transition={{
                  duration: 0.45,
                  delay: idx * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="bg-white text-[#0A0A0B] border border-neutral-200 rounded-xl p-8 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <Icon className="w-8 h-8 text-[#B89038]" strokeWidth={1.6} aria-hidden="true" />
                    <span className="font-mono text-xs font-medium text-neutral-400 tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <p className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-[#0A0A0B] tabular-nums">
                    <AnimatedCounter
                      target={item.target}
                      active={isVisible}
                      delayMs={idx * 90}
                      lang={lang}
                    />
                    <span className="text-[#B89038]">{item.suffix}</span>
                  </p>

                  <h3 className="mt-3 text-base font-semibold text-[#0A0A0B]">
                    {lang === 'ar' ? item.labelAr : item.labelFr}
                  </h3>
                </div>

                <p className="mt-3 pt-4 border-t border-neutral-100 text-xs text-neutral-600 leading-relaxed">
                  {lang === 'ar' ? item.descAr : item.descFr}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
