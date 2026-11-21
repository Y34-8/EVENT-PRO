import { Lang } from '../types/index.ts';

export const MOROCCAN_CITIES = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Mohammedia',
  'Tanger',
  'Agadir',
  'Fès',
  'El Jadida',
  'Bouskoura',
  'Dar Bouazza',
  'Meknès',
  'Oujda',
];

export function formatMad(amount: number, lang: Lang = 'fr'): string {
  const formatted = new Intl.NumberFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA', {
    maximumFractionDigits: 0,
  }).format(amount || 0);
  return lang === 'ar' ? `${formatted} د.م.` : `${formatted} MAD`;
}

export function formatLocalDate(dateStr: string, lang: Lang = 'fr'): string {
  if (!dateStr) return '—';
  const parsed = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(parsed);
}

export const STATUS_LABELS: Record<string, { fr: string; ar: string; colorClass: string }> = {
  pending: {
    fr: 'En attente',
    ar: 'قيد الانتظار',
    colorClass: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  confirmed: {
    fr: 'Confirmée',
    ar: 'مؤكد',
    colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  },
  in_preparation: {
    fr: 'En cours de préparation',
    ar: 'قيد التحضير',
    colorClass: 'text-sky-700 bg-sky-50 border-sky-200',
  },
  completed: {
    fr: 'Terminée',
    ar: 'مكتمل',
    colorClass: 'text-neutral-700 bg-neutral-100 border-neutral-300',
  },
  cancelled: {
    fr: 'Annulée',
    ar: 'ملغى',
    colorClass: 'text-rose-700 bg-rose-50 border-rose-200',
  },
  requested: {
    fr: 'Demandé',
    ar: 'مطلوب',
    colorClass: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  sent: {
    fr: 'Envoyé',
    ar: 'مرسل',
    colorClass: 'text-sky-700 bg-sky-50 border-sky-200',
  },
  accepted: {
    fr: 'Accepté',
    ar: 'مقبول',
    colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  },
  rejected: {
    fr: 'Refusé',
    ar: 'مرفوض',
    colorClass: 'text-rose-700 bg-rose-50 border-rose-200',
  },
  paid: {
    fr: 'Payé',
    ar: 'مدفوع',
    colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  },
  awaiting_verification: {
    fr: 'Virement en vérification',
    ar: 'قيد التحقق من التحويل',
    colorClass: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  failed: {
    fr: 'Échoué',
    ar: 'فشل',
    colorClass: 'text-rose-700 bg-rose-50 border-rose-200',
  },
  refunded: {
    fr: 'Remboursé',
    ar: 'مسترد',
    colorClass: 'text-neutral-700 bg-neutral-100 border-neutral-300',
  },
};

export const translations = {
  fr: {
    nav: {
      home: 'Accueil',
      events: 'Nos événements',
      services: 'Nos services',
      portfolio: 'Nos réalisations',
      about: 'À propos',
      contact: 'Contact',
      bookNow: 'Réserver maintenant',
      login: 'Connexion',
      account: 'Mon espace',
      admin: 'Admin',
      logout: 'Déconnexion',
    },
    hero: {
      eyebrow: 'Agence événementielle · Casablanca & Maroc',
      discoverServices: 'Découvrir nos services',
      bookEvent: 'Réserver un événement',
    },
    home: {
      introTitle: 'Une direction artistique et logistique d\'exception.',
      introBody:
        'Basée au cœur de Casablanca, EVENT PRO réunit architectes d\'espace, chefs exécutifs, ingénieurs son & lumière et coordinateurs protocolaires sous un même toit pour garantir la maîtrise totale de vos événements.',
      servicesTitle: 'Nos principaux services',
      servicesSubtitle: 'Douze pôles d\'expertise intégrés pour des événements privés et professionnels sans couture.',
      viewAllServices: 'Voir les 12 services',
      eventsTitle: 'Nos événements populaires',
      eventsSubtitle: 'Prochaines productions et formats phares orchestrés au Maroc.',
      whyTitle: 'Pourquoi choisir EVENT PRO ?',
      whyItems: [
        {
          num: '01',
          title: 'Interlocuteur unique à Casablanca',
          desc: 'De la conception 3D à la coordination du jour J, une équipe dédiée pilote l\'ensemble des prestataires.',
        },
        {
          num: '02',
          title: 'Transparence tarifaire en MAD',
          desc: 'Estimations détaillées, devis ligne par ligne et suivi budgétaire en temps réel depuis votre espace client.',
        },
        {
          num: '03',
          title: 'Vérification anti double-réservation',
          desc: 'Disponibilités contrôlées avant confirmation pour garantir des équipes et matériels 100 % dédiés à votre date.',
        },
        {
          num: '04',
          title: 'Déploiement partout au Maroc',
          desc: 'Casablanca, Rabat, Marrakech, Tanger et Agadir avec logistique propre et partenaires hôteliers 5 étoiles.',
        },
      ],
      galleryTitle: 'Galerie de nos réalisations',
      gallerySubtitle: 'Instants capturés lors de nos réceptions, congrès et productions scéniques.',
      reviewsTitle: 'Témoignages de clients',
      quoteSectionTitle: 'Demander un devis sur mesure',
      quoteSectionSubtitle:
        'Décrivez votre projet et recevez une proposition chiffrée sous 24 heures ouvrées.',
      newsletterTitle: 'Restez informé de nos productions',
      newsletterSubtitle: 'Tendances scénographiques, ouvertures de lieux exclusifs et calendrier Casablanca.',
      newsletterPlaceholder: 'Votre adresse e-mail professionnelle ou personnelle',
      newsletterCta: 'S\'inscrire',
      newsletterSuccess: 'Inscription enregistrée avec succès.',
    },
    actions: {
      discover: 'Découvrir',
      bookService: 'Réserver ce service',
      sendRequest: 'Envoyer la demande',
      submitBooking: 'Confirmer la demande de réservation',
      save: 'Enregistrer',
      cancel: 'Annuler',
      edit: 'Modifier',
      delete: 'Supprimer',
      confirm: 'Confirmer',
      back: 'Retour',
    },
  },
  ar: {
    nav: {
      home: 'الرئيسية',
      events: 'فعالياتنا',
      services: 'خدماتنا',
      portfolio: 'إنجازاتنا',
      about: 'من نحن',
      contact: 'اتصل بنا',
      bookNow: 'احجز الآن',
      login: 'تسجيل الدخول',
      account: 'حسابي',
      admin: 'لوحة الإدارة',
      logout: 'تسجيل الخروج',
    },
    hero: {
      eyebrow: 'وكالة تنظيم الفعاليات · الدار البيضاء والمغرب',
      discoverServices: 'اكتشف خدماتنا',
      bookEvent: 'احجز فعالية',
    },
    home: {
      introTitle: 'إدارة فنية ولوجستية استثنائية في كل التفاصيل.',
      introBody:
        'انطلاقاً من الدار البيضاء، تجمع إيفنت برو مهندسي الديكور والطهاة التنفيذيين ومهندسي الصوت والإضاءة ومنسقي البروتوكول تحت سقف واحد لضمان نجاح فعالياتكم.',
      servicesTitle: 'خدماتنا الرئيسية',
      servicesSubtitle: 'اثنا عشر تخصصاً متكاملاً لتنظيم الفعاليات الخاصة والمهنية بأعلى جودة.',
      viewAllServices: 'عرض جميع الخدمات (12)',
      eventsTitle: 'الفعاليات الرائجة',
      eventsSubtitle: 'أحدث الإنتاجات والفعاليات الكبرى في المغرب.',
      whyTitle: 'لماذا تختار إيفنت برو؟',
      whyItems: [
        {
          num: '01',
          title: 'مخاطب واحد في الدار البيضاء',
          desc: 'من التصميم ثلاثي الأبعاد إلى التنسيق الميداني يوم الحدث، فريق مخصص يدير كافة المزودين.',
        },
        {
          num: '02',
          title: 'شفافية الأسعار بالدرهم المغربي',
          desc: 'تقديرات واضحة وعروض أسعار مفصلة مع متابعة فورية عبر حسابكم الشخصي.',
        },
        {
          num: '03',
          title: 'التحقق من التوفر ومنع الحجز المزدوج',
          desc: 'مراقبة دقيقة للتواريخ قبل التأكيد لضمان تفرغ كامل للفرق والمعدات.',
        },
        {
          num: '04',
          title: 'تغطية شاملة لجميع مدن المغرب',
          desc: 'الدار البيضاء والرباط ومراكش وطنجة وأكادير بإمكانيات لوجستية متكاملة.',
        },
      ],
      galleryTitle: 'معرض إنجازاتنا',
      gallerySubtitle: 'لقطات من حفلات الزفاف والمؤتمرات والعروض التي أنجزناها.',
      reviewsTitle: 'شهادات عملائنا',
      quoteSectionTitle: 'اطلب عرض سعر مخصص',
      quoteSectionSubtitle: 'شاركنا تفاصيل مشروعك واحصل على دراسة مالية خلال 24 ساعة.',
      newsletterTitle: 'اشترك في نشرتنا البريدية',
      newsletterSubtitle: 'أحدث صيحات التصميم والفضاءات الحصرية وأجندة الدار البيضاء.',
      newsletterPlaceholder: 'أدخل بريدك الإلكتروني',
      newsletterCta: 'اشتراك',
      newsletterSuccess: 'تم تسجيل اشتراكك بنجاح.',
    },
    actions: {
      discover: 'اكتشف',
      bookService: 'احجز هذه الخدمة',
      sendRequest: 'إرسال الطلب',
      submitBooking: 'تأكيد طلب الحجز',
      save: 'حفظ',
      cancel: 'إلغاء',
      edit: 'تعديل',
      delete: 'حذف',
      confirm: 'تأكيد',
      back: 'رجوع',
    },
  },
} as const;
