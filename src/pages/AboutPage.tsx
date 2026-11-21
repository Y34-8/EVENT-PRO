import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { SafeImage } from '../components/BrandMark.tsx';
import { PremiumStatsSection } from '../components/PremiumStatsSection.tsx';
import { translations } from '../i18n/translations.ts';

export function AboutPage() {
  const { lang, bootstrap } = useApp();
  const t = translations[lang];
  const aboutImg =
    bootstrap?.settings?.homeContent?.aboutImageUrl ||
    '/src/assets/images/about_agency_team_1795276605935.jpg';

  const team = [
    {
      name: 'Nadia Benjelloun',
      roleFr: 'Fondatrice & Directrice Artistique',
      roleAr: 'المؤسسة والمديرة الفنية',
      bioFr: '14 ans en architecture d\'intérieur et scénographie de grands galas à Casablanca et Paris.',
      bioAr: '14 عاماً من الخبرة في الهندسة الداخلية وتصميم الحفلات الكبرى.',
    },
    {
      name: 'Youssef El Mansouri',
      roleFr: 'Directeur Production & Technique',
      roleAr: 'مدير الإنتاج والتقنيات',
      bioFr: 'Ingénieur acoustique et lumière supervisant les congrès institutionnels et festivals.',
      bioAr: 'مهندس صوت وإضاءة يشرف على المؤتمرات الكبرى والمهرجانات.',
    },
    {
      name: 'Kenza Chraïbi',
      roleFr: 'Responsable Protocole & Clientèle VIP',
      roleAr: 'مسؤولة البروتوكول وكبار الشخصيات',
      bioFr: 'Coordination millimétrée des mariages d\'exception et dîners officiels.',
      bioAr: 'تنسيق دقيق لحفلات الزفاف الراقية والمآدب الرسمية.',
    },
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <section className="bg-[#0A0A0B] text-white py-16 lg:py-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <p className="text-xs font-semibold text-[#D4AE5E] tracking-wider mb-3">
              {lang === 'ar' ? 'من نحن · الدار البيضاء' : 'À propos d\'EVENT PRO · Casablanca'}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-balance">
              {lang === 'ar'
                ? 'دار تنظيم فعاليات تجمع بين الإبداع المغربي والدقة التنفيذية.'
                : 'L\'exigence architecturale au service de vos célébrations et congrès.'}
            </h1>
            <p className="mt-5 text-base text-neutral-300 leading-relaxed">
              {lang === 'ar'
                ? 'منذ تأسيسها في الدار البيضاء سنة 2018، تلتزم إيفنت برو بتحويل كل مناسبة إلى تجربة متكاملة لا تُنسى عبر المغرب.'
                : 'Fondée à Casablanca en 2018, EVENT PRO réunit des métiers complémentaires — scénographie, gastronomie, régie technique et hospitalité — pour offrir à chaque client une sérénité absolue.'}
            </p>
          </div>
          <div className="lg:col-span-6">
            <div className="aspect-[16/10] rounded-xl overflow-hidden border border-neutral-800">
              <SafeImage src={aboutImg} alt="Équipe EVENT PRO Casablanca" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-20">
        {/* Histoire, Mission, Vision */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-neutral-200 rounded-xl p-8">
            <p className="font-mono text-xs text-[#8E6B1E] mb-3">01.</p>
            <h2 className="font-display text-2xl font-semibold text-[#0A0A0B]">
              {lang === 'ar' ? 'تاريخنا' : 'Notre histoire'}
            </h2>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
              {lang === 'ar'
                ? 'انطلقت إيفنت برو من استوديو تصميم في حي غوتييه بالدار البيضاء لتصبح اليوم مرجعاً في تنظيم الفعاليات الكبرى بالمملكة.'
                : 'Née au quartier Gautier à Casablanca, la maison a d\'abord signé des réceptions privées avant d\'intégrer ses propres ateliers de décoration et sa régie audiovisuelle pour accompagner les grandes entreprises marocaines.'}
            </p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-8">
            <p className="font-mono text-xs text-[#8E6B1E] mb-3">02.</p>
            <h2 className="font-display text-2xl font-semibold text-[#0A0A0B]">
              {lang === 'ar' ? 'مهمتنا' : 'Notre mission'}
            </h2>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
              {lang === 'ar'
                ? 'تبسيط التنظيم المعقد عبر منصة رقمية شفافة وفريق ميداني متمرس يحترم المواعيد والميزانية.'
                : 'Allier la chaleur de l\'hospitalité marocaine à une planification rigoureuse, transparente en dirhams marocains et pilotable en ligne de la réservation au bilan final.'}
            </p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-8">
            <p className="font-mono text-xs text-[#8E6B1E] mb-3">03.</p>
            <h2 className="font-display text-2xl font-semibold text-[#0A0A0B]">
              {lang === 'ar' ? 'رؤيتنا' : 'Notre vision'}
            </h2>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
              {lang === 'ar'
                ? 'وضع معايير جديدة للجودة والابتكار في صناعة الفعاليات بشمال أفريقيا.'
                : 'Devenir la référence digitale et terrain de l\'événementiel haut de gamme au Maroc, en digitalisant la demande de devis et le suivi sans jamais perdre la dimension humaine.'}
            </p>
          </div>
        </div>

        {/* Valeurs & Points forts */}
        <div className="bg-white border border-neutral-200 rounded-xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <h2 className="font-display text-3xl font-semibold text-[#0A0A0B]">
              {lang === 'ar' ? 'قيمنا ونقاط قوتنا' : 'Nos valeurs & engagements'}
            </h2>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
              {lang === 'ar'
                ? 'الالتزام بالمواعيد، الإبداع المخصص، والشفافية الكاملة في التسعير.'
                : 'Chaque événement mobilise des protocoles de contrôle qualité stricts avant, pendant et après l\'ouverture des portes.'}
            </p>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-neutral-800">
            {[
              { fr: 'Exigence et ponctualité', ar: 'الدقة والالتزام بالمواعيد' },
              { fr: 'Créativité sur mesure', ar: 'إبداع مخصص لكل عميل' },
              { fr: 'Zéro prestataire caché', ar: 'شفافية كاملة في التنفيذ' },
              { fr: 'Sécurité et conformité technique', ar: 'معايير السلامة التقنية' },
              { fr: 'Suivi digital en temps réel', ar: 'متابعة رقمية فورية' },
              { fr: 'Artisans et chefs marocains', ar: 'حرفيون وطهاة مغاربة محترفون' },
            ].map((v, idx) => (
              <li key={idx} className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#B89038] shrink-0" />
                <span>{lang === 'ar' ? v.ar : v.fr}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Équipe */}
        <div>
          <h2 className="font-display text-3xl font-semibold text-[#0A0A0B] mb-8">
            {lang === 'ar' ? 'فريق القيادة' : 'L\'équipe dirigeante'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.name} className="bg-white border border-neutral-200 rounded-xl p-7">
                <h3 className="font-display text-2xl font-semibold text-[#0A0A0B]">{member.name}</h3>
                <p className="text-xs font-semibold text-[#8E6B1E] mt-1">
                  {lang === 'ar' ? member.roleAr : member.roleFr}
                </p>
                <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
                  {lang === 'ar' ? member.bioAr : member.bioFr}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0A0A0B] text-white rounded-xl p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl font-semibold">
              {lang === 'ar' ? 'هل تخططون لفعالية قادمة؟' : 'Prêt à concevoir votre prochain événement ?'}
            </h2>
            <p className="mt-2 text-sm text-neutral-300">
              {lang === 'ar'
                ? 'احجزوا موعداً استشارياً أو قدّموا طلب حجز مباشر.'
                : 'Rencontrez notre équipe à Casablanca ou réservez votre date en ligne.'}
            </p>
          </div>
          <Link
            to="/reserver"
            className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold bg-[#B89038] text-[#0A0A0B] rounded-lg hover:bg-[#CCA44B] whitespace-nowrap shrink-0"
          >
            {t.nav.bookNow}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <PremiumStatsSection
        lang={lang}
        eventsCount={bootstrap?.liveMetrics?.eventsCount ?? bootstrap?.events?.length ?? 0}
        reservationsCount={bootstrap?.liveMetrics?.reservationsCount ?? 0}
      />
    </div>
  );
}
