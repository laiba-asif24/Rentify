const CITY_COORDS = {
  karachi: { lat: 24.8607, lng: 67.0011 },
  lahore: { lat: 31.5204, lng: 74.3587 },
  islamabad: { lat: 33.6844, lng: 73.0479 },
  rawalpindi: { lat: 33.5651, lng: 73.0169 },
  faisalabad: { lat: 31.4504, lng: 73.135 },
  multan: { lat: 30.1575, lng: 71.5249 },
  peshawar: { lat: 34.0151, lng: 71.5249 },
  quetta: { lat: 30.1798, lng: 66.975 },
  hyderabad: { lat: 25.396, lng: 68.3578 },
  sialkot: { lat: 32.4945, lng: 74.5229 },
};

function hashOffset(id, seed = 0) {
  const str = String(id || '0');
  let h = seed;
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) % 10000;
  }
  return (h / 10000 - 0.5) * 0.08;
}

export function getItemMapPosition(item) {
  const cityKey = (item.location?.city || 'Karachi').trim().toLowerCase();
  const base = CITY_COORDS[cityKey] || CITY_COORDS.karachi;
  const lat = base.lat + hashOffset(item._id, 1);
  const lng = base.lng + hashOffset(item._id, 2);
  return { lat, lng };
}

/** Short location for map cards — city + area only (FatLlama style) */
export function formatShortLocation(item) {
  const city = item.location?.city?.trim();
  const area = item.location?.area?.trim();
  if (city && area) return `${area}, ${city}`;
  if (city) return city;
  return 'Nearby';
}

export function sortByNearby(items, refCity = 'Karachi') {
  const ref = CITY_COORDS[refCity.trim().toLowerCase()] || CITY_COORDS.karachi;
  return [...items].sort((a, b) => {
    const pa = getItemMapPosition(a);
    const pb = getItemMapPosition(b);
    const da = (pa.lat - ref.lat) ** 2 + (pa.lng - ref.lng) ** 2;
    const db = (pb.lat - ref.lat) ** 2 + (pb.lng - ref.lng) ** 2;
    return da - db;
  });
}
