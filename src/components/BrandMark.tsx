import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

export function BrandLogo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
      <svg
        width="28"
        height="28"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="64" height="64" rx="12" fill={dark ? '#161618' : '#0A0A0B'} />
        <rect x="6" y="6" width="52" height="52" rx="8" stroke="#B89038" strokeWidth="2" />
        <path
          d="M20 20H44M20 32H38M20 44H44M20 20V44"
          stroke="#FAFAFA"
          strokeWidth="3"
          strokeLinecap="square"
        />
        <circle cx="44" cy="32" r="4" fill="#B89038" />
      </svg>
      <span
        className={`font-display text-xl font-semibold tracking-tight ${
          dark ? 'text-white' : 'text-[#0A0A0B]'
        }`}
      >
        EVENT PRO
      </span>
    </span>
  );
}

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function SafeImage({ src, alt, className = 'w-full h-full object-cover' }: SafeImageProps) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#141416] via-[#1E1C18] to-[#0A0A0B] text-[#E8DFC8] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Sparkles className="w-6 h-6 text-[#B89038] mb-2 opacity-80" />
        <span className="text-xs font-medium tracking-wide opacity-80 line-clamp-2">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setErrored(true)}
      className={className}
    />
  );
}
