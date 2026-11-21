import React, { useEffect, useRef } from 'react';

type CursorVariant = 'default' | 'interactive' | 'image' | 'input';

/**
 * Desktop-only accessible golden cursor halo.
 * - Preserves the native OS cursor so screen magnifiers, high-contrast pointers,
 *   I-beam text cursors, and drag/resize cursors remain 100% accessible.
 * - Automatically disabled on mobile/touchscreens (`pointer: coarse`, `hover: none`,
 *   or `touch` pointer events) and when `prefers-reduced-motion: reduce` is enabled.
 * - Uses refs + requestAnimationFrame + GPU transform: translate3d (zero per-frame React re-renders).
 */
export function GoldenCursor() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const finePointerMq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotionMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    let isEnabled = finePointerMq.matches && !reducedMotionMq.matches;
    let isVisible = false;
    let isPressed = false;
    let variant: CursorVariant = 'default';

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let currentScale = 1;
    let targetScale = 1;
    let rafId: number | null = null;

    const syncVisibilityStyles = () => {
      const container = containerRef.current;
      const ring = ringRef.current;
      const dot = dotRef.current;
      if (!container || !ring || !dot) return;

      if (!isEnabled || !isVisible || variant === 'input') {
        container.style.opacity = '0';
        return;
      }

      container.style.opacity = '1';

      if (variant === 'image') {
        targetScale = isPressed ? 1.85 : 2.25;
        ring.style.borderColor = 'rgba(212, 174, 94, 0.95)';
        ring.style.backgroundColor = 'rgba(184, 144, 56, 0.14)';
        ring.style.boxShadow = '0 0 24px rgba(212, 174, 94, 0.28)';
        dot.style.opacity = '0.9';
        dot.style.transform = 'translate3d(-50%, -50%, 0) scale(1.15)';
      } else if (variant === 'interactive') {
        targetScale = isPressed ? 1.45 : 1.8;
        ring.style.borderColor = 'rgba(212, 174, 94, 0.98)';
        ring.style.backgroundColor = 'rgba(212, 174, 94, 0.18)';
        ring.style.boxShadow = '0 0 18px rgba(184, 144, 56, 0.32)';
        dot.style.opacity = '1';
        dot.style.transform = 'translate3d(-50%, -50%, 0) scale(0.85)';
      } else {
        targetScale = isPressed ? 0.85 : 1;
        ring.style.borderColor = 'rgba(184, 144, 56, 0.72)';
        ring.style.backgroundColor = 'rgba(212, 174, 94, 0.04)';
        ring.style.boxShadow = '0 0 10px rgba(184, 144, 56, 0.12)';
        dot.style.opacity = '0.75';
        dot.style.transform = 'translate3d(-50%, -50%, 0) scale(1)';
      }
    };

    const detectVariant = (target: EventTarget | null, x: number, y: number): CursorVariant => {
      if (!(target instanceof Element)) return 'default';

      // 1. Keep form controls clean so native I-beam / select cursors remain unobstructed
      if (target.closest('input, textarea, select, [contenteditable="true"]')) {
        return 'input';
      }

      // 2. Direct image or explicit image surface (including gallery cards where an overlay sits above <img>)
      if (target instanceof HTMLImageElement || target.closest('[data-cursor="image"]')) {
        return 'image';
      }

      const clickableParent = target.closest(
        'a, button, [role="button"], [role="tab"], [role="slider"], summary, label[for]',
      );

      if (clickableParent) {
        // If hovering directly over the photo portion of a gallery/experience card, highlight as image
        const nestedImg = clickableParent.querySelector('img');
        if (nestedImg) {
          const rect = nestedImg.getBoundingClientRect();
          if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            return 'image';
          }
        }
        return 'interactive';
      }

      // Non-clickable figure/image wrapper with overlay scrim
      const imageContainer = target.closest('figure, [role="img"]');
      if (imageContainer) {
        return 'image';
      }

      return 'default';
    };

    const tick = () => {
      // Smooth spring-like interpolation (higher factor keeps cursor feeling crisp yet fluid)
      currentX += (targetX - currentX) * 0.24;
      currentY += (targetY - currentY) * 0.24;
      currentScale += (targetScale - currentScale) * 0.22;

      const container = containerRef.current;
      const ring = ringRef.current;
      if (container && ring) {
        container.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        ring.style.transform = `translate3d(-50%, -50%, 0) scale(${currentScale})`;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (rafId === null && isEnabled) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const stopLoop = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isEnabled) return;

      // Immediately hide on touch input (supports 2-in-1 / hybrid touch laptops)
      if (e.pointerType === 'touch') {
        isVisible = false;
        syncVisibilityStyles();
        return;
      }

      if (!isVisible) {
        currentX = e.clientX;
        currentY = e.clientY;
        isVisible = true;
      }

      targetX = e.clientX;
      targetY = e.clientY;
      variant = detectVariant(e.target, e.clientX, e.clientY);
      syncVisibilityStyles();
      startLoop();
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (!isEnabled || e.pointerType === 'touch') return;
      isPressed = true;
      syncVisibilityStyles();
    };

    const handlePointerUp = () => {
      if (!isEnabled) return;
      isPressed = false;
      syncVisibilityStyles();
    };

    const handleMouseLeaveWindow = () => {
      isVisible = false;
      isPressed = false;
      syncVisibilityStyles();
    };

    const handleMediaChange = () => {
      isEnabled = finePointerMq.matches && !reducedMotionMq.matches;
      if (!isEnabled) {
        isVisible = false;
        syncVisibilityStyles();
        stopLoop();
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeaveWindow);
    window.addEventListener('blur', handleMouseLeaveWindow);

    finePointerMq.addEventListener?.('change', handleMediaChange);
    reducedMotionMq.addEventListener?.('change', handleMediaChange);

    return () => {
      stopLoop();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      window.removeEventListener('blur', handleMouseLeaveWindow);
      finePointerMq.removeEventListener?.('change', handleMediaChange);
      reducedMotionMq.removeEventListener?.('change', handleMediaChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed top-0 left-0 z-[9999] pointer-events-none opacity-0 transition-opacity duration-200 hidden md:block"
      style={{ willChange: 'transform, opacity' }}
    >
      {/* Outer Expanding Golden Ring */}
      <div
        ref={ringRef}
        className="absolute top-0 left-0 w-8 h-8 rounded-full border-[1.5px] transition-[background-color,border-color,box-shadow] duration-200 ease-out"
        style={{
          transform: 'translate3d(-50%, -50%, 0) scale(1)',
          borderColor: 'rgba(184, 144, 56, 0.72)',
          backgroundColor: 'rgba(212, 174, 94, 0.04)',
          willChange: 'transform',
        }}
      />
      {/* Subtle Concentric Golden Point */}
      <div
        ref={dotRef}
        className="absolute top-0 left-0 w-1.5 h-1.5 rounded-full bg-[#D4AE5E] transition-[opacity,transform] duration-150"
        style={{
          transform: 'translate3d(-50%, -50%, 0) scale(1)',
          boxShadow: '0 0 6px rgba(212, 174, 94, 0.8)',
        }}
      />
    </div>
  );
}
