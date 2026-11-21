import React, { useState } from 'react';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { CasablancaMap } from '../components/CasablancaMap.tsx';
import { api, getApiErrorMessage } from '../lib/api.ts';
import { translations } from '../i18n/translations.ts';

export function ContactPage() {
  const { lang, bootstrap, user } = useApp();
  const t = translations[lang];
  const company = bootstrap?.settings?.companyInfo;

  const address = company?.address || "28 Boulevard d'Anfa, Quartier Gautier, 20000 Casablanca, Maroc";
  const phone = company?.phone || '+212 522 48 90 12';
  const whatsapp = company?.whatsapp || '+212 661 48 90 12';
  const email = company?.email || 'contact@eventpro.ma';
  const lat = company?.lat ?? 33.5912;
  const lng = company?.lng ?? -7.6324;

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    subject: '',
    message: '',
  });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSent(false);
    try {
      await api.post('/contact', form);
      setSent(true);
      setForm({ fullName: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const whatsappDigits = whatsapp.replace(/[^0-9]/g, '');

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <section className="bg-[#0A0A0B] text-white py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-[#D4AE5E] tracking-wider mb-3">
            Casablanca · Maroc
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
            {t.nav.contact}
          </h1>
          <p className="mt-4 text-neutral-300 max-w-2xl">
            {lang === 'ar'
              ? 'فريقنا في الدار البيضاء رهن إشارتكم لدراسة مشاريعكم وتحديد موعد في مقر الوكالة.'
              : 'Notre bureau d\'Anfa à Casablanca vous accueille sur rendez-vous du lundi au samedi.'}
          </p>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-[#B89038] mt-0.5 shrink-0" />
                <div>
                  <h2 className="text-sm font-semibold text-[#0A0A0B]">
                    {lang === 'ar' ? 'العنوان' : 'Adresse Casablanca'}
                  </h2>
                  <p className="text-sm text-neutral-600 mt-1">{address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-[#B89038] mt-0.5 shrink-0" />
                <div>
                  <h2 className="text-sm font-semibold text-[#0A0A0B]">
                    {lang === 'ar' ? 'الهاتف' : 'Téléphone'}
                  </h2>
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    className="text-sm text-neutral-600 hover:text-[#0A0A0B] mt-1 block tabular-nums"
                  >
                    {phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MessageCircle className="w-5 h-5 text-[#B89038] mt-0.5 shrink-0" />
                <div>
                  <h2 className="text-sm font-semibold text-[#0A0A0B]">WhatsApp Direct</h2>
                  <a
                    href={`https://wa.me/${whatsappDigits}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#8E6B1E] font-medium hover:underline mt-1 block tabular-nums"
                  >
                    {whatsapp}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-[#B89038] mt-0.5 shrink-0" />
                <div>
                  <h2 className="text-sm font-semibold text-[#0A0A0B]">E-mail</h2>
                  <a
                    href={`mailto:${email}`}
                    className="text-sm text-neutral-600 hover:text-[#0A0A0B] mt-1 block"
                  >
                    {email}
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-[#0A0A0B] text-white rounded-xl p-6 sm:p-8">
              <h2 className="text-sm font-semibold text-[#D4AE5E] mb-4">
                {lang === 'ar' ? 'تابعونا' : 'Réseaux sociaux'}
              </h2>
              <div className="flex flex-wrap gap-4 text-sm">
                {company?.instagram && (
                  <a href={company.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AE5E]">
                    Instagram
                  </a>
                )}
                {company?.linkedin && (
                  <a href={company.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AE5E]">
                    LinkedIn
                  </a>
                )}
                {company?.facebook && (
                  <a href={company.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AE5E]">
                    Facebook
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-xl p-6 sm:p-10">
            <h2 className="font-display text-3xl font-semibold text-[#0A0A0B] mb-2">
              {lang === 'ar' ? 'أرسلوا لنا رسالة' : 'Écrire à notre équipe'}
            </h2>
            <p className="text-sm text-neutral-600 mb-6">
              {lang === 'ar'
                ? 'يتم حفظ جميع الرسائل ومتابعتها مباشرة من طرف الإدارة.'
                : 'Tous vos messages sont enregistrés et traités directement par nos chefs de projet.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder={lang === 'ar' ? 'الاسم الكامل' : 'Nom complet *'}
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full px-4 py-3 text-sm border border-neutral-300 rounded-lg"
                />
                <input
                  type="email"
                  required
                  placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'Adresse e-mail *'}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 text-sm border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="tel"
                  placeholder="+212 6 61 48 90 12"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 text-sm border border-neutral-300 rounded-lg"
                />
                <input
                  type="text"
                  required
                  placeholder={lang === 'ar' ? 'الموضوع' : 'Objet du message *'}
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-3 text-sm border border-neutral-300 rounded-lg"
                />
              </div>

              <textarea
                rows={5}
                required
                placeholder={lang === 'ar' ? 'رسالتك...' : 'Votre message...'}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-3 text-sm border border-neutral-300 rounded-lg"
              />

              {error && (
                <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-lg">
                  {error}
                </p>
              )}
              {sent && (
                <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-lg">
                  {lang === 'ar'
                    ? 'تم إرسال رسالتكم بنجاح.'
                    : 'Votre message a bien été enregistré. Notre équipe vous répondra rapidement.'}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="px-6 py-3.5 text-sm font-semibold bg-[#0A0A0B] text-white rounded-lg hover:bg-[#B89038] hover:text-[#0A0A0B] transition-colors cursor-pointer"
              >
                {busy ? '...' : lang === 'ar' ? 'إرسال الرسالة' : 'Envoyer le message'}
              </button>
            </form>
          </div>
        </div>

        <CasablancaMap lat={lat} lng={lng} address={address} phone={phone} lang={lang} />
      </section>
    </div>
  );
}
