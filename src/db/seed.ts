import { count } from 'drizzle-orm';
import { db } from './index.ts';
import {
  categories,
  events,
  galleryItems,
  reviews,
  roles,
  services,
  settings,
} from './schema.ts';

let seedPromise: Promise<void> | null = null;

export async function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeedIfEmpty().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  return seedPromise;
}

async function runSeedIfEmpty(): Promise<void> {
  await db
    .insert(roles)
    .values([
      { name: 'admin', description: 'Administrateur complet de la plateforme EVENT PRO' },
      { name: 'client', description: 'Client EVENT PRO avec accès à son espace personnel' },
    ])
    .onConflictDoNothing();

  const [{ value: serviceCount }] = await db.select({ value: count() }).from(services);
  if (serviceCount > 0) {
    return;
  }

  const insertedCategories = await db
    .insert(categories)
    .values([
      {
        slug: 'mariages-ceremonies',
        nameFr: 'Mariages & Cérémonies',
        nameAr: 'الأعراس والمراسم',
        descriptionFr: 'Orchestration complète de mariages marocains et contemporains.',
        descriptionAr: 'تنظيم شامل للأعراس المغربية والعصرية.',
        sortOrder: 1,
      },
      {
        slug: 'corporate-conferences',
        nameFr: 'Corporate & Conférences',
        nameAr: 'الشركات والمؤتمرات',
        descriptionFr: 'Congrès, séminaires exécutifs, galas d\'entreprise et lancements.',
        descriptionAr: 'المؤتمرات والندوات التنفيذية وحفلات الشركات وإطلاق المنتجات.',
        sortOrder: 2,
      },
      {
        slug: 'celebrations-spectacles',
        nameFr: 'Célébrations & Spectacles',
        nameAr: 'الاحتفالات والعروض',
        descriptionFr: 'Anniversaires privés, soirées exclusives et festivals culturels.',
        descriptionAr: 'أعياد الميلاد الخاصة والسهرات الحصرية والمهرجانات الثقافية.',
        sortOrder: 3,
      },
      {
        slug: 'production-hospitalite',
        nameFr: 'Scénographie & Hospitalité',
        nameAr: 'التصميم والضيافة',
        descriptionFr: 'Décoration, son & lumière, gastronomie, image et lieux d\'exception.',
        descriptionAr: 'الديكور والصوت والإضاءة والضيافة والتصوير وتأجير القاعات.',
        sortOrder: 4,
      },
    ])
    .onConflictDoNothing()
    .returning();

  const catMap: Record<string, number> = {};
  for (const cat of insertedCategories) {
    catMap[cat.slug] = cat.id;
  }

  const IMG_HERO = '/src/assets/images/hero_event_gala_1795276605928.jpg';
  const IMG_WEDDING = '/src/assets/images/service_wedding_luxury_1795276605908.jpg';
  const IMG_CORP = '/src/assets/images/service_corporate_conference_1795276606884.jpg';
  const IMG_FOOD = '/src/assets/images/service_gastronomy_catering_1795276605960.jpg';
  const IMG_LIGHT = '/src/assets/images/service_sound_lighting_1795276605957.jpg';
  const IMG_STUDIO = '/src/assets/images/about_agency_team_1795276605935.jpg';

  await db
    .insert(services)
    .values([
      {
        categoryId: catMap['mariages-ceremonies'] ?? null,
        slug: 'mariages-et-ceremonies',
        titleFr: 'Mariages et cérémonies',
        titleAr: 'الأعراس والمراسم',
        shortDescFr:
          'Conception sur mesure de votre réception, de la scénographie florale au protocole complet.',
        shortDescAr:
          'تصميم وتنظيم حفلات الزفاف حسب الطلب، من تنسيق الزهور إلى إدارة البروتوكول الكامل.',
        fullDescFr:
          'EVENT PRO orchestre des mariages d\'exception à Casablanca et à travers tout le Maroc. Nos directeurs artistiques allient savoir-faire marocain authentique et architecture événementielle contemporaine pour transformer chaque cérémonie en une expérience fluide et mémorable.',
        fullDescAr:
          'تنظم إيفنت برو حفلات زفاف استثنائية في الدار البيضاء وجميع مدن المغرب، مع دمج التقاليد المغربية الأصيلة باللمسة المعمارية العصرية.',
        basePriceMad: 45000,
        priceUnitFr: 'À partir de',
        priceUnitAr: 'ابتداءً من',
        imageUrl: IMG_WEDDING,
        galleryUrls: [IMG_WEDDING, IMG_HERO, IMG_FOOD],
        includedItemsFr: [
          'Direction artistique et planification intégrale',
          'Scénographie de la salle et design floral',
          'Coordination des prestataires le jour J (équipe dédiée)',
          'Gestion des accès, accueil VIP et placement',
        ],
        includedItemsAr: [
          'الإشراف الفني والتخطيط الشامل',
          'تصميم القاعة وتنسيق الزهور',
          'تنسيق جميع المزودين يوم الحفل',
          'استقبال كبار الشخصيات وإدارة الدخول',
        ],
        extraOptions: [
          { id: 'orchestre', labelFr: 'Orchestre Andalou & DJ Set', labelAr: 'فرقة أندلسية ودي جي', priceMad: 12000 },
          { id: 'amaria', labelFr: 'Cortège traditionnel & Zaffa', labelAr: 'العمارية والموكب التقليدي', priceMad: 8500 },
          { id: 'drone', labelFr: 'Couverture cinéma 4K + Drone', labelAr: 'تغطية سينمائية 4K ودرون', priceMad: 9000 },
        ],
        sortOrder: 1,
      },
      {
        categoryId: catMap['celebrations-spectacles'] ?? null,
        slug: 'anniversaires',
        titleFr: 'Anniversaires',
        titleAr: 'أعياد الميلاد',
        shortDescFr:
          'Réceptions privées élégantes, dîners thématiques et mises en scène personnalisées.',
        shortDescAr: 'حفلات خاصة أنيقة وعشاء موضوعي وتنسيق شخصي راقٍ.',
        fullDescFr:
          'Qu\'il s\'agisse d\'un dîner intime en villa à Anfa ou d\'une grande soirée festive, nous créons une atmosphère raffinée avec art de la table, gâteau signature et animation musicale adaptée.',
        fullDescAr:
          'سواء كان عشاءً حميمياً في فيلا بأنفا أو سهرة احتفالية كبرى، نصمم أجواءً راقية مع تنسيق الطاولات وكعكة فاخرة وبرنامج موسيقي متكامل.',
        basePriceMad: 12000,
        priceUnitFr: 'À partir de',
        priceUnitAr: 'ابتداءً من',
        imageUrl: IMG_HERO,
        galleryUrls: [IMG_HERO, IMG_FOOD],
        includedItemsFr: [
          'Décoration thématique et mise en lumière',
          'Sonorisation d\'ambiance et playlist sur mesure',
          'Coordination complète sur place',
        ],
        includedItemsAr: [
          'ديكور موضوعي وإضاءة مخصصة',
          'نظام صوتي وقائمة موسيقية مخصصة',
          'تنسيق ميداني كامل طوال الحفل',
        ],
        extraOptions: [
          { id: 'cake', labelFr: 'Pâtisserie sculpturale sur mesure', labelAr: 'كعكة احتفالية فاخرة', priceMad: 3200 },
          { id: 'photobooth', labelFr: 'Studio photo éditorial avec tirages', labelAr: 'استوديو تصوير فوري للضيوف', priceMad: 3800 },
        ],
        sortOrder: 2,
      },
      {
        categoryId: catMap['corporate-conferences'] ?? null,
        slug: 'conferences-et-seminaires',
        titleFr: 'Conférences et séminaires',
        titleAr: 'المؤتمرات والندوات',
        shortDescFr:
          'Production technique, scénographie de scène, traduction simultanée et accueil exécutif.',
        shortDescAr: 'إنتاج تقني متكامل، تجهيز المنصات، ترجمة فورية واستقبال تنفيذي.',
        fullDescFr:
          'Nous accompagnons les directions générales, institutions et fédérations dans l\'organisation de congrès nationaux et internationaux à Casablanca Finance City, Rabat et Marrakech.',
        fullDescAr:
          'نواكب الشركات والمؤسسات في تنظيم المؤتمرات الوطنية والدولية بالدار البيضاء والرباط ومراكش بأعلى معايير الدقة.',
        basePriceMad: 28000,
        priceUnitFr: 'À partir de',
        priceUnitAr: 'ابتداءً من',
        imageUrl: IMG_CORP,
        galleryUrls: [IMG_CORP, IMG_LIGHT],
        includedItemsFr: [
          'Écran LED haute définition et régie audiovisuelle',
          'Micros de conférence HF et acoustique calibrée',
          'Enregistrement des badges et hôtesses d\'accueil',
          'Pauses café exécutives et déjeuners d\'affaires',
        ],
        includedItemsAr: [
          'شاشة LED عالية الدقة وإدارة سمعية بصرية',
          'ميكروفونات لاسلكية وهندسة صوتية دقيقة',
          'تسجيل المشاركين وفريق الاستقبال',
          'استراحات القهوة وغداء الأعمال',
        ],
        extraOptions: [
          { id: 'traduction', labelFr: 'Cabines de traduction simultanée (FR/AR/EN)', labelAr: 'كابينات الترجمة الفورية', priceMad: 11000 },
          { id: 'streaming', labelFr: 'Diffusion live multi-caméras', labelAr: 'بث مباشر متعدد الكاميرات', priceMad: 8500 },
        ],
        sortOrder: 3,
      },
      {
        categoryId: catMap['corporate-conferences'] ?? null,
        slug: 'evenements-professionnels',
        titleFr: 'Événements professionnels',
        titleAr: 'الفعاليات المهنية',
        shortDescFr:
          'Galas annuels, dîners de remise de prix, team-buildings et conventions d\'entreprise.',
        shortDescAr: 'حفلات الشركات السنوية، توزيع الجوائز، وأيام بناء الفريق.',
        fullDescFr:
          'Fédérez vos équipes et valorisez votre image de marque grâce à des événements corporate rigoureusement orchestrés, de la conception du concept au démontage final.',
        fullDescAr:
          'عززوا روح الفريق وصورة مؤسستكم عبر فعاليات احترافية منظمة بدقة من الفكرة الأولى حتى الختام.',
        basePriceMad: 35000,
        priceUnitFr: 'À partir de',
        priceUnitAr: 'ابتداءً من',
        imageUrl: IMG_HERO,
        galleryUrls: [IMG_HERO, IMG_CORP],
        includedItemsFr: [
          'Direction de production dédiée',
          'Branding spatial et signalétique corporate',
          'Dîner de gala assis ou cocktail dînatoire',
        ],
        includedItemsAr: [
          'إدارة إنتاج مخصصة',
          'تزيين فضائي وهوية بصرية للشركة',
          'عشاء رسمي أو كوكتيل استقبال',
        ],
        extraOptions: [
          { id: 'trophies', labelFr: 'Création de trophées gravés sur mesure', labelAr: 'تصميم دروع وجوائز مخصصة', priceMad: 4500 },
          { id: 'jazz', labelFr: 'Quartet Jazz acoustique', labelAr: 'فرقة جاز موسيقية', priceMad: 9500 },
        ],
        sortOrder: 4,
      },
      {
        categoryId: catMap['celebrations-spectacles'] ?? null,
        slug: 'soirees-privees',
        titleFr: 'Soirées privées',
        titleAr: 'السهرات الخاصة',
        shortDescFr:
          'Réceptions exclusives en rooftop, villa ou domaine privé avec service concierge.',
        shortDescAr: 'سهرات حصرية في الفيلات أو التراسات الفاخرة مع خدمة كونسيرج.',
        fullDescFr:
          'Discrétion absolue, atmosphère feutrée et prestations sur mesure pour vos réceptions privées à Casablanca, Dar Bouazza et Bouskoura.',
        fullDescAr:
          'سرية تامة وأجواء راقية وخدمات مخصصة لسهراتكم الخاصة في الدار البيضاء وبوسكورة.',
        basePriceMad: 18000,
        priceUnitFr: 'À partir de',
        priceUnitAr: 'ابتداءً من',
        imageUrl: IMG_LIGHT,
        galleryUrls: [IMG_LIGHT, IMG_HERO],
        includedItemsFr: [
          'Aménagement lounge et mobilier design',
          'Éclairage architectural d\'ambiance',
          'Service bar sans alcool signature & personnel maître d\'hôtel',
        ],
        includedItemsAr: [
          'تجهيز لاونج وأثاث عصري',
          'إضاءة معمارية دافئة',
          'خدمة ضيافة ومشروبات مميزة',
        ],
        extraOptions: [
          { id: 'dj_pro', labelFr: 'DJ Résident & système son L-Acoustics', labelAr: 'دي جي محترف ونظام صوتي فاخر', priceMad: 7000 },
          { id: 'securite', labelFr: 'Brigade d\'accueil et sécurité discrète', labelAr: 'فريق استقبال وأمن خاص', priceMad: 4000 },
        ],
        sortOrder: 5,
      },
      {
        categoryId: catMap['celebrations-spectacles'] ?? null,
        slug: 'festivals-et-spectacles',
        titleFr: 'Festivals et spectacles',
        titleAr: 'المهرجانات والعروض',
        shortDescFr:
          'Production scénique grand format, billetterie, gestion des flux et sécurité certifiée.',
        shortDescAr: 'إنتاج مسرحي كبير، إدارة التدفق الجماهيري والتذاكر والأمن.',
        fullDescFr:
          'De l\'implantation des scènes extérieures à la coordination des régies techniques et loges artistes, EVENT PRO déploie une logistique éprouvée pour les événements culturels et concerts.',
        fullDescAr:
          'من تركيب المنصات الكبرى إلى تنسيق الفرق التقنية وكواليس الفنانين، نوفر لوجستيكاً متكاملاً للمهرجانات.',
        basePriceMad: 65000,
        priceUnitFr: 'À partir de',
        priceUnitAr: 'ابتداءً من',
        imageUrl: IMG_LIGHT,
        galleryUrls: [IMG_LIGHT, IMG_CORP],
        includedItemsFr: [
          'Structure scénique certifiée et ponts lumière',
          'Système de sonorisation line-array haute puissance',
          'Plan de circulation, barrières et régie générale',
        ],
        includedItemsAr: [
          'هياكل مسرحية معتمدة وإضاءة احترافية',
          'أنظمة صوتية عالية القدرة',
          'مخطط التنظيم وإدارة الجمهور',
        ],
        extraOptions: [
          { id: 'led_wall', labelFr: 'Mur LED panoramique 40m²', labelAr: 'شاشة LED بانورامية 40 متر مربع', priceMad: 22000 },
        ],
        sortOrder: 6,
      },
      {
        categoryId: catMap['corporate-conferences'] ?? null,
        slug: 'lancements-de-produits',
        titleFr: 'Lancements de produits',
        titleAr: 'إطلاق المنتجات',
        shortDescFr:
          'Mises en scène immersives pour révéler vos nouveautés auprès de la presse et des VIP.',
        shortDescAr: 'عروض غامرة للكشف عن منتجاتكم الجديدة أمام الصحافة وكبار الشخصيات.',
        fullDescFr:
          'Créez un moment d\'impact immédiat lors du dévoilement d\'un véhicule, d\'une collection de luxe ou d\'une innovation technologique grâce à une scénographie spectaculaire.',
        fullDescAr:
          'اصنعوا لحظة تأثير قوية عند الكشف عن منتجاتكم الجديدة من خلال سينوغرافيا مبهرة.',
        basePriceMad: 32000,
        priceUnitFr: 'À partir de',
        priceUnitAr: 'ابتداءً من',
        imageUrl: IMG_CORP,
        galleryUrls: [IMG_CORP, IMG_LIGHT],
        includedItemsFr: [
          'Concept de révélation visuelle et timing millimétré',
          'Zone presse, photocall et espace démonstration',
          'Cocktail gastronomique et kit média',
        ],
        includedItemsAr: [
          'سيناريو الكشف البصري وتوقيت دقيق',
          'منطقة الصحافة والتصوير وعرض المنتج',
          'كوكتيل استقبال راقٍ',
        ],
        extraOptions: [
          { id: 'mapping', labelFr: 'Mapping vidéo architectural sur mesure', labelAr: 'عرض ضوئي ثلاثي الأبعاد', priceMad: 16000 },
        ],
        sortOrder: 7,
      },
      {
        categoryId: catMap['production-hospitalite'] ?? null,
        slug: 'decoration-et-amenagement',
        titleFr: 'Décoration et aménagement événementiel',
        titleAr: 'الديكور وتجهيز الفضاءات',
        shortDescFr:
          'Architecture florale, mobilier contemporain, nappages nobles et arts de la table.',
        shortDescAr: 'هندسة الزهور، أثاث عصري، مفروشات فاخرة وفنون المائدة.',
        fullDescFr:
          'Notre atelier de scénographie à Casablanca conçoit des décors sur mesure mêlant marbre, laiton brossé, fleurs fraîches et textiles haut de gamme.',
        fullDescAr:
          'يصمم استوديو الديكور الخاص بنا في الدار البيضاء فضاءات مخصصة تمزج بين الرخام والنحاس والزهور الطبيعية.',
        basePriceMad: 15000,
        priceUnitFr: 'À partir de',
        priceUnitAr: 'ابتداءً من',
        imageUrl: IMG_WEDDING,
        galleryUrls: [IMG_WEDDING, IMG_STUDIO],
        includedItemsFr: [
          'Planche d\'ambiance 3D et sélection des matériaux',
          'Compositions florales fraîches de saison',
          'Installation et désinstallation par nos équipes',
        ],
        includedItemsAr: [
          'لوحة إلهام ثلاثية الأبعاد واختيار الخامات',
          'تنسيقات زهور طبيعية موسمية',
          'التركيب والتفكيك الكامل',
        ],
        extraOptions: [
          { id: 'arche', labelFr: 'Arche architecturale monumentale', labelAr: 'قوس معماري مزين بالزهور', priceMad: 6500 },
        ],
        sortOrder: 8,
      },
      {
        categoryId: catMap['production-hospitalite'] ?? null,
        slug: 'sonorisation-et-eclairage',
        titleFr: 'Sonorisation et éclairage',
        titleAr: 'الصوتيات والإضاءة',
        shortDescFr:
          'Ingénierie acoustique, éclairage architectural et écrans LED grand format.',
        shortDescAr: 'هندسة صوتية، إضاءة معمارية وشاشات LED عالية الدقة.',
        fullDescFr:
          'Un parc matériel dernière génération opéré par des ingénieurs du son et concepteurs lumière expérimentés pour garantir une qualité irréprochable.',
        fullDescAr:
          'معدات تقنية من الجيل الحديث يديرها مهندسو صوت وإضاءة ذوو خبرة عالية.',
        basePriceMad: 14000,
        priceUnitFr: 'À partir de',
        priceUnitAr: 'ابتداءً من',
        imageUrl: IMG_LIGHT,
        galleryUrls: [IMG_LIGHT, IMG_CORP],
        includedItemsFr: [
          'Système audio calibré à l\'acoustique du lieu',
          'Projecteurs architecturaux chauds et poursuites',
          'Techniciens régie présents toute la durée de l\'événement',
        ],
        includedItemsAr: [
          'نظام صوتي مضبوط حسب مساحة القاعة',
          'كشافات إضاءة معمارية دافئة',
          'تقنيون مرافقون طوال مدة الحدث',
        ],
        extraOptions: [
          { id: 'pyro', labelFr: 'Fontaines d\'étincelles froides intérieures', labelAr: 'نوافير شرارات باردة آمنة', priceMad: 3500 },
        ],
        sortOrder: 9,
      },
      {
        categoryId: catMap['production-hospitalite'] ?? null,
        slug: 'traiteur-et-restauration',
        titleFr: 'Traiteur et restauration',
        titleAr: 'خدمات التموين والضيافة',
        shortDescFr:
          'Gastronomie marocaine haute couture et cuisine internationale avec brigade dédiée.',
        shortDescAr: 'مطبخ مغربي راقٍ ومأكولات عالمية مع طاقم خدمة محترف.',
        fullDescFr:
          'Nos chefs exécutifs élaborent des menus raffinés — pastillas revisitées, méchouis de prestige, pièces cocktails et dîners gastronomiques — servis sur porcelaine fine.',
        fullDescAr:
          'يعد طهاتنا التنفيذيون قوائم طعام راقية تجمع بين المطبخ المغربي الأصيل والمطبخ العالمي الراقي.',
        basePriceMad: 22500,
        priceUnitFr: 'Base 50 convives (450 MAD/pers.)',
        priceUnitAr: 'أساس 50 ضيفاً (450 درهم/شخص)',
        imageUrl: IMG_FOOD,
        galleryUrls: [IMG_FOOD, IMG_HERO],
        includedItemsFr: [
          'Dégustation préalable pour 4 personnes',
          'Menu complet 3 services ou cocktail 18 pièces',
          'Service en salle par maîtres d\'hôtel en tenue',
          'Vaisselle en porcelaine, verrerie cristal et argenterie',
        ],
        includedItemsAr: [
          'جلسة تذوق مسبقة لـ 4 أشخاص',
          'قائمة طعام كاملة أو كوكتيل فاخر',
          'طاقم ندل محترف بزي موحد',
          'أواني خزفية وكؤوس كريستال فاخرة',
        ],
        extraOptions: [
          { id: 'tea_ceremony', labelFr: 'Cérémonie du thé impérial & pâtisseries fines', labelAr: 'مراسم الشاي المغربي والحلويات الفاخرة', priceMad: 4500 },
        ],
        sortOrder: 10,
      },
      {
        categoryId: catMap['production-hospitalite'] ?? null,
        slug: 'photographie-et-videographie',
        titleFr: 'Photographie et vidéographie',
        titleAr: 'التصوير الفوتوغرافي والفيديو',
        shortDescFr:
          'Reportage éditorial, réalisation film 4K, drone et livraison galerie privée sécurisée.',
        shortDescAr: 'تغطية فوتوغرافية احترافية، فيلم 4K، درون ومعرض صور خاص.',
        fullDescFr:
          'Capturer l\'émotion, les détails architecturaux et l\'énergie de votre événement avec une esthétique cinématographique et un étalonnage soigné.',
        fullDescAr:
          'توثيق أجمل اللحظات والتفاصيل المعمارية بأسلوب سينمائي عالي الجودة.',
        basePriceMad: 9500,
        priceUnitFr: 'À partir de',
        priceUnitAr: 'ابتداءً من',
        imageUrl: IMG_STUDIO,
        galleryUrls: [IMG_STUDIO, IMG_WEDDING],
        includedItemsFr: [
          '2 photographes + 1 réalisateur vidéo sur place',
          'Film récapitulatif 4K (3 à 5 minutes) + teaser 48h',
          'Galerie en ligne haute résolution retouchée',
        ],
        includedItemsAr: [
          'مصوران فوتوغرافيان ومخرج فيديو',
          'فيلم ملخص 4K ومقطع تشويقي خلال 48 ساعة',
          'معرض صور إلكتروني عالي الدقة',
        ],
        extraOptions: [
          { id: 'album', labelFr: 'Livre d\'art imprimé reliure lin', labelAr: 'ألبوم مطبوع فاخر بغلاف كتان', priceMad: 2800 },
        ],
        sortOrder: 11,
      },
      {
        categoryId: catMap['production-hospitalite'] ?? null,
        slug: 'location-de-salles-et-espaces',
        titleFr: 'Location de salles et espaces événementiels',
        titleAr: 'كراء القاعات والفضاءات',
        shortDescFr:
          'Sélection exclusive de palais, villas d\'architecte, hôtels 5* et rooftops à Casablanca.',
        shortDescAr: 'مجموعة منتقاة من القصور والفيلات والفنادق المصنفة والتراسات بالدار البيضاء.',
        fullDescFr:
          'Accédez à notre portfolio de lieux confidentiels et de grandes salles modulables à Casablanca, Mohammedia, Rabat et Marrakech avec visite technique incluse.',
        fullDescAr:
          'اكتشفوا مجموعتنا الحصرية من القاعات والفضاءات المرموقة في الدار البيضاء والرباط ومراكش.',
        basePriceMad: 20000,
        priceUnitFr: 'À partir de / jour',
        priceUnitAr: 'ابتداءً من / يوم',
        imageUrl: IMG_WEDDING,
        galleryUrls: [IMG_WEDDING, IMG_HERO, IMG_CORP],
        includedItemsFr: [
          'Repérage personnalisé et visite technique',
          'Privatisation complète de l\'espace sélectionné',
          'Espace logistique traiteur et parking voiturier',
        ],
        includedItemsAr: [
          'معاينة ميدانية وتقنية مخصصة',
          'حجز حصري كامل للفضاء المختار',
          'فضاء لوجستي وموقف سيارات مع خدمة ركن',
        ],
        extraOptions: [
          { id: 'voiturier', labelFr: 'Service voiturier (6 agents)', labelAr: 'خدمة ركن السيارات (6 أعوان)', priceMad: 3600 },
        ],
        sortOrder: 12,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(events)
    .values([
      {
        slug: 'forum-economique-anfa-2026',
        titleFr: 'Forum Économique & Innovation Anfa',
        titleAr: 'منتدى أنفا الاقتصادي والابتكار',
        categorySlug: 'conferences-et-seminaires',
        eventDate: '2026-12-12',
        city: 'Casablanca',
        venue: 'Hyatt Regency & Auditorium Anfa',
        capacity: 420,
        ticketPriceMad: 1500,
        descriptionFr:
          'Sommet annuel réunissant dirigeants industriels, investisseurs et décideurs autour de la transformation économique au Maroc.',
        descriptionAr:
          'قمة سنوية تجمع القادة الصناعيين والمستثمرين وصناع القرار حول التحول الاقتصادي في المغرب.',
        imageUrl: IMG_CORP,
        status: 'upcoming',
      },
      {
        slug: 'gala-patrimoine-casablanca-2026',
        titleFr: 'Gala Nocturne du Patrimoine Casablancais',
        titleAr: 'الحفل الليلي لتراث الدار البيضاء',
        categorySlug: 'evenements-professionnels',
        eventDate: '2026-12-19',
        city: 'Casablanca',
        venue: 'Villa des Arts & Jardins',
        capacity: 220,
        ticketPriceMad: 2200,
        descriptionFr:
          'Soirée caritative et dîner gastronomique sous les lustres de la Villa des Arts avec concert symphonique.',
        descriptionAr:
          'سهرة خيرية وعشاء فاخر في فيلا الفنون مع حفل موسيقي سيمفوني.',
        imageUrl: IMG_HERO,
        status: 'featured',
      },
      {
        slug: 'nuit-des-lumieres-corniche',
        titleFr: 'Nuit des Lumières — Édition Corniche',
        titleAr: 'ليلة الأضواء — نسخة الكورنيش',
        categorySlug: 'festivals-et-spectacles',
        eventDate: '2027-01-16',
        city: 'Casablanca',
        venue: 'Esplanade Ain Diab',
        capacity: 800,
        ticketPriceMad: 650,
        descriptionFr:
          'Expérience immersive son et lumière face à l\'Atlantique avec créations acoustiques et scénographie architecturale.',
        descriptionAr:
          'تجربة صوتية وضوئية غامرة أمام المحيط الأطلسي مع عروض موسيقية ومعمارية.',
        imageUrl: IMG_LIGHT,
        status: 'upcoming',
      },
      {
        slug: 'salon-haute-joaillerie-2026',
        titleFr: 'Salon Privé de Haute Joaillerie',
        titleAr: 'المعرض الخاص للمجوهرات الراقية',
        categorySlug: 'lancements-de-produits',
        eventDate: '2026-10-08',
        city: 'Casablanca',
        venue: 'Four Seasons Hotel Casablanca',
        capacity: 150,
        ticketPriceMad: 0,
        descriptionFr:
          'Présentation confidentielle de collections horlogères et joaillières avec dîner de gala et sécurité renforcée.',
        descriptionAr:
          'عرض حصري لمجموعات الساعات والمجوهرات الراقية مع عشاء رسمي.',
        imageUrl: IMG_WEDDING,
        status: 'completed',
      },
    ])
    .onConflictDoNothing();

  const IMG_MASONRY_WEDDING = '/src/assets/images/masonry_wedding_courtyard_1795278028239.jpg';
  const IMG_MASONRY_DECOR = '/src/assets/images/masonry_decor_tablescape_1795278030242.jpg';
  const IMG_MASONRY_SOIREE = '/src/assets/images/masonry_soiree_rooftop_1795278030117.jpg';
  const IMG_MASONRY_CORP = '/src/assets/images/masonry_corporate_gala_1795278029590.jpg';

  await db.insert(galleryItems).values([
    {
      titleFr: 'Dîner de Gala Palais Anfa — 320 convives',
      titleAr: 'عشاء رسمي قصر أنفا — 320 ضيفاً',
      category: 'professionnels',
      city: 'Casablanca',
      eventDateLabel: 'Octobre 2026',
      imageUrl: IMG_HERO,
    },
    {
      titleFr: 'Réception Florale aux Jardins d\'Orchidées',
      titleAr: 'حفل زفاف بحدائق الأوركيد',
      category: 'mariages',
      city: 'Casablanca',
      eventDateLabel: 'Septembre 2026',
      imageUrl: IMG_WEDDING,
    },
    {
      titleFr: 'Sommet Exécutif CFC — Scène Principale',
      titleAr: 'قمة القطب المالي — المنصة الرئيسية',
      category: 'conferences',
      city: 'Casablanca',
      eventDateLabel: 'Novembre 2026',
      imageUrl: IMG_CORP,
    },
    {
      titleFr: 'Table Gastronomique Fusion Maroc-France',
      titleAr: 'مائدة ضيافة مغربية فرنسية راقية',
      category: 'decorations',
      city: 'Rabat',
      eventDateLabel: 'Août 2026',
      imageUrl: IMG_FOOD,
    },
    {
      titleFr: 'Conception Lumière & Acoustique Symphonique',
      titleAr: 'تصميم الإضاءة والصوتيات السيمفونية',
      category: 'soirees',
      city: 'Marrakech',
      eventDateLabel: 'Juillet 2026',
      imageUrl: IMG_LIGHT,
    },
    {
      titleFr: 'Atelier Scénographique & Direction Artistique',
      titleAr: 'ورشة التصميم والإدارة الفنية',
      category: 'anniversaires',
      city: 'Casablanca',
      eventDateLabel: 'Juin 2026',
      imageUrl: IMG_STUDIO,
    },
    {
      titleFr: 'Cérémonie Nocturne & Arches d\'Orchidées — Palais Anfa',
      titleAr: 'مراسم زفاف ليلية وأقواس الأوركيد — قصر أنفا',
      category: 'mariages',
      city: 'Casablanca',
      eventDateLabel: 'Novembre 2026',
      imageUrl: IMG_MASONRY_WEDDING,
    },
    {
      titleFr: 'Arts de la Table Marbre & Laiton Doré',
      titleAr: 'فنون المائدة بالرخام والنحاس الذهبي',
      category: 'decorations',
      city: 'Casablanca',
      eventDateLabel: 'Octobre 2026',
      imageUrl: IMG_MASONRY_DECOR,
    },
    {
      titleFr: 'Soirée Rooftop Face à l\'Atlantique',
      titleAr: 'سهرة خاصة مطلة على المحيط الأطلسي',
      category: 'soirees',
      city: 'Casablanca',
      eventDateLabel: 'Septembre 2026',
      imageUrl: IMG_MASONRY_SOIREE,
    },
    {
      titleFr: 'Gala de Remise de Prix — Auditorium Casablanca',
      titleAr: 'حفل توزيع الجوائز السنوي — الدار البيضاء',
      category: 'professionnels',
      city: 'Casablanca',
      eventDateLabel: 'Novembre 2026',
      imageUrl: IMG_MASONRY_CORP,
    },
  ]);

  await db.insert(reviews).values([
    {
      clientName: 'Salma Berrada',
      clientRole: 'Directrice Communication',
      companyOrEvent: 'Atlas Holding Group — Sommet Annuel (380 participants)',
      rating: 5,
      commentFr:
        'Nous devions coordonner trois plénières simultanées et un dîner de gala en moins de six semaines à Casablanca. EVENT PRO a livré une régie sans aucune fausse note et 100 % des délégations ont salué la fluidité de l\'accueil.',
      commentAr:
        'كان علينا تنسيق ثلاث جلسات عامة وعشاء رسمي في أقل من ستة أسابيع بالدار البيضاء. قدمت إيفنت برو تنظيماً متقناً نال إعجاب جميع الوفود.',
      isPublished: true,
    },
    {
      clientName: 'Karim & Yasmine Tazi',
      clientRole: 'Mariés',
      companyOrEvent: 'Réception de Mariage — Dar Bouazza (260 convives)',
      rating: 5,
      commentFr:
        'Avant notre rencontre, nous redoutions la dispersion entre huit prestataires. L\'équipe a centralisé la scénographie florale, le traiteur et la coordination jour J avec une précision remarquable et un respect strict du budget en MAD.',
      commentAr:
        'جمعت الفريق بين تصميم الزهور والتموين والتنسيق الكامل يوم الزفاف بدقة متناهية واحترام تام للميزانية.',
      isPublished: true,
    },
    {
      clientName: 'Mehdi El Alami',
      clientRole: 'Directeur Général',
      companyOrEvent: 'Maison Horizons — Lancement de Collection',
      rating: 5,
      commentFr:
        'La mise en scène lumineuse et l\'acoustique ont transformé notre showroom d\'Anfa en un espace immersif. Les retombées presse ont doublé par rapport à notre édition précédente.',
      commentAr:
        'حولت الإضاءة والهندسة الصوتية صالة العرض لدينا إلى فضاء غامر، مما ضاعف التغطية الإعلامية مقارنة بالنسخة السابقة.',
      isPublished: true,
    },
    {
      clientName: 'Hajar & Omar Benali',
      clientRole: 'Mariés',
      companyOrEvent: 'Cérémonie Palais Anfa — Casablanca (310 convives)',
      rating: 5,
      commentFr:
        'Nous souhaitions réunir traditions marocaines et scénographie épurée pour 310 invités venus de quatre pays. L\'atelier EVENT PRO a dessiné chaque détail floral et orchestré le protocole jour J sans aucun stress.',
      commentAr:
        'أردنا الجمع بين التقاليد المغربية والتصميم العصري لاستقبال 310 ضيوف من أربع دول. صمم فريق إيفنت برو كل التفاصيل وأدار البروتوكول بدقة تامة.',
      isPublished: true,
    },
    {
      clientName: 'Nabil Chraïbi',
      clientRole: 'Président',
      companyOrEvent: 'Forum Économique Maghreb — Conférence (450 participants)',
      rating: 5,
      commentFr:
        'Après deux éditions marquées par des retards techniques, nous avons confié la régie audiovisuelle et la traduction simultanée à EVENT PRO : zéro minute de retard sur 18 interventions et 98 % de satisfaction.',
      commentAr:
        'أوكلنا الإدارة التقنية والترجمة الفورية إلى إيفنت برو فحققنا التزاماً تاماً بالتوقيت خلال 18 مداخلة ونسبة رضا بلغت 98%.',
      isPublished: true,
    },
    {
      clientName: 'Lina & Sofiane Idrissi',
      clientRole: 'Réception Privée',
      companyOrEvent: 'Soirée Corniche Ain Diab — Casablanca (140 invités)',
      rating: 5,
      commentFr:
        'En trois semaines, l\'équipe a métamorphosé notre terrasse face à l\'océan avec éclairage architectural, dîner gastronomique sur mesure et DJ set calibré jusqu\'à 2h du matin.',
      commentAr:
        'في ثلاثة أسابيع، حوّل الفريق شرفتنا المطلة على المحيط بإضاءة معمارية وعشاء فاخر وبرنامج موسيقي متكامل حتى الثانية صباحاً.',
      isPublished: true,
    },
  ]);

  await db
    .insert(settings)
    .values([
      {
        key: 'companyInfo',
        value: {
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
        },
      },
      {
        key: 'homeContent',
        value: {
          heroTitleFr: 'Transformez vos événements en moments inoubliables.',
          heroTitleAr: 'حوّلوا فعالياتكم إلى لحظات لا تُنسى.',
          heroSubtitleFr:
            "EVENT PRO vous accompagne dans l'organisation de vos événements à Casablanca et partout au Maroc.",
          heroSubtitleAr:
            'ترافقكم إيفنت برو في تنظيم فعالياتكم بالدار البيضاء وجميع أنحاء المغرب.',
          heroImageUrl: IMG_HERO,
          aboutImageUrl: IMG_STUDIO,
          stats: [
            { value: '340+', labelFr: 'Événements orchestrés depuis 2018', labelAr: 'فعالية منظمة منذ 2018' },
            { value: '98,4%', labelFr: 'Satisfaction client vérifiée', labelAr: 'نسبة رضا العملاء' },
            { value: '12', labelFr: 'Pôles d\'expertise intégrés', labelAr: 'تخصصاً متكاملاً' },
            { value: '24h', labelFr: 'Réponse devis personnalisée', labelAr: 'الرد على طلبات الأسعار' },
          ],
        },
      },
      {
        key: 'paymentConfig',
        value: {
          depositPercent: 30,
          bankName: 'Attijariwafa Bank — Agence Anfa Casablanca',
          bankRib: '007 780 0001482000304912 45',
          bankBeneficiary: 'EVENT PRO SARL',
          onSiteInstructionsFr:
            "Règlement par chèque certifié ou espèces (selon plafond légal) à l'agence : 28 Bd d'Anfa, Casablanca.",
          onSiteInstructionsAr:
            'الدفع بشيك مصادق عليه أو نقداً (وفق السقف القانوني) في مقر الوكالة بالدار البيضاء.',
        },
      },
      {
        key: 'availability',
        value: {
          maxEventsPerDay: 3,
          blockedDates: [] as string[],
        },
      },
    ])
    .onConflictDoNothing();
}
