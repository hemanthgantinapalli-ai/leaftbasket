export interface DetectedLocationResult {
  name: string;
  area: string;
  city: string;
  state?: string;
  pincode: string;
  lat: number;
  lng: number;
  fullAddress: string;
  source: "gps" | "ip" | "manual" | "search";
  deliveryTime: string;
}

// Calculate approximate delivery time based on distance from dark store
export function calculateDeliveryTime(lat: number, lng: number): string {
  // Base dark store hubs in BLR & HYD
  const darkStores = [
    { name: "Indiranagar", lat: 12.978, lng: 77.636 },
    { name: "Koramangala", lat: 12.935, lng: 77.624 },
    { name: "HSR Layout", lat: 12.912, lng: 77.644 },
    { name: "Jubilee Hills", lat: 17.431, lng: 78.407 },
    { name: "Gachibowli", lat: 17.440, lng: 78.348 },
    { name: "Madhapur", lat: 17.448, lng: 78.391 },
  ];

  let minDistanceKm = 999;
  for (const store of darkStores) {
    const dLat = (lat - store.lat) * (Math.PI / 180);
    const dLng = (lng - store.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(store.lat * (Math.PI / 180)) *
        Math.cos(lat * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = 6371 * c;
    if (dist < minDistanceKm) {
      minDistanceKm = dist;
    }
  }

  if (minDistanceKm < 2) return "8-10 mins";
  if (minDistanceKm < 5) return "10-12 mins";
  if (minDistanceKm < 10) return "12-15 mins";
  return "15-20 mins";
}

// Reverse geocode lat & lng using OpenStreetMap Nominatim / BigDataCloud
export async function reverseGeocode(lat: number, lng: number): Promise<Partial<DetectedLocationResult>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        const street = addr.road || addr.street || addr.pedestrian || addr.footway || addr.building || "";
        const area =
          addr.suburb ||
          addr.neighbourhood ||
          addr.residential ||
          addr.commercial ||
          addr.subdistrict ||
          addr.village ||
          "";
        const city =
          addr.city ||
          addr.town ||
          addr.municipality ||
          addr.city_district ||
          addr.county ||
          "Bengaluru";
        const state = addr.state || "";
        const pincode = addr.postcode || "560038";

        const formattedName = street || area || "Current Location";
        const fullAddress = [street, area, city, pincode].filter(Boolean).join(", ");

        return {
          name: formattedName,
          area: area || city,
          city,
          state,
          pincode,
          fullAddress: fullAddress || data.display_name,
        };
      }
    }
  } catch (err) {
    console.warn("Nominatim reverse geocode fallback:", err);
  }

  // Backup reverse geocoding via BigDataCloud client API
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    if (response.ok) {
      const data = await response.json();
      const area = data.locality || data.localityInfo?.administrative?.[3]?.name || "Local Area";
      const city = data.city || data.principalSubdivision || "Bengaluru";
      const pincode = data.postcode || "560038";
      return {
        name: area || "Detected Spot",
        area: area || city,
        city,
        state: data.principalSubdivision,
        pincode,
        fullAddress: `${area}, ${city} - ${pincode}`,
      };
    }
  } catch (err) {
    console.warn("BigDataCloud fallback error:", err);
  }

  return {
    name: "Detected GPS Spot",
    area: "Local Area",
    city: "Bengaluru",
    pincode: "560038",
    fullAddress: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
  };
}

// IP-based Location Fallback when GPS is blocked or denied
export async function detectLocationViaIP(): Promise<DetectedLocationResult> {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (res.ok) {
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        const city = data.city || "Bengaluru";
        const region = data.region || "Karnataka";
        const pincode = data.postal || "560038";
        const area = data.city || "Central Zone";

        return {
          name: `${city} City Center`,
          area,
          city,
          state: region,
          pincode,
          lat,
          lng,
          fullAddress: `${area}, ${city}, ${region} - ${pincode}`,
          source: "ip",
          deliveryTime: calculateDeliveryTime(lat, lng),
        };
      }
    }
  } catch (e) {
    console.warn("IP geolocation fallback error:", e);
  }

  // Second IP fallback: ipwho.is
  try {
    const res = await fetch("https://ipwho.is/");
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        const lat = data.latitude;
        const lng = data.longitude;
        const city = data.city || "Bengaluru";
        const pincode = data.postal || "560038";
        return {
          name: `${city} Area`,
          area: city,
          city,
          state: data.region,
          pincode,
          lat,
          lng,
          fullAddress: `${city}, ${data.region} - ${pincode}`,
          source: "ip",
          deliveryTime: calculateDeliveryTime(lat, lng),
        };
      }
    }
  } catch (e) {
    console.warn("ipwho fallback error:", e);
  }

  // Default fallback if all fail
  return {
    name: "Indiranagar 100ft Rd",
    area: "Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038",
    lat: 12.9716,
    lng: 77.6412,
    fullAddress: "12th Main Rd, Indiranagar, Bengaluru - 560038",
    source: "manual",
    deliveryTime: "8-10 mins",
  };
}

// Master location detection function: GPS with automatic IP fallback & reverse geocoding
export async function detectUserLocation(): Promise<DetectedLocationResult> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      detectLocationViaIP().then(resolve);
      return;
    }

    let resolved = false;

    // Safety timeout after 7 seconds
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        detectLocationViaIP().then(resolve);
      }
    }, 7000);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const rev = await reverseGeocode(lat, lng);
          const deliveryTime = calculateDeliveryTime(lat, lng);

          resolve({
            name: rev.name || "My Current Location",
            area: rev.area || "Current Area",
            city: rev.city || "Bengaluru",
            state: rev.state,
            pincode: rev.pincode || "560038",
            lat,
            lng,
            fullAddress: rev.fullAddress || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
            source: "gps",
            deliveryTime,
          });
        } catch {
          resolve({
            name: "Current GPS Location",
            area: "Current Live Spot",
            city: "Bengaluru",
            pincode: "560038",
            lat,
            lng,
            fullAddress: `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            source: "gps",
            deliveryTime: calculateDeliveryTime(lat, lng),
          });
        }
      },
      async (err) => {
        console.warn("GPS Geolocation position error / denied:", err.message);
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);
        // Seamless fallback to IP location
        const ipLocation = await detectLocationViaIP();
        resolve(ipLocation);
      },
      {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 0,
      }
    );
  });
}

// Search places in India using Nominatim
export async function searchPlacesOSM(query: string): Promise<DetectedLocationResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const encoded = encodeURIComponent(query.trim());
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&countrycodes=in&addressdetails=1&limit=6`,
      {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((item: any) => {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const addr = item.address || {};
          const name = item.name || addr.road || addr.suburb || query;
          const area = addr.suburb || addr.neighbourhood || addr.city_district || addr.county || name;
          const city = addr.city || addr.town || addr.state_district || "Bengaluru";
          const pincode = addr.postcode || "";

          return {
            name: name || query,
            area,
            city,
            state: addr.state,
            pincode,
            lat,
            lng,
            fullAddress: item.display_name,
            source: "search",
            deliveryTime: calculateDeliveryTime(lat, lng),
          };
        });
      }
    }
  } catch (err) {
    console.warn("Search places error:", err);
  }

  return [];
}
