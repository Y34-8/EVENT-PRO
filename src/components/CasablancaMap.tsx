import React, { useState } from 'react';
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map,
  Pin,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';
import { MapPin, ExternalLink } from 'lucide-react';
import { Lang } from '../types/index.ts';

interface CasablancaMapProps {
  lat: number;
  lng: number;
  address: string;
  phone: string;
  lang: Lang;
}

function AgencyMarker({
  lat,
  lng,
  address,
  phone,
}: {
  lat: number;
  lng: number;
  address: string;
  phone: string;
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoOpen, setInfoOpen] = useState(true);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat, lng }}
        title="EVENT PRO Casablanca"
        onClick={() => setInfoOpen(true)}
      >
        <Pin background="#0A0A0B" borderColor="#B89038" glyphColor="#F4E6C1" scale={1.25} />
      </AdvancedMarker>
      {infoOpen && marker && (
        <InfoWindow anchor={marker} maxWidth={260} onCloseClick={() => setInfoOpen(false)}>
          <div className="p-1 text-neutral-900">
            <p className="font-semibold text-sm">EVENT PRO — Casablanca</p>
            <p className="text-xs text-neutral-600 mt-1">{address}</p>
            <p className="text-xs font-medium text-neutral-800 mt-1 tabular-nums">{phone}</p>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export function CasablancaMap({ lat, lng, address, phone, lang }: CasablancaMapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const center = { lat: Number(lat) || 33.5912, lng: Number(lng) || -7.6324 };

  if (!apiKey) {
    return (
      <div className="h-[380px] w-full rounded-xl border border-neutral-200 bg-neutral-100 flex flex-col items-center justify-center p-8 text-center">
        <MapPin className="w-8 h-8 text-[#B89038] mb-3" />
        <h3 className="font-display text-2xl font-semibold text-neutral-900">
          EVENT PRO — Casablanca
        </h3>
        <p className="text-sm text-neutral-600 mt-2 max-w-md">{address}</p>
        <p className="text-xs text-neutral-500 mt-1 tabular-nums">
          {center.lat.toFixed(4)}° N, {Math.abs(center.lng).toFixed(4)}° W
        </p>
        <a
          href={`https://maps.google.com/?q=${center.lat},${center.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[#0A0A0B] text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          {lang === 'ar' ? 'فتح في خرائط جوجل' : 'Ouvrir dans Google Maps'}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div className="h-[380px] w-full rounded-xl overflow-hidden border border-neutral-200">
      <APIProvider
        apiKey={apiKey}
        libraries={['marker']}
        language={lang === 'ar' ? 'ar' : 'fr'}
        region="MA"
      >
        <Map
          mapId="DEMO_MAP_ID"
          defaultCenter={center}
          defaultZoom={14}
          gestureHandling="cooperative"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          <AgencyMarker lat={center.lat} lng={center.lng} address={address} phone={phone} />
        </Map>
      </APIProvider>
    </div>
  );
}
