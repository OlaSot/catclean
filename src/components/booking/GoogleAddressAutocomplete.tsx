"use client";

import { useEffect, useRef, useState } from "react";
import { isHannoverServiceArea } from "@/lib/booking/hannover-service-area";

export type GoogleValidatedAddress = {
  street: string;
  houseNumber: string;
  zip: string;
  city: string;
  googlePlaceId: string;
  latitude: number | null;
  longitude: number | null;
  serviceAreaValidated: boolean;
};

type GoogleAddressComponent = {
  longText?: string;
  shortText?: string;
  types: string[];
};

type GooglePlace = {
  id?: string;
  addressComponents?: GoogleAddressComponent[];
  location?: { lat: () => number; lng: () => number };
  fetchFields: (options: { fields: string[] }) => Promise<void>;
};

type PlacePrediction = { toPlace: () => GooglePlace };
type PlaceSelectEvent = Event & { placePrediction?: PlacePrediction };

type PlaceAutocompleteElement = HTMLElement & {
  value: string;
  placeholder: string;
  includedRegionCodes: string[];
  locationRestriction: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
};

type PlaceAutocompleteConstructor = new () => PlaceAutocompleteElement;

type GoogleMapsWindow = Window & {
  __catcleanGoogleMapsReady?: () => void;
  google?: {
    maps?: {
      importLibrary?: (name: string) => Promise<{
        PlaceAutocompleteElement?: PlaceAutocompleteConstructor;
        Map?: unknown;
        AdvancedMarkerElement?: unknown;
      }>;
    };
  };
};

let googleMapsPromise: Promise<void> | null = null;

export function loadGoogleMaps(apiKey: string): Promise<void> {
  const mapsWindow = window as GoogleMapsWindow;
  if (mapsWindow.google?.maps?.importLibrary) return Promise.resolve();
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    mapsWindow.__catcleanGoogleMapsReady = () => {
      delete mapsWindow.__catcleanGoogleMapsReady;
      resolve();
    };
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&v=weekly&language=de&region=DE&callback=__catcleanGoogleMapsReady`;
    script.async = true;
    script.onerror = () => {
      delete mapsWindow.__catcleanGoogleMapsReady;
      reject(new Error("Google Maps could not be loaded"));
    };
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

function component(
  components: GoogleAddressComponent[],
  type: string,
  short = false
): string {
  const match = components.find((item) => item.types.includes(type));
  return match ? (short ? match.shortText : match.longText) ?? "" : "";
}

function isRegionHannover(components: GoogleAddressComponent[]): boolean {
  const region = component(components, "administrative_area_level_3");
  return /(^|\s)(region\s+)?hannover($|\s)/i.test(region.trim());
}

type Props = {
  label: string;
  value: string;
  error?: string;
  placeholder?: string;
  className?: string;
  onInputChange: (street: string) => void;
  onAddressSelected: (address: GoogleValidatedAddress) => void;
};

export function GoogleAddressAutocomplete({
  label,
  value,
  error,
  placeholder,
  className = "",
  onInputChange,
  onAddressSelected,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<PlaceAutocompleteElement | null>(null);
  const initialValueRef = useRef(value);
  const onInputChangeRef = useRef(onInputChange);
  const onAddressSelectedRef = useRef(onAddressSelected);
  const [mapsError, setMapsError] = useState<string | null>(null);
  const [widgetReady, setWidgetReady] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";

  useEffect(() => {
    onInputChangeRef.current = onInputChange;
    onAddressSelectedRef.current = onAddressSelected;
  }, [onAddressSelected, onInputChange]);

  useEffect(() => {
    if (widgetRef.current && widgetRef.current.value !== value) {
      widgetRef.current.value = value;
    }
  }, [value]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !apiKey) return;

    let active = true;
    let widget: PlaceAutocompleteElement | null = null;

    void loadGoogleMaps(apiKey)
      .then(async () => {
        const mapsWindow = window as GoogleMapsWindow;
        const places = await mapsWindow.google?.maps?.importLibrary?.("places");
        if (!active) return;
        if (!places?.PlaceAutocompleteElement) {
          setMapsError("Adresssuche ist für diesen API-Schlüssel nicht verfügbar.");
          return;
        }

        widget = new places.PlaceAutocompleteElement();
        widgetRef.current = widget;
        widget.value = initialValueRef.current;
        widget.placeholder = placeholder ?? "";
        widget.setAttribute("aria-label", label);
        widget.includedRegionCodes = ["de"];
        widget.locationRestriction = {
          north: 52.72,
          south: 52.14,
          east: 10.35,
          west: 9.27,
        };
        widget.className = "google-address-autocomplete";

        widget.addEventListener("input", () => {
          setMapsError(null);
          onInputChangeRef.current(widget?.value ?? "");
        });

        widget.addEventListener("gmp-select", (rawEvent) => {
          const event = rawEvent as PlaceSelectEvent;
          const place = event.placePrediction?.toPlace();
          if (!place) return;

          void place
            .fetchFields({ fields: ["id", "addressComponents", "location"] })
            .then(() => {
              const components = place.addressComponents ?? [];
              const zip = component(components, "postal_code");
              const city =
                component(components, "locality") ||
                component(components, "postal_town") ||
                component(components, "administrative_area_level_3");
              if (!isRegionHannover(components) && !isHannoverServiceArea(zip, city)) {
                setMapsError("Dieser Ort liegt außerhalb der Region Hannover.");
                return;
              }
              if (zip && !isHannoverServiceArea(zip, city)) {
                setMapsError("Dieser Ort liegt außerhalb der Region Hannover.");
                return;
              }

              setMapsError(null);
              onAddressSelectedRef.current({
                street: component(components, "route"),
                houseNumber: component(components, "street_number"),
                zip,
                city,
                googlePlaceId: place.id ?? "",
                latitude: place.location?.lat() ?? null,
                longitude: place.location?.lng() ?? null,
                serviceAreaValidated: true,
              });
            })
            .catch(() => setMapsError("Adresse konnte nicht geprüft werden."));
        });

        host.replaceChildren(widget);
        setWidgetReady(true);
      })
      .catch(() => {
        if (active) setMapsError("Adresssuche konnte nicht geladen werden.");
      });

    return () => {
      active = false;
      if (widget) widget.remove();
      if (widgetRef.current === widget) widgetRef.current = null;
    };
  }, [apiKey, label, placeholder]);

  return (
    <div className={`block ${className}`.trim()}>
      <span className="mb-2 block text-sm font-medium text-slate-600">{label}</span>
      <div ref={hostRef} className="google-address-autocomplete-host" />
      {!widgetReady ? (
        <input
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(event) => onInputChange(event.target.value)}
          className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#34597E]"
        />
      ) : null}
      {mapsError ? <p className="mt-1 text-sm text-rose-600">{mapsError}</p> : null}
      {!mapsError && error ? <p className="mt-1 text-sm text-rose-600">{error}</p> : null}
      {!apiKey ? (
        <p className="mt-1 text-xs text-amber-700">Google Maps API key is not configured.</p>
      ) : null}
    </div>
  );
}
