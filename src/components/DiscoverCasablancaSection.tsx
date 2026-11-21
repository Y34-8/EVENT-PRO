import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  ArrowRight,
  Clock,
  Compass,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Sparkles,
} from 'lucide-react';
import { Lang, ServiceItem } from '../types/index.ts';

export interface CasablancaProvider {
  id: string;
  districtId: 'anfa' | 'maarif' | 'ain-diab' | 'californie' | 'bouskoura';
  districtFr: string;
  districtAr: string;
  nameFr: string;
  nameAr: string;
  categoryFr: string;
  categoryAr: string;
  specialtyFr: string;
  specialtyAr: string;
  addressFr: string;
  addressAr: string;
  phone: string;
  email: string;
  hoursFr: string;
  hoursAr: string;
  lat: number;
  lng: number;
  // Normalized coordinates (0-100%) on the stylized Casablanca fallback SVG
  svgX: number;
  svgY: number;
  serviceSlugHint: string;
}

const CASABLANCA_PROVIDERS: CasablancaProvider[] = [
  {
    id: 'provider-anfa',
    districtId: 'anfa',
    districtFr: 'Anfa',
    districtAr: 'أنفا',
    nameFr: 'Palais d’Anfa & Jardins',
    nameAr: 'قصر أنفا والحدائق',
    categoryFr: 'Salle de Réception & Scénographie',
    categoryAr: 'قاعة استقبال وسينوغرافيا',
    specialtyFr: 'Jusqu’à 450 invités · Mariages royaux, lustres cristal & art floral',
    specialtyAr: 'تتسع حتى 450 ضيفاً · حفلات زفاف ملكية وتنسيق زهري فاخر',
    addressFr: '18 Boulevard Moulay Youssef, Anfa Supérieur, 20050 Casablanca',
    addressAr: '18 شارع مولاي يوسف، أنفا العليا، 20050 الدار البيضاء',
    phone: '+212 5 22 39 48 10',
    email: 'anfa@eventpro.ma',
    hoursFr: 'Lun – Sam · 09h30 – 19h30',
    hoursAr: 'الإثنين - السبت · 09:30 - 19:30',
    lat: 33.5945,
    lng: -7.6485,
    svgX: 43,
    svgY: 26,
    serviceSlugHint: 'location-de-salles',
  },
  {
    id: 'provider-maarif',
    districtId: 'maarif',
    districtFr: 'Maarif',
    districtAr: 'المعاريف',
    nameFr: 'Atelier Lumière & Son Maârif',
    nameAr: 'استوديو المعاريف للصوت والإضاءة',
    categoryFr: 'DJ, Sonorisation & Régie Technique',
    categoryAr: 'دي جي وهندسة الصوت والإضاءة',
    specialtyFr: 'Ingénierie acoustique L-Acoustics, mapping LED & DJs résidents',
    specialtyAr: 'هندسة صوتية متطورة وإضاءة معمارية ودي جي محترف',
    addressFr: '42 Rue Ibnou Mounir, Quartier Maârif, 20330 Casablanca',
    addressAr: '42 زنقة ابن منير، حي المعاريف، 20330 الدار البيضاء',
    phone: '+212 5 22 25 74 90',
    email: 'maarif-audio@eventpro.ma',
    hoursFr: 'Lun – Sam · 10h00 – 20h00',
    hoursAr: 'الإثنين - السبت · 10:00 - 20:00',
    lat: 33.5822,
    lng: -7.6328,
    svgX: 60,
    svgY: 36,
    serviceSlugHint: 'dj-animation',
  },
  {
    id: 'provider-ain-diab',
    districtId: 'ain-diab',
    districtFr: 'Ain Diab',
    districtAr: 'عين الذئاب',
    nameFr: 'Maison Océan Traiteur & Villa',
    nameAr: 'دار المحيط للضيافة والتموين',
    categoryFr: 'Traiteur Gastronomique & Pavillon',
    categoryAr: 'ممون حفلات راقٍ وفيلا مطلة على البحر',
    specialtyFr: 'Haute gastronomie marocaine & internationale face à l’Atlantique',
    specialtyAr: 'مأكولات مغربية وعالمية فاخرة على كورنيش المحيط الأطلسي',
    addressFr: '104 Boulevard de la Corniche, Aïn Diab, 20180 Casablanca',
    addressAr: '104 شارع الكورنيش، عين الذئاب، 20180 الدار البيضاء',
    phone: '+212 5 22 79 62 15',
    email: 'aindiab-traiteur@eventpro.ma',
    hoursFr: '7j/7 sur rendez-vous · 09h00 – 20h00',
    hoursAr: 'طيلة الأسبوع بموعد · 09:00 - 20:00',
    lat: 33.5955,
    lng: -7.6745,
    svgX: 19,
    svgY: 22,
    serviceSlugHint: 'traiteur',
  },
  {
    id: 'provider-californie',
    districtId: 'californie',
    districtFr: 'Californie',
    districtAr: 'كاليفورنيا',
    nameFr: 'Studio Dar Vision Californie',
    nameAr: 'استوديو دار فيجن كاليفورنيا',
    categoryFr: 'Photographie Éditoriale & Cinéma 4K',
    categoryAr: 'تصوير فوتوغرافي وسينمائي 4K',
    specialtyFr: 'Reportages éditoriaux, steadycam cinéma & tirages fine-art',
    specialtyAr: 'تغطية احترافية بتقنية السينما ومختبر طباعة فاخرة',
    addressFr: 'Villa 14, Avenue de Fès, Quartier Californie, 20150 Casablanca',
    addressAr: 'فيلا 14، شارع فاس، حي كاليفورنيا، 20150 الدار البيضاء',
    phone: '+212 6 61 84 30 22',
    email: 'californie-studio@eventpro.ma',
    hoursFr: 'Lun – Sam · 09h30 – 19h00',
    hoursAr: 'الإثنين - السبت · 09:30 - 19:00',
    lat: 33.5418,
    lng: -7.6192,
    svgX: 68,
    svgY: 60,
    serviceSlugHint: 'photographie',
  },
  {
    id: 'provider-bouskoura',
    districtId: 'bouskoura',
    districtFr: 'Bouskoura',
    districtAr: 'بوسكورة',
    nameFr: 'Domaine des Pins Bouskoura',
    nameAr: 'ضيعة الصنوبر بوسكورة',
    categoryFr: 'Domaine Privé & Décoration Botanique',
    categoryAr: 'فضاء خارجي خاص وتنسيق نباتي',
    specialtyFr: 'Parc privé de 2,5 hectares · Cérémonies en plein air & chapiteaux',
    specialtyAr: 'منتزه خاص بمساحة 2.5 هكتار لحفلات الهواء الطلق والخيام الزجاجية',
    addressFr: 'Route de la Forêt Verte, Km 4, Bouskoura, 27182 Casablanca',
    addressAr: 'طريق الغابة الخضراء، كلم 4، بوسكورة، 27182 الدار البيضاء',
    phone: '+212 5 22 59 18 40',
    email: 'bouskoura-domaine@eventpro.ma',
    hoursFr: 'Mar – Dim · 10h00 – 19h30',
    hoursAr: 'الثلاثاء - الأحد · 10:00 - 19:30',
    lat: 33.4625,
    lng: -7.6482,
    svgX: 46,
    svgY: 84,
    serviceSlugHint: 'decoration',
  },
];

const CASABLANCA_CENTER = { lat: 33.545, lng: -7.642 };
const Z_INDEX_SELECTED = 1000;
const Z_INDEX_HOVER = 999;

function CasablancaCameraController({
  selectedProvider,
  shouldPan,
  onPanComplete,
}: {
  selectedProvider: CasablancaProvider;
  shouldPan: boolean;
  onPanComplete: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !shouldPan) return;
    map.panTo({ lat: selectedProvider.lat, lng: selectedProvider.lng });
    const currentZoom = map.getZoom();
    if (typeof currentZoom === 'number' && currentZoom < 12) {
      map.setZoom(12);
    }
    onPanComplete();
  }, [map, selectedProvider, shouldPan, onPanComplete]);

  return null;
}

interface ProviderMarkerProps {
  provider: CasablancaProvider;
  isSelected: boolean;
  isHovered: boolean;
  isInfoOpen: boolean;
  zIndex: number;
  lang: Lang;
  onSelect: () => void;
  onCloseInfo: () => void;
  onHoverChange: (hovered: boolean) => void;
}

function ProviderMarker({
  provider,
  isSelected,
  isHovered,
  isInfoOpen,
  zIndex,
  lang,
  onSelect,
  onCloseInfo,
  onHoverChange,
}: ProviderMarkerProps) {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: provider.lat, lng: provider.lng }}
        zIndex={zIndex}
        title={`${lang === 'ar' ? provider.districtAr : provider.districtFr} — ${
          lang === 'ar' ? provider.nameAr : provider.nameFr
        }`}
        onClick={onSelect}
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={() => onHoverChange(false)}
      >
        <div className="flex flex-col items-center cursor-pointer group">
          <div
            className={`mb-1 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide rounded-md border shadow-md whitespace-nowrap transition-transform duration-150 ${
              isSelected
                ? 'bg-[#B89038] text-[#0A0A0B] border-white scale-105'
                : isHovered
                  ? 'bg-[#0A0A0B] text-[#D4AE5E] border-[#D4AE5E] scale-105'
                  : 'bg-[#0A0A0B]/90 text-white border-neutral-700'
            }`}
          >
            {lang === 'ar' ? provider.districtAr : provider.districtFr}
          </div>
          <Pin
            background={isSelected ? '#B89038' : '#0A0A0B'}
            borderColor={isSelected ? '#FFFFFF' : '#D4AE5E'}
            glyphColor={isSelected ? '#0A0A0B' : '#D4AE5E'}
            scale={isSelected ? 1.25 : 1.05}
          />
        </div>
      </AdvancedMarker>

      {isSelected && isInfoOpen && marker && (
        <InfoWindow anchor={marker} maxWidth={300} onCloseClick={onCloseInfo}>
          <div className="p-1.5 text-[#0A0A0B] max-w-[270px]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8E6B1E]">
              {lang === 'ar' ? provider.districtAr : provider.districtFr} ·{' '}
              {lang === 'ar' ? provider.categoryAr : provider.categoryFr}
            </p>
            <h4 className="font-display text-lg font-semibold text-[#0A0A0B] mt-0.5 leading-snug">
              {lang === 'ar' ? provider.nameAr : provider.nameFr}
            </h4>
            <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
              {lang === 'ar' ? provider.addressAr : provider.addressFr}
            </p>
            <div className="mt-2 pt-2 border-t border-neutral-200 space-y-1 text-xs">
              <p className="font-semibold text-[#0A0A0B] tabular-nums" dir="ltr">
                {provider.phone}
              </p>
              <p className="text-neutral-700">{provider.email}</p>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

function CasablancaInteractiveFallbackMap({
  providers,
  selectedId,
  infoOpen,
  lang,
  onSelectProvider,
  onCloseInfo,
}: {
  providers: CasablancaProvider[];
  selectedId: string;
  infoOpen: boolean;
  lang: Lang;
  onSelectProvider: (id: string) => void;
  onCloseInfo: () => void;
}) {
  const selectedProvider = providers.find((p) => p.id === selectedId) || providers[0];

  return (
    <div
      dir="ltr"
      className="relative h-[460px] lg:h-[560px] w-full rounded-xl overflow-hidden border border-neutral-800 bg-[#0D0E12] select-none"
      role="region"
      aria-label={
        lang === 'ar'
          ? 'خريطة تفاعلية لمزودي الخدمات في الدار البيضاء'
          : 'Carte interactive des quartiers de Casablanca'
      }
    >
      {/* Stylized Architectural Vector Map of Grand Casablanca */}
      <svg
        viewBox="0 0 1000 700"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="atlanticOcean" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#090D16" />
            <stop offset="100%" stopColor="#111622" />
          </linearGradient>
          <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D4AE5E" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#D4AE5E" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Atlantic Coastline (North-West Corner & Shoreline) */}
        <rect width="1000" height="700" fill="#121318" />
        <path
          d="M 0,0 L 660,0 C 560,72 445,112 315,126 C 215,137 125,180 0,275 Z"
          fill="url(#atlanticOcean)"
        />
        {/* Coastal Boulevard / Corniche Shoreline */}
        <path
          d="M 0,275 C 125,180 215,137 315,126 C 445,112 560,72 660,0"
          fill="none"
          stroke="#2A3448"
          strokeWidth="3"
        />
        <path
          d="M 0,275 C 125,180 215,137 315,126 C 445,112 560,72 660,0"
          fill="none"
          stroke="#B89038"
          strokeOpacity="0.45"
          strokeWidth="1.2"
          strokeDasharray="6 6"
        />

        {/* Cartographic Grid */}
        {[140, 280, 420, 560].map((y) => (
          <line key={`h-${y}`} x1="0" y1={y} x2="1000" y2={y} stroke="#1D1F27" strokeWidth="1" />
        ))}
        {[200, 400, 600, 800].map((x) => (
          <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="700" stroke="#1D1F27" strokeWidth="1" />
        ))}

        {/* Major Casablanca Arteries (Bd d'Anfa, Zerktouni, Route d'El Jadida, Rocade Sud) */}
        <path
          d="M 180,155 C 330,175 490,210 680,260"
          fill="none"
          stroke="#252834"
          strokeWidth="4"
        />
        <path
          d="M 430,180 C 485,295 495,435 460,645"
          fill="none"
          stroke="#252834"
          strokeWidth="4"
        />
        <path
          d="M 140,380 C 370,370 590,395 860,440"
          fill="none"
          stroke="#222530"
          strokeWidth="3"
        />
        <path
          d="M 240,565 C 450,515 670,485 910,510"
          fill="none"
          stroke="#222530"
          strokeWidth="3"
        />
        {/* Bouskoura Green Belt Accent */}
        <ellipse cx="460" cy="590" rx="185" ry="72" fill="#17201B" opacity="0.65" />

        {/* Subtle radial highlight behind active district */}
        <circle
          cx={selectedProvider.svgX * 10}
          cy={selectedProvider.svgY * 7}
          r="140"
          fill="url(#goldGlow)"
        />

        {/* Ocean & District Watermarks */}
        <text
          x="130"
          y="78"
          fill="#3E4B63"
          fontSize="13"
          fontWeight="600"
          letterSpacing="5"
        >
          OCÉAN ATLANTIQUE
        </text>
        <text
          x="460"
          y="618"
          textAnchor="middle"
          fill="#394B3E"
          fontSize="12"
          fontWeight="600"
          letterSpacing="4"
        >
          FORÊT DE BOUSKOURA
        </text>
      </svg>

      {/* Top Cartographic Header Overlay */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pointer-events-none">
        <div className="bg-[#0A0A0B]/90 backdrop-blur-sm border border-neutral-800 px-3 py-1.5 rounded-lg inline-flex items-center gap-2 text-xs text-neutral-300">
          <Compass className="w-3.5 h-3.5 text-[#D4AE5E]" />
          <span className="font-medium tracking-wide">Grand Casablanca · 33.57° N, 7.62° W</span>
        </div>
        <div className="hidden sm:flex bg-[#0A0A0B]/90 backdrop-blur-sm border border-neutral-800 px-3 py-1.5 rounded-lg items-center gap-2 text-[11px] text-neutral-400">
          <span className="w-2 h-2 bg-[#D4AE5E]" />
          <span>{lang === 'ar' ? 'انقر على حي لعرض الشريك' : 'Cliquez sur un marqueur'}</span>
        </div>
      </div>

      {/* Interactive District Pins */}
      {providers.map((provider) => {
        const isSelected = provider.id === selectedId;
        return (
          <button
            key={provider.id}
            type="button"
            onClick={() => onSelectProvider(provider.id)}
            style={{ left: `${provider.svgX}%`, top: `${provider.svgY}%` }}
            aria-label={`${lang === 'ar' ? provider.districtAr : provider.districtFr} — ${
              lang === 'ar' ? provider.nameAr : provider.nameFr
            }`}
            aria-pressed={isSelected}
            className="absolute -translate-x-1/2 -translate-y-full z-20 group focus:outline-none"
          >
            <div className="flex flex-col items-center">
              <span
                className={`mb-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border shadow-lg whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? 'bg-[#B89038] text-[#0A0A0B] border-white scale-105'
                    : 'bg-[#0A0A0B]/95 text-white border-neutral-700 group-hover:border-[#D4AE5E] group-hover:text-[#D4AE5E]'
                }`}
              >
                {lang === 'ar' ? provider.districtAr : provider.districtFr}
              </span>
              <span className="relative flex items-center justify-center">
                {isSelected && (
                  <span className="absolute w-8 h-8 rounded-full bg-[#D4AE5E]/30 animate-ping" />
                )}
                <span
                  className={`relative w-7 h-7 rounded-full border-2 flex items-center justify-center shadow-lg transition-transform duration-200 ${
                    isSelected
                      ? 'bg-[#B89038] border-white text-[#0A0A0B] scale-110'
                      : 'bg-[#0A0A0B] border-[#D4AE5E] text-[#D4AE5E] group-hover:scale-110'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                </span>
              </span>
            </div>
          </button>
        );
      })}

      {/* Floating Anchored Card (InfoWindow Equivalent on Fallback Map) */}
      {infoOpen && (
        <div
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
          className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-[330px] z-30 bg-white text-[#0A0A0B] rounded-xl p-4 shadow-2xl border border-neutral-200"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8E6B1E]">
                {lang === 'ar' ? selectedProvider.districtAr : selectedProvider.districtFr} ·{' '}
                {lang === 'ar' ? selectedProvider.categoryAr : selectedProvider.categoryFr}
              </p>
              <h4 className="font-display text-xl font-semibold text-[#0A0A0B] mt-0.5 leading-snug">
                {lang === 'ar' ? selectedProvider.nameAr : selectedProvider.nameFr}
              </h4>
            </div>
            <button
              type="button"
              onClick={onCloseInfo}
              aria-label={lang === 'ar' ? 'إغلاق' : 'Fermer l’infobulle'}
              className="text-xs font-semibold text-neutral-400 hover:text-[#0A0A0B] px-1.5 py-0.5"
            >
              ×
            </button>
          </div>
          <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
            {lang === 'ar' ? selectedProvider.addressAr : selectedProvider.addressFr}
          </p>
          <div className="mt-2.5 pt-2.5 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-[#0A0A0B] tabular-nums" dir="ltr">
              {selectedProvider.phone}
            </span>
            <span className="text-neutral-700">{selectedProvider.email}</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface DiscoverCasablancaSectionProps {
  lang: Lang;
  services: ServiceItem[];
}

export function DiscoverCasablancaSection({ lang, services }: DiscoverCasablancaSectionProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [selectedId, setSelectedId] = useState<string>(CASABLANCA_PROVIDERS[0].id);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState<boolean>(true);
  const [shouldPan, setShouldPan] = useState<boolean>(false);
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState<boolean>(false);

  useEffect(() => {
    const onQuota = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuota);
  }, []);

  const selectedProvider =
    CASABLANCA_PROVIDERS.find((p) => p.id === selectedId) || CASABLANCA_PROVIDERS[0];

  const handleSelectProvider = useCallback((id: string) => {
    setSelectedId(id);
    setInfoOpen(true);
    setShouldPan(true);
  }, []);

  const matchedService =
    services.find((s) => s.slug.includes(selectedProvider.serviceSlugHint)) || services[0];

  const bookingHref = matchedService
    ? `/reserver?serviceId=${matchedService.id}&city=Casablanca&venue=${encodeURIComponent(
        `${lang === 'ar' ? selectedProvider.nameAr : selectedProvider.nameFr} (${
          lang === 'ar' ? selectedProvider.districtAr : selectedProvider.districtFr
        })`,
      )}`
    : '/reserver?city=Casablanca';

  // Sort markers descending by latitude so southern markers sit naturally above northern overlaps
  const orderedProviders = [...CASABLANCA_PROVIDERS].sort((a, b) => b.lat - a.lat);

  const useLiveGoogleMap = Boolean(apiKey) && !mapsQuotaExceeded;

  return (
    <section
      aria-labelledby="discover-casablanca-heading"
      className="py-20 lg:py-28 bg-[#0A0A0B] text-white"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wider text-[#D4AE5E] uppercase mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AE5E]" />
              <span>
                {lang === 'ar'
                  ? 'اكتشفوا الدار البيضاء · شبكة الشركاء'
                  : 'Discover Casablanca · Carte des Quartiers'}
              </span>
            </p>
            <h2
              id="discover-casablanca-heading"
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white text-balance"
            >
              {lang === 'ar'
                ? 'أبرز مزودي الفعاليات حسب أحياء الدار البيضاء'
                : 'Nos prestataires d’excellence par quartier à Casablanca'}
            </h2>
            <p className="mt-3.5 text-base text-neutral-300 leading-relaxed">
              {lang === 'ar'
                ? 'استكشفوا شركاء إيفنت برو المعتمدين في المعاريف وأنفا وعين الذئاب وبوسكورة وكاليفورنيا وانقروا على أي علامة لعرض تفاصيل التواصل.'
                : 'Explorez nos partenaires sélectionnés à Maarif, Anfa, Ain Diab, Bouskoura et Californie. Cliquez sur un marqueur pour consulter la fiche détaillée du prestataire.'}
            </p>
          </div>

          {/* District Quick Selector Bar */}
          <div
            className="flex flex-wrap items-center gap-2"
            role="tablist"
            aria-label={lang === 'ar' ? 'أحياء الدار البيضاء' : 'Quartiers de Casablanca'}
          >
            {CASABLANCA_PROVIDERS.map((p) => {
              const active = p.id === selectedId;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => handleSelectProvider(p.id)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#B89038] text-[#0A0A0B] border-[#B89038]'
                      : 'bg-[#141416] text-neutral-300 border-neutral-800 hover:border-[#D4AE5E] hover:text-white'
                  }`}
                >
                  {lang === 'ar' ? p.districtAr : p.districtFr}
                </button>
              );
            })}
          </div>
        </div>

        {/* Map + Synchronized Provider Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Interactive Map Canvas */}
          <div className="lg:col-span-7">
            {useLiveGoogleMap ? (
              <div className="h-[460px] lg:h-[560px] w-full rounded-xl overflow-hidden border border-neutral-800">
                <APIProvider
                  apiKey={apiKey}
                  libraries={['marker']}
                  language={lang === 'ar' ? 'ar' : 'fr'}
                  region="MA"
                >
                  <GoogleMap
                    mapId="DEMO_MAP_ID"
                    defaultCenter={CASABLANCA_CENTER}
                    defaultZoom={11.5}
                    gestureHandling="cooperative"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <CasablancaCameraController
                      selectedProvider={selectedProvider}
                      shouldPan={shouldPan}
                      onPanComplete={() => setShouldPan(false)}
                    />
                    {orderedProviders.map((provider, idx) => {
                      let zIndex = idx;
                      if (hoveredId === provider.id) zIndex = Z_INDEX_HOVER;
                      if (selectedId === provider.id) zIndex = Z_INDEX_SELECTED;

                      return (
                        <ProviderMarker
                          key={provider.id}
                          provider={provider}
                          isSelected={selectedId === provider.id}
                          isHovered={hoveredId === provider.id}
                          isInfoOpen={infoOpen}
                          zIndex={zIndex}
                          lang={lang}
                          onSelect={() => handleSelectProvider(provider.id)}
                          onCloseInfo={() => setInfoOpen(false)}
                          onHoverChange={(h) => setHoveredId(h ? provider.id : null)}
                        />
                      );
                    })}
                  </GoogleMap>
                </APIProvider>
              </div>
            ) : (
              <CasablancaInteractiveFallbackMap
                providers={CASABLANCA_PROVIDERS}
                selectedId={selectedId}
                infoOpen={infoOpen}
                lang={lang}
                onSelectProvider={handleSelectProvider}
                onCloseInfo={() => setInfoOpen(false)}
              />
            )}
          </div>

          {/* Synchronized Provider Card (Fiche Prestataire) */}
          <div className="lg:col-span-5 bg-white text-[#0A0A0B] rounded-xl p-6 sm:p-8 border border-neutral-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-neutral-200">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#8E6B1E]">
                  <MapPin className="w-3.5 h-3.5 text-[#B89038]" />
                  <span>
                    {lang === 'ar'
                      ? `حي ${selectedProvider.districtAr} · الدار البيضاء`
                      : `Quartier ${selectedProvider.districtFr} · Casablanca`}
                  </span>
                </span>
                <span className="text-xs font-mono text-neutral-500 tabular-nums" dir="ltr">
                  {selectedProvider.lat.toFixed(4)}° N, {Math.abs(selectedProvider.lng).toFixed(4)}° W
                </span>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  {lang === 'ar' ? selectedProvider.categoryAr : selectedProvider.categoryFr}
                </p>
                <h3 className="font-display text-3xl font-semibold text-[#0A0A0B] mt-1.5 leading-tight">
                  {lang === 'ar' ? selectedProvider.nameAr : selectedProvider.nameFr}
                </h3>
                <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                  {lang === 'ar' ? selectedProvider.specialtyAr : selectedProvider.specialtyFr}
                </p>
              </div>

              {/* Coordinates & Contact Info */}
              <div className="mt-6 space-y-3.5 bg-[#FAFAFA] border border-neutral-200 rounded-xl p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  {lang === 'ar' ? 'بيانات ومعلومات الاتصال' : 'Coordonnées du prestataire'}
                </p>

                <div className="flex items-start gap-3 text-sm text-neutral-800">
                  <MapPin className="w-4 h-4 text-[#B89038] shrink-0 mt-0.5" />
                  <span>
                    {lang === 'ar' ? selectedProvider.addressAr : selectedProvider.addressFr}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-neutral-800">
                  <Phone className="w-4 h-4 text-[#B89038] shrink-0" />
                  <a
                    href={`tel:${selectedProvider.phone.replace(/\s+/g, '')}`}
                    className="font-semibold hover:text-[#8E6B1E] transition-colors tabular-nums"
                    dir="ltr"
                  >
                    {selectedProvider.phone}
                  </a>
                </div>

                <div className="flex items-center gap-3 text-sm text-neutral-800">
                  <Mail className="w-4 h-4 text-[#B89038] shrink-0" />
                  <a
                    href={`mailto:${selectedProvider.email}`}
                    className="hover:text-[#8E6B1E] transition-colors"
                  >
                    {selectedProvider.email}
                  </a>
                </div>

                <div className="flex items-center gap-3 text-sm text-neutral-600">
                  <Clock className="w-4 h-4 text-[#B89038] shrink-0" />
                  <span>
                    {lang === 'ar' ? selectedProvider.hoursAr : selectedProvider.hoursFr}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-neutral-200 flex flex-col sm:flex-row gap-3">
              <Link
                to={bookingHref}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold bg-[#0A0A0B] text-white rounded-lg hover:bg-neutral-800 transition-colors"
              >
                <span>
                  {lang === 'ar' ? 'احجزوا هذا الشريك' : 'Réserver ce prestataire'}
                </span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
              <a
                href={`https://maps.google.com/?q=${selectedProvider.lat},${selectedProvider.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold border border-neutral-300 text-[#0A0A0B] rounded-lg hover:border-[#0A0A0B] transition-colors whitespace-nowrap"
              >
                <span>{lang === 'ar' ? 'مسار الوصول' : 'Itinéraire'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
