/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: any;
    piddopGoogleMaps?: Promise<any>;
  }
}

function loadGoogleMaps(apiKey: string) {
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  window.piddopGoogleMaps ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
    script.async = true;
    script.onload = () => resolve(window.google?.maps);
    script.onerror = () => reject(new Error("No pudimos cargar Google Maps."));
    document.head.appendChild(script);
  });
  return window.piddopGoogleMaps;
}

export function CompanyLocationMap({
  apiKey,
  latitude,
  longitude,
  onChange,
}: {
  apiKey: string;
  latitude: number;
  longitude: number;
  onChange: (point: { latitude: number; longitude: number }) => void;
}) {
  const node = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    void loadGoogleMaps(apiKey)
      .then((maps) => {
        if (cancelled || !node.current || map.current) return;
        map.current = new maps.Map(node.current, {
          center: { lat: latitude, lng: longitude },
          zoom: 16,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        marker.current = new maps.Marker({
          map: map.current,
          draggable: true,
          position: { lat: latitude, lng: longitude },
        });
        const select = (event: any) =>
          onChange({ latitude: event.latLng.lat(), longitude: event.latLng.lng() });
        map.current.addListener("click", select);
        marker.current.addListener("dragend", select);
      })
      .catch((reason) => {
        if (!cancelled)
          setError(reason instanceof Error ? reason.message : "No pudimos cargar Google Maps.");
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey, onChange]);
  useEffect(() => {
    if (!map.current || !marker.current) return;
    const point = { lat: latitude, lng: longitude };
    marker.current.setPosition(point);
    map.current.panTo(point);
  }, [latitude, longitude]);
  return error ? (
    <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
  ) : (
    <div
      ref={node}
      className="h-56 w-full rounded-lg"
      aria-label="Mapa de Google para elegir ubicación"
    />
  );
}

/** Editor for the platform coverage polygon. Clicking the map adds a vertex;
 * existing vertices can be dragged, added, or removed with Google Maps' native
 * handles. The form remains the source of truth, so it also works without Maps. */
export function CoveragePolygonMap({
  apiKey,
  center,
  zoom,
  polygon,
  onChange,
}: {
  apiKey: string;
  center: { latitude: number; longitude: number };
  zoom: number;
  polygon: Array<{ latitude: number; longitude: number }>;
  onChange: (points: Array<{ latitude: number; longitude: number }>) => void;
}) {
  const node = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const shape = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const emitPath = () => {
      const points = shape.current
        .getPath()
        .getArray()
        .map((point: any) => ({ latitude: point.lat(), longitude: point.lng() }));
      onChange(points);
    };
    void loadGoogleMaps(apiKey)
      .then((maps) => {
        if (cancelled || !node.current || map.current) return;
        map.current = new maps.Map(node.current, {
          center: { lat: center.latitude, lng: center.longitude },
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        shape.current = new maps.Polygon({
          map: map.current,
          paths: polygon.map((point) => ({ lat: point.latitude, lng: point.longitude })),
          editable: true,
          draggable: true,
          fillColor: "#ff6b35",
          fillOpacity: 0.18,
          strokeColor: "#ff6b35",
          strokeWeight: 2,
        });
        maps.event.addListener(shape.current.getPath(), "set_at", emitPath);
        maps.event.addListener(shape.current.getPath(), "insert_at", emitPath);
        maps.event.addListener(shape.current.getPath(), "remove_at", emitPath);
        shape.current.addListener("dragend", emitPath);
        map.current.addListener("click", (event: any) => {
          shape.current.getPath().push(event.latLng);
        });
      })
      .catch((reason) => {
        if (!cancelled)
          setError(reason instanceof Error ? reason.message : "No pudimos cargar Google Maps.");
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  useEffect(() => {
    if (!map.current || !shape.current) return;
    map.current.setCenter({ lat: center.latitude, lng: center.longitude });
    map.current.setZoom(zoom);
    shape.current.setPath(polygon.map((point) => ({ lat: point.latitude, lng: point.longitude })));
  }, [center.latitude, center.longitude, polygon, zoom]);

  return error ? (
    <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
  ) : (
    <div
      ref={node}
      className="h-80 w-full rounded-lg"
      aria-label="Mapa para editar el polígono de cobertura"
    />
  );
}
