export type Lang = 'fr' | 'ar';

export interface UserProfile {
  id: number;
  uid: string;
  email: string;
  fullName: string;
  phone: string;
  city: string;
  role: 'admin' | 'client' | string;
  isActive?: boolean;
}

export interface Category {
  id: number;
  slug: string;
  nameFr: string;
  nameAr: string;
  descriptionFr: string;
  descriptionAr: string;
  sortOrder: number;
}

export interface ExtraOption {
  id: string;
  labelFr: string;
  labelAr: string;
  priceMad: number;
}

export interface ServiceItem {
  id: number;
  categoryId: number | null;
  slug: string;
  titleFr: string;
  titleAr: string;
  shortDescFr: string;
  shortDescAr: string;
  fullDescFr: string;
  fullDescAr: string;
  basePriceMad: number;
  priceUnitFr: string;
  priceUnitAr: string;
  imageUrl: string;
  galleryUrls: string[];
  includedItemsFr: string[];
  includedItemsAr: string[];
  extraOptions: ExtraOption[];
  isActive: boolean;
  sortOrder: number;
}

export interface EventItem {
  id: number;
  slug: string;
  titleFr: string;
  titleAr: string;
  categorySlug: string;
  eventDate: string;
  city: string;
  venue: string;
  capacity: number;
  ticketPriceMad: number;
  descriptionFr: string;
  descriptionAr: string;
  imageUrl: string;
  status: 'upcoming' | 'completed' | 'featured' | string;
}

export interface GalleryItem {
  id: number;
  titleFr: string;
  titleAr: string;
  category: string;
  city: string;
  eventDateLabel: string;
  imageUrl: string;
  isPublished: boolean;
}

export interface ReviewItem {
  id: number;
  clientName: string;
  clientRole: string;
  companyOrEvent: string;
  rating: number;
  commentFr: string;
  commentAr: string;
  isPublished: boolean;
}

export interface ReservationDetail {
  id: number;
  reservationId: number;
  itemLabelFr: string;
  itemLabelAr: string;
  quantity: number;
  unitPriceMad: number;
  subtotalMad: number;
}

export interface PaymentRecord {
  id: number;
  reservationId: number;
  quoteId: number | null;
  amountMad: number;
  paymentType: string;
  method: string;
  status: string;
  referenceCode: string;
  providerNote: string;
  createdAt: string;
  bookingCode?: string;
  clientName?: string;
}

export interface ReservationRecord {
  id: number;
  bookingCode: string;
  userId: number | null;
  serviceId: number | null;
  eventType: string;
  fullName: string;
  email: string;
  phone: string;
  eventDate: string;
  city: string;
  venueAddress: string;
  guestCount: number;
  estimatedBudgetMad: number;
  calculatedTotalMad: number;
  depositRequiredMad: number;
  notes: string;
  status: 'pending' | 'confirmed' | 'in_preparation' | 'completed' | 'cancelled' | string;
  adminComment: string;
  createdAt: string;
  details?: ReservationDetail[];
  payments?: PaymentRecord[];
}

export interface QuoteItemLine {
  label: string;
  qty: number;
  unitPriceMad: number;
}

export interface QuoteRecord {
  id: number;
  quoteNumber: string;
  reservationId: number | null;
  userId: number | null;
  serviceId: number | null;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventType: string;
  eventDate: string;
  city: string;
  guestCount: number;
  items: QuoteItemLine[];
  totalAmountMad: number;
  depositPercent: number;
  validUntil: string;
  notes: string;
  status: 'requested' | 'sent' | 'accepted' | 'rejected' | string;
  createdAt: string;
}

export interface NotificationRecord {
  id: number;
  userId: number;
  titleFr: string;
  titleAr: string;
  bodyFr: string;
  bodyAr: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface MessageRecord {
  id: number;
  userId: number | null;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  isRead: boolean;
  adminReply: string;
  createdAt: string;
}

export interface CompanyInfoSetting {
  name: string;
  address: string;
  city: string;
  phone: string;
  whatsapp: string;
  email: string;
  hoursFr: string;
  hoursAr: string;
  lat: number;
  lng: number;
  instagram: string;
  linkedin: string;
  facebook: string;
}

export interface HomeContentSetting {
  heroTitleFr: string;
  heroTitleAr: string;
  heroSubtitleFr: string;
  heroSubtitleAr: string;
  heroImageUrl: string;
  aboutImageUrl: string;
  stats: Array<{ value: string; labelFr: string; labelAr: string }>;
}

export interface PaymentConfigSetting {
  depositPercent: number;
  bankName: string;
  bankRib: string;
  bankBeneficiary: string;
  onSiteInstructionsFr: string;
  onSiteInstructionsAr: string;
}

export interface AvailabilitySetting {
  maxEventsPerDay: number;
  blockedDates: string[];
}

export interface BootstrapPayload {
  categories: Category[];
  services: ServiceItem[];
  events: EventItem[];
  gallery: GalleryItem[];
  reviews: ReviewItem[];
  settings: {
    companyInfo?: CompanyInfoSetting;
    homeContent?: HomeContentSetting;
    paymentConfig?: PaymentConfigSetting;
    availability?: AvailabilitySetting;
  };
  liveMetrics?: {
    reservationsCount: number;
    eventsCount: number;
  };
  integrations: {
    cmiConfigured: boolean;
    smtpConfigured: boolean;
  };
}
