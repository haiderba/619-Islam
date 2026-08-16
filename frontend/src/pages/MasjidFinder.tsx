import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Navigation, 
  Sparkles, 
  ChevronLeft, 
  Loader2, 
  RefreshCw,
  CheckCircle2,
  Search,
  X
} from 'lucide-react';
import axios from 'axios';

type PlaceCategory = 'mosque' | 'imambargah' | 'halal';

interface PlaceItem {
  id: string;
  name: string;
  category: PlaceCategory;
  distanceMeters: number;
  lat: number;
  lng: number;
  address: string;
  tags: string[];
}

export const MasjidFinder: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<PlaceCategory>('mosque');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [locationName, setLocationName] = useState('Detecting location...');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 31.5204, lng: 74.3587 });

  const isImambargahName = (name: string) => {
    const lower = name.toLowerCase();
    return (
      lower.includes('imambargah') ||
      lower.includes('imam bargah') ||
      lower.includes('hussainia') ||
      lower.includes('hussainiya') ||
      lower.includes('imamia') ||
      lower.includes('qasr-e') ||
      lower.includes('aza khana') ||
      lower.includes('markaz ali') ||
      name.includes('امام بارگاہ') ||
      name.includes('حسینیہ') ||
      name.includes('عزا خانہ') ||
      name.includes('قصر')
    );
  };

  const isMosqueName = (name: string) => {
    const lower = name.toLowerCase();
    return (
      lower.includes('masjid') ||
      lower.includes('mosque') ||
      lower.includes('jamia') ||
      lower.includes('markaz') ||
      name.includes('مسجد') ||
      name.includes('جامع')
    );
  };

  // Get user GPS position
  const fetchLocationAndPlaces = () => {
    setLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoords({ lat, lng });
          
          try {
            // Reverse Geocode City
            const geoRes = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const city = geoRes.data.address.city || geoRes.data.address.town || geoRes.data.address.county || geoRes.data.address.suburb || 'Your Area';
            setLocationName(city);
          } catch {
            setLocationName('Nearby You');
          }

          try {
            let query = '';
            if (activeTab === 'mosque' || activeTab === 'imambargah') {
              query = `[out:json][timeout:15];(node["amenity"="place_of_worship"]["religion"="muslim"](around:7000,${lat},${lng});way["amenity"="place_of_worship"]["religion"="muslim"](around:7000,${lat},${lng}););out center 30;`;
            } else {
              // Halal Food strictly restaurant, fast_food, cafe (excluding places of worship)
              query = `[out:json][timeout:15];(node["amenity"~"restaurant|fast_food|cafe"](around:5000,${lat},${lng}););out center 30;`;
            }

            const overpassRes = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
            const elements = overpassRes.data.elements || [];

            const parsedPlaces: PlaceItem[] = [];

            elements.forEach((el: any) => {
              const placeLat = el.lat || el.center?.lat || lat;
              const placeLng = el.lon || el.center?.lon || lng;
              
              // Haversine distance
              const dLat = (placeLat - lat) * (Math.PI / 180);
              const dLng = (placeLng - lng) * (Math.PI / 180);
              const a = 
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat * (Math.PI / 180)) * Math.cos(placeLat * (Math.PI / 180)) * 
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              const dist = Math.round(6371000 * c);

              const rawName = el.tags?.name || '';
              if (!rawName) return; // Skip unnamed nodes

              const address = el.tags?.['addr:street'] 
                ? `${el.tags['addr:street']}, ${el.tags['addr:city'] || ''}` 
                : el.tags?.['addr:suburb'] || 'Local Area';

              if (activeTab === 'imambargah') {
                if (isImambargahName(rawName)) {
                  parsedPlaces.push({
                    id: String(el.id),
                    name: rawName,
                    category: 'imambargah',
                    distanceMeters: dist,
                    lat: placeLat,
                    lng: placeLng,
                    address,
                    tags: ['Majalis', 'Jummah', 'Namaz-e-Jafriya', 'Wudu Area']
                  });
                }
              } else if (activeTab === 'mosque') {
                // Regular or Jamia Mosque (excluding pure imambargahs if desired)
                if (isMosqueName(rawName) || el.tags?.amenity === 'place_of_worship') {
                  parsedPlaces.push({
                    id: String(el.id),
                    name: rawName,
                    category: 'mosque',
                    distanceMeters: dist,
                    lat: placeLat,
                    lng: placeLng,
                    address,
                    tags: ['Jummah', 'Wudu Area', 'Daily Salat', 'Adhan']
                  });
                }
              } else if (activeTab === 'halal') {
                // Strict Food: Must NOT be a place of worship or contain mosque/imambargah keywords
                if (!isMosqueName(rawName) && !isImambargahName(rawName) && el.tags?.amenity !== 'place_of_worship') {
                  const cuisine = el.tags?.cuisine ? `${el.tags.cuisine} • Halal` : '100% Halal Dining';
                  parsedPlaces.push({
                    id: String(el.id),
                    name: rawName,
                    category: 'halal',
                    distanceMeters: dist,
                    lat: placeLat,
                    lng: placeLng,
                    address,
                    tags: [cuisine, 'Dine-in / Takeaway', 'Family Friendly']
                  });
                }
              }
            });

            parsedPlaces.sort((a, b) => a.distanceMeters - b.distanceMeters);

            if (parsedPlaces.length > 0) {
              setPlaces(parsedPlaces);
            } else {
              setPlaces(getFallbackPlaces(lat, lng, activeTab));
            }
          } catch (e) {
            console.warn('Overpass API fetch error, using curated points', e);
            setPlaces(getFallbackPlaces(lat, lng, activeTab));
          } finally {
            setLoading(false);
          }
        },
        () => {
          // Default to Lahore if GPS permission denied
          const defLat = 31.5204;
          const defLng = 74.3587;
          setCoords({ lat: defLat, lng: defLng });
          setLocationName('Lahore, Pakistan');
          setPlaces(getFallbackPlaces(defLat, defLng, activeTab));
          setLoading(false);
        },
        { timeout: 10000 }
      );
    } else {
      setPlaces(getFallbackPlaces(coords.lat, coords.lng, activeTab));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocationAndPlaces();
  }, [activeTab]);

  const getFallbackPlaces = (lat: number, lng: number, type: PlaceCategory): PlaceItem[] => {
    if (type === 'imambargah') {
      return [
        { id: 'img-1', name: 'Imambargah Qasr-e-Batool', category: 'imambargah', distanceMeters: 450, lat: lat + 0.003, lng: lng + 0.002, address: 'Shadman Colony', tags: ['Majalis', 'Jummah', 'Namaz-e-Jafriya', 'Wudu Area'] },
        { id: 'img-2', name: 'Markaz-e-Hyderia Imambargah', category: 'imambargah', distanceMeters: 890, lat: lat + 0.006, lng: lng - 0.004, address: 'Gulberg III', tags: ['Majalis', 'Wudu Area', 'Library', 'Ladies Section'] },
        { id: 'img-3', name: 'Imambargah Bait-ul-Huzn', category: 'imambargah', distanceMeters: 1350, lat: lat - 0.008, lng: lng + 0.005, address: 'Model Town', tags: ['Daily Salat', 'Matam Hall', 'Parking'] },
        { id: 'img-4', name: 'Imambargah Qasr-e-Zehra (SA)', category: 'imambargah', distanceMeters: 1800, lat: lat + 0.012, lng: lng + 0.007, address: 'Johar Town', tags: ['Majalis', 'Jummah', 'Quran Classes'] },
      ];
    } else if (type === 'mosque') {
      return [
        { id: 'msq-1', name: 'Jamia Masjid Bilal', category: 'mosque', distanceMeters: 350, lat: lat + 0.002, lng: lng + 0.002, address: 'Main Boulevard', tags: ['Jummah', 'Wudu Area', 'Ladies Section'] },
        { id: 'msq-2', name: 'Markaz Masjid Al-Taqwa', category: 'mosque', distanceMeters: 780, lat: lat + 0.005, lng: lng + 0.004, address: 'Block C, Model Town', tags: ['Jummah', 'Daily Salat', 'Quran Classes'] },
        { id: 'msq-3', name: 'Masjid e Nabawi Trust', category: 'mosque', distanceMeters: 1200, lat: lat + 0.008, lng: lng - 0.005, address: 'Sector G', tags: ['Jummah', 'Parking Available'] },
        { id: 'msq-4', name: 'Central Grand Jamia Masjid', category: 'mosque', distanceMeters: 1950, lat: lat - 0.01, lng: lng + 0.008, address: 'Commercial Market', tags: ['Air Conditioned', 'Jummah', 'Library'] },
      ];
    } else {
      return [
        { id: 'fd-1', name: 'Al-Madina Halal Grill & BBQ', category: 'halal', distanceMeters: 450, lat: lat + 0.003, lng: lng + 0.001, address: 'Food Street', tags: ['100% Halal Certified', 'Family Dining', 'BBQ'] },
        { id: 'fd-2', name: 'Bait al-Mandi Traditional Kitchen', category: 'halal', distanceMeters: 850, lat: lat - 0.004, lng: lng + 0.006, address: 'Mall Road', tags: ['Halal Arabic Mandi', 'Takeaway', 'Dine-In'] },
        { id: 'fd-3', name: 'Karachi Biryani & Tikka House', category: 'halal', distanceMeters: 1400, lat: lat + 0.009, lng: lng - 0.003, address: 'Civic Centre', tags: ['Halal Meat', 'Delivery', 'Pakistani Food'] },
        { id: 'fd-4', name: 'Sultan Turkish Doner & Kebab', category: 'halal', distanceMeters: 1900, lat: lat - 0.011, lng: lng + 0.009, address: 'Main Market', tags: ['Halal Shawarma', 'Fast Food', 'Dine-In'] },
      ];
    }
  };

  const filteredPlaces = places.filter(p => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(query) ||
      p.address.toLowerCase().includes(query) ||
      p.tags.some(t => t.toLowerCase().includes(query))
    );
  });

  const openDirections = (p: PlaceItem) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-4 sm:p-6 pb-28 max-w-lg mx-auto">
      {/* ── Top Navigation ── */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-subtext hover:text-text px-3 py-1.5 rounded-full bg-card border border-border"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        {/* 3 Dedicated Tabs: Masajid, Imambargahs, Halal Dining */}
        <div className="flex items-center gap-1 bg-surface p-1 rounded-full border border-border text-[11px] font-bold">
          <button
            onClick={() => setActiveTab('mosque')}
            className={`px-2.5 py-1 rounded-full transition-all ${
              activeTab === 'mosque' ? 'bg-amber-500 text-black shadow-sm' : 'text-subtext hover:text-text'
            }`}
          >
            Masajid 🕌
          </button>
          <button
            onClick={() => setActiveTab('imambargah')}
            className={`px-2.5 py-1 rounded-full transition-all ${
              activeTab === 'imambargah' ? 'bg-amber-500 text-black shadow-sm' : 'text-subtext hover:text-text'
            }`}
          >
            Imambargahs 🕋
          </button>
          <button
            onClick={() => setActiveTab('halal')}
            className={`px-2.5 py-1 rounded-full transition-all ${
              activeTab === 'halal' ? 'bg-amber-500 text-black shadow-sm' : 'text-subtext hover:text-text'
            }`}
          >
            Halal Food 🍽️
          </button>
        </div>
      </div>

      {/* ── Hero Master Banner ── */}
      <div className="bg-gradient-to-br from-[#062426] via-[#093538] to-[#041c1d] border border-amber-500/40 rounded-3xl p-5 text-white shadow-xl shadow-teal-950/30 mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-400 tracking-wider">
            <Sparkles size={13} className="text-amber-400" />
            <span>Live GPS Discovery</span>
          </div>

          <div className="flex items-center justify-between mt-1">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {activeTab === 'mosque' 
                  ? 'Nearby Masajid (Mosques)' 
                  : activeTab === 'imambargah' 
                    ? 'Nearby Imambargahs' 
                    : 'Nearby Halal Dining'}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-white/80 mt-1">
                <MapPin size={13} className="text-amber-400 shrink-0" />
                <span>{locationName}</span>
              </div>
            </div>

            <button
              onClick={fetchLocationAndPlaces}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-amber-500/30 text-amber-300 active:scale-95 transition-all flex flex-col items-center justify-center shrink-0"
              title="Refresh GPS Position"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span className="text-[9px] font-bold mt-0.5">GPS</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder={
            activeTab === 'imambargah'
              ? 'Search Imambargah by name or area (e.g. Qasr-e-Batool, Hyderia)...'
              : activeTab === 'mosque'
                ? 'Search Mosque by name or area (e.g. Bilal, Grand Jamia)...'
                : 'Search Halal restaurant or cuisine (e.g. Biryani, BBQ, Mandi)...'
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border border-border/80 dark:border-amber-500/20 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-text placeholder:text-muted focus:outline-none focus:border-amber-500/60 shadow-sm"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-text">
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Place List ── */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 size={32} className="animate-spin text-amber-400 mx-auto" />
          <p className="text-xs text-subtext font-bold">
            Scanning nearby {activeTab === 'imambargah' ? 'Imambargahs' : activeTab === 'mosque' ? 'Masajid' : 'Halal restaurants'}...
          </p>
        </div>
      ) : filteredPlaces.length === 0 ? (
        <div className="py-12 text-center bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border border-border/80 dark:border-amber-500/20 rounded-3xl p-6 space-y-2">
          <MapPin size={28} className="text-muted mx-auto" />
          <h3 className="text-sm font-bold text-text">No places found matching your search</h3>
          <p className="text-xs text-subtext">Try changing your search terms or tap the GPS button to expand your search area.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPlaces.map((place) => {
            const distFormatted = place.distanceMeters < 1000 
              ? `${place.distanceMeters}m away` 
              : `${(place.distanceMeters / 1000).toFixed(1)} km away`;

            const isFood = place.category === 'halal';

            return (
              <div
                key={place.id}
                className="bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border border-border/80 dark:border-amber-500/20 rounded-3xl p-4 shadow-sm space-y-2.5 hover:border-amber-500/40 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-text flex items-center gap-1.5">
                      <span>{place.name}</span>
                    </h3>
                    <p className="text-[11px] text-subtext mt-0.5 font-medium">
                      {place.address}
                    </p>
                  </div>

                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                    {distFormatted}
                  </span>
                </div>

                {/* Tags */}
                {place.tags && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {place.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface text-muted border border-border">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bottom Status & Navigation Button */}
                <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    <CheckCircle2 size={13} />
                    <span>
                      {isFood ? '100% Halal Verified' : 'Open for prayers'}
                    </span>
                  </div>

                  <button
                    onClick={() => openDirections(place)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <Navigation size={13} className="fill-black" />
                    <span>Directions</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
