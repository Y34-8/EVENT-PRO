import React from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';

/**
 * Fine golden reading/scroll progress bar pinned to the very top of the viewport.
 * - GPU-composited (`transform: scaleX`) for zero layout thrashing at 60/120fps.
 * - Respects `prefers-reduced-motion` and adapts origin for LTR (French) and RTL (Arabic).
 */
export function ScrollProgressBar() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 34,
    restDelta: 0.001,
  });

  const scaleX = prefersReducedMotion ? scrollYProgress : smoothProgress;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 inset-x-0 z-[60] h-[3px] pointer-events-none"
    >
      <motion.div
        style={{ scaleX }}
        className="h-full w-full origin-left rtl:origin-right bg-gradient-to-r rtl:bg-gradient-to-l from-[#8E6B1E] via-[#D4AE5E] to-[#F4E6C1] shadow-[0_0_10px_rgba(212,174,94,0.5)]"
      />
    </div>
  );
}
