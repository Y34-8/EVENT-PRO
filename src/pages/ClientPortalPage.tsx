import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Calendar, FileText, User as UserIcon, CreditCard, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { api, getApiErrorMessage } from '../lib/api.ts';
import { formatLocalDate, formatMad, MOROCCAN_CITIES, STATUS_LABELS } from '../i18n/translations.ts';
import { MessageRecord, NotificationRecord, QuoteRecord, ReservationRecord } from '../types/index.ts';

interface ClientDashboardData {
  reservations: ReservationRecord[];
  quotes: QuoteRecord[];
  notifications: NotificationRecord[];
  messages: MessageRecord[];
}

export function ClientPortalPage() {
  const { lang, user, authLoading, bootstrap, refreshProfile } = useApp();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'reservations' | 'quotes' | 'notifications' | 'profile'>('reservations');
  const [data, setData] = useState<ClientDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRes, setSelectedRes] = useState<ReservationRecord | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    city: 'Casablanca',
  });
  const [supportForm, setSupportForm] = useState({ subject: '', message: '' });

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ClientDashboardData>('/client/dashboard');
      setData(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion');
      return;
    }
    if (user) {
      setProfileForm({
        fullName: user.fullName || '',
        phone: user.phone || '',
        city: user.city || 'Casablanca',
      });
      void loadDashboard();
    }
  }, [user, authLoading, navigate, loadDashboard]);

  if (authLoading || loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-16">
        <div className="h-64 bg-neutral-200/70 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!user) return null;

  const paymentConfig = bootstrap?.settings?.paymentConfig;
  const unreadCount = (data?.notifications || []).filter((n) => !n.isRead).length;

  const handleCancelReservation = async (id: number) => {
    setError(null);
    setFeedback(null);
    try {
      await api.patch(`/client/reservations/${id}`, { action: 'cancel' });
      setFeedback(lang === 'ar' ? 'تم إلغاء الحجز.' : 'Réservation annulée.');
      setSelectedRes(null);
      await loadDashboard();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleInitiatePayment = async (reservationId: number, method: 'bank_transfer' | 'on_site') => {
    setError(null);
    setFeedback(null);
    try {
      const res = await api.post('/client/payments', {
        reservationId,
        method,
        paymentType: 'deposit',
      });
      setFeedback(
        `Ordre d'acompte enregistré (${res.data.referenceCode}). Suivez les instructions bancaires ou présentez cette référence à l'agence.`
      );
      await loadDashboard();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleQuoteDecision = async (quoteId: number, decision: 'accepted' | 'rejected') => {
    setError(null);
    try {
      await api.post(`/client/quotes/${quoteId}/respond`, { decision });
      setFeedback(
        decision === 'accepted' ? 'Devis accepté avec succès.' : 'Devis marqué comme refusé.'
      );
      await loadDashboard();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleMarkNotificationsRead = async () => {
    await api.patch('/client/notifications/read');
    await loadDashboard();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);
    try {
      await api.put('/client/profile', profileForm);
      await refreshProfile();
      setFeedback(lang === 'ar' ? 'تم تحديث الملف الشخصي.' : 'Profil mis à jour.');
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleSupportMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);
    try {
      await api.post('/contact', {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        subject: supportForm.subject,
        message: supportForm.message,
      });
      setSupportForm({ subject: '', message: '' });
      setFeedback('Message envoyé à l\'administration EVENT PRO.');
      await loadDashboard();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-10 lg:py-14">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
          <div>
            <p className="text-xs font-semibold text-[#8E6B1E]">
              {lang === 'ar' ? 'الفضاء الشخصي للعميل' : 'Espace Client EVENT PRO'}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#0A0A0B] mt-1">
              {user.fullName}
            </h1>
            <p className="text-xs text-neutral-500 mt-1">{user.email}</p>
          </div>
          <Link
            to="/reserver"
            className="px-5 py-2.5 text-xs font-semibold bg-[#0A0A0B] text-white rounded-lg hover:bg-[#B89038] hover:text-[#0A0A0B] transition-colors self-start sm:self-auto"
          >
            {lang === 'ar' ? 'حجز جديد' : 'Nouvelle réservation'}
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-200/70 rounded-lg w-fit">
          {[
            { id: 'reservations', icon: Calendar, fr: `Réservations (${data?.reservations.length || 0})`, ar: 'حجوزاتي' },
            { id: 'quotes', icon: FileText, fr: `Devis (${data?.quotes.length || 0})`, ar: 'عروض الأسعار' },
            { id: 'notifications', icon: Bell, fr: `Notifications (${unreadCount})`, ar: `الإشعارات (${unreadCount})` },
            { id: 'profile', icon: UserIcon, fr: 'Profil & Support', ar: 'الملف الشخصي والدعم' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id as typeof tab)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md cursor-pointer transition-colors ${
                  tab === item.id ? 'bg-white text-[#0A0A0B] shadow-sm' : 'text-neutral-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? item.ar : item.fr}</span>
              </button>
            );
          })}
        </div>

        {error && (
          <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 px-4 py-3 rounded-lg">
            {error}
          </p>
        )}
        {feedback && (
          <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-lg">
            {feedback}
          </p>
        )}

        {tab === 'reservations' && (
          <div className="space-y-4">
            {!data?.reservations.length ? (
              <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center space-y-4">
                <p className="text-neutral-600">
                  {lang === 'ar' ? 'لا توجد لديك حجوزات بعد.' : 'Vous n\'avez pas encore de réservation.'}
                </p>
                <Link
                  to="/reserver"
                  className="inline-block px-5 py-2.5 text-sm font-semibold bg-[#0A0A0B] text-white rounded-lg"
                >
                  {lang === 'ar' ? 'ابدأ الحجز الآن' : 'Effectuer une réservation'}
                </Link>
              </div>
            ) : (
              data.reservations.map((r) => {
                const st = STATUS_LABELS[r.status] || STATUS_LABELS.pending;
                const hasPaidDeposit = (r.payments || []).some((p) => p.status === 'paid');
                return (
                  <div
                    key={r.id}
                    className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                          <span className="font-mono font-semibold text-[#0A0A0B]">{r.bookingCode}</span>
                          <span>·</span>
                          <span>{formatLocalDate(r.eventDate, lang)}</span>
                          <span>·</span>
                          <span>{r.city}</span>
                          <span>·</span>
                          <span className={`font-semibold px-2 py-0.5 border rounded ${st.colorClass}`}>
                            {lang === 'ar' ? st.ar : st.fr}
                          </span>
                        </div>
                        <h2 className="font-display text-2xl font-semibold text-[#0A0A0B] mt-2">
                          {r.eventType}
                        </h2>
                        <p className="text-xs text-neutral-500 mt-1">
                          {r.venueAddress} · {r.guestCount} participants
                        </p>
                      </div>

                      <div className="text-start md:text-end">
                        <p className="text-xs text-neutral-500">Total estimé</p>
                        <p className="text-lg font-semibold text-[#0A0A0B] tabular-nums">
                          {formatMad(r.calculatedTotalMad, lang)}
                        </p>
                        <p className="text-xs text-[#8E6B1E] tabular-nums">
                          Acompte : {formatMad(r.depositRequiredMad, lang)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={() => setSelectedRes(selectedRes?.id === r.id ? null : r)}
                        className="px-3.5 py-2 text-xs font-semibold border border-neutral-300 rounded-lg hover:bg-neutral-50 cursor-pointer"
                      >
                        {selectedRes?.id === r.id ? 'Masquer détails' : 'Détails & Paiement'}
                      </button>

                      {r.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleCancelReservation(r.id)}
                          className="px-3.5 py-2 text-xs font-semibold text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-50 cursor-pointer"
                        >
                          Annuler la demande
                        </button>
                      )}
                    </div>

                    {selectedRes?.id === r.id && (
                      <div className="pt-4 border-t border-neutral-200 grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-[#0A0A0B]">Lignes de prestation</h3>
                          <ul className="space-y-1.5 text-xs text-neutral-700">
                            {(r.details || []).map((d) => (
                              <li key={d.id} className="flex justify-between">
                                <span>{lang === 'ar' ? d.itemLabelAr : d.itemLabelFr}</span>
                                <span className="tabular-nums font-medium">{formatMad(d.subtotalMad, lang)}</span>
                              </li>
                            ))}
                          </ul>
                          {r.notes && (
                            <p className="text-xs text-neutral-500 pt-2">Notes : {r.notes}</p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <h3 className="font-semibold text-[#0A0A0B] flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-[#B89038]" />
                            Suivi des paiements & acompte
                          </h3>
                          {(r.payments || []).length > 0 ? (
                            <div className="space-y-2">
                              {r.payments!.map((p) => {
                                const pst = STATUS_LABELS[p.status] || STATUS_LABELS.pending;
                                return (
                                  <div
                                    key={p.id}
                                    className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs flex justify-between items-center"
                                  >
                                    <div>
                                      <p className="font-mono font-semibold">{p.referenceCode}</p>
                                      <p className="text-neutral-600">{p.providerNote}</p>
                                    </div>
                                    <div className="text-end">
                                      <p className="font-semibold tabular-nums">{formatMad(p.amountMad, lang)}</p>
                                      <span className={`inline-block mt-1 px-2 py-0.5 border rounded ${pst.colorClass}`}>
                                        {lang === 'ar' ? pst.ar : pst.fr}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : null}

                          {!hasPaidDeposit && r.status !== 'cancelled' && (
                            <div className="pt-2 space-y-2">
                              <p className="text-xs text-neutral-600">
                                RIB : <span className="font-mono">{paymentConfig?.bankRib || '007 780 0001482000304912 45'}</span>
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleInitiatePayment(r.id, 'bank_transfer')}
                                  className="px-3 py-2 text-xs font-semibold bg-[#0A0A0B] text-white rounded-lg cursor-pointer"
                                >
                                  Déclarer virement bancaire
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleInitiatePayment(r.id, 'on_site')}
                                  className="px-3 py-2 text-xs font-semibold border border-neutral-300 rounded-lg cursor-pointer"
                                >
                                  Régler sur place (Casablanca)
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === 'quotes' && (
          <div className="space-y-4">
            {!data?.quotes.length ? (
              <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center text-neutral-600">
                Aucun devis enregistré pour le moment.
              </div>
            ) : (
              data.quotes.map((q) => {
                const st = STATUS_LABELS[q.status] || STATUS_LABELS.requested;
                return (
                  <div key={q.id} className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="font-mono text-xs font-semibold">{q.quoteNumber}</span>
                        <span className="mx-2 text-neutral-400">·</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 border rounded ${st.colorClass}`}>
                          {lang === 'ar' ? st.ar : st.fr}
                        </span>
                        <h3 className="font-display text-2xl font-semibold mt-2">{q.eventType}</h3>
                        <p className="text-xs text-neutral-500">
                          {q.city} · {q.guestCount} participants
                        </p>
                      </div>
                      <p className="text-xl font-semibold tabular-nums">
                        {q.totalAmountMad > 0 ? formatMad(q.totalAmountMad, lang) : 'En cours de chiffrage'}
                      </p>
                    </div>

                    {Array.isArray(q.items) && q.items.length > 0 && (
                      <div className="border-t border-neutral-100 pt-3 space-y-1.5 text-xs">
                        {q.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>
                              {item.label} (×{item.qty})
                            </span>
                            <span className="tabular-nums font-medium">
                              {formatMad(item.qty * item.unitPriceMad, lang)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {q.status === 'sent' && (
                      <div className="flex gap-3 pt-3 border-t border-neutral-100">
                        <button
                          type="button"
                          onClick={() => handleQuoteDecision(q.id, 'accepted')}
                          className="px-4 py-2 text-xs font-semibold bg-emerald-700 text-white rounded-lg cursor-pointer"
                        >
                          Accepter le devis
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuoteDecision(q.id, 'rejected')}
                          className="px-4 py-2 text-xs font-semibold border border-rose-300 text-rose-700 rounded-lg cursor-pointer"
                        >
                          Refuser
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === 'notifications' && (
          <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">Notifications</h2>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkNotificationsRead}
                  className="text-xs font-semibold text-[#8E6B1E] hover:underline cursor-pointer"
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>
            {!data?.notifications.length ? (
              <p className="text-sm text-neutral-500">Aucune notification.</p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {data.notifications.map((n) => (
                  <div key={n.id} className="py-3.5">
                    <p className="text-sm font-semibold text-[#0A0A0B]">
                      {lang === 'ar' ? n.titleAr : n.titleFr}
                    </p>
                    <p className="text-xs text-neutral-600 mt-1">
                      {lang === 'ar' ? n.bodyAr : n.bodyFr}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form
              onSubmit={handleSaveProfile}
              className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-4"
            >
              <h2 className="font-display text-2xl font-semibold">Mes informations</h2>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  required
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Téléphone Maroc</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+212 6 61 48 90 12"
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Ville</label>
                <select
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg bg-white"
                >
                  {MOROCCAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold bg-[#0A0A0B] text-white rounded-lg cursor-pointer"
              >
                Enregistrer
              </button>
            </form>

            <form
              onSubmit={handleSupportMessage}
              className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-4"
            >
              <h2 className="font-display text-2xl font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#B89038]" />
                Contacter l'administration
              </h2>
              <input
                type="text"
                required
                placeholder="Objet"
                value={supportForm.subject}
                onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
              />
              <textarea
                rows={4}
                required
                placeholder="Votre message à nos coordinateurs..."
                value={supportForm.message}
                onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
              />
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold bg-[#0A0A0B] text-white rounded-lg cursor-pointer"
              >
                Envoyer à l'administration
              </button>

              {(data?.messages || []).length > 0 && (
                <div className="pt-4 border-t border-neutral-100 space-y-2">
                  <p className="text-xs font-semibold text-neutral-600">Vos échanges récents</p>
                  {data!.messages.map((m) => (
                    <div key={m.id} className="p-3 bg-neutral-50 rounded-lg text-xs space-y-1">
                      <p className="font-semibold">{m.subject}</p>
                      <p className="text-neutral-600">{m.message}</p>
                      {m.adminReply && (
                        <p className="text-emerald-800 font-medium pt-1">
                          Réponse EVENT PRO : {m.adminReply}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
