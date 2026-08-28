import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Bike, MapPin, Navigation, Store, Layers, Compass, ZoomIn, ZoomOut } from "lucide-react";

interface LiveLeafletMapProps {
  storeLocation: { lat: number; lng: number; name: string };
  customerLocation: { lat: number; lng: number; address: string };
  riderLocation: { lat: number; lng: number; name?: string; speed?: number };
  orderStatus: string;
  isDelivered?: boolean;
}

export const LiveLeafletMap: React.FC<LiveLeafletMapProps> = ({
  storeLocation,
  customerLocation,
  riderLocation,
  orderStatus,
  isDelivered = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const riderMarkerRef = useRef<L.Marker | null>(null);
  const storeMarkerRef = useRef<L.Marker | null>(null);
  const customerMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const [mapTileTheme, setMapTileTheme] = useState<"standard" | "voyager">("voyager");

  // Create Custom Leaflet DivIcons
  const createStoreIcon = () => {
    return L.divIcon({
      className: "custom-leaflet-store-icon",
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 42px; height: 42px;">
          <div style="position: absolute; width: 42px; height: 42px; background: rgba(16, 185, 129, 0.25); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 34px; height: 34px; background: #065f46; border: 2.5px solid #ffffff; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-size: 16px;">
            🏪
          </div>
          <div style="position: absolute; bottom: -18px; background: #064e3b; color: #ffffff; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 6px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
            Store Hub
          </div>
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 21],
      popupAnchor: [0, -22],
    });
  };

  const createCustomerIcon = () => {
    return L.divIcon({
      className: "custom-leaflet-customer-icon",
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 42px; height: 42px;">
          <div style="position: absolute; width: 42px; height: 42px; background: rgba(239, 68, 68, 0.2); border-radius: 50%;"></div>
          <div style="width: 34px; height: 34px; background: #b91c1c; border: 2.5px solid #ffffff; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-size: 16px;">
            🏠
          </div>
          <div style="position: absolute; bottom: -18px; background: #991b1b; color: #ffffff; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 6px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
            Your Home
          </div>
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 21],
      popupAnchor: [0, -22],
    });
  };

  const createRiderIcon = (isComplete: boolean) => {
    return L.divIcon({
      className: "custom-leaflet-rider-icon",
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px;">
          <div style="position: absolute; width: 48px; height: 48px; background: rgba(245, 158, 11, 0.35); border-radius: 50%; animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
          <div style="width: 38px; height: 38px; background: #d97706; border: 2.5px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(217,119,6,0.5); font-size: 18px; transform: scale(${isComplete ? 1 : 1.1});">
            🛵
          </div>
          <div style="position: absolute; bottom: -20px; background: #78350f; color: #fef3c7; font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 9999px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 3px;">
            <span>⚡ Live Rider</span>
          </div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
      popupAnchor: [0, -25],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([riderLocation.lat, riderLocation.lng], 15);

      // OpenStreetMap Voyager / Positron clean map tiles
      const tileUrl =
        mapTileTheme === "voyager"
          ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      // Store Marker
      const storeMarker = L.marker([storeLocation.lat, storeLocation.lng], {
        icon: createStoreIcon(),
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: system-ui; padding: 4px;">
            <strong style="color: #065f46; font-size: 13px;">🏪 ${storeLocation.name}</strong>
            <p style="margin: 3px 0 0; color: #4b5563; font-size: 11px;">Dark Store Hub (10-Min Fast Dispatch)</p>
          </div>`
        );
      storeMarkerRef.current = storeMarker;

      // Customer Marker
      const custMarker = L.marker([customerLocation.lat, customerLocation.lng], {
        icon: createCustomerIcon(),
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: system-ui; padding: 4px;">
            <strong style="color: #991b1b; font-size: 13px;">🏠 Delivery Destination</strong>
            <p style="margin: 3px 0 0; color: #4b5563; font-size: 11px;">${customerLocation.address}</p>
          </div>`
        );
      customerMarkerRef.current = custMarker;

      // Rider Marker
      const riderPos: [number, number] = isDelivered
        ? [customerLocation.lat, customerLocation.lng]
        : [riderLocation.lat, riderLocation.lng];

      const riderMarker = L.marker(riderPos, {
        icon: createRiderIcon(isDelivered),
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: system-ui; padding: 4px;">
            <strong style="color: #d97706; font-size: 13px;">🛵 ${riderLocation.name || "Awaiting rider assignment"}</strong>
            <p style="margin: 3px 0 0; color: #4b5563; font-size: 11px;">Status: Out for Delivery · Speed: 28 km/h</p>
          </div>`
        );
      riderMarkerRef.current = riderMarker;

      // Route Path Line
      const routePoints: [number, number][] = [
        [storeLocation.lat, storeLocation.lng],
        [riderLocation.lat, riderLocation.lng],
        [customerLocation.lat, customerLocation.lng],
      ];

      const routePolyline = L.polyline(routePoints, {
        color: "#10b981",
        weight: 5,
        opacity: 0.85,
        dashArray: "8, 6",
        lineCap: "round",
      }).addTo(map);
      polylineRef.current = routePolyline;

      // Fit bounds nicely to encompass store, rider, and destination
      const group = L.featureGroup([storeMarker, custMarker, riderMarker]);
      map.fitBounds(group.getBounds().pad(0.25));

      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Rider Marker and Polyline when coordinates change dynamically
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const targetPos: [number, number] = isDelivered
      ? [customerLocation.lat, customerLocation.lng]
      : [riderLocation.lat, riderLocation.lng];

    if (riderMarkerRef.current) {
      riderMarkerRef.current.setLatLng(targetPos);
      riderMarkerRef.current.setIcon(createRiderIcon(isDelivered));
    }

    if (polylineRef.current) {
      const updatedPoints: [number, number][] = [
        [storeLocation.lat, storeLocation.lng],
        targetPos,
        [customerLocation.lat, customerLocation.lng],
      ];
      polylineRef.current.setLatLngs(updatedPoints);
    }
  }, [riderLocation.lat, riderLocation.lng, isDelivered, customerLocation.lat, customerLocation.lng]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current || !storeMarkerRef.current || !customerMarkerRef.current || !riderMarkerRef.current) return;
    const group = L.featureGroup([storeMarkerRef.current, customerMarkerRef.current, riderMarkerRef.current]);
    mapInstanceRef.current.fitBounds(group.getBounds().pad(0.25), { animate: true });
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden border border-emerald-900/40 shadow-xl z-0">
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-stone-900" />

      {/* Floating Map Controls & Overlays */}
      <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-md border border-stone-200 flex items-center gap-2 text-xs font-bold text-stone-800">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Leaflet Live GPS Tracker</span>
        <span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded font-mono">
          {riderLocation.lat.toFixed(4)}, {riderLocation.lng.toFixed(4)}
        </span>
      </div>

      {/* Map Action Buttons */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <button
          onClick={handleRecenter}
          className="w-8 h-8 rounded-xl bg-white/90 hover:bg-white text-stone-700 shadow-md border border-stone-200 flex items-center justify-center transition cursor-pointer"
          title="Re-center Live Route"
        >
          <Navigation className="w-4 h-4 text-emerald-700" />
        </button>
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 rounded-xl bg-white/90 hover:bg-white text-stone-700 shadow-md border border-stone-200 flex items-center justify-center transition cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 rounded-xl bg-white/90 hover:bg-white text-stone-700 shadow-md border border-stone-200 flex items-center justify-center transition cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Live Legend */}
      <div className="absolute bottom-3 left-3 right-3 z-10 bg-stone-950/85 backdrop-blur-md p-2.5 rounded-2xl border border-stone-800 text-white flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-sm">🏪</span>
            <span className="text-stone-300 text-[11px]">Dark Store #04</span>
          </div>
          <span className="text-stone-600">➔</span>
          <div className="flex items-center gap-1 font-bold text-amber-300">
            <span className="text-sm">🛵</span>
            <span className="text-[11px]">{isDelivered ? "Delivered" : "Rider in Motion (28 km/h)"}</span>
          </div>
          <span className="text-stone-600">➔</span>
          <div className="flex items-center gap-1">
            <span className="text-sm">🏠</span>
            <span className="text-stone-300 text-[11px]">Customer Home</span>
          </div>
        </div>

        <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Live Leaflet OpenStreetMap Sync</span>
        </div>
      </div>
    </div>
  );
};
