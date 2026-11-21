import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export function NotFoundPage() {
  const { lang } = useApp();
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-sm text-[#8E6B1E]">404</p>
      <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#0A0A0B] mt-2">
        {lang === 'ar' ? 'الصفحة غير موجودة' : 'Page introuvable'}
      </h1>
      <p className="mt-3 text-sm text-neutral-600 max-w-md">
        {lang === 'ar'
          ? 'الصفحة التي تبحثون عنها غير متاحة أو تم نقلها.'
          : 'La page demandée n\'existe pas ou a été déplacée.'}
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold bg-[#0A0A0B] text-white rounded-lg hover:bg-neutral-800"
      >
        <ArrowLeft className="w-4 h-4" />
        {lang === 'ar' ? 'العودة إلى الرئيسية' : 'Retour à l\'accueil'}
      </Link>
    </div>
  );
}
