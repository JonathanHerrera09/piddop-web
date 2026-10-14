import { useEffect, useMemo, useRef, useState } from 'react';
import { CoveragePoint } from '@/types/dashboard';

declare global {
  interface Window {
    google?: any;
    __alloraGoogleMapsPromise?: Promise<any>;
  }
}

const DEFAULT_CENTER = {
  latitude: 3.4516,
  longitude: -76.532
};

export function loadGoogleMaps(apiKey: string) {
  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (window.__alloraGoogleMapsPromise) {
    return window.__alloraGoogleMapsPromise;
  }

  window.__alloraGoogleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google?.maps);
    script.onerror = () => reject(new Error('No pudimos cargar Google Maps.'));
    document.head.appendChild(script);
  });

  return window.__alloraGoogleMapsPromise;
}

function normalizePoint(point: CoveragePoint | null | undefined) {
  if (!point) {
    return null;
  }

  const latitude = Number(point.latitude);
  const longitude = Number(point.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
}

export function CoverageMapEditor({
  apiKey,
  center,
  onCenterChange,
  onPolygonChange,
  onZoomChange,
  polygon,
  zoom
}: {
  apiKey: string;
  center: CoveragePoint | null;
  onCenterChange: (point: CoveragePoint) => void;
  onPolygonChange: (nextPolygon: CoveragePoint[]) => void;
  onZoomChange: (zoom: number) => void;
  polygon: CoveragePoint[];
  zoom: number;
}) {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const polygonRef = useRef<any>(null);
  const centerMarkerRef = useRef<any>(null);
  const polygonListenersRef = useRef<any[]>([]);
  const onCenterChangeRef = useRef(onCenterChange);
  const onPolygonChangeRef = useRef(onPolygonChange);
  const onZoomChangeRef = useRef(onZoomChange);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const initialCenter = useMemo(
    () => normalizePoint(center) || DEFAULT_CENTER,
    [center]
  );

  useEffect(() => {
    onCenterChangeRef.current = onCenterChange;
  }, [onCenterChange]);

  useEffect(() => {
    onPolygonChangeRef.current = onPolygonChange;
  }, [onPolygonChange]);

  useEffect(() => {
    onZoomChangeRef.current = onZoomChange;
  }, [onZoomChange]);

  useEffect(() => {
    let cancelled = false;

    async function bootMap() {
      try {
        const maps = await loadGoogleMaps(apiKey);

        if (cancelled || !mapNodeRef.current || mapRef.current) {
          return;
        }

        const map = new maps.Map(mapNodeRef.current, {
          center: { lat: initialCenter.latitude, lng: initialCenter.longitude },
          zoom,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: 'cooperative'
        });

        mapRef.current = map;

        centerMarkerRef.current = new maps.Marker({
          map,
          position: { lat: initialCenter.latitude, lng: initialCenter.longitude },
          title: 'Centro operativo'
        });

        map.addListener('click', (event: any) => {
          const latLng = event.latLng;
          const nextPolygon = [
            ...polygonRef.current.getPath().getArray().map((point: any) => ({
              latitude: point.lat(),
              longitude: point.lng()
            })),
            {
              latitude: latLng.lat(),
              longitude: latLng.lng()
            }
          ];

          onPolygonChangeRef.current(nextPolygon);
        });

        map.addListener('idle', () => {
          const mapCenter = map.getCenter();
          if (!mapCenter) {
            return;
          }

          onCenterChangeRef.current({
            latitude: mapCenter.lat(),
            longitude: mapCenter.lng()
          });
          onZoomChangeRef.current(map.getZoom() || zoom);
        });

        setIsReady(true);
      } catch (error) {
        if (!cancelled) {
          setMapError(error instanceof Error ? error.message : 'No pudimos cargar el mapa.');
        }
      }
    }

    void bootMap();

    return () => {
      cancelled = true;
    };
  }, [apiKey, initialCenter.latitude, initialCenter.longitude, zoom]);

  useEffect(() => {
    if (!isReady || !window.google?.maps || !mapRef.current) {
      return;
    }

    polygonListenersRef.current.forEach((listener) => listener.remove?.());
    polygonListenersRef.current = [];

    if (!polygonRef.current) {
      polygonRef.current = new window.google.maps.Polygon({
        editable: true,
        draggable: false,
        fillColor: '#ff6711',
        fillOpacity: 0.18,
        strokeColor: '#ff6711',
        strokeOpacity: 1,
        strokeWeight: 2
      });
      polygonRef.current.setMap(mapRef.current);
    }

    polygonRef.current.setPath(
      polygon.map((point) => ({
        lat: point.latitude,
        lng: point.longitude
      }))
    );

    const path = polygonRef.current.getPath();
    const syncPath = () => {
      onPolygonChangeRef.current(
        path.getArray().map((point: any) => ({
          latitude: point.lat(),
          longitude: point.lng()
        }))
      );
    };

    polygonListenersRef.current = [
      path.addListener('set_at', syncPath),
      path.addListener('insert_at', syncPath),
      path.addListener('remove_at', syncPath)
    ];
  }, [isReady, polygon]);

  useEffect(() => {
    if (!mapRef.current || !centerMarkerRef.current) {
      return;
    }

    const nextCenter = normalizePoint(center) || DEFAULT_CENTER;
    const mapCenter = mapRef.current.getCenter();
    const currentLatitude = mapCenter?.lat?.();
    const currentLongitude = mapCenter?.lng?.();

    if (
      !Number.isFinite(currentLatitude) ||
      !Number.isFinite(currentLongitude) ||
      Math.abs(currentLatitude - nextCenter.latitude) > 0.00001 ||
      Math.abs(currentLongitude - nextCenter.longitude) > 0.00001
    ) {
      mapRef.current.panTo({ lat: nextCenter.latitude, lng: nextCenter.longitude });
    }

    centerMarkerRef.current.setPosition({
      lat: nextCenter.latitude,
      lng: nextCenter.longitude
    });
  }, [center]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    if (mapRef.current.getZoom() !== zoom) {
      mapRef.current.setZoom(zoom);
    }
  }, [zoom]);

  function handleRemoveLastPoint() {
    onPolygonChange(polygon.slice(0, -1));
  }

  function handleClearPolygon() {
    onPolygonChange([]);
  }

  return (
    <section className="coverage-map-card">
      <div className="coverage-map-card__toolbar">
        <div>
          <strong>Mapa de cobertura</strong>
          <p>Haz clic sobre el mapa para marcar los puntos del polígono de la vereda.</p>
        </div>
        <div className="row-actions">
          <button className="secondary-button inline-action" onClick={handleRemoveLastPoint} type="button">
            Deshacer punto
          </button>
          <button className="secondary-button inline-action" onClick={handleClearPolygon} type="button">
            Limpiar
          </button>
        </div>
      </div>

      {mapError ? <p className="form-error" role="alert">{mapError}</p> : null}

      <div className="coverage-map" ref={mapNodeRef} />

      <div className="coverage-map-card__summary">
        <span>{polygon.length} puntos</span>
        <span>
          Centro: {center ? `${center.latitude.toFixed(5)}, ${center.longitude.toFixed(5)}` : 'sin definir'}
        </span>
        <span>Zoom: {zoom}</span>
      </div>
    </section>
  );
}
