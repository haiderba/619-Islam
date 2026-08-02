export interface IslamicReminder {
  id: number;
  type: 'Verse' | 'Hadith';
  arabic?: string;
  text: string;
  source: string;
}

export const DAILY_ISLAMIC_REMINDERS: IslamicReminder[] = [
  {
    id: 1,
    type: 'Verse',
    text: 'Indeed, with hardship will come ease.',
    source: 'Surah Ash-Sharh (94:6)',
  },
  {
    id: 2,
    type: 'Hadith',
    text: 'The most beloved of deeds to Allah are those that are most consistent, even if they are small.',
    source: 'Sahih Bukhari & Muslim',
  },
  {
    id: 3,
    type: 'Verse',
    text: 'And He found you lost and guided [you].',
    source: 'Surah Ad-Duha (93:7)',
  },
  {
    id: 4,
    type: 'Hadith',
    text: 'Take advantage of five before five: your youth before your old age, your health before your sickness, your wealth before your poverty, your free time before your busyness, and your life before your death.',
    source: 'Shu’ab al-Iman',
  },
  {
    id: 5,
    type: 'Verse',
    text: 'So remember Me; I will remember you.',
    source: 'Surah Al-Baqarah (2:152)',
  },
  {
    id: 6,
    type: 'Hadith',
    text: 'The best among you are those who learn the Quran and teach it.',
    source: 'Sahih Bukhari',
  },
  {
    id: 7,
    type: 'Verse',
    text: 'Allah does not burden a soul beyond that it can bear.',
    source: 'Surah Al-Baqarah (2:286)',
  },
  {
    id: 8,
    type: 'Hadith',
    text: 'Prayer is better than sleep.',
    source: 'Sunan an-Nasa’i (Fajr Call to Prayer)',
  },
];

export function getDailyReminder(): IslamicReminder {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );
  const index = dayOfYear % DAILY_ISLAMIC_REMINDERS.length;
  return DAILY_ISLAMIC_REMINDERS[index];
}
