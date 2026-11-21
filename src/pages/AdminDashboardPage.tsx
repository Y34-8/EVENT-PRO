import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Briefcase,
  Sparkles,
  Users,
  FileSpreadsheet,
  CreditCard,
  Image as ImageIcon,
  Settings as SettingsIcon,
  MessageSquare,
  Plus,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { api, getApiErrorMessage } from '../lib/api.ts';
import { formatLocalDate, formatMad, MOROCCAN_CITIES, STATUS_LABELS } from '../i18n/translations.ts';
import {
  EventItem,
  MessageRecord,
  PaymentRecord,
  QuoteRecord,
  ReservationRecord,
  ServiceItem,
} from '../types/index.ts';

type AdminTab =
  | 'overview'
  | 'reservations'
  | 'services'
  | 'events'
  | 'clients'
  | 'quotes'
  | 'payments'
  | 'messages'
  | 'content'
  | 'settings';

interface AdminOverview {
  stats: {
    totalClients: number;
    totalReservations: number;
    pendingReservations: number;
    confirmedReservations: number;
    completedEvents: number;
    paidRevenueMad: number;
    projectedRevenueMad: number;
    unreadMessages: number;
    pendingQuotes: number;
  };
  monthlyStats: Array<{ label: string; bookings: number; revenueMad: number }>;
  latestReservations: ReservationRecord[];
}

interface AdminClientRow {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  city: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  reservationCount: number;
  totalSpentMad: number;
}

export function AdminDashboardPage() {
  const { lang, user, authLoading, bootstrap, refreshBootstrap } = useApp();
  const navigate = useNavigate();

  const [tab, setTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [clients, setClients] = useState<AdminClientRow[]>([]);
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [messages, setMessages] = useState<MessageRecord[]>([]);

  // Filters
  const [resFilterStatus, setResFilterStatus] = useState('all');
  const [resSearch, setResSearch] = useState('');
  const [resCommentDraft, setResCommentDraft] = useState<Record<number, string>>({});

  // Service editing / creation
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [newService, setNewService] = useState({
    titleFr: '',
    titleAr: '',
    shortDescFr: '',
    basePriceMad: 15000,
    imageUrl: '/src/assets/images/hero_event_gala_1795276605928.jpg',
  });

  // Event creation
  const [newEvent, setNewEvent] = useState({
    titleFr: '',
    titleAr: '',
    eventDate: '2026-12-28',
    city: 'Casablanca',
    venue: '',
    capacity: 250,
    ticketPriceMad: 1200,
    descriptionFr: '',
    imageUrl: '/src/assets/images/hero_event_gala_1795276605928.jpg',
    status: 'upcoming',
  });

  // Quote builder
  const [newQuote, setNewQuote] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    eventType: 'Mariages et cérémonies',
    eventDate: '',
    city: 'Casablanca',
    guestCount: 150,
    notes: '',
    itemLabel: 'Organisation & scénographie complète',
    itemQty: 1,
    itemPriceMad: 45000,
  });

  // Gallery & Review creation
  const [newPhoto, setNewPhoto] = useState({
    titleFr: '',
    titleAr: '',
    category: 'mariages',
    city: 'Casablanca',
    eventDateLabel: '2026',
    imageUrl: '/src/assets/images/service_wedding_luxury_1795276605908.jpg',
  });
  const [newReview, setNewReview] = useState({
    clientName: '',
    clientRole: '',
    companyOrEvent: '',
    rating: 5,
    commentFr: '',
  });

  // Settings drafts
  const [companyDraft, setCompanyDraft] = useState(
    bootstrap?.settings?.companyInfo || {
      name: 'EVENT PRO',
      address: "28 Boulevard d'Anfa, Quartier Gautier, 20000 Casablanca, Maroc",
      city: 'Casablanca',
      phone: '+212 522 48 90 12',
      whatsapp: '+212 661 48 90 12',
      email: 'contact@eventpro.ma',
      hoursFr: 'Lun – Sam : 09h00 – 19h00',
      hoursAr: 'الإثنين – السبت: 09:00 – 19:00',
      lat: 33.5912,
      lng: -7.6324,
      instagram: 'https://instagram.com/eventpro.casablanca',
      linkedin: 'https://linkedin.com/company/eventpro-maroc',
      facebook: 'https://facebook.com/eventpro.maroc',
    }
  );
  const [homeDraft, setHomeDraft] = useState(
    bootstrap?.settings?.homeContent || {
      heroTitleFr: 'Transformez vos événements en moments inoubliables.',
      heroTitleAr: 'حوّلوا فعالياتكم إلى لحظات لا تُنسى.',
      heroSubtitleFr:
        "EVENT PRO vous accompagne dans l'organisation de vos événements à Casablanca et partout au Maroc.",
      heroSubtitleAr:
        'ترافقكم إيفنت برو في تنظيم فعالياتكم بالدار البيضاء وجميع أنحاء المغرب.',
      heroImageUrl: '/src/assets/images/hero_event_gala_1795276605928.jpg',
      aboutImageUrl: '/src/assets/images/about_agency_team_1795276605935.jpg',
      stats: [],
    }
  );
  const [paymentDraft, setPaymentDraft] = useState(
    bootstrap?.settings?.paymentConfig || {
      depositPercent: 30,
      bankName: 'Attijariwafa Bank — Agence Anfa Casablanca',
      bankRib: '007 780 0001482000304912 45',
      bankBeneficiary: 'EVENT PRO SARL',
      onSiteInstructionsFr: "Règlement à l'agence 28 Bd d'Anfa, Casablanca.",
      onSiteInstructionsAr: 'الدفع في مقر الوكالة بالدار البيضاء.',
    }
  );
  const [availDraft, setAvailDraft] = useState({
    maxEventsPerDay: bootstrap?.settings?.availability?.maxEventsPerDay || 3,
    blockedDatesText: (bootstrap?.settings?.availability?.blockedDates || []).join(', '),
  });

  useEffect(() => {
    if (bootstrap?.settings?.companyInfo) setCompanyDraft(bootstrap.settings.companyInfo);
    if (bootstrap?.settings?.homeContent) setHomeDraft(bootstrap.settings.homeContent);
    if (bootstrap?.settings?.paymentConfig) setPaymentDraft(bootstrap.settings.paymentConfig);
    if (bootstrap?.settings?.availability) {
      setAvailDraft({
        maxEventsPerDay: bootstrap.settings.availability.maxEventsPerDay || 3,
        blockedDatesText: (bootstrap.settings.availability.blockedDates || []).join(', '),
      });
    }
  }, [bootstrap]);

  const loadAllAdminData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, res, srv, evt, cli, quo, pay, msg] = await Promise.all([
        api.get<AdminOverview>('/admin/overview'),
        api.get<ReservationRecord[]>('/admin/reservations'),
        api.get<ServiceItem[]>('/admin/services'),
        api.get<EventItem[]>('/admin/events'),
        api.get<AdminClientRow[]>('/admin/clients'),
        api.get<QuoteRecord[]>('/admin/quotes'),
        api.get<PaymentRecord[]>('/admin/payments'),
        api.get<MessageRecord[]>('/admin/messages'),
      ]);
      setOverview(ov.data);
      setReservations(res.data);
      setServices(srv.data);
      setEvents(evt.data);
      setClients(cli.data);
      setQuotes(quo.data);
      setPayments(pay.data);
      setMessages(msg.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/connexion');
        return;
      }
      if (user.role !== 'admin') {
        navigate('/espace-client');
        return;
      }
      void loadAllAdminData();
    }
  }, [user, authLoading, navigate, loadAllAdminData]);

  if (authLoading || loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-16">
        <div className="h-96 bg-neutral-200/70 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  const notifyOk = (msg: string) => {
    setNotice(msg);
    setError(null);
  };

  const handleUpdateResStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/admin/reservations/${id}`, {
        status,
        adminComment: resCommentDraft[id],
      });
      notifyOk('Réservation mise à jour.');
      await loadAllAdminData();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    try {
      await api.put(`/admin/services/${editingService.id}`, editingService);
      setEditingService(null);
      notifyOk('Service et tarif mis à jour.');
      await Promise.all([loadAllAdminData(), refreshBootstrap()]);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/services', newService);
      setNewService({
        titleFr: '',
        titleAr: '',
        shortDescFr: '',
        basePriceMad: 15000,
        imageUrl: '/src/assets/images/hero_event_gala_1795276605928.jpg',
      });
      notifyOk('Nouveau service ajouté.');
      await Promise.all([loadAllAdminData(), refreshBootstrap()]);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleToggleServiceActive = async (s: ServiceItem) => {
    try {
      await api.put(`/admin/services/${s.id}`, { isActive: !s.isActive });
      await Promise.all([loadAllAdminData(), refreshBootstrap()]);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleDeleteService = async (id: number) => {
    try {
      await api.delete(`/admin/services/${id}`);
      notifyOk('Service supprimé.');
      await Promise.all([loadAllAdminData(), refreshBootstrap()]);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/events', newEvent);
      setNewEvent({
        titleFr: '',
        titleAr: '',
        eventDate: '2026-12-28',
        city: 'Casablanca',
        venue: '',
        capacity: 250,
        ticketPriceMad: 1200,
        descriptionFr: '',
        imageUrl: '/src/assets/images/hero_event_gala_1795276605928.jpg',
        status: 'upcoming',
      });
      notifyOk('Événement créé.');
      await Promise.all([loadAllAdminData(), refreshBootstrap()]);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleDeleteEvent = async (id: number) => {
    try {
      await api.delete(`/admin/events/${id}`);
      notifyOk('Événement supprimé.');
      await Promise.all([loadAllAdminData(), refreshBootstrap()]);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleToggleClient = async (c: AdminClientRow) => {
    try {
      await api.patch(`/admin/clients/${c.id}`, { isActive: !c.isActive });
      notifyOk('Statut du compte client mis à jour.');
      await loadAllAdminData();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/quotes', {
        clientName: newQuote.clientName,
        clientEmail: newQuote.clientEmail,
        clientPhone: newQuote.clientPhone,
        eventType: newQuote.eventType,
        eventDate: newQuote.eventDate,
        city: newQuote.city,
        guestCount: newQuote.guestCount,
        notes: newQuote.notes,
        status: 'sent',
        items: [
          {
            label: newQuote.itemLabel,
            qty: newQuote.itemQty,
            unitPriceMad: newQuote.itemPriceMad,
          },
        ],
      });
      setNewQuote({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        eventType: 'Mariages et cérémonies',
        eventDate: '',
        city: 'Casablanca',
        guestCount: 150,
        notes: '',
        itemLabel: 'Organisation & scénographie complète',
        itemQty: 1,
        itemPriceMad: 45000,
      });
      notifyOk('Devis personnalisé créé et envoyé au client.');
      await loadAllAdminData();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleUpdateQuoteStatus = async (q: QuoteRecord, status: string) => {
    try {
      await api.put(`/admin/quotes/${q.id}`, { status });
      notifyOk(`Devis ${q.quoteNumber} mis à jour.`);
      await loadAllAdminData();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleUpdatePaymentStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/admin/payments/${id}`, { status });
      notifyOk('Statut de paiement mis à jour.');
      await loadAllAdminData();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleReplyMessage = async (id: number, adminReply: string) => {
    try {
      await api.patch(`/admin/messages/${id}`, { isRead: true, adminReply });
      notifyOk('Réponse enregistrée.');
      await loadAllAdminData();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleSaveSettings = async (key: string, value: unknown) => {
    try {
      await api.put(`/admin/settings/${key}`, { value });
      notifyOk('Paramètres enregistrés.');
      await refreshBootstrap();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/gallery', newPhoto);
      setNewPhoto({ ...newPhoto, titleFr: '', titleAr: '' });
      notifyOk('Photo ajoutée à la galerie.');
      await refreshBootstrap();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleDeletePhoto = async (id: number) => {
    try {
      await api.delete(`/admin/gallery/${id}`);
      notifyOk('Photo supprimée.');
      await refreshBootstrap();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/reviews', newReview);
      setNewReview({ clientName: '', clientRole: '', companyOrEvent: '', rating: 5, commentFr: '' });
      notifyOk('Témoignage publié.');
      await refreshBootstrap();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleDeleteReview = async (id: number) => {
    try {
      await api.delete(`/admin/reviews/${id}`);
      notifyOk('Témoignage supprimé.');
      await refreshBootstrap();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const filteredReservations = reservations.filter((r) => {
    if (resFilterStatus !== 'all' && r.status !== resFilterStatus) return false;
    if (resSearch.trim()) {
      const q = resSearch.trim().toLowerCase();
      return (
        r.bookingCode.toLowerCase().includes(q) ||
        r.fullName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const navItems: Array<{ id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'overview', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'reservations', label: 'Réservations', icon: CalendarCheck },
    { id: 'services', label: 'Services & Tarifs', icon: Briefcase },
    { id: 'events', label: 'Événements', icon: Sparkles },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'quotes', label: 'Devis', icon: FileSpreadsheet },
    { id: 'payments', label: 'Paiements', icon: CreditCard },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'content', label: 'Contenu & Galerie', icon: ImageIcon },
    { id: 'settings', label: 'Paramètres', icon: SettingsIcon },
  ];

  const maxMonthlyRev = Math.max(
    1,
    ...(overview?.monthlyStats || []).map((m) => m.revenueMad)
  );

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 shrink-0 space-y-1">
          <div className="px-3 pb-4 border-b border-neutral-200 mb-3">
            <p className="text-xs font-semibold text-[#8E6B1E]">Console Administration</p>
            <p className="font-display text-2xl font-semibold text-[#0A0A0B]">EVENT PRO</p>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#0A0A0B] text-white'
                    : 'text-neutral-700 hover:bg-neutral-200/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 space-y-6">
          {error && (
            <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {notice && (
            <div className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-lg">
              {notice}
            </div>
          )}

          {/* A. OVERVIEW */}
          {tab === 'overview' && overview && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Clients inscrits', value: overview.stats.totalClients },
                  { label: 'Total réservations', value: overview.stats.totalReservations },
                  { label: 'En attente', value: overview.stats.pendingReservations },
                  { label: 'Confirmées / En prép.', value: overview.stats.confirmedReservations },
                  { label: 'Événements terminés', value: overview.stats.completedEvents },
                  {
                    label: 'CA encaissé (MAD)',
                    value: formatMad(overview.stats.paidRevenueMad, lang),
                  },
                  {
                    label: 'CA engagé (MAD)',
                    value: formatMad(overview.stats.projectedRevenueMad, lang),
                  },
                  { label: 'Messages non lus', value: overview.stats.unreadMessages },
                ].map((kpi, idx) => (
                  <div key={idx} className="bg-white border border-neutral-200 rounded-xl p-5">
                    <p className="text-xs text-neutral-500">{kpi.label}</p>
                    <p className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-[#0A0A0B] tabular-nums">
                      {kpi.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Monthly chart */}
              <div className="bg-white border border-neutral-200 rounded-xl p-6">
                <h2 className="font-display text-2xl font-semibold text-[#0A0A0B] mb-6">
                  Évolution mensuelle (Réservations & Volume MAD)
                </h2>
                <div className="grid grid-cols-6 gap-4 items-end h-52 pt-4">
                  {overview.monthlyStats.map((m) => {
                    const heightPct = Math.max(8, Math.round((m.revenueMad / maxMonthlyRev) * 100));
                    return (
                      <div key={m.label} className="flex flex-col items-center h-full justify-end gap-2">
                        <span className="text-[11px] font-mono text-neutral-500 tabular-nums">
                          {m.bookings} rés.
                        </span>
                        <div className="w-full max-w-[48px] bg-neutral-100 rounded-t-md h-36 flex items-end overflow-hidden">
                          <div
                            className="w-full bg-[#0A0A0B] hover:bg-[#B89038] transition-colors rounded-t-md"
                            style={{ height: `${heightPct}%` }}
                            title={formatMad(m.revenueMad, lang)}
                          />
                        </div>
                        <span className="text-xs font-semibold text-neutral-700">{m.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Latest reservations */}
              <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
                  <h2 className="font-display text-2xl font-semibold">Dernières réservations</h2>
                  <button
                    type="button"
                    onClick={() => setTab('reservations')}
                    className="text-xs font-semibold text-[#8E6B1E] hover:underline cursor-pointer"
                  >
                    Tout voir
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-start">
                    <thead className="bg-neutral-50 text-xs text-neutral-500 border-b border-neutral-200">
                      <tr>
                        <th className="py-3 px-4 text-start">Réf.</th>
                        <th className="py-3 px-4 text-start">Client</th>
                        <th className="py-3 px-4 text-start">Prestation</th>
                        <th className="py-3 px-4 text-start">Date</th>
                        <th className="py-3 px-4 text-end">Estimation</th>
                        <th className="py-3 px-4 text-start">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {overview.latestReservations.map((r) => {
                        const st = STATUS_LABELS[r.status] || STATUS_LABELS.pending;
                        return (
                          <tr key={r.id} className="hover:bg-neutral-50">
                            <td className="py-3 px-4 font-mono text-xs font-semibold">{r.bookingCode}</td>
                            <td className="py-3 px-4">{r.fullName}</td>
                            <td className="py-3 px-4 text-neutral-600">{r.eventType}</td>
                            <td className="py-3 px-4 tabular-nums">{r.eventDate}</td>
                            <td className="py-3 px-4 text-end font-semibold tabular-nums">
                              {formatMad(r.calculatedTotalMad, lang)}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-xs font-semibold px-2 py-0.5 border rounded ${st.colorClass}`}>
                                {st.fr}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* B. RESERVATIONS */}
          {tab === 'reservations' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <input
                  type="search"
                  placeholder="Rechercher par code, client, e-mail ou ville..."
                  value={resSearch}
                  onChange={(e) => setResSearch(e.target.value)}
                  className="px-4 py-2.5 text-sm bg-white border border-neutral-300 rounded-lg sm:w-80"
                />
                <select
                  value={resFilterStatus}
                  onChange={(e) => setResFilterStatus(e.target.value)}
                  className="px-4 py-2.5 text-sm bg-white border border-neutral-300 rounded-lg"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmée</option>
                  <option value="in_preparation">En cours de préparation</option>
                  <option value="completed">Terminée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>

              <div className="space-y-4">
                {filteredReservations.map((r) => {
                  const st = STATUS_LABELS[r.status] || STATUS_LABELS.pending;
                  return (
                    <div key={r.id} className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                            <span className="font-mono font-semibold text-[#0A0A0B]">{r.bookingCode}</span>
                            <span>·</span>
                            <span>{formatLocalDate(r.eventDate, 'fr')}</span>
                            <span>·</span>
                            <span>{r.city}</span>
                            <span>·</span>
                            <span className={`font-semibold px-2 py-0.5 border rounded ${st.colorClass}`}>
                              {st.fr}
                            </span>
                          </div>
                          <h3 className="font-display text-2xl font-semibold mt-1">{r.eventType}</h3>
                          <p className="text-xs text-neutral-600 mt-1">
                            {r.fullName} · {r.email} · {r.phone} · {r.guestCount} participants
                          </p>
                          <p className="text-xs text-neutral-500 mt-0.5">Lieu : {r.venueAddress}</p>
                        </div>
                        <div className="text-end">
                          <p className="font-semibold tabular-nums">{formatMad(r.calculatedTotalMad, 'fr')}</p>
                          <p className="text-xs text-[#8E6B1E] tabular-nums">
                            Acompte : {formatMad(r.depositRequiredMad, 'fr')}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-neutral-100">
                        <input
                          type="text"
                          placeholder="Commentaire interne équipe..."
                          value={resCommentDraft[r.id] ?? r.adminComment ?? ''}
                          onChange={(e) =>
                            setResCommentDraft((prev) => ({ ...prev, [r.id]: e.target.value }))
                          }
                          className="px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                        />
                        <div className="flex flex-wrap gap-2 justify-end">
                          {['pending', 'confirmed', 'in_preparation', 'completed', 'cancelled'].map(
                            (targetStatus) => (
                              <button
                                key={targetStatus}
                                type="button"
                                onClick={() => handleUpdateResStatus(r.id, targetStatus)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md border cursor-pointer ${
                                  r.status === targetStatus
                                    ? 'bg-[#0A0A0B] text-white border-[#0A0A0B]'
                                    : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                                }`}
                              >
                                {STATUS_LABELS[targetStatus].fr}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* C. SERVICES & TARIFS */}
          {tab === 'services' && (
            <div className="space-y-8">
              {editingService && (
                <form
                  onSubmit={handleSaveService}
                  className="bg-white border-2 border-[#B89038] rounded-xl p-6 space-y-4"
                >
                  <h2 className="font-display text-2xl font-semibold">
                    Modifier : {editingService.titleFr}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={editingService.titleFr}
                      onChange={(e) =>
                        setEditingService({ ...editingService, titleFr: e.target.value })
                      }
                      placeholder="Titre FR"
                      className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={editingService.titleAr}
                      onChange={(e) =>
                        setEditingService({ ...editingService, titleAr: e.target.value })
                      }
                      placeholder="Titre AR"
                      className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                    />
                    <input
                      type="number"
                      value={editingService.basePriceMad}
                      onChange={(e) =>
                        setEditingService({
                          ...editingService,
                          basePriceMad: Number(e.target.value) || 0,
                        })
                      }
                      placeholder="Tarif indicatif (MAD)"
                      className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg tabular-nums"
                    />
                    <input
                      type="text"
                      value={editingService.imageUrl}
                      onChange={(e) =>
                        setEditingService({ ...editingService, imageUrl: e.target.value })
                      }
                      placeholder="URL Image"
                      className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={editingService.shortDescFr}
                    onChange={(e) =>
                      setEditingService({ ...editingService, shortDescFr: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                  />
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-semibold bg-[#0A0A0B] text-white rounded-lg cursor-pointer"
                    >
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingService(null)}
                      className="px-5 py-2 text-xs font-semibold border border-neutral-300 rounded-lg cursor-pointer"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}

              <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200">
                  <h2 className="font-display text-2xl font-semibold">Services & Tarifs en MAD</h2>
                </div>
                <div className="divide-y divide-neutral-100">
                  {services.map((s) => (
                    <div
                      key={s.id}
                      className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <p className="font-semibold text-sm text-[#0A0A0B]">
                          {s.titleFr}{' '}
                          <span className="text-xs text-neutral-400">
                            ({s.isActive ? 'Actif' : 'Désactivé'})
                          </span>
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5 tabular-nums">
                          {formatMad(s.basePriceMad, 'fr')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingService(s)}
                          className="px-3 py-1.5 text-xs font-semibold border border-neutral-300 rounded-md cursor-pointer"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleServiceActive(s)}
                          className="px-3 py-1.5 text-xs font-semibold border border-neutral-300 rounded-md cursor-pointer"
                        >
                          {s.isActive ? 'Désactiver' : 'Activer'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteService(s.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form
                onSubmit={handleCreateService}
                className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4"
              >
                <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#B89038]" />
                  Ajouter un service
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Titre (FR) *"
                    value={newService.titleFr}
                    onChange={(e) => setNewService({ ...newService, titleFr: e.target.value })}
                    className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Titre (AR)"
                    value={newService.titleAr}
                    onChange={(e) => setNewService({ ...newService, titleAr: e.target.value })}
                    className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                  />
                  <input
                    type="number"
                    required
                    placeholder="Prix indicatif MAD"
                    value={newService.basePriceMad}
                    onChange={(e) =>
                      setNewService({ ...newService, basePriceMad: Number(e.target.value) || 0 })
                    }
                    className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg tabular-nums"
                  />
                  <input
                    type="text"
                    placeholder="URL image"
                    value={newService.imageUrl}
                    onChange={(e) => setNewService({ ...newService, imageUrl: e.target.value })}
                    className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                  />
                </div>
                <textarea
                  rows={2}
                  required
                  placeholder="Description courte *"
                  value={newService.shortDescFr}
                  onChange={(e) => setNewService({ ...newService, shortDescFr: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold bg-[#0A0A0B] text-white rounded-lg cursor-pointer"
                >
                  Ajouter le service
                </button>
              </form>
            </div>
          )}

          {/* D. EVENTS */}
          {tab === 'events' && (
            <div className="space-y-6">
              <form
                onSubmit={handleCreateEvent}
                className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4"
              >
                <h2 className="font-display text-2xl font-semibold">Créer un événement</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Titre de l'événement *"
                    value={newEvent.titleFr}
                    onChange={(e) => setNewEvent({ ...newEvent, titleFr: e.target.value })}
                    className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                  />
                  <input
                    type="date"
                    required
                    value={newEvent.eventDate}
                    onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })}
                    className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                  />
                  <select
                    value={newEvent.city}
                    onChange={(e) => setNewEvent({ ...newEvent, city: e.target.value })}
                    className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg bg-white"
                  >
                    {MOROCCAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Lieu / Salle *"
                    value={newEvent.venue}
                    onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                    className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Capacité"
                    value={newEvent.capacity}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, capacity: Number(e.target.value) || 200 })
                    }
                    className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                  />
                  <select
                    value={newEvent.status}
                    onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                    className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value="upcoming">À venir</option>
                    <option value="featured">Mis en avant</option>
                    <option value="completed">Terminé</option>
                  </select>
                </div>
                <textarea
                  rows={2}
                  required
                  placeholder="Description..."
                  value={newEvent.descriptionFr}
                  onChange={(e) => setNewEvent({ ...newEvent, descriptionFr: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold bg-[#0A0A0B] text-white rounded-lg cursor-pointer"
                >
                  Publier l'événement
                </button>
              </form>

              <div className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-100">
                {events.map((evt) => (
                  <div key={evt.id} className="p-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-sm">{evt.titleFr}</p>
                      <p className="text-xs text-neutral-500">
                        {evt.eventDate} · {evt.venue}, {evt.city} · {evt.status}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(evt.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* E. CLIENTS */}
          {tab === 'clients' && (
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-200">
                <h2 className="font-display text-2xl font-semibold">Clients inscrits</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-start">
                  <thead className="bg-neutral-50 text-xs text-neutral-500 border-b border-neutral-200">
                    <tr>
                      <th className="py-3 px-4 text-start">Nom</th>
                      <th className="py-3 px-4 text-start">E-mail</th>
                      <th className="py-3 px-4 text-start">Ville</th>
                      <th className="py-3 px-4 text-start">Rôle</th>
                      <th className="py-3 px-4 text-end">Réservations</th>
                      <th className="py-3 px-4 text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {clients.map((c) => (
                      <tr key={c.id}>
                        <td className="py-3 px-4 font-medium">{c.fullName}</td>
                        <td className="py-3 px-4 text-neutral-600">{c.email}</td>
                        <td className="py-3 px-4">{c.city}</td>
                        <td className="py-3 px-4 font-mono text-xs">{c.role}</td>
                        <td className="py-3 px-4 text-end tabular-nums">{c.reservationCount}</td>
                        <td className="py-3 px-4 text-end">
                          <button
                            type="button"
                            onClick={() => handleToggleClient(c)}
                            className="px-3 py-1 text-xs font-semibold border border-neutral-300 rounded-md cursor-pointer"
                          >
                            {c.isActive ? 'Désactiver' : 'Activer'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* F. QUOTES */}
          {tab === 'quotes' && (
            <div className="space-y-6">
              <form
                onSubmit={handleCreateQuote}
                className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4"
              >
                <h2 className="font-display text-2xl font-semibold">Créer un devis personnalisé</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Nom client *"
                    value={newQuote.clientName}
                    onChange={(e) => setNewQuote({ ...newQuote, clientName: e.target.value })}
                    className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                  />
                  <input
                    type="email"
                    required
                    placeholder="E-mail client *"
                    value={newQuote.clientEmail}
                    onChange={(e) => setNewQuote({ ...newQuote, clientEmail: e.target.value })}
                    className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Type d'événement"
                    value={newQuote.eventType}
                    onChange={(e) => setNewQuote({ ...newQuote, eventType: e.target.value })}
                    className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Intitulé prestation *"
                    value={newQuote.itemLabel}
                    onChange={(e) => setNewQuote({ ...newQuote, itemLabel: e.target.value })}
                    className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                  />
                  <input
                    type="number"
                    min={1}
                    placeholder="Quantité"
                    value={newQuote.itemQty}
                    onChange={(e) =>
                      setNewQuote({ ...newQuote, itemQty: Number(e.target.value) || 1 })
                    }
                    className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg tabular-nums"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Prix unitaire MAD"
                    value={newQuote.itemPriceMad}
                    onChange={(e) =>
                      setNewQuote({ ...newQuote, itemPriceMad: Number(e.target.value) || 0 })
                    }
                    className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg tabular-nums"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold bg-[#0A0A0B] text-white rounded-lg cursor-pointer"
                >
                  Créer et envoyer au client
                </button>
              </form>

              <div className="space-y-3">
                {quotes.map((q) => {
                  const st = STATUS_LABELS[q.status] || STATUS_LABELS.requested;
                  return (
                    <div
                      key={q.id}
                      className="bg-white border border-neutral-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <p className="font-mono text-xs font-semibold">
                          {q.quoteNumber} ·{' '}
                          <span className={`px-2 py-0.5 border rounded ${st.colorClass}`}>{st.fr}</span>
                        </p>
                        <p className="font-semibold text-sm mt-1">
                          {q.clientName} ({q.clientEmail}) — {q.eventType}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">{q.notes}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold tabular-nums">
                          {formatMad(q.totalAmountMad, 'fr')}
                        </span>
                        {q.status === 'requested' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateQuoteStatus(q, 'sent')}
                            className="px-3 py-1.5 text-xs font-semibold bg-[#0A0A0B] text-white rounded-lg cursor-pointer"
                          >
                            Marquer envoyé
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* G. PAYMENTS */}
          {tab === 'payments' && (
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-200">
                <h2 className="font-display text-2xl font-semibold">Suivi des paiements & acomptes</h2>
              </div>
              <div className="divide-y divide-neutral-100">
                {payments.length === 0 ? (
                  <p className="p-8 text-sm text-neutral-500">Aucun règlement enregistré.</p>
                ) : (
                  payments.map((p) => {
                    const st = STATUS_LABELS[p.status] || STATUS_LABELS.pending;
                    return (
                      <div
                        key={p.id}
                        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <p className="font-mono text-xs font-semibold">
                            {p.referenceCode} · Réservation {p.bookingCode}
                          </p>
                          <p className="text-sm font-medium mt-1">
                            {p.clientName} — {p.method === 'bank_transfer' ? 'Virement bancaire' : 'Sur place'}
                          </p>
                          <p className="text-xs text-neutral-500">{p.providerNote}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold tabular-nums">{formatMad(p.amountMad, 'fr')}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 border rounded ${st.colorClass}`}>
                            {st.fr}
                          </span>
                          {p.status !== 'paid' && (
                            <button
                              type="button"
                              onClick={() => handleUpdatePaymentStatus(p.id, 'paid')}
                              className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 text-white rounded-md cursor-pointer"
                            >
                              Confirmer encaissement
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* MESSAGES */}
          {tab === 'messages' && (
            <div className="space-y-4">
              {messages.map((m) => (
                <div key={m.id} className="bg-white border border-neutral-200 rounded-xl p-6 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-semibold text-sm">{m.subject}</p>
                      <p className="text-xs text-neutral-500">
                        {m.fullName} · {m.email} · {m.phone}
                      </p>
                    </div>
                    <span className="text-xs text-neutral-400">
                      {m.isRead ? 'Traité' : 'Nouveau'}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-700">{m.message}</p>
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      defaultValue={m.adminReply}
                      placeholder="Réponse de l'administration..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          void handleReplyMessage(m.id, e.currentTarget.value);
                        }
                      }}
                      className="flex-1 px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CONTENT & GALLERY */}
          {tab === 'content' && (
            <div className="space-y-8">
              <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
                <h2 className="font-display text-2xl font-semibold">Texte et bannière d'accueil</h2>
                <input
                  type="text"
                  value={homeDraft.heroTitleFr}
                  onChange={(e) => setHomeDraft({ ...homeDraft, heroTitleFr: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                  placeholder="Titre Hero FR"
                />
                <input
                  type="text"
                  value={homeDraft.heroSubtitleFr}
                  onChange={(e) => setHomeDraft({ ...homeDraft, heroSubtitleFr: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                  placeholder="Sous-titre Hero FR"
                />
                <input
                  type="text"
                  value={homeDraft.heroImageUrl}
                  onChange={(e) => setHomeDraft({ ...homeDraft, heroImageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                  placeholder="URL image bannière"
                />
                <button
                  type="button"
                  onClick={() => handleSaveSettings('homeContent', homeDraft)}
                  className="px-5 py-2.5 text-xs font-semibold bg-[#0A0A0B] text-white rounded-lg cursor-pointer"
                >
                  Enregistrer l'accueil
                </button>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
                <h2 className="font-display text-2xl font-semibold">Gestion de la galerie</h2>
                <form onSubmit={handleAddPhoto} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Titre réalisation"
                    value={newPhoto.titleFr}
                    onChange={(e) => setNewPhoto({ ...newPhoto, titleFr: e.target.value })}
                    className="px-3 py-2 text-sm border border-neutral-300 rounded-lg"
                  />
                  <select
                    value={newPhoto.category}
                    onChange={(e) => setNewPhoto({ ...newPhoto, category: e.target.value })}
                    className="px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value="mariages">Mariages</option>
                    <option value="decorations">Décorations</option>
                    <option value="conferences">Conférences</option>
                    <option value="anniversaires">Anniversaires</option>
                    <option value="soirees">Soirées</option>
                    <option value="professionnels">Professionnels</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="URL image"
                    value={newPhoto.imageUrl}
                    onChange={(e) => setNewPhoto({ ...newPhoto, imageUrl: e.target.value })}
                    className="px-3 py-2 text-sm border border-neutral-300 rounded-lg"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold bg-[#0A0A0B] text-white rounded-lg cursor-pointer"
                  >
                    Ajouter photo
                  </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
                  {(bootstrap?.gallery || []).map((g) => (
                    <div key={g.id} className="border border-neutral-200 rounded-lg p-3 flex items-center justify-between gap-2">
                      <span className="text-xs font-medium truncate">{g.titleFr}</span>
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(g.id)}
                        className="text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
                <h2 className="font-display text-2xl font-semibold">Témoignages clients</h2>
                <form onSubmit={handleAddReview} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Nom client"
                    value={newReview.clientName}
                    onChange={(e) => setNewReview({ ...newReview, clientName: e.target.value })}
                    className="px-3 py-2 text-sm border border-neutral-300 rounded-lg"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Fonction"
                    value={newReview.clientRole}
                    onChange={(e) => setNewReview({ ...newReview, clientRole: e.target.value })}
                    className="px-3 py-2 text-sm border border-neutral-300 rounded-lg"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Entreprise ou événement"
                    value={newReview.companyOrEvent}
                    onChange={(e) => setNewReview({ ...newReview, companyOrEvent: e.target.value })}
                    className="px-3 py-2 text-sm border border-neutral-300 rounded-lg"
                  />
                  <textarea
                    rows={2}
                    required
                    placeholder="Témoignage..."
                    value={newReview.commentFr}
                    onChange={(e) => setNewReview({ ...newReview, commentFr: e.target.value })}
                    className="sm:col-span-2 px-3 py-2 text-sm border border-neutral-300 rounded-lg"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold bg-[#0A0A0B] text-white rounded-lg cursor-pointer"
                  >
                    Publier témoignage
                  </button>
                </form>

                <div className="space-y-2 pt-2">
                  {(bootstrap?.reviews || []).map((r) => (
                    <div key={r.id} className="border border-neutral-200 rounded-lg p-3 flex justify-between items-center">
                      <span className="text-xs">
                        <strong>{r.clientName}</strong> — {r.companyOrEvent}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(r.id)}
                        className="text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {tab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
                <h2 className="font-display text-2xl font-semibold">
                  Coordonnées Casablanca & Google Maps
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={companyDraft.address}
                    onChange={(e) => setCompanyDraft({ ...companyDraft, address: e.target.value })}
                    placeholder="Adresse complète"
                    className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={companyDraft.phone}
                    onChange={(e) => setCompanyDraft({ ...companyDraft, phone: e.target.value })}
                    placeholder="Téléphone"
                    className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={companyDraft.whatsapp}
                    onChange={(e) => setCompanyDraft({ ...companyDraft, whatsapp: e.target.value })}
                    placeholder="WhatsApp"
                    className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                  />
                  <input
                    type="email"
                    value={companyDraft.email}
                    onChange={(e) => setCompanyDraft({ ...companyDraft, email: e.target.value })}
                    placeholder="Email"
                    className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    value={companyDraft.lat}
                    onChange={(e) =>
                      setCompanyDraft({ ...companyDraft, lat: Number(e.target.value) || 33.5912 })
                    }
                    placeholder="Latitude"
                    className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg tabular-nums"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    value={companyDraft.lng}
                    onChange={(e) =>
                      setCompanyDraft({ ...companyDraft, lng: Number(e.target.value) || -7.6324 })
                    }
                    placeholder="Longitude"
                    className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg tabular-nums"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveSettings('companyInfo', companyDraft)}
                  className="px-5 py-2.5 text-xs font-semibold bg-[#0A0A0B] text-white rounded-lg cursor-pointer"
                >
                  Enregistrer les coordonnées
                </button>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
                <h2 className="font-display text-2xl font-semibold">Paiements & Acompte</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    type="number"
                    value={paymentDraft.depositPercent}
                    onChange={(e) =>
                      setPaymentDraft({
                        ...paymentDraft,
                        depositPercent: Number(e.target.value) || 30,
                      })
                    }
                    placeholder="% Acompte"
                    className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg tabular-nums"
                  />
                  <input
                    type="text"
                    value={paymentDraft.bankName}
                    onChange={(e) => setPaymentDraft({ ...paymentDraft, bankName: e.target.value })}
                    placeholder="Banque"
                    className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={paymentDraft.bankRib}
                    onChange={(e) => setPaymentDraft({ ...paymentDraft, bankRib: e.target.value })}
                    placeholder="RIB Maroc"
                    className="px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveSettings('paymentConfig', paymentDraft)}
                  className="px-5 py-2.5 text-xs font-semibold bg-[#0A0A0B] text-white rounded-lg cursor-pointer"
                >
                  Enregistrer configuration paiement
                </button>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
                <h2 className="font-display text-2xl font-semibold">Disponibilités & Dates bloquées</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Capacité maximale d'événements / jour
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={availDraft.maxEventsPerDay}
                      onChange={(e) =>
                        setAvailDraft({
                          ...availDraft,
                          maxEventsPerDay: Number(e.target.value) || 3,
                        })
                      }
                      className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Dates bloquées (YYYY-MM-DD, séparées par des virgules)
                    </label>
                    <input
                      type="text"
                      placeholder="2026-12-31, 2027-01-01"
                      value={availDraft.blockedDatesText}
                      onChange={(e) =>
                        setAvailDraft({ ...availDraft, blockedDatesText: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg font-mono"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleSaveSettings('availability', {
                      maxEventsPerDay: availDraft.maxEventsPerDay,
                      blockedDates: availDraft.blockedDatesText
                        .split(',')
                        .map((s) => s.trim())
                        .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s)),
                    })
                  }
                  className="px-5 py-2.5 text-xs font-semibold bg-[#0A0A0B] text-white rounded-lg cursor-pointer"
                >
                  Enregistrer les disponibilités
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
