export interface ExclusiveOfferDefinition {
  code: string;
  serviceSlug: string;
  discountPercent: number;
  oldPriceDh: number;
  newPriceDh: number;
  titleFr: string;
  titleAr: string;
  descFr: string;
  descAr: string;
  highlightsFr: string[];
  highlightsAr: string[];
  validUntilFr: string;
  validUntilAr: string;
  imageUrl: string;
}

export const EXCLUSIVE_OFFERS: ExclusiveOfferDefinition[] = [
  {
    code: 'ANFA20',
    serviceSlug: 'mariages-et-ceremonies',
    discountPercent: 20,
    oldPriceDh: 45000,
    newPriceDh: 36000,
    titleFr: 'Pack Mariage Signature Anfa',
    titleAr: 'باقة الزفاف الفاخرة أنفا',
    descFr:
      'Direction artistique intégrale, arches florales blanches et coordination protocolaire complète à Casablanca.',
    descAr:
      'إشراف فني شامل، أقواس زهور بيضاء وتنسيق بروتوكولي متكامل في الدار البيضاء.',
    highlightsFr: ['Scénographie florale sur mesure', 'Équipe de coordination jour J'],
    highlightsAr: ['تصميم زهور مخصص', 'فريق تنسيق مرافق يوم الحفل'],
    validUntilFr: 'Valable jusqu’au 31 déc. 2026',
    validUntilAr: 'صالح إلى غاية 31 دجنبر 2026',
    imageUrl: '/src/assets/images/service_wedding_luxury_1795276605908.jpg',
  },
  {
    code: 'CFC15',
    serviceSlug: 'conferences-et-seminaires',
    discountPercent: 15,
    oldPriceDh: 28000,
    newPriceDh: 23800,
    titleFr: 'Forfait Conférence & Séminaire Exécutif',
    titleAr: 'عرض المؤتمرات والندوات التنفيذية',
    descFr:
      'Régie audiovisuelle HD, écran LED central, micros HF et accueil des délégations professionnelles.',
    descAr:
      'إدارة سمعية بصرية عالية الدقة، شاشة LED وميكروفونات واستقبال الوفود.',
    highlightsFr: ['Écran LED & sonorisation calibrée', 'Hôtesses & gestion badges'],
    highlightsAr: ['شاشة LED وهندسة صوتية', 'فريق استقبال وإدارة الشارات'],
    validUntilFr: 'Valable jusqu’au 31 déc. 2026',
    validUntilAr: 'صالح إلى غاية 31 دجنبر 2026',
    imageUrl: '/src/assets/images/service_corporate_conference_1795276606884.jpg',
  },
  {
    code: 'SOIREE25',
    serviceSlug: 'soirees-privees',
    discountPercent: 25,
    oldPriceDh: 18000,
    newPriceDh: 13500,
    titleFr: 'Offre Soirée Privée & Lounge VIP',
    titleAr: 'عرض السهرات الخاصة ولاونج VIP',
    descFr:
      'Aménagement lounge contemporain, éclairage architectural chaleureux et service bar signature.',
    descAr:
      'تجهيز لاونج عصري وإضاءة معمارية دافئة وخدمة ضيافة ومشروبات مميزة.',
    highlightsFr: ['Mobilier design & lumière chaude', 'Brigade maîtres d’hôtel incluse'],
    highlightsAr: ['أثاث عصري وإضاءة دافئة', 'طاقم خدمة محترف مشمول'],
    validUntilFr: 'Offre saisonnière -25 %',
    validUntilAr: 'عرض موسمي -25%',
    imageUrl: '/src/assets/images/masonry_soiree_rooftop_1795278030117.jpg',
  },
  {
    code: 'SALLE20',
    serviceSlug: 'location-de-salles-et-espaces',
    discountPercent: 20,
    oldPriceDh: 20000,
    newPriceDh: 16000,
    titleFr: 'Privatisation Lieu d’Exception 24h',
    titleAr: 'حجز حصري لفضاء استقبال راقٍ',
    descFr:
      'Accès privilégié à nos villas, palais et salons partenaires à Casablanca avec repérage technique.',
    descAr:
      'حجز حصري للفيلات والقصور والصالونات الشريكة في الدار البيضاء مع معاينة تقنية.',
    highlightsFr: ['Privatisation complète journée & soirée', 'Espace logistique & voiturier'],
    highlightsAr: ['حجز حصري طوال اليوم والسهرة', 'فضاء لوجستي وركن السيارات'],
    validUntilFr: 'Places limitées · Semaine & week-end',
    validUntilAr: 'مقاعد محدودة · طيلة الأسبوع',
    imageUrl: '/src/assets/images/venue_palais_anfa_1795278190140.jpg',
  },
];

export function formatDh(amount: number, lang: 'fr' | 'ar' = 'fr'): string {
  const formatted = new Intl.NumberFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA', {
    maximumFractionDigits: 0,
  }).format(amount || 0);
  return `${formatted} DH`;
}
