import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Calendar, MapPin, Check } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { formatLocalDate, formatMad, MOROCCAN_CITIES, translations } from '../i18n/translations.ts';
import { SafeImage } from '../components/BrandMark.tsx';
import { PremiumStatsSection } from '../components/PremiumStatsSection.tsx';
import { MasonryGallerySection } from '../components/MasonryGallerySection.tsx';
import { VenueCarouselSection } from '../components/VenueCarouselSection.tsx';
import { ExploreByExperienceSection } from '../components/ExploreByExperienceSection.tsx';
import { ExclusiveOffersSection } from '../components/ExclusiveOffersSection.tsx';
import { ClientLoveStoriesSection } from '../components/ClientLoveStoriesSection.tsx';
import { EventTimelineSection } from '../components/EventTimelineSection.tsx';
import { BeforeAfterGallerySection } from '../components/BeforeAfterGallerySection.tsx';
import { DiscoverCasablancaSection } from '../components/DiscoverCasablancaSection.tsx';
import { api, getApiErrorMessage } from '../lib/api.ts';

export function HomePage() {
  const { lang, bootstrap } = useApp();
  const t = translations[lang];

  const homeContent = bootstrap?.settings?.homeContent;
  const services = bootstrap?.services || [];
  const events = bootstrap?.events || [];
  const gallery = bootstrap?.gallery || [];
  const reviews = bootstrap?.reviews || [];

  const heroTitle =
    lang === 'ar'
      ? homeContent?.heroTitleAr || 'حوّلوا فعالياتكم إلى لحظات لا تُنسى.'
      : homeContent?.heroTitleFr || 'Transformez vos événements en moments inoubliables.';

  const heroSubtitle =
    lang === 'ar'
      ? homeContent?.heroSubtitleAr ||
        'ترافقكم إيفنت برو في تنظيم فعالياتكم بالدار البيضاء وجميع أنحاء المغرب.'
      : homeContent?.heroSubtitleFr ||
        "EVENT PRO vous accompagne dans l'organisation de vos événements à Casablanca et partout au Maroc.";

  const heroImage =
    homeContent?.heroImageUrl || '/src/assets/images/hero_event_gala_1795276605928.jpg';
  const aboutImage =
    homeContent?.aboutImageUrl || '/src/assets/images/about_agency_team_1795276605935.jpg';

  const stats = homeContent?.stats || [
    { value: '340+', labelFr: 'Événements orchestrés depuis 2018', labelAr: 'فعالية منظمة منذ 2018' },
    { value: '98,4%', labelFr: 'Satisfaction client vérifiée', labelAr: 'نسبة رضا العملاء' },
    { value: '12', labelFr: "Pôles d'expertise intégrés", labelAr: 'تخصصاً متكاملاً' },
    { value: '24h', labelFr: 'Réponse devis personnalisée', labelAr: 'الرد على طلبات الأسعار' },
  ];

  // Quick quote state
  const [quoteForm, setQuoteForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    eventType: 'Mariages et cérémonies',
    eventDate: '',
    city: 'Casablanca',
    guestCount: 150,
    notes: '',
  });
  const [quoteBusy, setQuoteBusy] = useState(false);
  const [quoteResult, setQuoteResult] = useState<string | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState<string | null>(null);
  const [newsletterErr, setNewsletterErr] = useState<string | null>(null);

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteBusy(true);
    setQuoteError(null);
    setQuoteResult(null);
    try {
      const res = await api.post('/quotes/request', quoteForm);
      setQuoteResult(res.data.quoteNumber);
      setQuoteForm({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        eventType: 'Mariages et cérémonies',
        eventDate: '',
        city: 'Casablanca',
        guestCount: 150,
        notes: '',
      });
    } catch (err) {
      setQuoteError(getApiErrorMessage(err));
    } finally {
      setQuoteBusy(false);
    }
  };

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterErr(null);
    setNewsletterMsg(null);
    try {
      await api.post('/newsletter', { email: newsletterEmail });
      setNewsletterMsg(t.home.newsletterSuccess);
      setNewsletterEmail('');
    } catch (err) {
      setNewsletterErr(getApiErrorMessage(err));
    }
  };

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="relative bg-[#0A0A0B] text-white overflow-hidden">
        <div className="absolute inset-0">
          <SafeImage src={heroImage} alt="EVENT PRO Casablanca Gala" className="w-full h-full object-cover opacity-55" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0B]/95 via-[#0A0A0B]/70 to-[#0A0A0B]/35" />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <p className="text-xs sm:text-sm font-medium tracking-wider text-[#D4AE5E] mb-4">
              {t.hero.eyebrow}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.08] text-balance text-white">
              {heroTitle}
            </h1>
            <p className="mt-6 text-base sm:text-lg text-neutral-200 leading-relaxed max-w-2xl">
              {heroSubtitle}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/reserver"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold bg-[#B89038] text-[#0A0A0B] rounded-lg hover:bg-[#CCA44B] transition-colors whitespace-nowrap shrink-0"
              >
                {t.hero.bookEvent}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
              >
                {t.hero.discoverServices}
              </Link>
            </div>
          </motion.div>
        </div>

        {/* 4-Column KPI strip below hero */}
        <div className="relative border-t border-white/10 bg-[#0A0A0B]/85 backdrop-blur-sm">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-7 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((st, idx) => (
              <div key={idx} className="space-y-1">
                <p className="font-display text-3xl sm:text-4xl font-semibold text-[#D4AE5E] tabular-nums">
                  {st.value}
                </p>
                <p className="text-xs sm:text-sm text-neutral-300">
                  {lang === 'ar' ? st.labelAr : st.labelFr}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. PRÉSENTATION DE L'ENTREPRISE */}
      <section className="py-20 lg:py-24 bg-white border-b border-neutral-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-xs font-semibold tracking-wider text-[#8E6B1E] mb-3">
              {lang === 'ar' ? 'وكالة إيفنت برو · الدار البيضاء' : 'Maison EVENT PRO · Casablanca'}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#0A0A0B] text-balance">
              {t.home.introTitle}
            </h2>
            <p className="mt-5 text-base text-neutral-600 leading-relaxed max-w-[65ch]">
              {t.home.introBody}
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-neutral-700">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#B89038] shrink-0" />
                <span>{lang === 'ar' ? 'إدارة كاملة في الدار البيضاء والرباط ومراكش' : 'Couverture Casablanca, Rabat, Marrakech'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#B89038] shrink-0" />
                <span>{lang === 'ar' ? 'تتبع الحجوزات وعروض الأسعار عبر الإنترنت' : 'Suivi des réservations et devis en ligne'}</span>
              </div>
            </div>
            <div className="mt-8">
              <Link
                to="/a-propos"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A0A0B] border-b border-[#0A0A0B] pb-1 hover:text-[#8E6B1E] hover:border-[#8E6B1E] transition-colors"
              >
                {lang === 'ar' ? 'تعرف على قصتنا وفريقنا' : 'Découvrir notre maison'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full min-h-[340px] rounded-xl overflow-hidden border border-neutral-200">
              <SafeImage
                src={aboutImage}
                alt="Studio de direction artistique EVENT PRO Casablanca"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2B. EXPLORE BY EXPERIENCE */}
      <ExploreByExperienceSection lang={lang} />

      {/* 3. NOS PRINCIPAUX SERVICES */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#0A0A0B]">
                {t.home.servicesTitle}
              </h2>
              <p className="mt-3 text-base text-neutral-600 max-w-2xl">
                {t.home.servicesSubtitle}
              </p>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border border-neutral-300 text-[#0A0A0B] rounded-lg hover:bg-[#0A0A0B] hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              {t.home.viewAllServices}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 6).map((service, idx) => (
              <article
                key={service.id}
                className="group bg-white border border-neutral-200 rounded-xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                  <SafeImage
                    src={service.imageUrl}
                    alt={lang === 'ar' ? service.titleAr : service.titleFr}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2 tabular-nums">
                    <span>{String(idx + 1).padStart(2, '0')}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {lang === 'ar' ? service.priceUnitAr : service.priceUnitFr}{' '}
                      <strong className="text-[#0A0A0B] font-semibold">
                        {formatMad(service.basePriceMad, lang)}
                      </strong>
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-[#0A0A0B]">
                    {lang === 'ar' ? service.titleAr : service.titleFr}
                  </h3>
                  <p className="mt-2.5 text-sm text-neutral-600 leading-relaxed flex-1">
                    {lang === 'ar' ? service.shortDescAr : service.shortDescFr}
                  </p>
                  <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between gap-4">
                    <Link
                      to={`/services/${service.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0A0A0B] hover:text-[#8E6B1E] transition-colors"
                    >
                      {t.actions.discover}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/reserver?serviceId=${service.id}`}
                      className="text-xs font-medium text-neutral-600 hover:text-[#0A0A0B]"
                    >
                      {t.nav.bookNow}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3B. EXCLUSIVE OFFERS */}
      <ExclusiveOffersSection lang={lang} services={services} />

      {/* 4. NOS ÉVÉNEMENTS POPULAIRES */}
      <section className="py-20 lg:py-24 bg-[#0A0A0B] text-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                {t.home.eventsTitle}
              </h2>
              <p className="mt-3 text-base text-neutral-400 max-w-2xl">
                {t.home.eventsSubtitle}
              </p>
            </div>
            <Link
              to="/evenements"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#D4AE5E] hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              {lang === 'ar' ? 'عرض جميع الفعاليات' : 'Voir le calendrier complet'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.slice(0, 3).map((evt) => (
              <article
                key={evt.id}
                className="bg-[#141416] border border-neutral-800 rounded-xl overflow-hidden flex flex-col"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <SafeImage
                    src={evt.imageUrl}
                    alt={lang === 'ar' ? evt.titleAr : evt.titleFr}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2 tabular-nums">
                    <Calendar className="w-3.5 h-3.5 text-[#D4AE5E]" />
                    <span>{formatLocalDate(evt.eventDate, lang)}</span>
                    <span aria-hidden="true">·</span>
                    <MapPin className="w-3.5 h-3.5 text-[#D4AE5E]" />
                    <span>{evt.city}</span>
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-white">
                    {lang === 'ar' ? evt.titleAr : evt.titleFr}
                  </h3>
                  <p className="mt-2.5 text-sm text-neutral-400 leading-relaxed flex-1">
                    {lang === 'ar' ? evt.descriptionAr : evt.descriptionFr}
                  </p>
                  <div className="mt-5 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-300 tabular-nums">
                    <span>{evt.venue}</span>
                    <span>
                      {evt.ticketPriceMad > 0
                        ? formatMad(evt.ticketPriceMad, lang)
                        : lang === 'ar'
                          ? 'بدعوة خاصة'
                          : 'Sur invitation'}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 5. POURQUOI CHOISIR EVENT PRO */}
      <section className="py-20 lg:py-24 bg-white border-b border-neutral-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#0A0A0B] mb-12">
            {t.home.whyTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.home.whyItems.map((item) => (
              <div key={item.num} className="p-6 border border-neutral-200 rounded-xl bg-[#FAFAFA]">
                <p className="font-mono text-xs font-medium text-[#8E6B1E] mb-4 tabular-nums">
                  {item.num}.
                </p>
                <h3 className="text-lg font-semibold text-[#0A0A0B]">{item.title}</h3>
                <p className="mt-2.5 text-sm text-neutral-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5B. STATISTIQUES ANIMÉES PREMIUM */}
      <PremiumStatsSection
        lang={lang}
        eventsCount={bootstrap?.liveMetrics?.eventsCount ?? events.length}
        reservationsCount={bootstrap?.liveMetrics?.reservationsCount ?? 0}
      />

      {/* 5C. EVENT TIMELINE */}
      <EventTimelineSection lang={lang} />

      {/* 6. GALERIE MASONRY */}
      <section className="py-20 lg:py-24 bg-[#FAFAFA]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#0A0A0B]">
                {t.home.galleryTitle}
              </h2>
              <p className="mt-3 text-base text-neutral-600 max-w-2xl">
                {t.home.gallerySubtitle}
              </p>
            </div>
            <Link
              to="/realisations"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A0A0B] hover:text-[#8E6B1E]"
            >
              {lang === 'ar' ? 'استكشف المعرض الكامل' : 'Explorer la galerie'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div>
            <MasonryGallerySection items={gallery} lang={lang} maxItems={9} />
          </div>
        </div>
      </section>

      {/* 6B. GALERIE BEFORE & AFTER INTERACTIVE */}
      <BeforeAfterGallerySection lang={lang} services={services} />

      {/* 6C. CARROUSEL HORIZONTAL DE SALLES DE RÉCEPTION */}
      <VenueCarouselSection lang={lang} services={services} />

      {/* 6D. CLIENT LOVE STORIES */}
      <ClientLoveStoriesSection lang={lang} reviews={reviews} />

      {/* 6E. DISCOVER CASABLANCA · CARTE INTERACTIVE DES PRESTATAIRES */}
      <DiscoverCasablancaSection lang={lang} services={services} />

      {/* 7. FORMULAIRE DE DEMANDE DE DEVIS + NEWSLETTER */}
      <section className="py-20 lg:py-24 bg-white border-t border-neutral-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#0A0A0B]">
              {t.home.quoteSectionTitle}
            </h2>
            <p className="mt-3 text-base text-neutral-600 mb-8">{t.home.quoteSectionSubtitle}</p>

            <form onSubmit={handleQuoteSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder={lang === 'ar' ? 'الاسم الكامل' : 'Nom complet *'}
                  value={quoteForm.clientName}
                  onChange={(e) => setQuoteForm({ ...quoteForm, clientName: e.target.value })}
                  className="w-full px-4 py-3 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0A0A0B]"
                />
                <input
                  type="email"
                  required
                  placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'Adresse e-mail *'}
                  value={quoteForm.clientEmail}
                  onChange={(e) => setQuoteForm({ ...quoteForm, clientEmail: e.target.value })}
                  className="w-full px-4 py-3 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0A0A0B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="tel"
                  required
                  placeholder="+212 6 61 48 90 12"
                  value={quoteForm.clientPhone}
                  onChange={(e) => setQuoteForm({ ...quoteForm, clientPhone: e.target.value })}
                  className="w-full px-4 py-3 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0A0A0B]"
                />
                <select
                  value={quoteForm.city}
                  onChange={(e) => setQuoteForm({ ...quoteForm, city: e.target.value })}
                  className="w-full px-4 py-3 text-sm border border-neutral-300 rounded-lg bg-white focus:outline-none focus:border-[#0A0A0B]"
                >
                  {MOROCCAN_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={quoteForm.eventDate}
                  onChange={(e) => setQuoteForm({ ...quoteForm, eventDate: e.target.value })}
                  className="w-full px-4 py-3 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0A0A0B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  value={quoteForm.eventType}
                  onChange={(e) => setQuoteForm({ ...quoteForm, eventType: e.target.value })}
                  className="w-full px-4 py-3 text-sm border border-neutral-300 rounded-lg bg-white focus:outline-none focus:border-[#0A0A0B]"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.titleFr}>
                      {lang === 'ar' ? s.titleAr : s.titleFr}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={10}
                  max={20000}
                  value={quoteForm.guestCount}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, guestCount: Number(e.target.value) || 50 })
                  }
                  placeholder={lang === 'ar' ? 'عدد المشاركين' : 'Nombre de participants'}
                  className="w-full px-4 py-3 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0A0A0B] tabular-nums"
                />
              </div>

              <textarea
                rows={3}
                placeholder={
                  lang === 'ar'
                    ? 'تفاصيل الحدث والاحتياجات الخاصة...'
                    : 'Précisez votre besoin, lieu souhaité ou contraintes logistiques...'
                }
                value={quoteForm.notes}
                onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                className="w-full px-4 py-3 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0A0A0B]"
              />

              {quoteError && (
                <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-lg">
                  {quoteError}
                </p>
              )}
              {quoteResult && (
                <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-lg">
                  {lang === 'ar'
                    ? `تم إرسال طلب عرض السعر بنجاح (${quoteResult}).`
                    : `Demande de devis enregistrée sous la référence ${quoteResult}. Nos conseillers vous répondent sous 24h.`}
                </p>
              )}

              <button
                type="submit"
                disabled={quoteBusy}
                className="px-6 py-3.5 text-sm font-semibold bg-[#0A0A0B] text-white rounded-lg hover:bg-[#B89038] hover:text-[#0A0A0B] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {quoteBusy ? '...' : t.actions.sendRequest}
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between bg-[#0A0A0B] text-white rounded-xl p-8 sm:p-10">
            <div>
              <p className="text-xs font-semibold text-[#D4AE5E] tracking-wider mb-3">
                Newsletter EVENT PRO
              </p>
              <h3 className="font-display text-3xl font-semibold">{t.home.newsletterTitle}</h3>
              <p className="mt-3 text-sm text-neutral-300 leading-relaxed">
                {t.home.newsletterSubtitle}
              </p>
              <form onSubmit={handleNewsletter} className="mt-7 space-y-3">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder={t.home.newsletterPlaceholder}
                  className="w-full px-4 py-3 text-sm bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#D4AE5E]"
                />
                <button
                  type="submit"
                  className="w-full px-5 py-3 text-sm font-semibold bg-[#B89038] text-[#0A0A0B] rounded-lg hover:bg-[#CCA44B] transition-colors cursor-pointer"
                >
                  {t.home.newsletterCta}
                </button>
                {newsletterMsg && <p className="text-xs text-emerald-400">{newsletterMsg}</p>}
                {newsletterErr && <p className="text-xs text-rose-400">{newsletterErr}</p>}
              </form>
            </div>

            <div className="mt-10 pt-6 border-t border-neutral-800 text-xs text-neutral-400 space-y-1.5">
              <p className="text-white font-medium">
                {lang === 'ar' ? 'هل لديكم موعد محدد؟' : 'Vous avez déjà une date en tête ?'}
              </p>
              <p>
                {lang === 'ar'
                  ? 'تحققوا من التوفر الفوري واحجزوا عبر نظام الحجز المباشر.'
                  : 'Vérifiez nos disponibilités en direct et obtenez une estimation immédiate en MAD.'}
              </p>
              <Link
                to="/reserver"
                className="inline-flex items-center gap-1.5 text-[#D4AE5E] font-semibold pt-2 hover:underline"
              >
                {t.nav.bookNow}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
