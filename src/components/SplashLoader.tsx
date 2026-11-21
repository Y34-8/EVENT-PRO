import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useApp } from '../context/AppContext.tsx';

const DURATION_MS = 10000;
const SVG_SIZE = 280;
const STROKE_WIDTH = 2.5;
const RADIUS = (SVG_SIZE - 24) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Full-screen luxury obsidian splash loader.
 * - Features the centered EVENT PRO emblem & wordmark.
 * - Draws a golden SVG ring progressively from 0% to 100% over exactly 10 seconds.
 */
export function SplashLoader() {
  const { lang } = useApp();
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const start = performance.now();
    let rafId = 0;
    let exitTimer: number | null = null;

    const update = (now: number) => {
      const elapsed = now - start;
      const ratio = Math.min(1, elapsed / DURATION_MS);
      // Smooth slight easeInOutSine curve for organic luxury drawing feel while staying faithful to 10s duration
      const eased = -(Math.cos(Math.PI * ratio) - 1) / 2;
      setProgress(eased);

      if (ratio < 1) {
        rafId = window.requestAnimationFrame(update);
      } else {
        setProgress(1);
        exitTimer = window.setTimeout(() => setVisible(false), 180);
      }
    };

    rafId = window.requestAnimationFrame(update);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setVisible(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.cancelAnimationFrame(rafId);
      if (exitTimer !== null) window.clearTimeout(exitTimer);
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [visible]);

  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const percent = Math.round(progress * 100);
  const angleRad = (progress * 360 - 90) * (Math.PI / 180);
  const tipX = SVG_SIZE / 2 + RADIUS * Math.cos(angleRad);
  const tipY = SVG_SIZE / 2 + RADIUS * Math.sin(angleRad);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="event-pro-splash"
          role="status"
          aria-live="polite"
          aria-label={
            lang === 'ar'
              ? 'جاري تحميل منصة إيفنت برو'
              : 'Chargement de la plateforme EVENT PRO'
          }
          initial={{ opacity: 1 }}
          exit={
            prefersReducedMotion
              ? { opacity: 0, transition: { duration: 0.15 } }
              : { opacity: 0, scale: 1.02, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } }
          }
          className="fixed inset-0 z-[100] bg-[#0A0A0B] text-white flex flex-col items-center justify-center px-6 select-none overflow-hidden"
        >
          {/* Ambient radial gold aura behind the central emblem */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 50% 48%, rgba(184, 144, 56, 0.15) 0%, rgba(10, 10, 11, 0.92) 48%, #0A0A0B 75%)',
            }}
          />

          {/* Central Golden Ring & Logo */}
          <div className="relative flex items-center justify-center w-[250px] h-[250px] sm:w-[280px] sm:h-[280px]">
            <svg
              viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
              className="absolute inset-0 w-full h-full overflow-visible"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="splashGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8E6B1E" />
                  <stop offset="50%" stopColor="#D4AE5E" />
                  <stop offset="100%" stopColor="#F4E6C1" />
                </linearGradient>
                <filter id="splashGoldGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Subtle outer hairline track */}
              <circle
                cx={SVG_SIZE / 2}
                cy={SVG_SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="rgba(212, 174, 94, 0.14)"
                strokeWidth="1.5"
              />

              {/* Inner fine architectural reference ring */}
              <circle
                cx={SVG_SIZE / 2}
                cy={SVG_SIZE / 2}
                r={RADIUS - 14}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1"
                strokeDasharray="2 8"
              />

              {/* Progressively Drawn Golden Circle */}
              <circle
                cx={SVG_SIZE / 2}
                cy={SVG_SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="url(#splashGoldGrad)"
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                transform={`rotate(-90 ${SVG_SIZE / 2} ${SVG_SIZE / 2})`}
                filter="url(#splashGoldGlow)"
              />

              {/* Luminous Gold Nib Following the Drawing Tip */}
              {!prefersReducedMotion && progress > 0.005 && progress < 0.995 && (
                <circle
                  cx={tipX}
                  cy={tipY}
                  r="4"
                  fill="#F4E6C1"
                  filter="url(#splashGoldGlow)"
                />
              )}
            </svg>

            {/* Centered EVENT PRO Emblem & Wordmark */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex flex-col items-center text-center px-4"
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 64 64"
                fill="none"
                aria-hidden="true"
                className="mb-3.5"
              >
                <rect width="64" height="64" rx="12" fill="#141416" />
                <rect x="6" y="6" width="52" height="52" rx="8" stroke="#B89038" strokeWidth="2" />
                <path
                  d="M20 20H44M20 32H38M20 44H44M20 20V44"
                  stroke="#FAFAFA"
                  strokeWidth="3"
                  strokeLinecap="square"
                />
                <circle cx="44" cy="32" r="4" fill="#B89038" />
              </svg>

              <span className="font-display text-2xl sm:text-3xl font-semibold tracking-[0.18em] text-white">
                EVENT PRO
              </span>
              <span className="mt-1.5 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.28em] text-[#D4AE5E]">
                {lang === 'ar' ? 'الدار البيضاء · المغرب' : 'Casablanca · Maroc'}
              </span>
            </motion.div>
          </div>

          {/* Synchronized Progress Readout Below the Ring */}
          <div className="relative z-10 mt-8 flex flex-col items-center gap-2 text-center">
            <p className="font-mono text-sm font-medium text-[#D4AE5E] tabular-nums tracking-widest">
              {String(percent).padStart(2, '0')}%
            </p>
            <p className="text-xs tracking-wider text-neutral-400">
              {lang === 'ar'
                ? 'جاري تهيئة تجربتكم الحصرية...'
                : 'Préparation de votre expérience événementielle...'}
            </p>
          </div>

          {/* Discreet Skip Control for Accessibility / Returning Visitors */}
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="relative z-10 mt-10 text-[11px] uppercase tracking-[0.2em] text-neutral-500 hover:text-[#D4AE5E] transition-colors px-3 py-1.5 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AE5E] rounded"
          >
            {lang === 'ar' ? 'تخطي' : 'Passer l’introduction'}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
