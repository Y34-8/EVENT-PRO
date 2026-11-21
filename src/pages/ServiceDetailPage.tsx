import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { formatMad, MOROCCAN_CITIES, translations } from '../i18n/translations.ts';
import { SafeImage } from '../components/BrandMark.tsx';
import { api, getApiErrorMessage } from '../lib/api.ts';
import { ServiceItem } from '../types/index.ts';

export function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, bootstrap } = useApp();
  const t = translations[lang];

  const [service, setService] = useState<ServiceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [activePhoto, setActivePhoto] = useState<string>('');

  const [quoteForm, setQuoteForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    eventDate: '',
    city: 'Casablanca',
    guestCount: 120,
    notes: '',
  });
  const [quoteStatus, setQuoteStatus] = useState<string | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  useEffect(() => {
    const cached = bootstrap?.services.find((s) => s.slug === slug);
    if (cached) {
      setService(cached);
      setActivePhoto(cached.imageUrl);
      setLoading(false);
      return;
    }
    api
      .get<ServiceItem>(`/services/${slug}`)
      .then((res) => {
        setService(res.data);
        setActivePhoto(res.data.imageUrl);
      })
      .catch(() => setService(null))
      .finally(() => setLoading(false));
  }, [slug, bootstrap]);

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-20">
        <div className="h-96 bg-neutral-200/70 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">
          {lang === 'ar' ? 'الخدمة غير موجودة' : 'Service introuvable'}
        </h1>
        <Link
          to="/services"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#0A0A0B] text-white rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.nav.services}
        </Link>
      </div>
    );
  }

  const gallery = Array.from(new Set([service.imageUrl, ...(service.galleryUrls || [])])).filter(Boolean);
  const included = lang === 'ar' ? service.includedItemsAr : service.includedItemsFr;
  const extras = service.extraOptions || [];
  const extrasTotal = extras
    .filter((o) => selectedOptions.includes(o.id))
    .reduce((acc, o) => acc + o.priceMad, 0);
  const estimatedPrice = service.basePriceMad + extrasTotal;

  const toggleOption = (id: string) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteError(null);
    setQuoteStatus(null);
    try {
      const res = await api.post('/quotes/request', {
        ...quoteForm,
        serviceId: service.id,
        eventType: service.titleFr,
      });
      setQuoteStatus(res.data.quoteNumber);
    } catch (err) {
      setQuoteError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-12 lg:py-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-[#0A0A0B] mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.nav.services}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left column: Gallery & details */}
          <div className="lg:col-span-7 space-y-8">
            <div className="aspect-[16/10] rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100">
              <SafeImage
                src={activePhoto || service.imageUrl}
                alt={lang === 'ar' ? service.titleAr : service.titleFr}
                className="w-full h-full object-cover"
              />
            </div>

            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {gallery.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhoto(url)}
                    className={`aspect-[4/3] rounded-lg overflow-hidden border-2 transition-colors cursor-pointer ${
                      activePhoto === url ? 'border-[#B89038]' : 'border-transparent'
                    }`}
                  >
                    <SafeImage src={url} alt={`${service.titleFr} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div>
              <h1 className="font-display text-3xl sm:text-5xl font-semibold text-[#0A0A0B]">
                {lang === 'ar' ? service.titleAr : service.titleFr}
              </h1>
              <p className="mt-4 text-base text-neutral-600 leading-relaxed">
                {lang === 'ar' ? service.fullDescAr : service.fullDescFr}
              </p>
            </div>

            {included.length > 0 && (
              <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8">
                <h2 className="font-display text-2xl font-semibold text-[#0A0A0B] mb-4">
                  {lang === 'ar' ? 'الخدمات المشمولة' : 'Prestations incluses'}
                </h2>
                <ul className="space-y-3">
                  {included.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-neutral-700">
                      <Check className="w-4 h-4 text-[#B89038] mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {extras.length > 0 && (
              <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8">
                <h2 className="font-display text-2xl font-semibold text-[#0A0A0B] mb-4">
                  {lang === 'ar' ? 'خيارات إضافية' : 'Options supplémentaires'}
                </h2>
                <div className="space-y-3">
                  {extras.map((opt) => {
                    const checked = selectedOptions.includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center justify-between gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                          checked ? 'border-[#B89038] bg-[#FAF6EC]' : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleOption(opt.id)}
                            className="w-4 h-4 accent-[#0A0A0B]"
                          />
                          <span className="text-sm font-medium text-[#0A0A0B]">
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
          </div>

          {/* Right column: Price summary + Booking CTA + Quote Form */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-[#0A0A0B] text-white rounded-xl p-8">
              <p className="text-xs text-[#D4AE5E] font-semibold tracking-wider">
                {lang === 'ar' ? service.priceUnitAr : service.priceUnitFr}
              </p>
              <p className="mt-2 font-display text-4xl font-semibold tabular-nums">
                {formatMad(estimatedPrice, lang)}
              </p>
              <p className="mt-2 text-xs text-neutral-400">
                {lang === 'ar'
                  ? 'السعر التقديري يشمل الخيارات المحددة (الدرهم المغربي).'
                  : 'Estimation indicative en dirhams marocains incluant vos options sélectionnées.'}
              </p>
              <Link
                to={`/reserver?serviceId=${service.id}&extras=${selectedOptions.join(',')}`}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold bg-[#B89038] text-[#0A0A0B] rounded-lg hover:bg-[#CCA44B] transition-colors"
              >
                {t.actions.bookService}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8">
              <h2 className="font-display text-2xl font-semibold text-[#0A0A0B] mb-2">
                {lang === 'ar' ? 'طلب عرض سعر لهذه الخدمة' : 'Demander un devis personnalisé'}
              </h2>
              <p className="text-sm text-neutral-600 mb-6">
                {lang === 'ar'
                  ? 'أرسل متطلباتك وسيتواصل معك مستشارنا في الدار البيضاء.'
                  : 'Recevez un chiffrage détaillé adapté à votre date et votre lieu.'}
              </p>

              <form onSubmit={handleQuote} className="space-y-3.5">
                <input
                  type="text"
                  required
                  placeholder={lang === 'ar' ? 'الاسم الكامل' : 'Nom complet *'}
                  value={quoteForm.clientName}
                  onChange={(e) => setQuoteForm({ ...quoteForm, clientName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                />
                <input
                  type="email"
                  required
                  placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'Adresse e-mail *'}
                  value={quoteForm.clientEmail}
                  onChange={(e) => setQuoteForm({ ...quoteForm, clientEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                />
                <input
                  type="tel"
                  required
                  placeholder="+212 6 61 48 90 12"
                  value={quoteForm.clientPhone}
                  onChange={(e) => setQuoteForm({ ...quoteForm, clientPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={quoteForm.city}
                    onChange={(e) => setQuoteForm({ ...quoteForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg bg-white"
                  >
                    {MOROCCAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={quoteForm.eventDate}
                    onChange={(e) => setQuoteForm({ ...quoteForm, eventDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                  />
                </div>
                <input
                  type="number"
                  min={10}
                  value={quoteForm.guestCount}
                  onChange={(e) => setQuoteForm({ ...quoteForm, guestCount: Number(e.target.value) || 50 })}
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg tabular-nums"
                />
                <textarea
                  rows={3}
                  placeholder={lang === 'ar' ? 'ملاحظات إضافية...' : 'Précisions sur votre événement...'}
                  value={quoteForm.notes}
                  onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                />
                {quoteError && <p className="text-xs text-rose-700">{quoteError}</p>}
                {quoteStatus && (
                  <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                    {lang === 'ar'
                      ? `تم إرسال الطلب (${quoteStatus}).`
                      : `Devis demandé sous la référence ${quoteStatus}.`}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full py-3 text-sm font-semibold bg-[#0A0A0B] text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  {t.actions.sendRequest}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
