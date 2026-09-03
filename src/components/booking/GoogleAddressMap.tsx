"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { loadGoogleMaps } from "@/components/booking/GoogleAddressAutocomplete";

type GoogleMapInstance = { setCenter: (position: Coordinates) => void };
type GoogleMapConstructor = new (
  element: HTMLElement,
  options: Record<string, unknown>
) => GoogleMapInstance;
type GoogleMarkerConstructor = new (options: Record<string, unknown>) => unknown;

type Coordinates = { lat: number; lng: number };

type MapsWindow = Window & {
  google?: {
    maps?: {
      importLibrary?: (name: string) => Promise<{
        Map?: GoogleMapConstructor;
        AdvancedMarkerElement?: GoogleMarkerConstructor;
      }>;
    };
  };
};

type Props = {
  latitude: number | null;
  longitude: number | null;
  placeholderTitle: string;
  placeholderHint: string;
};

export function GoogleAddressMap({
  latitude,
  longitude,
  placeholderTitle,
  placeholderHint,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";
  const hasCoordinates = latitude !== null && longitude !== null;

  useEffect(() => {
    const element = mapRef.current;
    if (!element || !apiKey || !hasCoordinates) return;

    let active = true;
    const position = { lat: latitude, lng: longitude };

    void loadGoogleMaps(apiKey)
      .then(async () => {
        const mapsWindow = window as MapsWindow;
        const [mapsLibrary, markerLibrary] = await Promise.all([
          mapsWindow.google?.maps?.importLibrary?.("maps"),
          mapsWindow.google?.maps?.importLibrary?.("marker"),
        ]);
        if (!active || !mapsLibrary?.Map) return;

        const map = new mapsLibrary.Map(element, {
          center: position,
          zoom: 16,
          mapId: "DEMO_MAP_ID",
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          clickableIcons: false,
        });

        if (markerLibrary?.AdvancedMarkerElement) {
          new markerLibrary.AdvancedMarkerElement({ map, position });
        }
        setMapError(false);
      })
      .catch(() => {
        if (active) setMapError(true);
      });

    return () => {
      active = false;
    };
  }, [apiKey, hasCoordinates, latitude, longitude]);

  if (!hasCoordinates || mapError) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#34597E] text-white shadow-[0_8px_24px_rgba(52,89,126,0.28)]">
          <MapPin className="h-5 w-5" aria-hidden />
        </span>
        <p className="text-sm font-medium text-slate-600">{placeholderTitle}</p>
        <p className="text-xs text-slate-400">{placeholderHint}</p>
      </div>
    );
  }

  return <div ref={mapRef} className="absolute inset-0" aria-label={placeholderTitle} />;
}
