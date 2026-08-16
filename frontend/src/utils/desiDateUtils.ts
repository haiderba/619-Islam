/**
 * Desi / Punjabi Bikrami Solar Calendar Converter Utility
 * Accurate solar transitions (Sankranti) for traditional South Asian Desi Months
 */

export interface DesiMonthInfo {
  index: number;
  en: string;
  ur: string;
  startMonth: number; // 0-indexed (0 = Jan, 1 = Feb, ...)
  startDay: number;   // Day of the month
}

export const DESI_MONTHS: DesiMonthInfo[] = [
  { index: 1, en: 'Chet', ur: 'چیت', startMonth: 2, startDay: 14 },     // Mar 14
  { index: 2, en: 'Vaisakh', ur: 'وساکھ', startMonth: 3, startDay: 14 }, // Apr 14
  { index: 3, en: 'Jeth', ur: 'جیٹھ', startMonth: 4, startDay: 15 },     // May 15
  { index: 4, en: 'Harh', ur: 'ہاڑھ', startMonth: 5, startDay: 15 },     // Jun 15
  { index: 5, en: 'Sawan', ur: 'ساون', startMonth: 6, startDay: 16 },    // Jul 16
  { index: 6, en: 'Bhadon', ur: 'بھادوں', startMonth: 7, startDay: 16 },  // Aug 16
  { index: 7, en: 'Assu', ur: 'اسو', startMonth: 8, startDay: 16 },      // Sep 16
  { index: 8, en: 'Kattak', ur: 'کاتک', startMonth: 9, startDay: 16 },   // Oct 16
  { index: 9, en: 'Maghar', ur: 'مگھر', startMonth: 10, startDay: 15 },  // Nov 15
  { index: 10, en: 'Poh', ur: 'پوہ', startMonth: 11, startDay: 15 },    // Dec 15
  { index: 11, en: 'Magh', ur: 'ماگھ', startMonth: 0, startDay: 14 },    // Jan 14
  { index: 12, en: 'Phagun', ur: 'پھگن', startMonth: 1, startDay: 13 },  // Feb 13
];

export interface DesiDateResult {
  day: number;
  monthEn: string;
  monthUr: string;
  bikramiYear: number;
  formatted: string;
  shortFormatted: string;
}

export function getDesiDate(date: Date = new Date()): DesiDateResult {
  const gYear = date.getFullYear();
  const gMonth = date.getMonth(); // 0-11
  const gDay = date.getDate();

  // Create boundary points for each month in the current year
  const boundaries: { month: DesiMonthInfo; startDate: Date; yearOffset: number }[] = [];

  for (const m of DESI_MONTHS) {
    const year = (m.startMonth === 0 || m.startMonth === 1) ? gYear : gYear;
    const startDate = new Date(year, m.startMonth, m.startDay, 0, 0, 0, 0);
    boundaries.push({
      month: m,
      startDate,
      yearOffset: (m.startMonth >= 2) ? 57 : 56
    });
  }

  // Sort chronologically in the Gregorian year
  boundaries.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  // Find active Desi month
  const targetTime = new Date(gYear, gMonth, gDay, 0, 0, 0, 0).getTime();
  let activeEntry = boundaries[boundaries.length - 1]; // default to last

  for (let i = 0; i < boundaries.length; i++) {
    if (targetTime >= boundaries[i].startDate.getTime()) {
      activeEntry = boundaries[i];
    } else {
      break;
    }
  }

  // Calculate day difference
  const diffTime = targetTime - activeEntry.startDate.getTime();
  const dayInMonth = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // Bikrami Year calculation
  const isAfterChet = (gMonth > 2) || (gMonth === 2 && gDay >= 14);
  const bikramiYear = gYear + (isAfterChet ? 57 : 56);

  return {
    day: dayInMonth,
    monthEn: activeEntry.month.en,
    monthUr: activeEntry.month.ur,
    bikramiYear,
    formatted: `${dayInMonth} ${activeEntry.month.en} (${dayInMonth} ${activeEntry.month.ur})`,
    shortFormatted: `${dayInMonth} ${activeEntry.month.en}`
  };
}
