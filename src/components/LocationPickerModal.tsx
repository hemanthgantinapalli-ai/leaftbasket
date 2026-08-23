import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Navigation,
  Search,
  Check,
  X,
  Clock,
  Shield,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Building,
  Home,
  Briefcase,
  Compass,
  Layers,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import L from "leaflet";
import {
  detectUserLocation,
  reverseGeocode,
  searchPlacesOSM,
  calculateDeliveryTime,
  DetectedLocationResult,
} from "../utils/geolocation";

export interface DeliveryLocation {
  id: string;
  name: string;
  area: string;
  city: string;
  pincode: string;
  deliveryTime: string;
  lat: number;
  lng: number;
  isAvailable: boolean;
  flat?: string;
  landmark?: string;
  fullAddress?: string;
}

const POPULAR_LOCATIONS: DeliveryLocation[] = [
  {
    id: "loc-indiranagar",
    name: "Indiranagar 100ft Rd",
    area: "Indiranagar",
    city: "Bengaluru",
    pincode: "560038",
    deliveryTime: "8-10 mins",
    lat: 12.9716,
    lng: 77.6412,
    isAvailable: true,
  },
  {
    id: "loc-koramangala",
    name: "Koramangala 4th Block",
    area: "Koramangala",
    city: "Bengaluru",
    pincode: "560034",
    deliveryTime: "9-11 mins",
    lat: 12.9352,
    lng: 77.6245,
    isAvailable: true,
  },
  {
    id: "loc-hsr",
    name: "HSR Layout Sector 1",
    area: "HSR Layout",
    city: "Bengaluru",
    pincode: "560102",
    deliveryTime: "10-12 mins",
    lat: 12.9121,
    lng: 77.6446,
    isAvailable: true,
  },
  {
    id: "loc-jubilee-hills",
    name: "Jubilee Hills Rd No 36",
    area: "Jubilee Hills",
    city: "Hyderabad",
    pincode: "500033",
    deliveryTime: "8-10 mins",
    lat: 17.4319,
    lng: 78.4073,
    isAvailable: true,
  },
  {
    id: "loc-gachibowli",
    name: "Gachibowli Financial District",
    area: "Gachibowli",
    city: "Hyderabad",
    pincode: "500032",
    deliveryTime: "9-12 mins",
    lat: 17.4401,
    lng: 78.3489,
    isAvailable: true,
  },
  {
    id: "loc-madhapur",
    name: "Madhapur Hitec City",
    area: "Madhapur",
    city: "Hyderabad",
    pincode: "500081",
    deliveryTime: "10 mins",
    lat: 17.4483,
    lng: 78.3915,
    isAvailable: true,
  },
  {
    id: "loc-whitefield",
    name: "Whitefield Inner Circle",
    area: "Whitefield",
    city: "Bengaluru",
    pincode: "560066",
    deliveryTime: "10-14 mins",
    lat: 12.9698,
    lng: 77.7499,
    isAvailable: true,
  },
];

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAddress: string;
  onSelectLocation: (loc: DeliveryLocation) => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  currentAddress,
  onSelectLocation,
}) => {
  const [search, setSearch] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState<string | null>(null);
  const [detectedResult, setDetectedResult] = useState<DetectedLocationResult | null>(null);
  const [selectedCity, setSelectedCity] = useState<"All" | "Bengaluru" | "Hyderabad" | "Other">("All");
  const [searchResults, setSearchResults] = useState<DetectedLocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  // Manual Form Fields
  const [flatNo, setFlatNo] = useState("");
  const [landmark, setLandmark] = useState("");
  const [addressType, setAddressType] = useState<"home" | "work" | "other">("home");

  // Map state
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 12.9716,
    lng: 77.6412,
  });
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialize and update Mini Map
  useEffect(() => {
    if (!isOpen || !showMiniMap) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
        }).setView([mapCenter.lat, mapCenter.lng], 14);

        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          { maxZoom: 19, subdomains: "abcd" }
        ).addTo(map);

        const pinIcon = L.divIcon({
          className: "custom-leaflet-pin-icon",
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px;">
              <div style="position: absolute; width: 38px; height: 38px; background: rgba(16, 185, 129, 0.35); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 32px; height: 32px; background: #059669; border: 2.5px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-size: 14px; color: white;">
                📍
              </div>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });

        const marker = L.marker([mapCenter.lat, mapCenter.lng], {
          icon: pinIcon,
          draggable: true,
        }).addTo(map);

        marker.on("dragend", async (e: any) => {
          const newPos = e.target.getLatLng();
          setMapCenter({ lat: newPos.lat, lng: newPos.lng });
          const rev = await reverseGeocode(newPos.lat, newPos.lng);
          const dt = calculateDeliveryTime(newPos.lat, newPos.lng);
          setDetectedResult({
            name: rev.name || "Pinned Location",
            area: rev.area || "Custom Pin",
            city: rev.city || "Bengaluru",
            state: rev.state,
            pincode: rev.pincode || "560038",
            lat: newPos.lat,
            lng: newPos.lng,
            fullAddress: rev.fullAddress || `Lat: ${newPos.lat.toFixed(4)}, Lng: ${newPos.lng.toFixed(4)}`,
            source: "manual",
            deliveryTime: dt,
          });
        });

        map.on("click", async (e: L.LeafletMouseEvent) => {
          marker.setLatLng(e.latlng);
          setMapCenter({ lat: e.latlng.lat, lng: e.latlng.lng });
          const rev = await reverseGeocode(e.latlng.lat, e.latlng.lng);
          const dt = calculateDeliveryTime(e.latlng.lat, e.latlng.lng);
          setDetectedResult({
            name: rev.name || "Selected Spot",
            area: rev.area || "Custom Pin",
            city: rev.city || "Bengaluru",
            state: rev.state,
            pincode: rev.pincode || "560038",
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            fullAddress: rev.fullAddress || `Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`,
            source: "manual",
            deliveryTime: dt,
          });
        });

        markerRef.current = marker;
        mapInstanceRef.current = map;
      } else {
        mapInstanceRef.current.setView([mapCenter.lat, mapCenter.lng], 14);
        if (markerRef.current) {
          markerRef.current.setLatLng([mapCenter.lat, mapCenter.lng]);
        }
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, showMiniMap, mapCenter.lat, mapCenter.lng]);

  // Handle dynamic address searching
  useEffect(() => {
    if (!search || search.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchPlacesOSM(search);
      setSearchResults(results);
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  if (!isOpen) return null;

  // Filter curated dark stores
  const filteredCurated = POPULAR_LOCATIONS.filter((loc) => {
    const matchCity = selectedCity === "All" || loc.city === selectedCity;
    const matchSearch =
      loc.name.toLowerCase().includes(search.toLowerCase()) ||
      loc.area.toLowerCase().includes(search.toLowerCase()) ||
      loc.pincode.includes(search) ||
      loc.city.toLowerCase().includes(search.toLowerCase());
    return matchCity && matchSearch;
  });

  // Handle Master GPS / IP Location Detection
  const handleDetectGPS = async () => {
    setIsDetecting(true);
    setDetectionStatus("Contacting GPS & Network location services...");

    try {
      const result = await detectUserLocation();
      setDetectedResult(result);
      setMapCenter({ lat: result.lat, lng: result.lng });

      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.setView([result.lat, result.lng], 15);
        markerRef.current.setLatLng([result.lat, result.lng]);
      }

      setDetectionStatus(
        result.source === "gps"
          ? `📍 GPS pinpointed: ${result.name}, ${result.area}`
          : `🌐 Network location detected: ${result.city}, ${result.area}`
      );
      setShowManualForm(true);
    } catch (err) {
      console.warn("Detection error:", err);
      setDetectionStatus("Unable to acquire live fix. Please select a city or enter address below.");
    } finally {
      setIsDetecting(false);
    }
  };

  const handleConfirmDetected = (res: DetectedLocationResult) => {
    const deliveryLocation: DeliveryLocation = {
      id: `loc-${Date.now()}`,
      name: res.name,
      area: res.area,
      city: res.city,
      pincode: res.pincode,
      deliveryTime: res.deliveryTime || calculateDeliveryTime(res.lat, res.lng),
      lat: res.lat,
      lng: res.lng,
      isAvailable: true,
      flat: flatNo || undefined,
      landmark: landmark || undefined,
      fullAddress: res.fullAddress,
    };
    onSelectLocation(deliveryLocation);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-xs">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-transparent"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 w-full max-w-xl overflow-hidden z-10 max-h-[92vh] sm:max-h-[85vh] flex flex-col my-0 sm:my-6"
        >
          {/* Mobile Drag Indicator */}
          <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

          {/* Header */}
          <div className="p-3.5 sm:p-5 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-emerald-200 shadow-inner shrink-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-lg font-extrabold font-['Outfit'] flex items-center gap-2">
                  <span>Delivery Location</span>
                  <span className="text-[9px] sm:text-[10px] bg-amber-400 text-emerald-950 font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                    ⚡ 10 MINS
                  </span>
                </h3>
                <p className="text-[11px] sm:text-xs text-emerald-200">Instant dispatch from our regional organic dark stores</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 flex-1 overflow-y-auto pb-safe">
            {/* Primary Action: Live GPS & Network Detection */}
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-stone-50 p-3.5 rounded-2xl border border-emerald-300/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Navigation className={`w-4 h-4 ${isDetecting ? "animate-spin text-amber-300" : ""}`} />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-emerald-950">
                      {isDetecting ? "Detecting Live Location..." : "Auto-Detect Current Location"}
                    </div>
                    <div className="text-[11px] text-emerald-700">GPS & Network reverse geocoding</div>
                  </div>
                </div>

                <button
                  onClick={handleDetectGPS}
                  disabled={isDetecting}
                  className="bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isDetecting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  <span>{isDetecting ? "Detecting..." : "Detect GPS"}</span>
                </button>
              </div>

              {/* Status Banner */}
              {detectionStatus && (
                <div className="text-[11px] bg-white/90 p-2.5 rounded-xl border border-emerald-200 text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{detectionStatus}</span>
                </div>
              )}
            </div>

            {/* Detected Result Card with 1-Click Confirm */}
            {detectedResult && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-emerald-900 text-white rounded-2xl border border-emerald-700 shadow-md space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg">📍</span>
                    <div>
                      <div className="text-xs font-extrabold text-emerald-100 flex items-center gap-1.5">
                        <span>{detectedResult.name}</span>
                        <span className="text-[10px] bg-emerald-700 text-emerald-200 px-1.5 py-0.2 rounded font-normal">
                          {detectedResult.source.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-300 font-medium mt-0.5">
                        {detectedResult.area}, {detectedResult.city} {detectedResult.pincode && `· PIN: ${detectedResult.pincode}`}
                      </div>
                      <div className="text-[10px] text-emerald-400 mt-0.5 truncate max-w-sm">
                        {detectedResult.fullAddress}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-extrabold bg-amber-400 text-emerald-950 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{detectedResult.deliveryTime}</span>
                    </span>
                  </div>
                </div>

                {/* Optional Flat & Landmark Input */}
                {showManualForm && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-800/80">
                    <div>
                      <label className="text-[10px] font-bold text-emerald-200 block mb-0.5">
                        House / Flat / Floor No. (Optional)
                      </label>
                      <input
                        type="text"
                        value={flatNo}
                        onChange={(e) => setFlatNo(e.target.value)}
                        placeholder="e.g. Flat 302, Block B"
                        className="w-full px-2.5 py-1.5 bg-emerald-950/70 border border-emerald-700 rounded-lg text-xs text-white placeholder:text-emerald-500 focus:outline-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-emerald-200 block mb-0.5">
                        Landmark / Street (Optional)
                      </label>
                      <input
                        type="text"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        placeholder="e.g. Near Main Gate"
                        className="w-full px-2.5 py-1.5 bg-emerald-950/70 border border-emerald-700 rounded-lg text-xs text-white placeholder:text-emerald-500 focus:outline-emerald-400"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleConfirmDetected(detectedResult)}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Deliver to this Location (10-Min Fast Dispatch)</span>
                </button>
              </motion.div>
            )}

            {/* Interactive Leaflet Mini Pinpoint Map */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Pinpoint on Map (Drag pin or click map)</span>
                </span>
                <span className="text-[10px] text-stone-400">OpenStreetMap Sync</span>
              </div>
              <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-stone-300 shadow-inner bg-stone-100">
                <div ref={mapContainerRef} className="w-full h-full z-0" />
                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-stone-700 shadow-xs border border-stone-200 z-10">
                  📍 Click map to set exact spot
                </div>
              </div>
            </div>

            {/* Search Input for All Localities & Pincodes in India */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search area, apartment, colony, street or pincode..."
                className="w-full pl-10 pr-9 py-2.5 bg-stone-50 hover:bg-stone-100 focus:bg-white border border-stone-200 focus:border-emerald-500 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden transition"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
                </div>
              )}
            </div>

            {/* Dynamic Search Results (Live Nominatim Geocoding) */}
            {searchResults.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  Live Search Results ({searchResults.length})
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {searchResults.map((res, i) => (
                    <button
                      key={i}
                      onClick={() => handleConfirmDetected(res)}
                      className="w-full p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-emerald-50 hover:border-emerald-400 text-left transition cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-stone-900 truncate">{res.name}</div>
                          <div className="text-[10px] text-stone-500 truncate">{res.fullAddress}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md shrink-0 ml-2">
                        {res.deliveryTime}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* City Filter Pills */}
            <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
              {(["All", "Bengaluru", "Hyderabad", "Other"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCity(c)}
                  className={`px-3 py-1 rounded-xl border transition cursor-pointer text-xs ${
                    selectedCity === c
                      ? "bg-emerald-800 text-white border-emerald-800"
                      : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  {c === "All" ? "All Dark Stores" : `📍 ${c}`}
                </button>
              ))}
            </div>

            {/* Predefined Instant 10-Minute Dark Store Hubs */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Instant 10-Minute Dispatch Hubs
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {filteredCurated.map((loc) => {
                  const isSelected = currentAddress.toLowerCase().includes(loc.area.toLowerCase());

                  return (
                    <button
                      key={loc.id}
                      onClick={() => {
                        onSelectLocation(loc);
                        onClose();
                      }}
                      className={`w-full p-2.5 sm:p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? "bg-emerald-50/80 border-emerald-500 shadow-xs"
                          : "bg-white hover:bg-stone-50 border-stone-200"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                            <span>{loc.name}</span>
                            <span className="text-[10px] text-stone-500 font-normal">({loc.city})</span>
                          </div>
                          <div className="text-[11px] text-stone-500">
                            {loc.area} · PIN: {loc.pincode}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{loc.deliveryTime}</span>
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
