import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { api } from '../config/api';
import { getTodayDateString } from '../utils/dateUtils';

interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
}

interface HijriDate {
  day: string;
  month: {
    en: string;
    ar: string;
  };
  year: string;
  designation: {
    abbreviated: string;
  };
}

export function useNamaz() {
  const { user } = useAuth();
  const [timings, setTimings] = useState<PrayerTimes | null>(null);
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [locationName, setLocationName] = useState<string>('Detecting location...');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Track which prayers are completed today (mapped to our Goal Completion backend)
  const [completedPrayers, setCompletedPrayers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) return;
    
    const fetchTimings = async (lat: number, lng: number) => {
      try {
        setLoading(true);
        let method = 1; // Default Karachi (Hanafi)
        let school = 1; // Default Hanafi Asr

        if (user.fiqh === "Sunni (Shafi)") { method = 3; school = 0; }
        else if (user.fiqh === "Sunni (Maliki)") { method = 3; school = 0; }
        else if (user.fiqh === "Sunni (Hanbali)") { method = 4; school = 0; }
        else if (user.fiqh === "Shia (Jafari)") { method = 0; school = 0; }
        else if (user.fiqh === "Shia (Zaydi)") { method = 0; school = 0; }
        else if (user.fiqh === "Shia (Ismaili)") { method = 0; school = 0; }
        else if (user.fiqh === "Ibadi") { method = 3; school = 0; }
        else if (user.fiqh === "Salafi / Ahle Hadith") { method = 4; school = 0; }

        const timestamp = Math.floor(Date.now() / 1000);
        
        // Fetch Aladhan timings and reverse geocode location in parallel
        const [aladhanRes, geoRes] = await Promise.all([
          axios.get(`https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`),
          axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`).catch(() => null)
        ]);
        
        setTimings(aladhanRes.data.data.timings);
        setHijriDate(aladhanRes.data.data.date.hijri);

        if (geoRes?.data) {
          const city = geoRes.data.city || geoRes.data.locality || geoRes.data.principalSubdivision;
          const country = geoRes.data.countryName;
          if (city && country) {
            setLocationName(`${city}, ${country}`);
          } else if (city || country) {
            setLocationName(city || country);
          } else {
            setLocationName('Local Timings');
          }
        } else {
          setLocationName('Local Timings');
        }

        await loadCompletedPrayers();
      } catch (err) {
        console.error("Error fetching prayer times:", err);
        setError("Could not load prayer times. Please check your internet connection.");
      } finally {
        setLoading(false);
      }
    };

    // If user provided manual coordinates in Settings, use them!
    if (user.latitude && user.longitude) {
      fetchTimings(parseFloat(user.latitude), parseFloat(user.longitude));
    } else {
      // Otherwise, use geolocation to get accurate local timings
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchTimings(position.coords.latitude, position.coords.longitude);
          },
          (err) => {
            console.warn("Geolocation blocked, defaulting to London coords", err);
            // Fallback to London if blocked
            fetchTimings(51.508515, -0.1254872);
          }
        );
      } else {
        fetchTimings(51.508515, -0.1254872);
      }
    }
  }, [user]);

  const loadCompletedPrayers = async () => {
    try {
      // In a full implementation, we'd have a specific table for prayers,
      // but for this MVP, we can just hit a specific endpoint or use our generic TaskCompletion system.
      // Let's assume we map the 5 prayers to 5 specific goal_ids.
      const response = await api.get('/progress');
      const today = getTodayDateString();
      const todaysCompletions = response.data.filter((p: any) => p.date === today && p.completed);
      
      const completed: Record<string, boolean> = {};
      todaysCompletions.forEach((p: any) => {
        completed[p.goal_id] = true; // goal_id would be 'Fajr', 'Dhuhr', etc.
      });
      setCompletedPrayers(completed);
    } catch (err) {
      console.error("Failed to load completed prayers", err);
    }
  };

  const togglePrayer = async (prayerName: string) => {
    try {
      const isCurrentlyCompleted = !!completedPrayers[prayerName];
      const today = getTodayDateString();
      
      // Save to backend via the /progress endpoint using the prayerName as the goal_id
      await api.post('/progress', {
        goal_id: prayerName,
        date: today,
        completed: !isCurrentlyCompleted
      });
      
      // Optimistic UI update
      setCompletedPrayers(prev => ({
        ...prev,
        [prayerName]: !isCurrentlyCompleted
      }));
    } catch (err) {
      console.error("Failed to toggle prayer", err);
    }
  };

  return { timings, hijriDate, locationName, loading, error, completedPrayers, togglePrayer };
}
