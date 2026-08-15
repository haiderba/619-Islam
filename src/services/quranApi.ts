const API_KEY = 'umh_5755b76ebef6825abd479b31a97ecef0d8f8c248';
const BASE_URL = 'https://ummahapi.com/api/quran';

export const fetchSurahs = async () => {
  try {
    const response = await fetch(`${BASE_URL}/surahs?apikey=${API_KEY}`);
    const json = await response.json();
    if (json.success) {
      return json.data.surahs;
    }
    return [];
  } catch (error) {
    console.error('Error fetching surahs:', error);
    return [];
  }
};

export const fetchSurahDetails = async (surahId: number) => {
  try {
    const response = await fetch(`${BASE_URL}/surah/${surahId}?apikey=${API_KEY}`);
    const json = await response.json();
    if (json.success) {
      return json.data;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching surah ${surahId}:`, error);
    return null;
  }
};

export const fetchJuzDetails = async (juzId: number) => {
  try {
    const response = await fetch(`${BASE_URL}/juz/${juzId}?apikey=${API_KEY}`);
    const json = await response.json();
    if (json.success) {
      return json.data;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching juz ${juzId}:`, error);
    return null;
  }
};

export const fetchPrayerTimes = async (lat?: number, lng?: number, address?: string) => {
  try {
    let url = '';
    // Method 2 corresponds to ISNA. You can change the method parameter if needed.
    if (address) {
      url = `https://api.aladhan.com/v1/timingsByAddress?address=${encodeURIComponent(address)}&method=2`;
    } else if (lat !== undefined && lng !== undefined) {
      url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=2`;
    } else {
      return null;
    }

    const response = await fetch(url);
    const json = await response.json();
    
    if (json.code === 200 && json.data && json.data.timings) {
      const timings = json.data.timings;
      return {
        fajr: timings.Fajr,
        dhuhr: timings.Dhuhr,
        asr: timings.Asr,
        maghrib: timings.Maghrib,
        isha: timings.Isha,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching prayer times from Aladhan API:', error);
    return null;
  }
};
