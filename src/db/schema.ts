import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export interface ExtraOptionItem {
  id: string;
  labelFr: string;
  labelAr: string;
  priceMad: number;
}

export interface QuoteLineItem {
  label: string;
  qty: number;
  unitPriceMad: number;
}

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(), // 'admin' | 'client'
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  fullName: text('full_name').notNull(),
  phone: text('phone').default('').notNull(),
  city: text('city').default('Casablanca').notNull(),
  role: text('role').default('client').notNull(), // 'admin' | 'client'
  roleId: integer('role_id').references(() => roles.id),
  isActive: boolean('is_active').default(true).notNull(),
  resetToken: text('reset_token'),
  resetTokenExpiresAt: timestamp('reset_token_expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  nameFr: text('name_fr').notNull(),
  nameAr: text('name_ar').notNull(),
  descriptionFr: text('description_fr').default('').notNull(),
  descriptionAr: text('description_ar').default('').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
});

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => categories.id),
  slug: text('slug').notNull().unique(),
  titleFr: text('title_fr').notNull(),
  titleAr: text('title_ar').notNull(),
  shortDescFr: text('short_desc_fr').notNull(),
  shortDescAr: text('short_desc_ar').notNull(),
  fullDescFr: text('full_desc_fr').notNull(),
  fullDescAr: text('full_desc_ar').notNull(),
  basePriceMad: integer('base_price_mad').notNull(),
  priceUnitFr: text('price_unit_fr').default('À partir de').notNull(),
  priceUnitAr: text('price_unit_ar').default('ابتداءً من').notNull(),
  imageUrl: text('image_url').notNull(),
  galleryUrls: jsonb('gallery_urls').$type<string[]>().default([]).notNull(),
  includedItemsFr: jsonb('included_items_fr').$type<string[]>().default([]).notNull(),
  includedItemsAr: jsonb('included_items_ar').$type<string[]>().default([]).notNull(),
  extraOptions: jsonb('extra_options').$type<ExtraOptionItem[]>().default([]).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  titleFr: text('title_fr').notNull(),
  titleAr: text('title_ar').notNull(),
  categorySlug: text('category_slug').notNull(),
  eventDate: text('event_date').notNull(), // YYYY-MM-DD
  city: text('city').default('Casablanca').notNull(),
  venue: text('venue').notNull(),
  capacity: integer('capacity').default(250).notNull(),
  ticketPriceMad: integer('ticket_price_mad').default(0).notNull(),
  descriptionFr: text('description_fr').notNull(),
  descriptionAr: text('description_ar').notNull(),
  imageUrl: text('image_url').notNull(),
  status: text('status').default('upcoming').notNull(), // 'upcoming' | 'completed' | 'featured'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reservations = pgTable('reservations', {
  id: serial('id').primaryKey(),
  bookingCode: text('booking_code').notNull().unique(),
  userId: integer('user_id').references(() => users.id),
  serviceId: integer('service_id').references(() => services.id),
  eventType: text('event_type').notNull(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  eventDate: text('event_date').notNull(), // YYYY-MM-DD
  city: text('city').default('Casablanca').notNull(),
  venueAddress: text('venue_address').notNull(),
  guestCount: integer('guest_count').default(100).notNull(),
  estimatedBudgetMad: integer('estimated_budget_mad').default(0).notNull(),
  calculatedTotalMad: integer('calculated_total_mad').default(0).notNull(),
  depositRequiredMad: integer('deposit_required_mad').default(0).notNull(),
  notes: text('notes').default('').notNull(),
  status: text('status').default('pending').notNull(), // 'pending' | 'confirmed' | 'in_preparation' | 'completed' | 'cancelled'
  adminComment: text('admin_comment').default('').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const reservationDetails = pgTable('reservation_details', {
  id: serial('id').primaryKey(),
  reservationId: integer('reservation_id')
    .references(() => reservations.id, { onDelete: 'cascade' })
    .notNull(),
  itemLabelFr: text('item_label_fr').notNull(),
  itemLabelAr: text('item_label_ar').notNull(),
  quantity: integer('quantity').default(1).notNull(),
  unitPriceMad: integer('unit_price_mad').notNull(),
  subtotalMad: integer('subtotal_mad').notNull(),
});

export const quotes = pgTable('quotes', {
  id: serial('id').primaryKey(),
  quoteNumber: text('quote_number').notNull().unique(),
  reservationId: integer('reservation_id').references(() => reservations.id),
  userId: integer('user_id').references(() => users.id),
  serviceId: integer('service_id').references(() => services.id),
  clientName: text('client_name').notNull(),
  clientEmail: text('client_email').notNull(),
  clientPhone: text('client_phone').default('').notNull(),
  eventType: text('event_type').notNull(),
  eventDate: text('event_date').default('').notNull(),
  city: text('city').default('Casablanca').notNull(),
  guestCount: integer('guest_count').default(100).notNull(),
  items: jsonb('items').$type<QuoteLineItem[]>().default([]).notNull(),
  totalAmountMad: integer('total_amount_mad').default(0).notNull(),
  depositPercent: integer('deposit_percent').default(30).notNull(),
  validUntil: text('valid_until').default('').notNull(),
  notes: text('notes').default('').notNull(),
  status: text('status').default('requested').notNull(), // 'requested' | 'sent' | 'accepted' | 'rejected'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  reservationId: integer('reservation_id')
    .references(() => reservations.id, { onDelete: 'cascade' })
    .notNull(),
  quoteId: integer('quote_id').references(() => quotes.id),
  amountMad: integer('amount_mad').notNull(),
  paymentType: text('payment_type').default('deposit').notNull(), // 'deposit' | 'balance' | 'full'
  method: text('method').default('bank_transfer').notNull(), // 'on_site' | 'bank_transfer' | 'card_morocco'
  status: text('status').default('pending').notNull(), // 'pending' | 'awaiting_verification' | 'paid' | 'failed' | 'refunded'
  referenceCode: text('reference_code').notNull().unique(),
  providerNote: text('provider_note').default('').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  clientName: text('client_name').notNull(),
  clientRole: text('client_role').notNull(),
  companyOrEvent: text('company_or_event').notNull(),
  rating: integer('rating').default(5).notNull(),
  commentFr: text('comment_fr').notNull(),
  commentAr: text('comment_ar').notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const galleryItems = pgTable('gallery_items', {
  id: serial('id').primaryKey(),
  titleFr: text('title_fr').notNull(),
  titleAr: text('title_ar').notNull(),
  category: text('category').notNull(), // 'mariages' | 'decorations' | 'conferences' | 'anniversaires' | 'soirees' | 'professionnels'
  city: text('city').default('Casablanca').notNull(),
  eventDateLabel: text('event_date_label').default('2026').notNull(),
  imageUrl: text('image_url').notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').default('').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  adminReply: text('admin_reply').default('').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  titleFr: text('title_fr').notNull(),
  titleAr: text('title_ar').notNull(),
  bodyFr: text('body_fr').notNull(),
  bodyAr: text('body_ar').notNull(),
  type: text('type').default('info').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: jsonb('value').$type<Record<string, unknown>>().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  roleRecord: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  reservations: many(reservations),
  quotes: many(quotes),
  notifications: many(notifications),
  messages: many(messages),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  services: many(services),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  category: one(categories, {
    fields: [services.categoryId],
    references: [categories.id],
  }),
  reservations: many(reservations),
}));

export const reservationsRelations = relations(reservations, ({ one, many }) => ({
  user: one(users, {
    fields: [reservations.userId],
    references: [users.id],
  }),
  service: one(services, {
    fields: [reservations.serviceId],
    references: [services.id],
  }),
  details: many(reservationDetails),
  payments: many(payments),
  quotes: many(quotes),
}));

export const reservationDetailsRelations = relations(reservationDetails, ({ one }) => ({
  reservation: one(reservations, {
    fields: [reservationDetails.reservationId],
    references: [reservations.id],
  }),
}));

export const quotesRelations = relations(quotes, ({ one }) => ({
  reservation: one(reservations, {
    fields: [quotes.reservationId],
    references: [reservations.id],
  }),
  user: one(users, {
    fields: [quotes.userId],
    references: [users.id],
  }),
  service: one(services, {
    fields: [quotes.serviceId],
    references: [services.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  reservation: one(reservations, {
    fields: [payments.reservationId],
    references: [reservations.id],
  }),
  quote: one(quotes, {
    fields: [payments.quoteId],
    references: [quotes.id],
  }),
}));
