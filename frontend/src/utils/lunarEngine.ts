/**
 * Lunar & Astronomy Engine for Islamic Moon Sighting, Phase Simulation & Celestial Events
 */

export interface MoonPhaseInfo {
  phase: number; // 0.0 to 1.0 (0/1 = New Moon, 0.25 = First Quarter, 0.5 = Full Moon, 0.75 = Last Quarter)
  phaseName: string;
  phaseNameAr: string;
  phaseNameUr: string;
  illumination: number; // 0 to 100%
  ageDays: number; // 0 to 29.53
  isCrescent: boolean;
  isFullMoon: boolean; // Ayyam al-Beed
  hilalVisibility: 'Invisible' | 'Difficult' | 'Easily Visible' | 'Full / Bright';
  islamicSignificance: string;
}

export interface EclipseEvent {
  type: 'solar' | 'lunar';
  name: string;
  nameAr: string;
  date: string; // YYYY-MM-DD
  formattedDate: string;
  eclipseType: 'Total' | 'Annular' | 'Partial' | 'Penumbral';
  visibilityRegions: string;
  islamicRuling: string; // Salat al-Kusuf / Khusuf details
}

/**
 * Calculates Moon Phase and illumination for any given JavaScript Date object
 */
export function getMoonPhase(date: Date = new Date()): MoonPhaseInfo {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60) / 24;

  // Astronomical Julian Day calculation
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const JD = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;

  // Days since known New Moon (Jan 6, 2000 18:14 UTC -> JD 2451549.5)
  const synodicMonth = 29.53058867;
  const daysSinceNew = (JD - 2451549.5) % synodicMonth;
  const normalizedAge = daysSinceNew < 0 ? daysSinceNew + synodicMonth : daysSinceNew;
  const phase = normalizedAge / synodicMonth;

  // Illumination %
  const illumination = Math.round((1 - Math.cos(phase * 2 * Math.PI)) / 2 * 100);

  let phaseName = 'New Moon (Hilal)';
  let phaseNameAr = 'محاق / هلال';
  let phaseNameUr = 'نیا چاند / ہلال';
  let isCrescent = false;
  let isFullMoon = false;
  let hilalVisibility: MoonPhaseInfo['hilalVisibility'] = 'Invisible';
  let islamicSignificance = 'Standard Lunar Observation';

  if (phase < 0.03 || phase > 0.97) {
    phaseName = 'New Moon (Conjunction)';
    phaseNameAr = 'المحاق';
    phaseNameUr = 'محاق (چاند چھپنا)';
    hilalVisibility = 'Invisible';
    islamicSignificance = 'Astronomical Birth of the new moon. Hilal not yet visible to the naked eye.';
  } else if (phase < 0.22) {
    phaseName = 'Waxing Crescent (Hilal)';
    phaseNameAr = 'الهلال المتزايد';
    phaseNameUr = 'ہلال (پہلی کا چاند)';
    isCrescent = true;
    hilalVisibility = normalizedAge > 1.2 ? 'Easily Visible' : 'Difficult';
    islamicSignificance = 'Hilal Sighting Window: Marks the start of a new Islamic Hijri month upon visual confirmation.';
  } else if (phase < 0.28) {
    phaseName = 'First Quarter';
    phaseNameAr = 'التربيع الأول';
    phaseNameUr = 'پہلا چوتھائی';
    hilalVisibility = 'Full / Bright';
    islamicSignificance = 'Half moon visible in the evening sky.';
  } else if (phase < 0.47) {
    phaseName = 'Waxing Gibbous';
    phaseNameAr = 'الأحدب المتزايد';
    phaseNameUr = 'بڑھتا ہوا چاند';
    hilalVisibility = 'Full / Bright';
    islamicSignificance = 'Moon approaches maximum radiance.';
  } else if (phase < 0.53) {
    phaseName = 'Full Moon (Badr)';
    phaseNameAr = 'البدر التام';
    phaseNameUr = 'بدرِ کامل (چودھویں کا چاند)';
    isFullMoon = true;
    hilalVisibility = 'Full / Bright';
    islamicSignificance = 'Ayyam al-Beed (White Days: 13th, 14th, 15th): Highly recommended sunnah fasts.';
  } else if (phase < 0.72) {
    phaseName = 'Waning Gibbous';
    phaseNameAr = 'الأحدب المتناقص';
    phaseNameUr = 'گھٹتا ہوا چاند';
    hilalVisibility = 'Full / Bright';
    islamicSignificance = 'Moon visible in late night and early morning hours.';
  } else if (phase < 0.78) {
    phaseName = 'Last Quarter';
    phaseNameAr = 'التربيع الثاني';
    phaseNameUr = 'آخری چوتھائی';
    hilalVisibility = 'Full / Bright';
    islamicSignificance = 'Half moon visible during Fajr and morning.';
  } else {
    phaseName = 'Waning Crescent (Mahaq)';
    phaseNameAr = 'الهلال المتناقص';
    phaseNameUr = 'آخری دنوں کا ہلال';
    isCrescent = true;
    hilalVisibility = normalizedAge < 28.5 ? 'Difficult' : 'Invisible';
    islamicSignificance = 'Final crescent seen before sunrise. Marks concluding days of the Islamic month.';
  }

  return {
    phase,
    phaseName,
    phaseNameAr,
    phaseNameUr,
    illumination,
    ageDays: Math.round(normalizedAge * 10) / 10,
    isCrescent,
    isFullMoon,
    hilalVisibility,
    islamicSignificance
  };
}

/**
 * Known Major Eclipses (Solar & Lunar) for 2026-2028 with Islamic Rulings
 */
export const UPCOMING_ECLIPSES: EclipseEvent[] = [
  {
    type: 'solar',
    name: 'Total Solar Eclipse (Kusuf)',
    nameAr: 'كسوف الشمس الكلي',
    date: '2026-08-12',
    formattedDate: '12 August 2026',
    eclipseType: 'Total',
    visibilityRegions: 'Arctic, Greenland, Iceland, Spain, Portugal, North Africa, Western Europe',
    islamicRuling: 'Salat al-Kusuf (Prayer of Eclipse) is an emphatic Sunnah Mu’akkadah / Wajib (according to Fiqh) to be prayed in congregation while the eclipse is active until full clearance.'
  },
  {
    type: 'lunar',
    name: 'Total Lunar Eclipse (Khusuf)',
    nameAr: 'خسوف القمر الكلي',
    date: '2026-08-28',
    formattedDate: '28 August 2026',
    eclipseType: 'Total',
    visibilityRegions: 'Americas, Pacific, Atlantic, Western Europe, parts of Africa and Asia',
    islamicRuling: 'Salat al-Khusuf (Lunar Eclipse Prayer) is offered individually or in congregation with prolonged recitation, Ruku, and sincere Dua & Istighfar.'
  },
  {
    type: 'solar',
    name: 'Annular Solar Eclipse',
    nameAr: 'كسوف الشمس الحلقي',
    date: '2027-02-06',
    formattedDate: '6 February 2027',
    eclipseType: 'Annular',
    visibilityRegions: 'South America, Antarctica, Atlantic, West & South Africa',
    islamicRuling: 'Sunnah Salat al-Kusuf observed in areas experiencing visible occultation.'
  },
  {
    type: 'solar',
    name: 'The Great North African Total Solar Eclipse',
    nameAr: 'كسوف الشمس الكلي الأعظم',
    date: '2027-08-02',
    formattedDate: '2 August 2027 (Longest of the Century)',
    eclipseType: 'Total',
    visibilityRegions: 'Egypt (Luxor ~6m22s), Saudi Arabia, Makkah region, North Africa, Middle East, Southern Europe',
    islamicRuling: 'Historic long eclipse over Islamic heartlands. Massive congregation of Salat al-Kusuf at Masjid al-Haram in Makkah and throughout the Muslim world.'
  },
  {
    type: 'lunar',
    name: 'Partial Lunar Eclipse',
    nameAr: 'خسوف القمر الجزئي',
    date: '2028-01-12',
    formattedDate: '12 January 2028',
    eclipseType: 'Partial',
    visibilityRegions: 'Europe, Africa, Asia, Australia, Indian Ocean',
    islamicRuling: 'Salat al-Khusuf recommended upon seeing the shadow engulf the moon.'
  }
];

export function getNextSolarEclipse(): EclipseEvent {
  const now = new Date().toISOString().split('T')[0];
  const solar = UPCOMING_ECLIPSES.filter(e => e.type === 'solar' && e.date >= now);
  return solar[0] || UPCOMING_ECLIPSES[0];
}

export function getNextLunarEclipse(): EclipseEvent {
  const now = new Date().toISOString().split('T')[0];
  const lunar = UPCOMING_ECLIPSES.filter(e => e.type === 'lunar' && e.date >= now);
  return lunar[0] || UPCOMING_ECLIPSES[1];
}
