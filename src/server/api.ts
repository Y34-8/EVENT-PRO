import express from 'express';
import { and, desc, eq, gte, inArray, sql } from 'drizzle-orm';
import crypto from 'node:crypto';
import { db } from '../db/index.ts';
import { ensureSeeded } from '../db/seed.ts';
import {
  categories,
  events,
  galleryItems,
  messages,
  newsletterSubscribers,
  notifications,
  payments,
  quotes,
  reservationDetails,
  reservations,
  reviews,
  roles,
  services,
  settings,
  users,
} from '../db/schema.ts';
import {
  generateReferenceCode,
  hashPassword,
  signSessionToken,
  verifyPassword,
} from '../lib/auth-crypto.ts';
import {
  AuthRequest,
  isConfiguredAdminEmail,
  optionalAuth,
  requireAdmin,
  requireAuth,
} from '../middleware/auth.ts';
import { EXCLUSIVE_OFFERS } from '../lib/offers.ts';

export const apiRouter = express.Router();

const MOROCCAN_PHONE_RE = /^(?:\+212|0)[5-7]\d{8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizePhone(phone: string): string {
  return phone.replace(/[\s\-().]/g, '');
}

function parseId(raw: unknown): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

async function getSettingValue<T>(key: string, fallback: T): Promise<T> {
  const rows = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  if (rows.length === 0) return fallback;
  return rows[0].value as unknown as T;
}

async function checkDateAvailability(eventDate: string) {
  const avail = await getSettingValue<{ maxEventsPerDay: number; blockedDates: string[] }>(
    'availability',
    { maxEventsPerDay: 3, blockedDates: [] }
  );
  if (avail.blockedDates?.includes(eventDate)) {
    return { available: false, reason: 'date_blocked', confirmedCount: 0, maxPerDay: avail.maxEventsPerDay || 3 };
  }
  const existing = await db
    .select({ id: reservations.id })
    .from(reservations)
    .where(
      and(
        eq(reservations.eventDate, eventDate),
        inArray(reservations.status, ['confirmed', 'in_preparation'])
      )
    );
  const maxPerDay = avail.maxEventsPerDay || 3;
  return {
    available: existing.length < maxPerDay,
    reason: existing.length >= maxPerDay ? 'capacity_full' : 'available',
    confirmedCount: existing.length,
    maxPerDay,
  };
}

// Middleware to lazily seed empty database on first API call
apiRouter.use(async (_req, res, next) => {
  try {
    await ensureSeeded();
    next();
  } catch (err) {
    console.error('Database initialization error:', err);
    res.status(503).json({ error: 'Service de base de données temporairement indisponible.' });
  }
});

// ==================== PUBLIC ROUTES ====================

apiRouter.get('/public/bootstrap', async (_req, res) => {
  try {
    const [
      catRows,
      serviceRows,
      eventRows,
      galleryRows,
      reviewRows,
      settingRows,
      resCountRows,
    ] = await Promise.all([
      db.select().from(categories).orderBy(categories.sortOrder),
      db.select().from(services).where(eq(services.isActive, true)).orderBy(services.sortOrder),
      db.select().from(events).orderBy(events.eventDate),
      db.select().from(galleryItems).where(eq(galleryItems.isPublished, true)).orderBy(desc(galleryItems.id)),
      db.select().from(reviews).where(eq(reviews.isPublished, true)).orderBy(desc(reviews.id)),
      db.select().from(settings),
      db.select({ total: sql<number>`count(*)::int` }).from(reservations),
    ]);

    const settingsMap: Record<string, unknown> = {};
    for (const s of settingRows) {
      settingsMap[s.key] = s.value;
    }

    const cmiConfigured = Boolean(
      process.env.CMI_MERCHANT_ID?.trim() &&
        process.env.CMI_SECRET_KEY?.trim() &&
        process.env.CMI_GATEWAY_URL?.trim()
    );

    res.json({
      categories: catRows,
      services: serviceRows,
      events: eventRows,
      gallery: galleryRows,
      reviews: reviewRows,
      settings: settingsMap,
      liveMetrics: {
        reservationsCount: Number(resCountRows[0]?.total || 0),
        eventsCount: eventRows.length,
      },
      integrations: {
        cmiConfigured,
        smtpConfigured: Boolean(process.env.SMTP_HOST?.trim()),
      },
    });
  } catch (err) {
    console.error('Bootstrap error:', err);
    res.status(500).json({ error: 'Impossible de charger les données de la plateforme.' });
  }
});

apiRouter.get('/services', async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(services)
      .where(eq(services.isActive, true))
      .orderBy(services.sortOrder);
    res.json(rows);
  } catch (err) {
    console.error('Services error:', err);
    res.status(500).json({ error: 'Erreur lors du chargement des services.' });
  }
});

apiRouter.get('/services/:slug', async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(services)
      .where(eq(services.slug, String(req.params.slug)))
      .limit(1);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Service introuvable.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Service detail error:', err);
    res.status(500).json({ error: 'Erreur lors du chargement du service.' });
  }
});

apiRouter.get('/availability', async (req, res) => {
  const dateStr = String(req.query.date || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return res.status(400).json({ error: 'Format de date invalide (YYYY-MM-DD).' });
  }
  try {
    const availability = await checkDateAvailability(dateStr);
    res.json({ date: dateStr, ...availability });
  } catch (err) {
    console.error('Availability error:', err);
    res.status(500).json({ error: 'Impossible de vérifier la disponibilité.' });
  }
});

apiRouter.post('/reservations', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const {
      serviceId,
      eventType,
      fullName,
      email,
      phone,
      eventDate,
      city,
      venueAddress,
      guestCount,
      estimatedBudgetMad,
      selectedExtraIds,
      notes,
      paymentMethod,
      promoCode,
    } = req.body ?? {};

    const cleanName = String(fullName || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPhone = sanitizePhone(String(phone || '').trim());
    const cleanDate = String(eventDate || '').trim();
    const cleanCity = String(city || 'Casablanca').trim();
    const cleanVenue = String(venueAddress || '').trim();
    const cleanEventType = String(eventType || '').trim();
    const guests = Math.max(10, Math.min(20000, Number(guestCount) || 100));
    const budget = Math.max(0, Number(estimatedBudgetMad) || 0);

    if (cleanName.length < 2) {
      return res.status(400).json({ error: 'Le nom complet est requis.' });
    }
    if (!EMAIL_RE.test(cleanEmail)) {
      return res.status(400).json({ error: 'Adresse e-mail invalide.' });
    }
    if (!MOROCCAN_PHONE_RE.test(cleanPhone)) {
      return res.status(400).json({
        error: 'Numéro de téléphone marocain invalide (ex: +212 6 61 48 90 12 ou 0661489012).',
      });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
      return res.status(400).json({ error: 'Veuillez sélectionner une date valide.' });
    }
    if (cleanVenue.length < 3) {
      return res.status(400).json({ error: 'Veuillez indiquer le lieu ou l\'adresse de l\'événement.' });
    }

    const avail = await checkDateAvailability(cleanDate);
    if (!avail.available) {
      return res.status(409).json({
        error:
          'Cette date est complète ou bloquée dans notre calendrier. Veuillez choisir une autre date.',
      });
    }

    let basePrice = 15000;
    let serviceTitleFr = cleanEventType || 'Organisation complète';
    let serviceTitleAr = cleanEventType || 'تنظيم شامل';
    let matchedServiceId: number | null = null;
    const detailLines: Array<{
      itemLabelFr: string;
      itemLabelAr: string;
      quantity: number;
      unitPriceMad: number;
      subtotalMad: number;
    }> = [];

    if (serviceId) {
      const sRows = await db
        .select()
        .from(services)
        .where(eq(services.id, Number(serviceId)))
        .limit(1);
      if (sRows.length > 0) {
        const s = sRows[0];
        matchedServiceId = s.id;
        basePrice = s.basePriceMad;
        serviceTitleFr = s.titleFr;
        serviceTitleAr = s.titleAr;

        // Scale catering or large guest counts transparently
        const isCatering = s.slug.includes('traiteur');
        const rawBase = isCatering ? Math.round((guests / 50) * s.basePriceMad) : s.basePriceMad;
        const cleanPromo = String(promoCode || '').trim().toUpperCase();
        const matchedOffer = EXCLUSIVE_OFFERS.find(
          (o) => o.code === cleanPromo && o.serviceSlug === s.slug
        );
        const effectiveBase = matchedOffer
          ? Math.round(rawBase * (1 - matchedOffer.discountPercent / 100))
          : rawBase;

        detailLines.push({
          itemLabelFr: matchedOffer
            ? `${s.titleFr} (Offre ${matchedOffer.code} -${matchedOffer.discountPercent}%)`
            : s.titleFr,
          itemLabelAr: matchedOffer
            ? `${s.titleAr} (عرض ${matchedOffer.code} -${matchedOffer.discountPercent}%)`
            : s.titleAr,
          quantity: 1,
          unitPriceMad: effectiveBase,
          subtotalMad: effectiveBase,
        });

        const extras = Array.isArray(s.extraOptions) ? s.extraOptions : [];
        const chosenIds = Array.isArray(selectedExtraIds) ? selectedExtraIds.map(String) : [];
        for (const opt of extras) {
          if (chosenIds.includes(opt.id)) {
            detailLines.push({
              itemLabelFr: opt.labelFr,
              itemLabelAr: opt.labelAr,
              quantity: 1,
              unitPriceMad: opt.priceMad,
              subtotalMad: opt.priceMad,
            });
          }
        }
      }
    }

    if (detailLines.length === 0) {
      detailLines.push({
        itemLabelFr: serviceTitleFr,
        itemLabelAr: serviceTitleAr,
        quantity: 1,
        unitPriceMad: basePrice,
        subtotalMad: basePrice,
      });
    }

    const calculatedTotal = detailLines.reduce((acc, item) => acc + item.subtotalMad, 0);
    const paymentCfg = await getSettingValue<{ depositPercent: number }>('paymentConfig', {
      depositPercent: 30,
    });
    const depositPercent = paymentCfg.depositPercent || 30;
    const depositRequired = Math.round((calculatedTotal * depositPercent) / 100);

    // Link to authenticated user or existing account by email
    let ownerUserId: number | null = req.dbUser?.id ?? null;
    if (!ownerUserId) {
      const existingUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, cleanEmail))
        .limit(1);
      if (existingUsers.length > 0) {
        ownerUserId = existingUsers[0].id;
      }
    }

    const bookingCode = generateReferenceCode('EP');

    const [created] = await db
      .insert(reservations)
      .values({
        bookingCode,
        userId: ownerUserId,
        serviceId: matchedServiceId,
        eventType: cleanEventType || serviceTitleFr,
        fullName: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        eventDate: cleanDate,
        city: cleanCity,
        venueAddress: cleanVenue,
        guestCount: guests,
        estimatedBudgetMad: budget,
        calculatedTotalMad: calculatedTotal,
        depositRequiredMad: depositRequired,
        notes: String(notes || '').trim(),
        status: 'pending',
      })
      .returning();

    if (detailLines.length > 0) {
      await db.insert(reservationDetails).values(
        detailLines.map((line) => ({
          reservationId: created.id,
          ...line,
        }))
      );
    }

    let createdPayment = null;
    if (paymentMethod === 'bank_transfer' || paymentMethod === 'on_site') {
      const refCode = generateReferenceCode('PAY');
      const [pay] = await db
        .insert(payments)
        .values({
          reservationId: created.id,
          amountMad: depositRequired,
          paymentType: 'deposit',
          method: paymentMethod,
          status: paymentMethod === 'bank_transfer' ? 'awaiting_verification' : 'pending',
          referenceCode: refCode,
          providerNote:
            paymentMethod === 'bank_transfer'
              ? 'Virement bancaire en attente de réception sur RIB EVENT PRO'
              : 'Règlement prévu à l\'agence EVENT PRO Casablanca',
        })
        .returning();
      createdPayment = pay;
    }

    if (ownerUserId) {
      await db.insert(notifications).values({
        userId: ownerUserId,
        titleFr: `Demande enregistrée (${bookingCode})`,
        titleAr: `تم تسجيل الطلب (${bookingCode})`,
        bodyFr: `Votre réservation pour le ${cleanDate} à ${cleanCity} est en cours d'examen par nos conseillers.`,
        bodyAr: `طلب الحجز الخاص بكم ليوم ${cleanDate} في ${cleanCity} قيد المراجعة.`,
        type: 'reservation',
      });
    }

    res.status(201).json({
      reservation: created,
      details: detailLines,
      payment: createdPayment,
      emailNotificationQueued: Boolean(process.env.SMTP_HOST?.trim()),
    });
  } catch (err) {
    console.error('Create reservation error:', err);
    res.status(500).json({ error: 'Impossible d\'enregistrer la réservation.' });
  }
});

apiRouter.post('/quotes/request', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const {
      serviceId,
      clientName,
      clientEmail,
      clientPhone,
      eventType,
      eventDate,
      city,
      guestCount,
      notes,
    } = req.body ?? {};

    const cleanName = String(clientName || '').trim();
    const cleanEmail = String(clientEmail || '').trim().toLowerCase();
    const cleanPhone = sanitizePhone(String(clientPhone || '').trim());

    if (cleanName.length < 2 || !EMAIL_RE.test(cleanEmail)) {
      return res.status(400).json({ error: 'Nom complet et e-mail valide requis.' });
    }
    if (cleanPhone && !MOROCCAN_PHONE_RE.test(cleanPhone)) {
      return res.status(400).json({ error: 'Numéro de téléphone marocain invalide.' });
    }

    let ownerId = req.dbUser?.id ?? null;
    if (!ownerId) {
      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, cleanEmail))
        .limit(1);
      if (existing.length > 0) ownerId = existing[0].id;
    }

    const quoteNumber = generateReferenceCode('DEV');
    const [created] = await db
      .insert(quotes)
      .values({
        quoteNumber,
        userId: ownerId,
        serviceId: serviceId ? Number(serviceId) : null,
        clientName: cleanName,
        clientEmail: cleanEmail,
        clientPhone: cleanPhone,
        eventType: String(eventType || 'Événement sur mesure').trim(),
        eventDate: String(eventDate || '').trim(),
        city: String(city || 'Casablanca').trim(),
        guestCount: Math.max(10, Number(guestCount) || 100),
        notes: String(notes || '').trim(),
        status: 'requested',
      })
      .returning();

    res.status(201).json(created);
  } catch (err) {
    console.error('Quote request error:', err);
    res.status(500).json({ error: 'Impossible d\'envoyer la demande de devis.' });
  }
});

apiRouter.post('/contact', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { fullName, email, phone, subject, message } = req.body ?? {};
    const cleanName = String(fullName || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanSubject = String(subject || '').trim();
    const cleanMessage = String(message || '').trim();

    if (cleanName.length < 2 || !EMAIL_RE.test(cleanEmail) || cleanMessage.length < 5) {
      return res.status(400).json({ error: 'Veuillez renseigner tous les champs obligatoires.' });
    }

    const [created] = await db
      .insert(messages)
      .values({
        userId: req.dbUser?.id ?? null,
        fullName: cleanName,
        email: cleanEmail,
        phone: sanitizePhone(String(phone || '').trim()),
        subject: cleanSubject || 'Demande d\'information',
        message: cleanMessage,
      })
      .returning();

    res.status(201).json(created);
  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message.' });
  }
});

apiRouter.post('/newsletter', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Adresse e-mail invalide.' });
    }
    await db.insert(newsletterSubscribers).values({ email }).onConflictDoNothing();
    res.status(201).json({ subscribed: true, email });
  } catch (err) {
    console.error('Newsletter error:', err);
    res.status(500).json({ error: 'Impossible d\'enregistrer votre inscription.' });
  }
});

// ==================== AUTH ROUTES ====================

apiRouter.post('/auth/register', async (req, res) => {
  try {
    const { fullName, email, phone, city, password } = req.body ?? {};
    const cleanName = String(fullName || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPhone = sanitizePhone(String(phone || '').trim());
    const cleanCity = String(city || 'Casablanca').trim();
    const rawPassword = String(password || '');

    if (cleanName.length < 2) {
      return res.status(400).json({ error: 'Nom complet requis (2 caractères min).' });
    }
    if (!EMAIL_RE.test(cleanEmail)) {
      return res.status(400).json({ error: 'Adresse e-mail invalide.' });
    }
    if (cleanPhone && !MOROCCAN_PHONE_RE.test(cleanPhone)) {
      return res.status(400).json({ error: 'Numéro de téléphone marocain invalide.' });
    }
    if (rawPassword.length < 8) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' });
    }

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, cleanEmail))
      .limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Un compte existe déjà avec cette adresse e-mail.' });
    }

    const roleName = isConfiguredAdminEmail(cleanEmail) ? 'admin' : 'client';
    const roleRows = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
    const roleId = roleRows[0]?.id ?? null;
    const uid = `local_${crypto.randomUUID()}`;
    const passwordHash = hashPassword(rawPassword);

    const [created] = await db
      .insert(users)
      .values({
        uid,
        email: cleanEmail,
        passwordHash,
        fullName: cleanName,
        phone: cleanPhone,
        city: cleanCity,
        role: roleName,
        roleId,
        isActive: true,
      })
      .returning();

    // Link any previous guest reservations or quotes matching this email
    await db
      .update(reservations)
      .set({ userId: created.id })
      .where(and(eq(reservations.email, cleanEmail), sql`${reservations.userId} IS NULL`));
    await db
      .update(quotes)
      .set({ userId: created.id })
      .where(and(eq(quotes.clientEmail, cleanEmail), sql`${quotes.userId} IS NULL`));

    const token = signSessionToken({
      userId: created.id,
      uid: created.uid,
      email: created.email,
    });

    res.status(201).json({
      token,
      user: {
        id: created.id,
        uid: created.uid,
        email: created.email,
        fullName: created.fullName,
        phone: created.phone,
        city: created.city,
        role: created.role,
        isActive: created.isActive,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Erreur lors de la création du compte.' });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!EMAIL_RE.test(email) || !password) {
      return res.status(400).json({ error: 'E-mail et mot de passe requis.' });
    }

    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Identifiants incorrects.' });
    }
    const user = rows[0];
    if (!user.passwordHash) {
      return res.status(401).json({
        error: 'Ce compte utilise la connexion Google. Veuillez vous connecter avec Google.',
      });
    }
    if (!verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Identifiants incorrects.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: 'Ce compte a été désactivé.' });
    }

    const token = signSessionToken({
      userId: user.id,
      uid: user.uid,
      email: user.email,
    });

    res.json({
      token,
      user: {
        id: user.id,
        uid: user.uid,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        city: user.city,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erreur lors de la connexion.' });
  }
});

apiRouter.post('/auth/forgot-password', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Adresse e-mail invalide.' });
    }
    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (rows.length > 0 && rows[0].passwordHash) {
      const resetToken = crypto.randomBytes(24).toString('hex');
      const expires = new Date(Date.now() + 1000 * 60 * 60);
      await db
        .update(users)
        .set({ resetToken, resetTokenExpiresAt: expires, updatedAt: new Date() })
        .where(eq(users.id, rows[0].id));
    }
    res.json({
      ok: true,
      smtpConfigured: Boolean(process.env.SMTP_HOST?.trim()),
      message: process.env.SMTP_HOST?.trim()
        ? 'Si un compte correspond à cet e-mail, un lien de réinitialisation a été envoyé.'
        : 'Demande de réinitialisation enregistrée. Configurez SMTP dans les paramètres serveur pour l\'envoi automatique par e-mail ou contactez le support à Casablanca.',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Erreur lors de la demande de réinitialisation.' });
  }
});

apiRouter.post('/auth/reset-password', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const token = String(req.body?.token || '').trim();
    const newPassword = String(req.body?.newPassword || '');
    if (!EMAIL_RE.test(email) || !token || newPassword.length < 8) {
      return res.status(400).json({ error: 'Paramètres de réinitialisation invalides.' });
    }
    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (
      rows.length === 0 ||
      !rows[0].resetToken ||
      rows[0].resetToken !== token ||
      !rows[0].resetTokenExpiresAt ||
      rows[0].resetTokenExpiresAt < new Date()
    ) {
      return res.status(400).json({ error: 'Jeton de réinitialisation invalide ou expiré.' });
    }
    await db
      .update(users)
      .set({
        passwordHash: hashPassword(newPassword),
        resetToken: null,
        resetTokenExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, rows[0].id));
    res.json({ ok: true });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Impossible de réinitialiser le mot de passe.' });
  }
});

apiRouter.get('/auth/me', requireAuth, async (req: AuthRequest, res) => {
  res.json({ user: req.dbUser });
});

// ==================== CLIENT SPACE ROUTES ====================

apiRouter.get('/client/dashboard', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser!;
    const myReservations = await db
      .select()
      .from(reservations)
      .where(eq(reservations.userId, user.id))
      .orderBy(desc(reservations.createdAt));

    const resIds = myReservations.map((r) => r.id);
    const [detailRows, paymentRows, myQuotes, myNotifs, myMessages] = await Promise.all([
      resIds.length > 0
        ? db.select().from(reservationDetails).where(inArray(reservationDetails.reservationId, resIds))
        : Promise.resolve([]),
      resIds.length > 0
        ? db.select().from(payments).where(inArray(payments.reservationId, resIds))
        : Promise.resolve([]),
      db.select().from(quotes).where(eq(quotes.userId, user.id)).orderBy(desc(quotes.createdAt)),
      db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, user.id))
        .orderBy(desc(notifications.createdAt)),
      db.select().from(messages).where(eq(messages.userId, user.id)).orderBy(desc(messages.createdAt)),
    ]);

    res.json({
      reservations: myReservations.map((r) => ({
        ...r,
        details: detailRows.filter((d) => d.reservationId === r.id),
        payments: paymentRows.filter((p) => p.reservationId === r.id),
      })),
      quotes: myQuotes,
      notifications: myNotifs,
      messages: myMessages,
    });
  } catch (err) {
    console.error('Client dashboard error:', err);
    res.status(500).json({ error: 'Impossible de charger votre espace client.' });
  }
});

apiRouter.put('/client/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser!;
    const fullName = String(req.body?.fullName || '').trim();
    const phone = sanitizePhone(String(req.body?.phone || '').trim());
    const city = String(req.body?.city || 'Casablanca').trim();

    if (fullName.length < 2) {
      return res.status(400).json({ error: 'Nom complet invalide.' });
    }
    if (phone && !MOROCCAN_PHONE_RE.test(phone)) {
      return res.status(400).json({ error: 'Numéro de téléphone marocain invalide.' });
    }

    const [updated] = await db
      .update(users)
      .set({ fullName, phone, city, updatedAt: new Date() })
      .where(eq(users.id, user.id))
      .returning();

    res.json({
      user: {
        id: updated.id,
        uid: updated.uid,
        email: updated.email,
        fullName: updated.fullName,
        phone: updated.phone,
        city: updated.city,
        role: updated.role,
        isActive: updated.isActive,
      },
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil.' });
  }
});

apiRouter.patch('/client/reservations/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser!;
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Identifiant de réservation invalide.' });
    const existing = await db
      .select()
      .from(reservations)
      .where(and(eq(reservations.id, id), eq(reservations.userId, user.id)))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Réservation introuvable.' });
    }
    const current = existing[0];
    if (current.status === 'completed' || current.status === 'cancelled') {
      return res.status(400).json({ error: 'Cette réservation ne peut plus être modifiée.' });
    }

    const { action, notes, guestCount } = req.body ?? {};
    if (action === 'cancel') {
      if (current.status === 'in_preparation') {
        return res.status(400).json({
          error: 'Un événement en cours de préparation nécessite l\'accord de votre conseiller.',
        });
      }
      const [updated] = await db
        .update(reservations)
        .set({ status: 'cancelled', updatedAt: new Date() })
        .where(eq(reservations.id, id))
        .returning();
      return res.json(updated);
    }

    const [updated] = await db
      .update(reservations)
      .set({
        notes: typeof notes === 'string' ? notes.trim() : current.notes,
        guestCount: guestCount ? Math.max(10, Number(guestCount)) : current.guestCount,
        updatedAt: new Date(),
      })
      .where(eq(reservations.id, id))
      .returning();
    res.json(updated);
  } catch (err) {
    console.error('Client reservation update error:', err);
    res.status(500).json({ error: 'Impossible de modifier la réservation.' });
  }
});

apiRouter.post('/client/quotes/:id/respond', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser!;
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Identifiant de devis invalide.' });
    const decision = String(req.body?.decision || '');
    if (decision !== 'accepted' && decision !== 'rejected') {
      return res.status(400).json({ error: 'Décision invalide.' });
    }
    const existing = await db
      .select()
      .from(quotes)
      .where(and(eq(quotes.id, id), eq(quotes.userId, user.id)))
      .limit(1);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Devis introuvable.' });
    }
    const [updated] = await db
      .update(quotes)
      .set({ status: decision, updatedAt: new Date() })
      .where(eq(quotes.id, id))
      .returning();
    res.json(updated);
  } catch (err) {
    console.error('Quote response error:', err);
    res.status(500).json({ error: 'Impossible de mettre à jour le devis.' });
  }
});

apiRouter.post('/client/payments', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser!;
    const { reservationId, method, paymentType } = req.body ?? {};
    const resRows = await db
      .select()
      .from(reservations)
      .where(and(eq(reservations.id, Number(reservationId)), eq(reservations.userId, user.id)))
      .limit(1);
    if (resRows.length === 0) {
      return res.status(404).json({ error: 'Réservation introuvable.' });
    }
    const targetRes = resRows[0];

    if (method === 'card_morocco') {
      const cmiConfigured = Boolean(
        process.env.CMI_MERCHANT_ID?.trim() &&
          process.env.CMI_SECRET_KEY?.trim() &&
          process.env.CMI_GATEWAY_URL?.trim()
      );
      if (!cmiConfigured) {
        return res.status(503).json({
          error:
            'La passerelle bancaire marocaine (CMI/Payzone) n\'est pas encore configurée avec vos identifiants marchands. Choisissez le virement bancaire ou le paiement sur place.',
        });
      }
      // Real CMI HMAC initialization would return signed form payload when configured
    }

    if (method !== 'bank_transfer' && method !== 'on_site') {
      return res.status(400).json({ error: 'Mode de paiement non pris en charge.' });
    }

    const amountMad =
      paymentType === 'full'
        ? targetRes.calculatedTotalMad
        : targetRes.depositRequiredMad || Math.round(targetRes.calculatedTotalMad * 0.3);

    const [created] = await db
      .insert(payments)
      .values({
        reservationId: targetRes.id,
        amountMad,
        paymentType: paymentType === 'full' ? 'full' : 'deposit',
        method,
        status: method === 'bank_transfer' ? 'awaiting_verification' : 'pending',
        referenceCode: generateReferenceCode('PAY'),
        providerNote:
          method === 'bank_transfer'
            ? 'Virement bancaire initié par le client — en attente de validation comptable'
            : 'Règlement sur place programmé à l\'agence Casablanca',
      })
      .returning();

    res.status(201).json(created);
  } catch (err) {
    console.error('Payment create error:', err);
    res.status(500).json({ error: 'Erreur lors de la création de l\'ordre de paiement.' });
  }
});

apiRouter.patch('/client/notifications/read', requireAuth, async (req: AuthRequest, res) => {
  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, req.dbUser!.id));
    res.json({ ok: true });
  } catch (err) {
    console.error('Notifications read error:', err);
    res.status(500).json({ error: 'Erreur lors du marquage des notifications.' });
  }
});

// ==================== ADMIN ROUTES ====================

apiRouter.get('/admin/overview', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const [allUsers, allReservations, allEvents, allPayments, allQuotes, allMessages] =
      await Promise.all([
        db.select({ id: users.id, role: users.role }).from(users),
        db.select().from(reservations).orderBy(desc(reservations.createdAt)),
        db.select().from(events),
        db.select().from(payments).orderBy(desc(payments.createdAt)),
        db.select().from(quotes).orderBy(desc(quotes.createdAt)),
        db.select().from(messages).orderBy(desc(messages.createdAt)),
      ]);

    const totalClients = allUsers.filter((u) => u.role === 'client').length;
    const totalReservations = allReservations.length;
    const pendingReservations = allReservations.filter((r) => r.status === 'pending').length;
    const confirmedReservations = allReservations.filter(
      (r) => r.status === 'confirmed' || r.status === 'in_preparation'
    ).length;
    const completedReservations = allReservations.filter((r) => r.status === 'completed').length;
    const completedEvents =
      allEvents.filter((e) => e.status === 'completed').length + completedReservations;

    const paidRevenue = allPayments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + p.amountMad, 0);
    const projectedRevenue = allReservations
      .filter((r) => r.status === 'confirmed' || r.status === 'in_preparation' || r.status === 'completed')
      .reduce((sum, r) => sum + r.calculatedTotalMad, 0);

    // Build 6-month chart buckets
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const now = new Date();
    const monthlyStats: Array<{ label: string; bookings: number; revenueMad: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthRes = allReservations.filter((r) => {
        const createdYm = r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 7) : '';
        return createdYm === ym || r.eventDate.startsWith(ym);
      });
      monthlyStats.push({
        label: monthNames[d.getMonth()],
        bookings: monthRes.length,
        revenueMad: monthRes
          .filter((r) => r.status !== 'cancelled')
          .reduce((acc, r) => acc + r.calculatedTotalMad, 0),
      });
    }

    res.json({
      stats: {
        totalClients,
        totalReservations,
        pendingReservations,
        confirmedReservations,
        completedEvents,
        paidRevenueMad: paidRevenue,
        projectedRevenueMad: projectedRevenue,
        unreadMessages: allMessages.filter((m) => !m.isRead).length,
        pendingQuotes: allQuotes.filter((q) => q.status === 'requested').length,
      },
      monthlyStats,
      latestReservations: allReservations.slice(0, 8),
    });
  } catch (err) {
    console.error('Admin overview error:', err);
    res.status(500).json({ error: 'Impossible de charger les statistiques.' });
  }
});

apiRouter.get('/admin/reservations', requireAuth, requireAdmin, async (req, res) => {
  try {
    const statusFilter = String(req.query.status || '').trim();
    const search = String(req.query.q || '').trim().toLowerCase();
    const rows = await db.select().from(reservations).orderBy(desc(reservations.createdAt));
    const filtered = rows.filter((r) => {
      if (statusFilter && statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (search) {
        const hay = `${r.bookingCode} ${r.fullName} ${r.email} ${r.city} ${r.eventType}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });
    const resIds = filtered.map((r) => r.id);
    const [detailRows, paymentRows] = await Promise.all([
      resIds.length > 0
        ? db.select().from(reservationDetails).where(inArray(reservationDetails.reservationId, resIds))
        : Promise.resolve([]),
      resIds.length > 0
        ? db.select().from(payments).where(inArray(payments.reservationId, resIds))
        : Promise.resolve([]),
    ]);

    res.json(
      filtered.map((r) => ({
        ...r,
        details: detailRows.filter((d) => d.reservationId === r.id),
        payments: paymentRows.filter((p) => p.reservationId === r.id),
      }))
    );
  } catch (err) {
    console.error('Admin reservations error:', err);
    res.status(500).json({ error: 'Erreur lors du chargement des réservations.' });
  }
});

apiRouter.patch('/admin/reservations/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Identifiant invalide.' });
    const { status, adminComment } = req.body ?? {};
    const validStatuses = ['pending', 'confirmed', 'in_preparation', 'completed', 'cancelled'];

    const existingRows = await db.select().from(reservations).where(eq(reservations.id, id)).limit(1);
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Réservation introuvable.' });
    }
    const current = existingRows[0];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide.' });
    }

    // Prevent double booking when moving from pending/cancelled to confirmed
    if (status === 'confirmed' && current.status !== 'confirmed' && current.status !== 'in_preparation') {
      const avail = await checkDateAvailability(current.eventDate);
      if (!avail.available) {
        return res.status(409).json({
          error: `Capacité maximale atteinte pour le ${current.eventDate}. Impossible de confirmer sans libérer un créneau.`,
        });
      }
    }

    const [updated] = await db
      .update(reservations)
      .set({
        status: status || current.status,
        adminComment: typeof adminComment === 'string' ? adminComment : current.adminComment,
        updatedAt: new Date(),
      })
      .where(eq(reservations.id, id))
      .returning();

    if (updated.userId && status && status !== current.status) {
      await db.insert(notifications).values({
        userId: updated.userId,
        titleFr: `Mise à jour réservation ${updated.bookingCode}`,
        titleAr: `تحديث الحجز ${updated.bookingCode}`,
        bodyFr: `Le statut de votre événement est désormais : ${status}.`,
        bodyAr: `تم تحديث حالة حجزكم إلى: ${status}.`,
        type: 'status',
      });
    }

    res.json(updated);
  } catch (err) {
    console.error('Admin update reservation error:', err);
    res.status(500).json({ error: 'Impossible de mettre à jour la réservation.' });
  }
});

// Admin Services CRUD
apiRouter.get('/admin/services', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const rows = await db.select().from(services).orderBy(services.sortOrder);
    res.json(rows);
  } catch (err) {
    console.error('Admin services error:', err);
    res.status(500).json({ error: 'Erreur chargement services.' });
  }
});

apiRouter.post('/admin/services', requireAuth, requireAdmin, async (req, res) => {
  try {
    const body = req.body ?? {};
    const slug =
      String(body.slug || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-') || `service-${Date.now()}`;
    const [created] = await db
      .insert(services)
      .values({
        categoryId: body.categoryId ? Number(body.categoryId) : null,
        slug,
        titleFr: String(body.titleFr || 'Nouveau service').trim(),
        titleAr: String(body.titleAr || 'خدمة جديدة').trim(),
        shortDescFr: String(body.shortDescFr || '').trim(),
        shortDescAr: String(body.shortDescAr || '').trim(),
        fullDescFr: String(body.fullDescFr || body.shortDescFr || '').trim(),
        fullDescAr: String(body.fullDescAr || body.shortDescAr || '').trim(),
        basePriceMad: Math.max(0, Number(body.basePriceMad) || 10000),
        priceUnitFr: String(body.priceUnitFr || 'À partir de').trim(),
        priceUnitAr: String(body.priceUnitAr || 'ابتداءً من').trim(),
        imageUrl: String(body.imageUrl || '/src/assets/images/hero_event_gala_1795276605928.jpg').trim(),
        galleryUrls: Array.isArray(body.galleryUrls) ? body.galleryUrls : [],
        includedItemsFr: Array.isArray(body.includedItemsFr) ? body.includedItemsFr : [],
        includedItemsAr: Array.isArray(body.includedItemsAr) ? body.includedItemsAr : [],
        extraOptions: Array.isArray(body.extraOptions) ? body.extraOptions : [],
        isActive: body.isActive !== false,
        sortOrder: Number(body.sortOrder) || 20,
      })
      .returning();
    res.status(201).json(created);
  } catch (err) {
    console.error('Admin create service error:', err);
    res.status(500).json({ error: 'Impossible de créer le service.' });
  }
});

apiRouter.put('/admin/services/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body ?? {};
    const existing = await db.select().from(services).where(eq(services.id, id)).limit(1);
    if (existing.length === 0) return res.status(404).json({ error: 'Service introuvable.' });
    const cur = existing[0];

    const [updated] = await db
      .update(services)
      .set({
        titleFr: body.titleFr !== undefined ? String(body.titleFr).trim() : cur.titleFr,
        titleAr: body.titleAr !== undefined ? String(body.titleAr).trim() : cur.titleAr,
        shortDescFr: body.shortDescFr !== undefined ? String(body.shortDescFr).trim() : cur.shortDescFr,
        shortDescAr: body.shortDescAr !== undefined ? String(body.shortDescAr).trim() : cur.shortDescAr,
        fullDescFr: body.fullDescFr !== undefined ? String(body.fullDescFr).trim() : cur.fullDescFr,
        fullDescAr: body.fullDescAr !== undefined ? String(body.fullDescAr).trim() : cur.fullDescAr,
        basePriceMad:
          body.basePriceMad !== undefined ? Math.max(0, Number(body.basePriceMad)) : cur.basePriceMad,
        imageUrl: body.imageUrl !== undefined ? String(body.imageUrl).trim() : cur.imageUrl,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : cur.isActive,
        updatedAt: new Date(),
      })
      .where(eq(services.id, id))
      .returning();

    res.json(updated);
  } catch (err) {
    console.error('Admin update service error:', err);
    res.status(500).json({ error: 'Erreur mise à jour service.' });
  }
});

apiRouter.delete('/admin/services/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.delete(services).where(eq(services.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (err) {
    console.error('Admin delete service error:', err);
    res.status(500).json({ error: 'Impossible de supprimer ce service (peut-être lié à des réservations).' });
  }
});

// Admin Events CRUD
apiRouter.get('/admin/events', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const rows = await db.select().from(events).orderBy(events.eventDate);
    res.json(rows);
  } catch (err) {
    console.error('Admin events error:', err);
    res.status(500).json({ error: 'Erreur chargement événements.' });
  }
});

apiRouter.post('/admin/events', requireAuth, requireAdmin, async (req, res) => {
  try {
    const body = req.body ?? {};
    const [created] = await db
      .insert(events)
      .values({
        slug: `evt-${Date.now()}`,
        titleFr: String(body.titleFr || 'Nouvel événement').trim(),
        titleAr: String(body.titleAr || body.titleFr || 'فعالية جديدة').trim(),
        categorySlug: String(body.categorySlug || 'evenements-professionnels'),
        eventDate: String(body.eventDate || '2026-12-30'),
        city: String(body.city || 'Casablanca'),
        venue: String(body.venue || 'Casablanca').trim(),
        capacity: Math.max(10, Number(body.capacity) || 200),
        ticketPriceMad: Math.max(0, Number(body.ticketPriceMad) || 0),
        descriptionFr: String(body.descriptionFr || '').trim(),
        descriptionAr: String(body.descriptionAr || body.descriptionFr || '').trim(),
        imageUrl: String(body.imageUrl || '/src/assets/images/hero_event_gala_1795276605928.jpg').trim(),
        status: String(body.status || 'upcoming'),
      })
      .returning();
    res.status(201).json(created);
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ error: 'Impossible de créer l\'événement.' });
  }
});

apiRouter.put('/admin/events/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body ?? {};
    const existing = await db.select().from(events).where(eq(events.id, id)).limit(1);
    if (existing.length === 0) return res.status(404).json({ error: 'Événement introuvable.' });
    const cur = existing[0];
    const [updated] = await db
      .update(events)
      .set({
        titleFr: body.titleFr ?? cur.titleFr,
        titleAr: body.titleAr ?? cur.titleAr,
        eventDate: body.eventDate ?? cur.eventDate,
        city: body.city ?? cur.city,
        venue: body.venue ?? cur.venue,
        capacity: body.capacity !== undefined ? Number(body.capacity) : cur.capacity,
        ticketPriceMad:
          body.ticketPriceMad !== undefined ? Number(body.ticketPriceMad) : cur.ticketPriceMad,
        descriptionFr: body.descriptionFr ?? cur.descriptionFr,
        imageUrl: body.imageUrl ?? cur.imageUrl,
        status: body.status ?? cur.status,
      })
      .where(eq(events.id, id))
      .returning();
    res.json(updated);
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ error: 'Impossible de modifier l\'événement.' });
  }
});

apiRouter.delete('/admin/events/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.delete(events).where(eq(events.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ error: 'Erreur suppression événement.' });
  }
});

// Admin Clients
apiRouter.get('/admin/clients', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const [allUsers, allRes] = await Promise.all([
      db
        .select({
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          phone: users.phone,
          city: users.city,
          role: users.role,
          isActive: users.isActive,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt)),
      db.select({ id: reservations.id, userId: reservations.userId, calculatedTotalMad: reservations.calculatedTotalMad }).from(reservations),
    ]);

    res.json(
      allUsers.map((u) => {
        const userRes = allRes.filter((r) => r.userId === u.id);
        return {
          ...u,
          reservationCount: userRes.length,
          totalSpentMad: userRes.reduce((s, r) => s + r.calculatedTotalMad, 0),
        };
      })
    );
  } catch (err) {
    console.error('Admin clients error:', err);
    res.status(500).json({ error: 'Erreur chargement clients.' });
  }
});

apiRouter.patch('/admin/clients/:id', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Identifiant client invalide.' });
    if (id === req.dbUser!.id && req.body?.isActive === false) {
      return res.status(400).json({ error: 'Impossible de désactiver votre propre compte administrateur.' });
    }
    const existing = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (existing.length === 0) return res.status(404).json({ error: 'Client introuvable.' });
    const [updated] = await db
      .update(users)
      .set({
        isActive: req.body?.isActive !== undefined ? Boolean(req.body.isActive) : existing[0].isActive,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        isActive: users.isActive,
        role: users.role,
      });
    res.json(updated);
  } catch (err) {
    console.error('Admin toggle client error:', err);
    res.status(500).json({ error: 'Impossible de modifier le compte client.' });
  }
});

// Admin Quotes
apiRouter.get('/admin/quotes', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const rows = await db.select().from(quotes).orderBy(desc(quotes.createdAt));
    res.json(rows);
  } catch (err) {
    console.error('Admin quotes error:', err);
    res.status(500).json({ error: 'Erreur chargement devis.' });
  }
});

apiRouter.post('/admin/quotes', requireAuth, requireAdmin, async (req, res) => {
  try {
    const body = req.body ?? {};
    const items = Array.isArray(body.items) ? body.items : [];
    const total = items.reduce(
      (sum: number, it: { qty?: number; unitPriceMad?: number }) =>
        sum + (Number(it.qty) || 1) * (Number(it.unitPriceMad) || 0),
      0
    );
    const cleanEmail = String(body.clientEmail || '').trim().toLowerCase();
    const matchedUser = cleanEmail
      ? await db.select({ id: users.id }).from(users).where(eq(users.email, cleanEmail)).limit(1)
      : [];

    const [created] = await db
      .insert(quotes)
      .values({
        quoteNumber: generateReferenceCode('DEV'),
        userId: matchedUser[0]?.id ?? null,
        clientName: String(body.clientName || '').trim(),
        clientEmail: cleanEmail,
        clientPhone: String(body.clientPhone || '').trim(),
        eventType: String(body.eventType || 'Événement sur mesure').trim(),
        eventDate: String(body.eventDate || '').trim(),
        city: String(body.city || 'Casablanca').trim(),
        guestCount: Number(body.guestCount) || 100,
        items,
        totalAmountMad: total || Number(body.totalAmountMad) || 0,
        depositPercent: Number(body.depositPercent) || 30,
        validUntil: String(body.validUntil || '').trim(),
        notes: String(body.notes || '').trim(),
        status: body.status === 'sent' ? 'sent' : 'requested',
      })
      .returning();

    if (created.userId && created.status === 'sent') {
      await db.insert(notifications).values({
        userId: created.userId,
        titleFr: `Nouveau devis ${created.quoteNumber}`,
        titleAr: `عرض سعر جديد ${created.quoteNumber}`,
        bodyFr: `Un devis de ${created.totalAmountMad.toLocaleString('fr-MA')} MAD est disponible dans votre espace.`,
        bodyAr: `عرض سعر بقيمة ${created.totalAmountMad} درهم متاح الآن في حسابكم.`,
        type: 'quote',
      });
    }
    res.status(201).json(created);
  } catch (err) {
    console.error('Admin create quote error:', err);
    res.status(500).json({ error: 'Impossible de créer le devis.' });
  }
});

apiRouter.put('/admin/quotes/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body ?? {};
    const existing = await db.select().from(quotes).where(eq(quotes.id, id)).limit(1);
    if (existing.length === 0) return res.status(404).json({ error: 'Devis introuvable.' });
    const cur = existing[0];
    const items = Array.isArray(body.items) ? body.items : cur.items;
    const total = Array.isArray(body.items)
      ? items.reduce(
          (sum: number, it: { qty?: number; unitPriceMad?: number }) =>
            sum + (Number(it.qty) || 1) * (Number(it.unitPriceMad) || 0),
          0
        )
      : body.totalAmountMad !== undefined
        ? Number(body.totalAmountMad)
        : cur.totalAmountMad;

    const [updated] = await db
      .update(quotes)
      .set({
        items,
        totalAmountMad: total,
        status: body.status ?? cur.status,
        notes: body.notes ?? cur.notes,
        validUntil: body.validUntil ?? cur.validUntil,
        updatedAt: new Date(),
      })
      .where(eq(quotes.id, id))
      .returning();

    if (updated.userId && body.status === 'sent' && cur.status !== 'sent') {
      await db.insert(notifications).values({
        userId: updated.userId,
        titleFr: `Devis prêt (${updated.quoteNumber})`,
        titleAr: `عرض السعر جاهز (${updated.quoteNumber})`,
        bodyFr: `Votre devis personnalisé (${updated.totalAmountMad.toLocaleString('fr-MA')} MAD) vous attend.`,
        bodyAr: `عرض السعر الخاص بكم جاهز للمراجعة.`,
        type: 'quote',
      });
    }

    res.json(updated);
  } catch (err) {
    console.error('Admin update quote error:', err);
    res.status(500).json({ error: 'Erreur mise à jour devis.' });
  }
});

// Admin Payments
apiRouter.get('/admin/payments', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const rows = await db.select().from(payments).orderBy(desc(payments.createdAt));
    const resRows = await db.select({ id: reservations.id, bookingCode: reservations.bookingCode, fullName: reservations.fullName }).from(reservations);
    res.json(
      rows.map((p) => {
        const match = resRows.find((r) => r.id === p.reservationId);
        return {
          ...p,
          bookingCode: match?.bookingCode || `#${p.reservationId}`,
          clientName: match?.fullName || '',
        };
      })
    );
  } catch (err) {
    console.error('Admin payments error:', err);
    res.status(500).json({ error: 'Erreur chargement paiements.' });
  }
});

apiRouter.patch('/admin/payments/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Identifiant paiement invalide.' });
    const { status, providerNote } = req.body ?? {};
    const validPaymentStatuses = ['pending', 'awaiting_verification', 'paid', 'failed', 'refunded'];
    const existing = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    if (existing.length === 0) return res.status(404).json({ error: 'Paiement introuvable.' });
    if (status !== undefined && !validPaymentStatuses.includes(String(status))) {
      return res.status(400).json({ error: 'Statut de paiement invalide.' });
    }
    const [updated] = await db
      .update(payments)
      .set({
        status: status !== undefined ? String(status) : existing[0].status,
        providerNote: typeof providerNote === 'string' ? providerNote : existing[0].providerNote,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, id))
      .returning();
    res.json(updated);
  } catch (err) {
    console.error('Admin update payment error:', err);
    res.status(500).json({ error: 'Impossible de mettre à jour le paiement.' });
  }
});

// Admin Gallery & Reviews & Messages & Settings
apiRouter.post('/admin/gallery', requireAuth, requireAdmin, async (req, res) => {
  try {
    const body = req.body ?? {};
    const [created] = await db
      .insert(galleryItems)
      .values({
        titleFr: String(body.titleFr || '').trim(),
        titleAr: String(body.titleAr || body.titleFr || '').trim(),
        category: String(body.category || 'mariages'),
        city: String(body.city || 'Casablanca'),
        eventDateLabel: String(body.eventDateLabel || '2026'),
        imageUrl: String(body.imageUrl || '/src/assets/images/hero_event_gala_1795276605928.jpg').trim(),
      })
      .returning();
    res.status(201).json(created);
  } catch (err) {
    console.error('Create gallery item error:', err);
    res.status(500).json({ error: 'Impossible d\'ajouter la photo.' });
  }
});

apiRouter.delete('/admin/gallery/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.delete(galleryItems).where(eq(galleryItems.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete gallery item error:', err);
    res.status(500).json({ error: 'Impossible de supprimer la photo.' });
  }
});

apiRouter.post('/admin/reviews', requireAuth, requireAdmin, async (req, res) => {
  try {
    const body = req.body ?? {};
    const [created] = await db
      .insert(reviews)
      .values({
        clientName: String(body.clientName || '').trim(),
        clientRole: String(body.clientRole || '').trim(),
        companyOrEvent: String(body.companyOrEvent || '').trim(),
        rating: Math.min(5, Math.max(1, Number(body.rating) || 5)),
        commentFr: String(body.commentFr || '').trim(),
        commentAr: String(body.commentAr || body.commentFr || '').trim(),
        isPublished: body.isPublished !== false,
      })
      .returning();
    res.status(201).json(created);
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({ error: 'Impossible d\'ajouter le témoignage.' });
  }
});

apiRouter.delete('/admin/reviews/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.delete(reviews).where(eq(reviews.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ error: 'Impossible de supprimer le témoignage.' });
  }
});

apiRouter.get('/admin/messages', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const rows = await db.select().from(messages).orderBy(desc(messages.createdAt));
    res.json(rows);
  } catch (err) {
    console.error('Admin messages error:', err);
    res.status(500).json({ error: 'Erreur chargement messages.' });
  }
});

apiRouter.patch('/admin/messages/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Identifiant message invalide.' });
    const { isRead, adminReply } = req.body ?? {};
    const existing = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
    if (existing.length === 0) return res.status(404).json({ error: 'Message introuvable.' });
    const [updated] = await db
      .update(messages)
      .set({
        isRead: isRead !== undefined ? Boolean(isRead) : true,
        adminReply: typeof adminReply === 'string' ? adminReply : existing[0].adminReply,
      })
      .where(eq(messages.id, id))
      .returning();
    res.json(updated);
  } catch (err) {
    console.error('Admin reply message error:', err);
    res.status(500).json({ error: 'Erreur mise à jour message.' });
  }
});

apiRouter.put('/admin/settings/:key', requireAuth, requireAdmin, async (req, res) => {
  try {
    const key = String(req.params.key);
    const allowed = ['companyInfo', 'homeContent', 'paymentConfig', 'availability'];
    if (!allowed.includes(key)) {
      return res.status(400).json({ error: 'Clé de paramètre non autorisée.' });
    }
    const value = req.body?.value;
    if (!value || typeof value !== 'object') {
      return res.status(400).json({ error: 'Valeur de paramètre invalide.' });
    }
    const [updated] = await db
      .insert(settings)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();
    res.json(updated);
  } catch (err) {
    console.error('Update setting error:', err);
    res.status(500).json({ error: 'Impossible d\'enregistrer les paramètres.' });
  }
});
