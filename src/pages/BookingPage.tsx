import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Calendar, CreditCard, Building2, Banknote } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { formatLocalDate, formatMad, MOROCCAN_CITIES, translations } from '../i18n/translations.ts';
import { api, getApiErrorMessage } from '../lib/api.ts';
import { EXCLUSIVE_OFFERS } from '../lib/offers.ts';
import { ReservationRecord } from '../types/index.ts';

export function BookingPage() {
  const [searchParams] = useSearchParams();
  const { lang, bootstrap, user } = useApp();
  const t = translations[lang];

  const services = bootstrap?.services || [];
  const paymentConfig = bootstrap?.settings?.paymentConfig;
  const cmiConfigured = bootstrap?.integrations?.cmiConfigured ?? false;

  const initialServiceId = Number(searchParams.get('serviceId')) || (services[0]?.id ?? 0);
  const initialExtras = (searchParams.get('extras') || '').split(',').filter(Boolean);
  const initialCity = searchParams.get('city') || '';
  const initialVenue = searchParams.get('venue') || '';
  const promoCode = (searchParams.get('promo') || '').trim().toUpperCase();

  const [serviceId, setServiceId] = useState<number>(initialServiceId);
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>(initialExtras);
  const [eventDate, setEventDate] = useState('');
  const [availability, setAvailability] = useState<{
    checking: boolean;
    available: boolean | null;
    reason?: string;
  }>({ checking: false, available: null });

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: initialCity || user?.city || 'Casablanca',
    venueAddress: initialVenue,
    guestCount: 150,
    estimatedBudgetMad: 50000,
    notes: '',
    paymentMethod: 'bank_transfer' as 'bank_transfer' | 'on_site' | 'none',
  });

  useEffect(() => {
    if (!serviceId && services.length > 0) {
      setServiceId(services[0].id);
    }
  }, [services, serviceId]);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName,
        email: prev.email || user.email,
        phone: prev.phone || user.phone,
        city: prev.city || user.city || 'Casablanca',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!eventDate || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
      setAvailability({ checking: false, available: null });
      return;
    }
    let active = true;
    setAvailability({ checking: true, available: null });
    api
      .get<{ available: boolean; reason: string }>(`/availability?date=${eventDate}`)
      .then((res) => {
        if (active) {
          setAvailability({ checking: false, available: res.data.available, reason: res.data.reason });
        }
      })
      .catch(() => {
        if (active) setAvailability({ checking: false, available: null });
      });
    return () => {
      active = false;
    };
  }, [eventDate]);

  const activeService = useMemo(
    () => services.find((s) => s.id === Number(serviceId)) || services[0],
    [services, serviceId]
  );

  const activeOffer = useMemo(
    () =>
      activeService
        ? EXCLUSIVE_OFFERS.find((o) => o.code === promoCode && o.serviceSlug === activeService.slug) ||
          null
        : null,
    [activeService, promoCode]
  );

  const estimation = useMemo(() => {
    if (!activeService) return { total: 0, originalTotal: 0, deposit: 0, pct: 30 };
    const isCatering = activeService.slug.includes('traiteur');
    const rawBase = isCatering
      ? Math.round((form.guestCount / 50) * activeService.basePriceMad)
      : activeService.basePriceMad;
    const discountedBase = activeOffer
      ? Math.round(rawBase * (1 - activeOffer.discountPercent / 100))
      : rawBase;
    const extrasSum = (activeService.extraOptions || [])
      .filter((o) => selectedExtraIds.includes(o.id))
      .reduce((acc, o) => acc + o.priceMad, 0);
    const total = discountedBase + extrasSum;
    const originalTotal = rawBase + extrasSum;
    const pct = paymentConfig?.depositPercent || 30;
    return { total, originalTotal, deposit: Math.round((total * pct) / 100), pct };
  }, [activeService, activeOffer, selectedExtraIds, form.guestCount, paymentConfig]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    reservation: ReservationRecord;
    payment: { referenceCode: string; amountMad: number; method: string } | null;
  } | null>(null);

  const toggleExtra = (id: string) => {
    setSelectedExtraIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (availability.available === false) {
      setSubmitError(
        lang === 'ar'
          ? 'التاريخ المختار محجوز بالكامل. يرجى اختيار تاريخ آخر.'
          : 'Cette date est indisponible. Veuillez choisir une autre date.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/reservations', {
        serviceId: activeService?.id,
        eventType: activeService?.titleFr || 'Événement sur mesure',
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        eventDate,
        city: form.city,
        venueAddress: form.venueAddress,
        guestCount: form.guestCount,
        estimatedBudgetMad: form.estimatedBudgetMad,
        selectedExtraIds,
        notes: form.notes,
        promoCode: activeOffer?.code,
        paymentMethod: form.paymentMethod === 'none' ? undefined : form.paymentMethod,
      });
      setConfirmation(res.data);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmation) {
    const r = confirmation.reservation;
    return (
      <div className="bg-[#FAFAFA] min-h-screen py-16 px-4">
        <div className="max-w-2xl mx-auto bg-white border border-neutral-200 rounded-xl p-8 sm:p-10">
          <div className="flex items-center gap-3 text-emerald-700 mb-4">
            <CheckCircle2 className="w-7 h-7" />
            <span className="text-sm font-semibold">
              {lang === 'ar' ? 'تم تسجيل طلب الحجز بنجاح' : 'Demande de réservation enregistrée'}
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#0A0A0B]">
            {lang === 'ar' ? 'رقم الحجز:' : 'Référence'} <span className="font-mono">{r.bookingCode}</span>
          </h1>
          <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
            {lang === 'ar'
              ? 'تم حفظ طلبكم في قاعدة البيانات. يمكنكم متابعة حالة الحجز عبر حسابكم الشخصي.'
              : 'Votre demande a été enregistrée dans notre base de données et transmise à nos équipes à Casablanca.'}
          </p>

          <dl className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-y border-neutral-200 text-sm">
            <div>
              <dt className="text-neutral-500 text-xs">{lang === 'ar' ? 'الحدث' : 'Prestation'}</dt>
              <dd className="font-semibold mt-0.5">{r.eventType}</dd>
            </div>
            <div>
              <dt className="text-neutral-500 text-xs">{lang === 'ar' ? 'التاريخ والمدينة' : 'Date & Ville'}</dt>
              <dd className="font-semibold mt-0.5">
                {formatLocalDate(r.eventDate, lang)} · {r.city}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500 text-xs">{lang === 'ar' ? 'التقدير المالي' : 'Estimation totale'}</dt>
              <dd className="font-semibold mt-0.5 tabular-nums">{formatMad(r.calculatedTotalMad, lang)}</dd>
            </div>
            <div>
              <dt className="text-neutral-500 text-xs">{lang === 'ar' ? 'التسبيق المطلوب' : 'Acompte indicatif'}</dt>
              <dd className="font-semibold mt-0.5 text-[#8E6B1E] tabular-nums">
                {formatMad(r.depositRequiredMad, lang)}
              </dd>
            </div>
          </dl>

          {confirmation.payment && (
            <div className="mt-6 p-5 bg-[#FAF6EC] border border-[#E6D6AD] rounded-lg text-sm space-y-2">
              <p className="font-semibold text-[#0A0A0B]">
                {confirmation.payment.method === 'bank_transfer'
                  ? lang === 'ar'
                    ? 'تعليمات التحويل البنكي'
                    : 'Instructions de virement bancaire (Acompte)'
                  : lang === 'ar'
                    ? 'الدفع في مقر الوكالة'
                    : 'Règlement sur place — Agence Casablanca'}
              </p>
              <p className="text-xs text-neutral-700 font-mono">
                Référence paiement : {confirmation.payment.referenceCode}
              </p>
              {confirmation.payment.method === 'bank_transfer' ? (
                <div className="text-xs text-neutral-700 space-y-1 pt-1">
                  <p>{paymentConfig?.bankName || 'Attijariwafa Bank — Agence Anfa'}</p>
                  <p className="font-mono font-semibold">
                    RIB : {paymentConfig?.bankRib || '007 780 0001482000304912 45'}
                  </p>
                  <p>Bénéficiaire : {paymentConfig?.bankBeneficiary || 'EVENT PRO SARL'}</p>
                </div>
              ) : (
                <p className="text-xs text-neutral-700">
                  {lang === 'ar' ? paymentConfig?.onSiteInstructionsAr : paymentConfig?.onSiteInstructionsFr}
                </p>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to={user ? '/espace-client' : '/connexion'}
              className="px-5 py-3 text-sm font-semibold bg-[#0A0A0B] text-white rounded-lg hover:bg-neutral-800"
            >
              {user
                ? lang === 'ar'
                  ? 'متابعة حجزي'
                  : 'Suivre ma réservation'
                : lang === 'ar'
                  ? 'الدخول إلى حسابي'
                  : 'Accéder à mon espace client'}
            </Link>
            <Link
              to="/services"
              className="px-5 py-3 text-sm font-semibold border border-neutral-300 rounded-lg hover:bg-neutral-100"
            >
              {t.nav.services}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <section className="bg-[#0A0A0B] text-white py-14">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-[#D4AE5E] tracking-wider mb-2">
            {lang === 'ar' ? 'الحجز الإلكتروني' : 'Réservation en ligne'}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold">
            {lang === 'ar' ? 'احجز فعاليتك مع إيفنت برو' : 'Réserver votre événement'}
          </h1>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8 space-y-8">
            {/* Step 1: Prestation & Date */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-5">
              <h2 className="font-display text-2xl font-semibold text-[#0A0A0B]">
                01. {lang === 'ar' ? 'نوع الفعالية والتاريخ' : 'Prestation, date et lieu'}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    {lang === 'ar' ? 'الخدمة المختارة *' : 'Prestation principale *'}
                  </label>
                  <select
                    value={serviceId}
                    onChange={(e) => {
                      setServiceId(Number(e.target.value));
                      setSelectedExtraIds([]);
                    }}
                    className="w-full px-4 py-3 text-sm border border-neutral-300 rounded-lg bg-white"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {lang === 'ar' ? s.titleAr : s.titleFr} ({formatMad(s.basePriceMad, lang)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    {lang === 'ar' ? 'تاريخ الفعالية *' : 'Date souhaitée *'}
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-4 py-3 text-sm border border-neutral-300 rounded-lg"
                    />
                  </div>
                  {availability.checking && (
                    <p className="text-xs text-neutral-500 mt-1.5">Vérification des disponibilités...</p>
                  )}
                  {availability.available === true && (
                    <p className="text-xs text-emerald-700 mt-1.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {lang === 'ar' ? 'التاريخ متاح للحجز.' : 'Date disponible pour votre événement.'}
                    </p>
                  )}
                  {availability.available === false && (
                    <p className="text-xs text-rose-700 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {lang === 'ar'
                        ? 'هذا التاريخ غير متاح حالياً.'
                        : 'Capacité atteinte ou date bloquée. Choisissez une autre date.'}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    {lang === 'ar' ? 'المدينة *' : 'Ville *'}
                  </label>
                  <select
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-4 py-3 text-sm border border-neutral-300 rounded-lg bg-white"
                  >
                    {MOROCCAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    {lang === 'ar' ? 'عدد المشاركين *' : 'Participants *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={20000}
                    value={form.guestCount}
                    onChange={(e) => setForm({ ...form, guestCount: Number(e.target.value) || 50 })}
                    className="w-full px-4 py-3 text-sm border border-neutral-300 rounded-lg tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    {lang === 'ar' ? 'الميزانية التقديرية (درهم)' : 'Budget estimé (MAD)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={form.estimatedBudgetMad}
                    onChange={(e) =>
                      setForm({ ...form, estimatedBudgetMad: Number(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-3 text-sm border border-neutral-300 rounded-lg tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  {lang === 'ar' ? 'العنوان أو الفضاء المقترح *' : 'Adresse ou lieu souhaité *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    lang === 'ar'
                      ? 'مثال: فيلا خاصة بعين الذئاب أو فندق بالدار البيضاء'
                      : 'Ex: Villa Ain Diab, Palais Anfa ou à recommander par EVENT PRO'
                  }
                  value={form.venueAddress}
                  onChange={(e) => setForm({ ...form, venueAddress: e.target.value })}
                  className="w-full px-4 py-3 text-sm border border-neutral-300 rounded-lg"
                />
              </div>
            </div>

            {/* Step 2: Options supplémentaires */}
            {activeService && activeService.extraOptions?.length > 0 && (
              <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-4">
                <h2 className="font-display text-2xl font-semibold text-[#0A0A0B]">
                  02. {lang === 'ar' ? 'الخدمات الإضافية' : 'Services supplémentaires'}
                </h2>
                <div className="space-y-3">
                  {activeService.extraOptions.map((opt) => {
                    const checked = selectedExtraIds.includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                          checked ? 'border-[#B89038] bg-[#FAF6EC]' : 'border-neutral-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleExtra(opt.id)}
                            className="w-4 h-4 accent-[#0A0A0B]"
                          />
                          <span className="text-sm font-medium">
                            {lang === 'ar' ? opt.labelAr : opt.labelFr}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-[#8E6B1E] tabular-nums">
                          + {formatMad(opt.priceMad, lang)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Coordonnées & besoin */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-5">
              <h2 className="font-display text-2xl font-semibold text-[#0A0A0B]">
                03. {lang === 'ar' ? 'بيانات الاتصال والوصف' : 'Vos coordonnées et besoins'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="text"
                  required
                  placeholder={lang === 'ar' ? 'الاسم الكامل *' : 'Nom complet *'}
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full px-4 py-3 text-sm border border-neutral-300 rounded-lg"
                />
                <input
                  type="email"
                  required
                  placeholder={lang === 'ar' ? 'البريد الإلكتروني *' : 'Adresse e-mail *'}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 text-sm border border-neutral-300 rounded-lg"
                />
                <input
                  type="tel"
                  required
                  placeholder="+212 6 61 48 90 12"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 text-sm border border-neutral-300 rounded-lg"
                />
              </div>

              <textarea
                rows={4}
                placeholder={
                  lang === 'ar'
                    ? 'صف لنا رؤيتك ومتطلباتك الإضافية...'
                    : 'Décrivez votre besoin, thématique, contraintes horaires ou demandes particulières...'
                }
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-4 py-3 text-sm border border-neutral-300 rounded-lg"
              />
            </div>

            {/* Step 4: Options de règlement d'acompte */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-4">
              <h2 className="font-display text-2xl font-semibold text-[#0A0A0B]">
                04. {lang === 'ar' ? 'خيارات دفع التسبيق' : 'Modalité d\'acompte souhaitée'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label
                  className={`p-4 border rounded-lg cursor-pointer ${
                    form.paymentMethod === 'bank_transfer'
                      ? 'border-[#B89038] bg-[#FAF6EC]'
                      : 'border-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={form.paymentMethod === 'bank_transfer'}
                      onChange={() => setForm({ ...form, paymentMethod: 'bank_transfer' })}
                    />
                    <Building2 className="w-4 h-4 text-[#B89038]" />
                    <span>{lang === 'ar' ? 'تحويل بنكي (RIB)' : 'Virement bancaire'}</span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-2">
                    {lang === 'ar'
                      ? 'تحويل بنكي إلى حساب إيفنت برو بالمغرب.'
                      : 'Édition automatique des coordonnées RIB marocaines et référence.'}
                  </p>
                </label>

                <label
                  className={`p-4 border rounded-lg cursor-pointer ${
                    form.paymentMethod === 'on_site'
                      ? 'border-[#B89038] bg-[#FAF6EC]'
                      : 'border-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={form.paymentMethod === 'on_site'}
                      onChange={() => setForm({ ...form, paymentMethod: 'on_site' })}
                    />
                    <Banknote className="w-4 h-4 text-[#B89038]" />
                    <span>{lang === 'ar' ? 'الدفع بالوكالة' : 'Paiement sur place'}</span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-2">
                    {lang === 'ar'
                      ? 'في مقرنا بشارع أنفا بالدار البيضاء.'
                      : 'À notre agence 28 Bd d\'Anfa lors de la validation du dossier.'}
                  </p>
                </label>

                <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50 opacity-85">
                  <div className="flex items-center gap-2 font-semibold text-sm text-neutral-700">
                    <CreditCard className="w-4 h-4 text-neutral-500" />
                    <span>{lang === 'ar' ? 'البطاقة البنكية (CMI)' : 'Carte bancaire (Maroc)'}</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    {cmiConfigured
                      ? 'Passerelle CMI active après validation du devis.'
                      : 'Disponible après configuration des identifiants marchands CMI / Payzone.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 bg-[#0A0A0B] text-white rounded-xl p-7 space-y-6">
            <div>
              <p className="text-xs font-semibold text-[#D4AE5E] tracking-wider">
                {lang === 'ar' ? 'ملخص التقدير' : 'Estimation indicative'}
              </p>
              <h3 className="font-display text-2xl font-semibold mt-1">
                {activeService ? (lang === 'ar' ? activeService.titleAr : activeService.titleFr) : '—'}
              </h3>
            </div>

            <div className="space-y-3 py-5 border-y border-neutral-800 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">{lang === 'ar' ? 'المدينة' : 'Ville'}</span>
                <span>{form.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">{lang === 'ar' ? 'المشاركون' : 'Participants'}</span>
                <span className="tabular-nums">{form.guestCount}</span>
              </div>
              {activeOffer && (
                <div className="flex justify-between text-xs text-[#D4AE5E]">
                  <span>
                    {lang === 'ar' ? 'عرض حصري مطبّق' : 'Offre Exclusive appliquée'}
                  </span>
                  <span className="font-mono font-semibold">
                    {activeOffer.code} (-{activeOffer.discountPercent}%)
                  </span>
                </div>
              )}
              <div className="flex justify-between items-baseline">
                <span className="text-neutral-400">{lang === 'ar' ? 'التقدير الإجمالي' : 'Total estimé'}</span>
                <div className="text-end">
                  {activeOffer && estimation.originalTotal > estimation.total && (
                    <span className="text-xs text-neutral-500 line-through me-2 tabular-nums">
                      {formatMad(estimation.originalTotal, lang)}
                    </span>
                  )}
                  <span className="font-semibold tabular-nums">{formatMad(estimation.total, lang)}</span>
                </div>
              </div>
              <div className="flex justify-between text-[#D4AE5E]">
                <span>
                  {lang === 'ar'
                    ? `التسبيق (${estimation.pct || 30}%)`
                    : `Acompte conseillé (${estimation.pct || 30}%)`}
                </span>
                <span className="font-semibold tabular-nums">{formatMad(estimation.deposit, lang)}</span>
              </div>
            </div>

            {submitError && (
              <p className="text-xs text-rose-300 bg-rose-950/60 border border-rose-800 p-3 rounded-lg">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || availability.available === false}
              className="w-full py-3.5 text-sm font-semibold bg-[#B89038] text-[#0A0A0B] rounded-lg hover:bg-[#CCA44B] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? '...' : t.actions.submitBooking}
            </button>

            <p className="text-xs text-neutral-400 leading-relaxed">
              {lang === 'ar'
                ? 'لا يتم اقتطاع أي مبلغ تلقائياً عند إرسال الطلب.'
                : 'Aucun débit immédiat. Un numéro de réservation unique est généré et nos équipes valident la faisabilité.'}
            </p>
          </aside>
        </form>
      </section>
    </div>
  );
}
