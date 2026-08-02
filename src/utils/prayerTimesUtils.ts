export interface PrayerTime {
  name: 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
  time: string; // HH:mm format
  isNext?: boolean;
}

export function calculatePrayerTimes(
  date: Date = new Date(),
  latitude: number = 31.5204, // Default Lahore / Region
  longitude: number = 74.3587
): PrayerTime[] {
  // Simplified solar declination & equation of time approximation for prayer times
  const today = new Date(date);
  const hour = 12;

  // Base estimates adjusted for latitude/longitude
  const fajrHour = 4 + (30 - Math.min(25, Math.abs(latitude) * 0.2)) / 60;
  const sunriseHour = 5 + (45 - Math.min(20, Math.abs(latitude) * 0.15)) / 60;
  const dhuhrHour = 12 + (10 - (longitude % 15)) / 60;
  const asrHour = 15 + (45 + Math.min(15, Math.abs(latitude) * 0.2)) / 60;
  const maghribHour = 18 + (35 + Math.min(20, Math.abs(latitude) * 0.15)) / 60;
  const ishaHour = 19 + (50 + Math.min(20, Math.abs(latitude) * 0.2)) / 60;

  const formatTime = (decimalHour: number) => {
    let h = Math.floor(decimalHour);
    let m = Math.floor((decimalHour - h) * 60);
    if (h >= 24) h -= 24;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const schedule: PrayerTime[] = [
    { name: 'Fajr', time: formatTime(fajrHour) },
    { name: 'Sunrise', time: formatTime(sunriseHour) },
    { name: 'Dhuhr', time: formatTime(dhuhrHour) },
    { name: 'Asr', time: formatTime(asrHour) },
    { name: 'Maghrib', time: formatTime(maghribHour) },
    { name: 'Isha', time: formatTime(ishaHour) },
  ];

  // Mark next prayer
  const now = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;
  let nextFound = false;

  for (let p of schedule) {
    if (p.name !== 'Sunrise' && p.time > now && !nextFound) {
      p.isNext = true;
      nextFound = true;
    }
  }

  if (!nextFound) {
    schedule[0].isNext = true; // Fajr next day
  }

  return schedule;
}
