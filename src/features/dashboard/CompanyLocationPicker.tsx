import { useEffect, useMemo, useRef, useState } from 'react';
import { loadGoogleMaps } from '@/features/dashboard/CoverageMapEditor';
import { isPointWithinCoverage } from '@/features/dashboard/coverage.utils';
import { CompanyCoverageBoundary, CoveragePoint } from '@/types/dashboard';

const DEFAULT_CENTER: CoveragePoint = { latitude: 3.4516, longitude: -76.532 };

function validCoordinatePair(latitude: number | null, longitude: number | null) {
  return latitude != null && longitude != null && Number.isFinite(latitude) && Number.isFinite(longitude) &&
    latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

export function CompanyLocationPicker({ apiKey, coverage, latitude, longitude, onChange }: {
  apiKey: string;
  coverage: CompanyCoverageBoundary | null;
  latitude: number | null;
  longitude: number | null;
  onChange: (location: CoveragePoint) => void;
}) {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const polygonRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const coverageRef = useRef(coverage);
  const selectedPointRef = useRef<CoveragePoint | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const hasLocation = validCoordinatePair(latitude, longitude);
  const selectedLocationIsAllowed = hasLocation && latitude != null && longitude != null &&
    isPointWithinCoverage({ latitude, longitude }, coverage);
  const initialCenter = useMemo(() => hasLocation
    ? { latitude: latitude as number, longitude: longitude as number }
    : coverage?.center || DEFAULT_CENTER, [coverage?.center, hasLocation, latitude, longitude]);

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { coverageRef.current = coverage; }, [coverage]);
  useEffect(() => {
    selectedPointRef.current = hasLocation && latitude != null && longitude != null ? { latitude, longitude } : null;
  }, [hasLocation, latitude, longitude]);

  function selectPoint(point: CoveragePoint) {
    if (!isPointWithinCoverage(point, coverageRef.current)) {
      setMapError('Ese punto esta fuera de la zona habilitada para domicilios. Selecciona un lugar dentro de la vereda.');
      const previous = selectedPointRef.current;
      if (previous && markerRef.current) markerRef.current.setPosition({ lat: previous.latitude, lng: previous.longitude });
      return;
    }
    setMapError(null);
    onChangeRef.current(point);
  }

  useEffect(() => {
    let cancelled = false;
    async function bootMap() {
      try {
        const maps = await loadGoogleMaps(apiKey);
        if (cancelled || !mapNodeRef.current || mapRef.current) return;
        const map = new maps.Map(mapNodeRef.current, {
          center: { lat: initialCenter.latitude, lng: initialCenter.longitude },
          zoom: hasLocation ? 17 : 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: 'cooperative'
        });
        mapRef.current = map;
        map.addListener('click', (event: any) => selectPoint({
          latitude: event.latLng.lat(), longitude: event.latLng.lng()
        }));
        setMapError(null);
        setIsReady(true);
      } catch (error) {
        if (!cancelled) setMapError(error instanceof Error ? error.message : 'No pudimos cargar Google Maps.');
      }
    }
    void bootMap();
    return () => {
      cancelled = true;
      if (mapRef.current && window.google?.maps) {
        window.google.maps.event.clearInstanceListeners(mapRef.current);
        markerRef.current?.setMap(null);
        polygonRef.current?.setMap(null);
        mapRef.current = null;
        markerRef.current = null;
        polygonRef.current = null;
      }
    };
    // The Google map must only be initialized once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  useEffect(() => {
    if (!isReady || !mapRef.current || !window.google?.maps) return;
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }
    if (coverage?.enabled && coverage.polygon.length >= 3) {
      polygonRef.current = new window.google.maps.Polygon({
        clickable: false,
        fillColor: '#ff6711', fillOpacity: 0.13,
        map: mapRef.current,
        paths: coverage.polygon.map((point) => ({ lat: point.latitude, lng: point.longitude })),
        strokeColor: '#ff6711', strokeOpacity: 1, strokeWeight: 3
      });
      const bounds = new window.google.maps.LatLngBounds();
      coverage.polygon.forEach((point) => bounds.extend({ lat: point.latitude, lng: point.longitude }));
      if (!selectedLocationIsAllowed) mapRef.current.fitBounds(bounds, 32);
    }
  }, [coverage, isReady, selectedLocationIsAllowed]);

  useEffect(() => {
    if (!isReady || !mapRef.current || !window.google?.maps || !hasLocation || latitude == null || longitude == null) return;
    const position = { lat: latitude, lng: longitude };
    if (!markerRef.current) {
      markerRef.current = new window.google.maps.Marker({ draggable: true, map: mapRef.current, position, title: 'Ubicacion de la tienda' });
      markerRef.current.addListener('dragend', (event: any) => selectPoint({
        latitude: event.latLng.lat(), longitude: event.latLng.lng()
      }));
    } else {
      markerRef.current.setPosition(position);
    }
    mapRef.current.panTo(position);
  }, [hasLocation, isReady, latitude, longitude]);

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setMapError('Tu navegador no permite obtener la ubicacion actual.');
      return;
    }
    setIsLocating(true);
    setMapError(null);
    navigator.geolocation.getCurrentPosition((position) => {
      const nextPoint = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      selectPoint(nextPoint);
      if (isPointWithinCoverage(nextPoint, coverageRef.current)) {
        mapRef.current?.setZoom(18);
        mapRef.current?.panTo({ lat: nextPoint.latitude, lng: nextPoint.longitude });
      }
      setIsLocating(false);
    }, () => {
      setMapError('No pudimos obtener tu ubicacion. Revisa el permiso del navegador o marca el punto en el mapa.');
      setIsLocating(false);
    }, { enableHighAccuracy: true, timeout: 12000 });
  }

  return (
    <section className="company-location-picker">
      <div className="company-location-picker__header">
        <div>
          <strong>Ubicacion de tu tienda</strong>
          <p>Marca o arrastra el pin dentro del area naranja habilitada para domicilios.</p>
        </div>
        <button className="secondary-button inline-action" disabled={isLocating} onClick={handleUseCurrentLocation} type="button">
          {isLocating ? 'Buscando...' : 'Usar mi ubicacion'}
        </button>
      </div>
      {mapError ? <p className="form-error" role="alert">{mapError}</p> : null}
      <div aria-label="Mapa de Google para seleccionar la ubicacion de la tienda" className="company-location-picker__map" ref={mapNodeRef} />
      <p className={`company-location-picker__status ${selectedLocationIsAllowed ? 'is-selected' : ''}`} aria-live="polite">
        {selectedLocationIsAllowed
          ? 'Ubicacion valida seleccionada. Guarda la configuracion para confirmar el cambio.'
          : hasLocation
            ? 'La ubicacion guardada esta fuera del area permitida. Selecciona un nuevo punto dentro de la vereda.'
            : 'Aun no has marcado la ubicacion de tu tienda.'}
      </p>
    </section>
  );
}
